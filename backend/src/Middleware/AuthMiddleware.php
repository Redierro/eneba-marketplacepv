<?php
namespace App\Middleware;

use App\Http\Json;
use App\Services\JwtService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;

final class AuthMiddleware implements MiddlewareInterface
{
    public function __construct(private JwtService $jwt) {}

    public function process(Request $req, Handler $handler): Response
    {
        $token = $req->getCookieParams()['token'] ?? null;
        $userId = $token ? $this->jwt->verify($token) : null;
        if (!$userId) {
            return Json::respond(new \Slim\Psr7\Response(), ['error' => 'Unauthorized'], 401);
        }
        return $handler->handle($req->withAttribute('userId', $userId));
    }
}