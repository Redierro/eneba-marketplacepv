<?php
namespace App\Http;

use Psr\Http\Message\ResponseInterface as Response;

final class Json
{
    public static function respond(Response $res, mixed $data, int $status = 200): Response
    {
        $res->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return $res->withStatus($status)->withHeader('Content-Type', 'application/json');
    }
}