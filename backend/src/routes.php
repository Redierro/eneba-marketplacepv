<?php
use App\Controllers\AuthController;
use App\Http\Json;
use App\Middleware\AuthMiddleware;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use App\Controllers\ProductController;
use App\Controllers\HomeController;
use App\Controllers\CartController;
use App\Controllers\OrderController;

return function (App $app) {
    $app->group('/api', function (RouteCollectorProxy $g) {
        $g->get('/health', function (Request $req, Response $res) {
            $this->get(PDO::class)->query('SELECT 1');
            return Json::respond($res, ['status' => 'ok']);
        });

        $g->post('/auth/register', [AuthController::class, 'register']);
        $g->post('/auth/login', [AuthController::class, 'login']);
        $g->post('/auth/logout', [AuthController::class, 'logout']);
		
		$g->get('/products', [ProductController::class, 'index']);
		$g->get('/products/{slug}', [ProductController::class, 'show']);
		$g->get('/search/suggest', [ProductController::class, 'suggest']);
		$g->get('/filters', [ProductController::class, 'filters']);
		
		$g->get('/home/layout', [HomeController::class, 'layout']);
		$g->get('/home/banners', [HomeController::class, 'banners']);
		$g->get('/home/best-sellers', [HomeController::class, 'bestSellers']);
		$g->get('/home/deals', [HomeController::class, 'deals']);
		$g->get('/home/new-releases', [HomeController::class, 'newReleases']);
		
		$g->get('/home/categories', [HomeController::class, 'categories']);
		
		$g->post('/cart/quote', [CartController::class, 'quote']);
		
        $g->group('', function (RouteCollectorProxy $p) {
            $p->get('/auth/me', [AuthController::class, 'me']);
			$p->post('/checkout', [OrderController::class, 'checkout']);
			$p->get('/orders', [OrderController::class, 'index']);
			$p->get('/orders/{id}', [OrderController::class, 'show']);
        })->add(AuthMiddleware::class);
    });
};