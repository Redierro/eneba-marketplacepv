<?php
require __DIR__ . '/vendor/autoload.php';
Dotenv\Dotenv::createImmutable(__DIR__)->load();

$pdo = new PDO(
    sprintf('pgsql:host=%s;port=%s;dbname=%s', $_ENV['DB_HOST'], $_ENV['DB_PORT'], $_ENV['DB_NAME']),
    $_ENV['DB_USER'], $_ENV['DB_PASS'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);
mt_srand(42);

function slugify(string $s): string {
    return trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($s)), '-');
}
function cover(string $title, int $i): string {
    $h1 = ($i * 47) % 360; $h2 = ($h1 + 40) % 360;
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="530"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        . "<stop offset=\"0\" stop-color=\"hsl($h1,70%,35%)\"/><stop offset=\"1\" stop-color=\"hsl($h2,70%,15%)\"/></linearGradient></defs>"
        . '<rect width="400" height="530" fill="url(#g)"/><text x="200" y="265" fill="#fff" font-family="sans-serif" font-size="26" font-weight="700" text-anchor="middle">'
        . htmlspecialchars($title) . '</text></svg>';
    return 'data:image/svg+xml;base64,' . base64_encode($svg);
}
function keyString(): string {
    $c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $parts = [];
    for ($p = 0; $p < 3; $p++) {
        $s = '';
        for ($i = 0; $i < 5; $i++) $s .= $c[mt_rand(0, strlen($c) - 1)];
        $parts[] = $s;
    }
    return implode('-', $parts);
}
function insertLookup(PDO $pdo, string $table, array $names): array {
    $ids = [];
    $st = $pdo->prepare("INSERT INTO $table (name, slug) VALUES (?, ?) RETURNING id");
    foreach ($names as $n) {
        $st->execute([$n, slugify($n)]);
        $ids[] = (int)$st->fetchColumn();
    }
    return $ids;
}

$titles = [
    'Elden Ring', 'Cyberpunk 2077', 'The Witcher 3: Wild Hunt', 'Red Dead Redemption 2', 'Grand Theft Auto V',
    'Hogwarts Legacy', 'Baldur\'s Gate 3', 'Starfield', 'Call of Duty: Modern Warfare III', 'EA Sports FC 25',
    'Forza Horizon 5', 'Gran Turismo 7', 'Resident Evil 4', 'Dark Souls III', 'Sekiro: Shadows Die Twice',
    'Assassin\'s Creed Valhalla', 'Far Cry 6', 'Hades', 'Hollow Knight', 'Stardew Valley',
    'Terraria', 'Minecraft', 'Civilization VI', 'Total War: Warhammer III', 'Age of Empires IV',
    'The Sims 4', 'Cities: Skylines', 'Football Manager 2025', 'NBA 2K25', 'F1 24',
    'Mortal Kombat 1', 'Tekken 8', 'Street Fighter 6', 'Diablo IV', 'Path of Exile 2',
    'Borderlands 3', 'Doom Eternal', 'Battlefield 2042', 'Apex Legends Coins', 'Overwatch 2',
    'Zelda: Tears of the Kingdom', 'Super Mario Odyssey', 'Mario Kart 8 Deluxe', 'Animal Crossing: New Horizons', 'Pokemon Scarlet',
    'Halo Infinite', 'Gears 5', 'Sea of Thieves', 'Palworld', 'Helldivers 2',
];
$platformNames = ['Steam', 'Xbox', 'PlayStation', 'Nintendo Switch', 'EA App', 'Epic Games'];
$regionNames   = ['Global', 'Europe', 'North America', 'United Kingdom'];
$genreNames    = ['Action', 'RPG', 'Shooter', 'Strategy', 'Adventure', 'Sports', 'Racing', 'Simulation'];
$sellerNames   = ['KeyMaster', 'GameVault', 'PixelDeals', 'LootHouse', 'DigitalDragon', 'CheapKeys24', 'NordGames', 'BlueFox Store'];

$pdo->beginTransaction();
$pdo->exec('TRUNCATE users, platforms, regions, genres, products, sellers, offers, game_keys, carts, cart_items, orders, order_items, payments, banners, home_blocks RESTART IDENTITY CASCADE');

$platformIds = insertLookup($pdo, 'platforms', $platformNames);
$regionIds   = insertLookup($pdo, 'regions', $regionNames);
$genreIds    = insertLookup($pdo, 'genres', $genreNames);

$sellerIds = [];
$st = $pdo->prepare('INSERT INTO sellers (name, rating) VALUES (?, ?) RETURNING id');
foreach ($sellerNames as $n) {
    $st->execute([$n, number_format(mt_rand(38, 50) / 10, 1)]);
    $sellerIds[] = (int)$st->fetchColumn();
}

$insProduct = $pdo->prepare('INSERT INTO products (slug, name, description, image_url, platform_id, genre_id, release_date, base_price, sales_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id');
$insOffer = $pdo->prepare('INSERT INTO offers (product_id, seller_id, region_id, price, old_price) VALUES (?, ?, ?, ?, ?) RETURNING id');
$insKey   = $pdo->prepare('INSERT INTO game_keys (offer_id, key_value) VALUES (?, ?)');

$n = 0;
foreach ($titles as $ti => $title) {
    $genreId = $genreIds[$ti % count($genreIds)];
    $count = mt_rand(1, 3);
    $pidx = array_rand($platformIds, $count);
    foreach ((array)$pidx as $pi) {
        $n++;
        $name = "$title ({$platformNames[$pi]})";
        $base = mt_rand(5, 69) + 0.99;
        $date = date('Y-m-d', strtotime('-' . mt_rand(1, 1100) . ' days'));
        $desc = "$title for {$platformNames[$pi]}. Instant digital key delivery. Activate on your account and start playing right away. "
              . 'Compare offers from multiple sellers and pick the best price for your region.';
        $insProduct->execute([slugify($name), $name, $desc, cover($title, $n), $platformIds[$pi], $genreId, $date, $base, mt_rand(0, 5000)]);
        $productId = (int)$insProduct->fetchColumn();

        $sellers = (array)array_rand($sellerIds, mt_rand(3, 6));
        foreach ($sellers as $si) {
            $price = round($base * mt_rand(60, 105) / 100, 2);
            $old = mt_rand(1, 100) <= 35 ? round($price * mt_rand(115, 160) / 100, 2) : null;
            $insOffer->execute([$productId, $sellerIds[$si], $regionIds[array_rand($regionIds)], $price, $old]);
            $offerId = (int)$insOffer->fetchColumn();
            for ($k = 0, $kc = mt_rand(2, 12); $k < $kc; $k++) $insKey->execute([$offerId, keyString()]);
        }
    }
}

$pdo->exec("INSERT INTO banners (title, subtitle, link_url, position) VALUES
    ('Black Friday Deals', 'Up to 70% off top games', '/store?sort=discount', 1),
    ('New Releases', 'Fresh keys, instant delivery', '/store?sort=newest', 2),
    ('Best Sellers', 'What everyone is playing', '/store?sort=popular', 3)");

$pdo->exec("INSERT INTO home_blocks (type, title, endpoint, position) VALUES
    ('banner', 'Featured', '/home/banners', 1),
    ('product_row', 'Best sellers', '/home/best-sellers', 2),
    ('product_row', 'Hot deals', '/home/deals', 3),
    ('product_row', 'New releases', '/home/new-releases', 4),
    ('category_grid', 'Categories', '/home/categories', 5)");

$pdo->commit();
echo "Seeded $n products\n";