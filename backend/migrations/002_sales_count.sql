ALTER TABLE products ADD COLUMN sales_count INT NOT NULL DEFAULT 0;
CREATE INDEX idx_products_sales ON products(sales_count DESC);