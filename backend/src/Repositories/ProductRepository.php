<?php
namespace App\Repositories;

use PDO;

final class ProductRepository
{
    private const SORTS = ['relevance', 'popular', 'newest', 'price_asc', 'price_desc', 'discount'];

    public function __construct(private PDO $db) {}

    /** Filters: q, platform[], region[], genre[], price_min, price_max, deals, sort, page, per_page */
    public function search(array $f): array
    {
        $params = [];
        $n = 0;
        $bind = function (mixed $v) use (&$params, &$n): string {
            $k = 'p' . $n++;
            $params[$k] = $v;
            return ':' . $k;
        };
        $in = fn(array $vals): string => implode(',', array_map($bind, $vals));

        $offerWhere = ['o.is_active'];
        if (!empty($f['region'])) $offerWhere[] = 'r.slug IN (' . $in($f['region']) . ')';
        if (isset($f['price_min'])) $offerWhere[] = 'o.price >= ' . $bind($f['price_min']);
        if (isset($f['price_max'])) $offerWhere[] = 'o.price <= ' . $bind($f['price_max']);

        $where = ['TRUE'];
        if (!empty($f['platform'])) $where[] = 'pl.slug IN (' . $in($f['platform']) . ')';
        if (!empty($f['genre'])) $where[] = 'g.slug IN (' . $in($f['genre']) . ')';
        if (!empty($f['deals'])) $where[] = 'a.old_price > a.min_price';

        $q = trim((string)($f['q'] ?? ''));
        $esc = addcslashes($q, '%_\\');
        $fuzzy = mb_strlen($q) >= 3;
        if ($q !== '') {
            $parts = ['p.name ILIKE ' . $bind('%' . $esc . '%')];
            if ($fuzzy) $parts[] = 'word_similarity(' . $bind($q) . ', p.name) >= 0.4';
            $where[] = '(' . implode(' OR ', $parts) . ')';
        }

        $sort = in_array($f['sort'] ?? '', self::SORTS, true) ? $f['sort'] : ($q !== '' ? 'relevance' : 'popular');
        if ($sort === 'relevance' && $q === '') $sort = 'popular';

        $order = match ($sort) {
            'relevance' => '(CASE WHEN p.name ILIKE ' . $bind($esc . '%') . ' THEN 2 WHEN p.name ILIKE ' . $bind('%' . $esc . '%') . ' THEN 1 ELSE 0 END) DESC, '
                . ($fuzzy ? 'GREATEST(word_similarity(' . $bind($q) . ', p.name), similarity(' . $bind($q) . ', p.name))' : '0')
                . ' DESC, p.sales_count DESC, p.id',
            'newest' => 'p.release_date DESC NULLS LAST, p.id',
            'price_asc' => 'a.min_price ASC, p.id',
            'price_desc' => 'a.min_price DESC, p.id',
            'discount' => 'discount DESC, p.sales_count DESC, p.id',
            default => 'p.sales_count DESC, p.id',
        };

        $perPage = max(1, min(48, (int)($f['per_page'] ?? 24)));
        $page = max(1, (int)($f['page'] ?? 1));
        $offset = ($page - 1) * $perPage;

        $sql = "
            WITH offer_stock AS (
                SELECT o.id, o.product_id, o.price, o.old_price, COUNT(k.id) AS stock
                FROM offers o
                JOIN regions r ON r.id = o.region_id
                JOIN game_keys k ON k.offer_id = o.id AND k.status = 'available'
                WHERE " . implode(' AND ', $offerWhere) . "
                GROUP BY o.id
            ),
            agg AS (
                SELECT product_id,
                       MIN(price) AS min_price,
                       (ARRAY_AGG(old_price ORDER BY price ASC, id ASC))[1] AS old_price,
                       COUNT(*) AS offers_count
                FROM offer_stock
                GROUP BY product_id
            )
            SELECT p.id, p.slug, p.name, p.image_url, p.release_date, p.sales_count,
                   pl.name AS platform, pl.slug AS platform_slug, g.name AS genre,
                   a.min_price, a.old_price, a.offers_count,
                   CASE WHEN a.old_price > a.min_price THEN ROUND((1 - a.min_price / a.old_price) * 100) ELSE 0 END AS discount,
                   COUNT(*) OVER() AS total
            FROM products p
            JOIN agg a ON a.product_id = p.id
            JOIN platforms pl ON pl.id = p.platform_id
            LEFT JOIN genres g ON g.id = p.genre_id
            WHERE " . implode(' AND ', $where) . "
            ORDER BY $order
            LIMIT $perPage OFFSET $offset";

        $st = $this->db->prepare($sql);
        $st->execute($params);
        $rows = $st->fetchAll();
        $total = $rows ? (int)$rows[0]['total'] : 0;

        return [
            'items' => array_map([$this, 'card'], $rows),
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => (int)ceil($total / $perPage),
        ];
    }

