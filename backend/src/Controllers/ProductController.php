<?php
namespace App\Controllers;

use App\Http\Json;
use App\Repositories\ProductRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class ProductController
{
    public function __construct(private ProductRepository $products) {}

    public function index(Request $req, Response $res): Response
    {
        return Json::respond($res, $this->products->search($this->parse($req->getQueryParams())));
    }

    public function suggest(Request $req, Response $res): Response
    {
        $q = trim((string)($req->getQueryParams()['q'] ?? ''));
        if (mb_strlen($q) < 2) return Json::respond($res, ['items' => []]);
        $r = $this->products->search(['q' => $q, 'per_page' => 6]);
        return Json::respond($res, ['items' => $r['items']]);
    }

    public function show(Request $req, Response $res, array $args): Response
    {
        $p = $this->products->findBySlug($args['slug']);
        return $p ? Json::respond($res, $p) : Json::respond($res, ['error' => 'Product not found'], 404);
    }

    public function filters(Request $req, Response $res): Response
    {
        return Json::respond($res, $this->products->filterOptions());
    }

    private function parse(array $q): array
    {
        $num = fn($k) => (isset($q[$k]) && is_numeric($q[$k])) ? (float)$q[$k] : null;
        return array_filter([
            'q' => $q['q'] ?? null,
            'platform' => $this->csv($q['platform'] ?? null),
            'region' => $this->csv($q['region'] ?? null),
            'genre' => $this->csv($q['genre'] ?? null),
            'price_min' => $num('price_min'),
            'price_max' => $num('price_max'),
            'deals' => !empty($q['deals']),
            'sort' => $q['sort'] ?? null,
            'page' => $q['page'] ?? null,
            'per_page' => $q['per_page'] ?? null,
        ], fn($v) => $v !== null && $v !== [] && $v !== false);
    }

    private function csv(mixed $v): array
    {
        if ($v === null) return [];
        $v = is_array($v) ? $v : explode(',', (string)$v);
        return array_values(array_filter(
            array_map(fn($x) => strtolower(trim((string)$x)), $v),
            fn($x) => $x !== ''
        ));
    }
}