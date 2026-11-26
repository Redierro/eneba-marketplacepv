<?php
namespace App;

use PDO;

final class Database
{
    public static function env(string $key, ?string $default = null): ?string
    {
        $v = $_ENV[$key] ?? getenv($key);
        return ($v === false || $v === null || $v === '') ? $default : $v;
    }

    public static function connect(): PDO
    {
        $dsn = sprintf(
            'pgsql:host=%s;port=%s;dbname=%s;sslmode=%s',
            self::env('DB_HOST', '127.0.0.1'),
            self::env('DB_PORT', '5432'),
            self::env('DB_NAME', 'eneba'),
            self::env('DB_SSLMODE', 'prefer')
        );
        return new PDO($dsn, self::env('DB_USER'), self::env('DB_PASS'), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
}