    public function findBySlug(string $slug): ?array
    {
        $st = $this->db->prepare('
            SELECT p.id, p.slug, p.name, p.description, p.image_url, p.release_date, p.base_price,
                   pl.name AS platform, pl.slug AS platform_slug, g.name AS genre
            FROM products p
            JOIN platforms pl ON pl.id = p.platform_id
            LEFT JOIN genres g ON g.id = p.genre_id
            WHERE p.slug = ?');
        $st->execute([$slug]);
        $p = $st->fetch();
        if (!$p) return null;

        $st = $this->db->prepare("
            SELECT o.id, o.price, o.old_price, s.id AS seller_id, s.name AS seller, s.rating,
                   r.name AS region, r.slug AS region_slug, COUNT(k.id) AS stock
            FROM offers o
            JOIN sellers s ON s.id = o.seller_id
            JOIN regions r ON r.id = o.region_id
            JOIN game_keys k ON k.offer_id = o.id AND k.status = 'available'
            WHERE o.product_id = ? AND o.is_active
            GROUP BY o.id, s.id, r.id
            ORDER BY o.price ASC, o.id ASC");
        $st->execute([$p['id']]);

        $offers = array_map(fn($o) => [
            'id' => (int)$o['id'],
            'price' => (float)$o['price'],
            'old_price' => $o['old_price'] !== null ? (float)$o['old_price'] : null,
            'seller' => ['id' => (int)$o['seller_id'], 'name' => $o['seller'], 'rating' => (float)$o['rating']],
            'region' => $o['region'],
            'region_slug' => $o['region_slug'],
            'stock' => (int)$o['stock'],
        ], $st->fetchAll());

        return [
            'id' => (int)$p['id'],
            'slug' => $p['slug'],
            'name' => $p['name'],
            'description' => $p['description'],
            'image_url' => $p['image_url'],
            'release_date' => $p['release_date'],
            'platform' => $p['platform'],
            'platform_slug' => $p['platform_slug'],
            'genre' => $p['genre'],
            'offers' => $offers,
        ];
    }

    public function filterOptions(): array
    {
        $q = fn(string $sql) => $this->db->query($sql)->fetchAll();
        $price = $this->db->query('SELECT MIN(price) AS min, MAX(price) AS max FROM offers WHERE is_active')->fetch();
        return [
            'platforms' => $q('SELECT name, slug FROM platforms ORDER BY name'),
            'regions' => $q('SELECT name, slug FROM regions ORDER BY name'),
            'genres' => $q('SELECT name, slug FROM genres ORDER BY name'),
            'price' => ['min' => (float)floor((float)$price['min']), 'max' => (float)ceil((float)$price['max'])],
        ];
    }

    private function card(array $r): array
    {
        $min = (float)$r['min_price'];
        $old = $r['old_price'] !== null ? (float)$r['old_price'] : null;
        return [
            'id' => (int)$r['id'],
            'slug' => $r['slug'],
            'name' => $r['name'],
            'image_url' => $r['image_url'],
            'platform' => $r['platform'],
            'platform_slug' => $r['platform_slug'],
            'genre' => $r['genre'],
            'price' => $min,
            'old_price' => ($old !== null && $old > $min) ? $old : null,
            'discount' => (int)$r['discount'],
            'offers_count' => (int)$r['offers_count'],
        ];
    }
}