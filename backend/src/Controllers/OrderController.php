<?php
namespace App\Controllers;

use App\Http\Json;
use App\Repositories\OrderRepository;
use App\Services\CheckoutException;
use App\Services\CheckoutService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class OrderController
{
    public function __construct(private CheckoutService $checkout, private OrderRepository $orders) {}

    public function checkout(Request $req, Response $res): Response
    {
        $b = (array)$req->getParsedBody();
        $items = is_array($b['items'] ?? null) ? array_slice($b['items'], 0, 50) : [];
        $card = is_array($b['card'] ?? null) ? $b['card'] : [];
        try {
            $id = $this->checkout->place((int)$req->getAttribute('userId'), $items, $card);
        } catch (CheckoutException $e) {
            $body = ['error' => $e->getMessage()];
            if ($e->fields) $body['fields'] = $e->fields;
            return Json::respond($res, $body, $e->status);
        }
        return Json::respond($res, ['order_id' => $id], 201);
    }

    public function index(Request $req, Response $res): Response
    {
        return Json::respond($res, ['items' => $this->orders->listForUser((int)$req->getAttribute('userId'))]);
    }

    public function show(Request $req, Response $res, array $args): Response
    {
        $o = $this->orders->find((int)$req->getAttribute('userId'), (int)$args['id']);
        return $o ? Json::respond($res, $o) : Json::respond($res, ['error' => 'Order not found'], 404);
    }
}