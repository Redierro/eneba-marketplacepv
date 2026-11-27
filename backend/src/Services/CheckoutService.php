<?php
namespace App\Services;

use PDO;

final class CheckoutService
{
    public function __construct(private PDO $db, private SimulatedPayment $payment) {}

    /** @return int order id */
    public function place(int $userId, array $items, array $card): int
    {
        $wanted = [];
        foreach ($items as $it) {
            if (!is_array($it)) continue;
            $id = (int)($it['offer_id'] ?? 0);
            $qty = (int)($it['quantity'] ?? 0);
            if ($id <= 0 || $qty <= 0) continue;
            $wanted[$id] = min(CartService::MAX_QTY, ($wanted[$id] ?? 0) + $qty);
        }
        if (!$wanted) throw new CheckoutException('Your cart is empty');

        $errors = $this->payment->validate($card);
        if ($errors) throw new CheckoutException('Please check your card details', 422, $errors);

        ksort($wanted); // consistent lock order avoids deadlocks

        $this->db->beginTransaction();
        try {
            $total = 0.0;
            $sold = []; // [offerId, price, keyId]

            $offerSt = $this->db->prepare('SELECT o.price, p.name FROM offers o JOIN products p ON p.id = o.product_id WHERE o.id = ? AND o.is_active');
            foreach ($wanted as $offerId => $qty) {
                $offerSt->execute([$offerId]);
                $offer = $offerSt->fetch();
                if (!$offer) throw new CheckoutException('An item in your cart is no longer available', 409);

                $limit = (int)$qty;
                $keySt = $this->db->prepare(
                    "SELECT id FROM game_keys WHERE offer_id = ? AND status = 'available' ORDER BY id LIMIT $limit FOR UPDATE SKIP LOCKED"
                );
                $keySt->execute([$offerId]);
                $keyIds = $keySt->fetchAll(PDO::FETCH_COLUMN);
                if (count($keyIds) < $qty) throw new CheckoutException("Not enough stock for {$offer['name']}", 409);

                $in = implode(',', array_fill(0, count($keyIds), '?'));
                $this->db->prepare("UPDATE game_keys SET status = 'sold' WHERE id IN ($in)")->execute($keyIds);

                foreach ($keyIds as $kid) $sold[] = [$offerId, (float)$offer['price'], (int)$kid];
                $total += $qty * (float)$offer['price'];
            }
            $total = round($total, 2);

            $pay = $this->payment->charge($card, $total);
            if (!$pay['ok']) throw new CheckoutException($pay['error'] ?? 'Payment failed', 402);

            $st = $this->db->prepare("INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'paid') RETURNING id");
            $st->execute([$userId, $total]);
            $orderId = (int)$st->fetchColumn();

            $ins = $this->db->prepare('INSERT INTO order_items (order_id, offer_id, game_key_id, price) VALUES (?, ?, ?, ?)');
            foreach ($sold as [$offerId, $price, $keyId]) $ins->execute([$orderId, $offerId, $keyId, $price]);

            $this->db->prepare("INSERT INTO payments (order_id, provider, status, amount, reference) VALUES (?, 'simulated', 'approved', ?, ?)")
                ->execute([$orderId, $total, $pay['reference']]);

            $this->db->commit();
            return $orderId;
        } catch (\Throwable $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            throw $e;
        }
    }
}