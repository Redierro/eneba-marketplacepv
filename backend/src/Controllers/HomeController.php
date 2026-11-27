<?php
namespace App\Controllers;

use App\Http\Json;
use App\Repositories\ProductRepository;
use PDO;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class HomeController
{
    public function __construct(private PDO $db, private ProductRepository $products) {}

    public function layout(Request $req, Response $res): Response
    {
        $rows = $this->db->query('SELECT id, type, title, endpoint, position FROM home_blocks WHERE is_active ORDER BY position, id')->fetchAll();
        return Json::respond($res, ['blocks' => array_map(fn($r) => [
            'id' => (int)$r['id'],
            'type' => $r['type'],
            'title' => $r['title'],
            'endpoint' => $r['endpoint'],
        ], $rows)]);
    }

    public function banners(Request $req, Response $res): Response
    {
        $rows = $this->db->query('SELECT id, title, subtitle, image_url, link_url FROM banners WHERE is_active ORDER BY position, id')->fetchAll();
        return Json::respond($res, ['items' => array_map(fn($r) => ['id' => (int)$r['id']] + $r, $rows)]);
    }

        public function bestSellers(Request $req, Response $res): Response
    {
        return $this->row($res, ['sort' => 'popular'], '/store?sort=popular');
    }

    public function deals(Request $req, Response $res): Response
    {
        return $this->row($res, ['deals' => true, 'sort' => 'discount'], '/store?deals=1&sort=discount');
    }

    public function newReleases(Request $req, Response $res): Response
    {
        return $this->row($res, ['sort' => 'newest'], '/store?sort=newest');
    }

    public function categories(Request $req, Response $res): Response
    {
        $rows = $this->db->query("
            SELECT g.name, g.slug, COUNT(DISTINCT p.id) AS count
            FROM genres g
            JOIN products p ON p.genre_id = g.id
            JOIN offers o ON o.product_id = p.id AND o.is_active
            JOIN game_keys k ON k.offer_id = o.id AND k.status = 'available'
            GROUP BY g.id
            ORDER BY count DESC, g.name")->fetchAll();
        return Json::respond($res, ['items' => array_map(fn($r) => [
            'name' => $r['name'],
            'slug' => $r['slug'],
            'count' => (int)$r['count'],
            'link' => '/store?genre=' . $r['slug'],
        ], $rows)]);
    }

    private function row(Response $res, array $filters, string $link): Response
    {
        $r = $this->products->search($filters + ['per_page' => 12]);
        return Json::respond($res, ['items' => $r['items'], 'link' => $link]);
    }
}