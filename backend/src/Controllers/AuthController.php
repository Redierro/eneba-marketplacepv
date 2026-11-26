<?php
namespace App\Controllers;

use App\Http\Json;
use App\Services\JwtService;
use PDO;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class AuthController
{
    public function __construct(private PDO $db, private JwtService $jwt) {}

    public function register(Request $req, Response $res): Response
    {
        $b = (array)$req->getParsedBody();
        $email = strtolower(trim((string)($b['email'] ?? '')));
        $name = trim((string)($b['name'] ?? ''));
        $password = (string)($b['password'] ?? '');

        $errors = [];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Invalid email';
        if ($name === '' || mb_strlen($name) > 100) $errors['name'] = 'Name is required';
        if (strlen($password) < 8) $errors['password'] = 'Minimum 8 characters';
        if ($errors) return Json::respond($res, ['error' => 'Validation failed', 'fields' => $errors], 422);

        $st = $this->db->prepare('SELECT 1 FROM users WHERE email = ?');
        $st->execute([$email]);
        if ($st->fetchColumn()) {
            return Json::respond($res, ['error' => 'Validation failed', 'fields' => ['email' => 'Email already registered']], 409);
        }

        $st = $this->db->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?) RETURNING id');
        $st->execute([$email, password_hash($password, PASSWORD_DEFAULT), $name]);
        $id = (int)$st->fetchColumn();

        $res = $this->jwt->attachCookie($res, $this->jwt->issue($id));
        return Json::respond($res, ['user' => ['id' => $id, 'email' => $email, 'name' => $name]], 201);
    }

    public function login(Request $req, Response $res): Response
    {
        $b = (array)$req->getParsedBody();
        $email = strtolower(trim((string)($b['email'] ?? '')));
        $password = (string)($b['password'] ?? '');

        $st = $this->db->prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?');
        $st->execute([$email]);
        $u = $st->fetch();
        if (!$u || !password_verify($password, $u['password_hash'])) {
            return Json::respond($res, ['error' => 'Invalid email or password'], 401);
        }

        $res = $this->jwt->attachCookie($res, $this->jwt->issue((int)$u['id']));
        return Json::respond($res, ['user' => ['id' => (int)$u['id'], 'email' => $u['email'], 'name' => $u['name']]]);
    }

    public function logout(Request $req, Response $res): Response
    {
        return Json::respond($this->jwt->clearCookie($res), ['ok' => true]);
    }

    public function me(Request $req, Response $res): Response
    {
        $st = $this->db->prepare('SELECT id, email, name FROM users WHERE id = ?');
        $st->execute([$req->getAttribute('userId')]);
        $u = $st->fetch();
        if (!$u) return Json::respond($this->jwt->clearCookie($res), ['error' => 'Unauthorized'], 401);
        return Json::respond($res, ['user' => ['id' => (int)$u['id'], 'email' => $u['email'], 'name' => $u['name']]]);
    }
}