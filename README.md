Paleisti backenda - php -S localhost:8080 -t public

Testai:

curl http://localhost:8080/api/health

curl -i -c c.txt -H "Content-Type: application/json" -d "{\"email\":\"a@b.com\",\"name\":\"Test\",\"password\":\"password123\"}" http://localhost:8080/api/auth/register
curl -b c.txt http://localhost:8080/api/auth/me
curl http://localhost:8080/api/auth/me

curl "http://localhost:8080/api/products?per_page=2"
curl "http://localhost:8080/api/products?q=cyberpnk"
curl "http://localhost:8080/api/products?q=witch&platform=steam,xbox&sort=price_asc"
curl "http://localhost:8080/api/search/suggest?q=elden"
curl "http://localhost:8080/api/filters"

