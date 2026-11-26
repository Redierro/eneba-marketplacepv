<?php
use App\Database;
use DI\Container;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';
Dotenv\Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();

$container = new Container();
$container->set(PDO::class, fn() => Database::connect());
AppFactory::setContainer($container);

$app = AppFactory::create();
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

$debug = filter_var(Database::env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN);
$errors = $app->addErrorMiddleware($debug, true, true);
$errors->getDefaultErrorHandler()->forceContentType('application/json');

(require __DIR__ . '/../src/routes.php')($app);

$app->run();