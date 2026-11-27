<?php
namespace App\Controllers;

use App\Http\Json;
use App\Services\CartService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class CartController
{
    public function __construct(private CartService $cart) {}

    public function quote(Request $req, Response $res): Response
    {
        $b = (array)$req->getParsedBody();
        $items = is_array($b['items'] ?? null) ? array_slice($b['items'], 0, 50) : [];
        return Json::respond($res, $this->cart->quote($items));
    }
}