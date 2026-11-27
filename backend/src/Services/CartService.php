<?php
namespace App\Services;

use PDO;

final class CartService
{
    public const MAX_QTY = 10;

    public function __construct(private PDO $db) {}

    /** @param array<int, array{offer_id: mixed, quantity: mixed}> $items */
    public function quote(array $items): array
    {
        $wanted = [];
        foreach ($items as $it) {
            if (!is_array($it)) continue;
            $id = (int)($it['offer_id'] ?? 0);
            $qty = (int)($it['quantity'] ?? 0);
            if ($id <= 0 || $qty <= 0) continue;
            $wanted[$id] = min(self::MAX_QTY, ($wanted[$id] ?? 0) + $qty);
        }
        if (!$wanted) return ['items' => [], 'count' => 0, 'total' => 0.0];

        $ids = array_keys($wanted);
        $in = implode(',', array_fill(0, count($ids), '?'));
        $st = $this->db->prepare("
            SELECT o.id, o.price, o.old_price, p.slug, p.name, p.image_url,
                   pl.name AS platform, s.name AS seller, r.name AS region,
                   (SELECT COUNT(*) FROM game_keys k WHERE k.offer_id = o.id AND k.status = 'available') AS stock
            FROM offers o
            JOIN products p ON p.id = o.product_id
            JOIN platforms pl ON pl.id = p.platform_id
            JOIN sellers s ON s.id = o.seller_id
            JOIN regions r ON r.id = o.region_id
            WHERE o.id IN ($in) AND o.is_active");
        $st->execute($ids);
        $rows = [];
        foreach ($st->fetchAll() as $r) $rows[(int)$r['id']] = $r;

        $lines = [];
        $count = 0;
        $total = 0.0;
        foreach ($wanted as $id => $qty) {
            if (!isset($rows[$id])) continue;
            $r = $rows[$id];
            $stock = (int)$r['stock'];
            $q = min($qty, $stock);
            $price = (float)$r['price'];
            $lines[] = [
                'offer_id' => $id,
                'slug' => $r['slug'],
                'name' => $r['name'],
                'image_url' => $r['image_url'],
                'platform' => $r['platform'],
                'seller' => $r['seller'],
                'region' => $r['region'],
                'price' => $price,
                'old_price' => $r['old_price'] !== null ? (float)$r['old_price'] : null,
                'stock' => $stock,
                'quantity' => $q,
                'available' => $q > 0,
            ];
            $count += $q;
            $total += $q * $price;
        }
        return ['items' => $lines, 'count' => $count, 'total' => round($total, 2)];
    }
}