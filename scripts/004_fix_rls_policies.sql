-- Disable RLS on products table for admin operations
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Alternatively, create RLS policies that allow all operations (for admin use)
-- If you prefer to keep RLS enabled, uncomment the following lines instead:
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all operations on products" ON products
-- FOR ALL USING (true) WITH CHECK (true);
-- 
-- CREATE POLICY "Allow read access to products" ON products
-- FOR SELECT USING (true);
-- 
-- CREATE POLICY "Allow insert access to products" ON products
-- FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow update access to products" ON products
-- FOR UPDATE USING (true) WITH CHECK (true);
-- 
-- CREATE POLICY "Allow delete access to products" ON products
-- FOR DELETE USING (true);

-- Also disable RLS on other tables for admin operations
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
