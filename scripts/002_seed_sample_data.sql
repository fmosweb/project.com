-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Electronics', 'Electronic devices and gadgets', '/placeholder.svg?height=200&width=200'),
('Clothing', 'Fashion and apparel', '/placeholder.svg?height=200&width=200'),
('Books', 'Books and literature', '/placeholder.svg?height=200&width=200'),
('Home & Garden', 'Home improvement and gardening', '/placeholder.svg?height=200&width=200'),
('Sports', 'Sports equipment and accessories', '/placeholder.svg?height=200&width=200');

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_featured) VALUES
('Smartphone Pro Max', 'Latest flagship smartphone with advanced features', 999.99, (SELECT id FROM categories WHERE name = 'Electronics'), '/placeholder.svg?height=300&width=300', 50, true),
('Wireless Headphones', 'Premium noise-cancelling wireless headphones', 299.99, (SELECT id FROM categories WHERE name = 'Electronics'), '/placeholder.svg?height=300&width=300', 100, true),
('Designer T-Shirt', 'Premium cotton designer t-shirt', 49.99, (SELECT id FROM categories WHERE name = 'Clothing'), '/placeholder.svg?height=300&width=300', 200, false),
('Running Shoes', 'Professional running shoes for athletes', 129.99, (SELECT id FROM categories WHERE name = 'Sports'), '/placeholder.svg?height=300&width=300', 75, true),
('Programming Book', 'Complete guide to modern web development', 39.99, (SELECT id FROM categories WHERE name = 'Books'), '/placeholder.svg?height=300&width=300', 30, false),
('Smart Watch', 'Fitness tracking smartwatch with GPS', 249.99, (SELECT id FROM categories WHERE name = 'Electronics'), '/placeholder.svg?height=300&width=300', 80, true),
('Yoga Mat', 'Premium non-slip yoga mat', 29.99, (SELECT id FROM categories WHERE name = 'Sports'), '/placeholder.svg?height=300&width=300', 150, false),
('Coffee Maker', 'Automatic drip coffee maker', 89.99, (SELECT id FROM categories WHERE name = 'Home & Garden'), '/placeholder.svg?height=300&width=300', 40, false);

-- Insert sample customers
INSERT INTO customers (email, first_name, last_name, phone) VALUES
('john.doe@example.com', 'John', 'Doe', '+1234567890'),
('jane.smith@example.com', 'Jane', 'Smith', '+1234567891'),
('mike.johnson@example.com', 'Mike', 'Johnson', '+1234567892'),
('sarah.wilson@example.com', 'Sarah', 'Wilson', '+1234567893'),
('david.brown@example.com', 'David', 'Brown', '+1234567894');

-- Insert sample orders
INSERT INTO orders (customer_id, status, total_amount, shipping_address, billing_address, payment_status) VALUES
((SELECT id FROM customers WHERE email = 'john.doe@example.com'), 'delivered', 1299.98, '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', 'paid'),
((SELECT id FROM customers WHERE email = 'jane.smith@example.com'), 'shipped', 179.98, '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90210", "country": "USA"}', '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90210", "country": "USA"}', 'paid'),
((SELECT id FROM customers WHERE email = 'mike.johnson@example.com'), 'processing', 89.99, '{"street": "789 Pine St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}', '{"street": "789 Pine St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}', 'paid'),
((SELECT id FROM customers WHERE email = 'sarah.wilson@example.com'), 'pending', 299.99, '{"street": "321 Elm St", "city": "Houston", "state": "TX", "zip": "77001", "country": "USA"}', '{"street": "321 Elm St", "city": "Houston", "state": "TX", "zip": "77001", "country": "USA"}', 'pending');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
((SELECT id FROM orders WHERE total_amount = 1299.98), (SELECT id FROM products WHERE name = 'Smartphone Pro Max'), 1, 999.99, 999.99),
((SELECT id FROM orders WHERE total_amount = 1299.98), (SELECT id FROM products WHERE name = 'Wireless Headphones'), 1, 299.99, 299.99),
((SELECT id FROM orders WHERE total_amount = 179.98), (SELECT id FROM products WHERE name = 'Designer T-Shirt'), 2, 49.99, 99.98),
((SELECT id FROM orders WHERE total_amount = 179.98), (SELECT id FROM products WHERE name = 'Yoga Mat'), 1, 29.99, 29.99),
((SELECT id FROM orders WHERE total_amount = 179.98), (SELECT id FROM products WHERE name = 'Designer T-Shirt'), 1, 49.99, 49.99),
((SELECT id FROM orders WHERE total_amount = 89.99), (SELECT id FROM products WHERE name = 'Coffee Maker'), 1, 89.99, 89.99),
((SELECT id FROM orders WHERE total_amount = 299.99), (SELECT id FROM products WHERE name = 'Wireless Headphones'), 1, 299.99, 299.99);

-- Insert default admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', 'Admin User', 'super_admin');
