<?php
namespace App\Services;

use App\Database;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;

final class JwtService
{
    private const TTL = 7 * 86400;

    private function secret(): string
    {
        return Database::env('JWT_SECRET', '');
    }

    public function issue(int $userId): string
    {
        $now = time();
        return JWT::encode(['sub' => $userId, 'iat' => $now, 'exp' => $now + self::TTL], $this->secret(), 'HS256');
    }

    public function verify(string $token): ?int
    {
        try {
            $d = JWT::decode($token, new Key($this->secret(), 'HS256'));
            return (int)$d->sub;
        } catch (\Throwable) {
            return null;
        }
    }

    public function attachCookie(Response $res, string $token): Response
    {
        return $res->withAddedHeader('Set-Cookie', $this->cookie($token, self::TTL));
    }

    public function clearCookie(Response $res): Response
    {
        return $res->withAddedHeader('Set-Cookie', $this->cookie('', 0));
    }

    private function cookie(string $value, int $maxAge): string
    {
        $secure = filter_var(Database::env('COOKIE_SECURE', 'false'), FILTER_VALIDATE_BOOLEAN);
        return "token=$value; Path=/; Max-Age=$maxAge; HttpOnly; SameSite=Lax" . ($secure ? '; Secure' : '');
    }
}