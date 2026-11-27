<?php
namespace App\Repositories;

use PDO;

final class OrderRepository
{
    public function __construct(private PDO $db) {}

    public function listForUser(int $userId): array
    {
        $st = $this->db->prepare('
            SELECT o.id, o.total, o.status, o.created_at, COUNT(oi.id) AS items
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.id DESC');
        $st->execute([$userId]);
        return array_map(fn($r) => [
            'id' => (int)$r['id'],
            'total' => (float)$r['total'],
            'status' => $r['status'],
            'created_at' => $this->date($r['created_at']),
            'items' => (int)$r['items'],
        ], $st->fetchAll());
    }

    public function find(int $userId, int $id): ?array
    {
        $st = $this->db->prepare('SELECT id, total, status, created_at FROM orders WHERE id = ? AND user_id = ?');
        $st->execute([$id, $userId]);
        $o = $st->fetch();
        if (!$o) return null;

        $st = $this->db->prepare('
            SELECT oi.price, k.key_value, p.name, p.slug, p.image_url, pl.name AS platform, s.name AS seller
            FROM order_items oi
            JOIN game_keys k ON k.id = oi.game_key_id
            JOIN offers of ON of.id = oi.offer_id
            JOIN products p ON p.id = of.product_id
            JOIN platforms pl ON pl.id = p.platform_id
            JOIN sellers s ON s.id = of.seller_id
            WHERE oi.order_id = ?
            ORDER BY oi.id');
        $st->execute([$id]);

        return [
            'id' => (int)$o['id'],
            'total' => (float)$o['total'],
            'status' => $o['status'],
            'created_at' => $this->date($o['created_at']),
            'items' => array_map(fn($r) => [
                'name' => $r['name'],
                'slug' => $r['slug'],
                'image_url' => $r['image_url'],
                'platform' => $r['platform'],
                'seller' => $r['seller'],
                'price' => (float)$r['price'],
                'key' => $r['key_value'],
            ], $st->fetchAll()),
        ];
    }

    private function date(string $ts): string
    {
        return (new \DateTimeImmutable($ts))->format(DATE_ATOM);
    }
}