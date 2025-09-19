-- Updated to match the correct database schema with proper column names
-- Insert sample products with correct schema
INSERT INTO public.products (
  name, 
  description, 
  price, 
  original_price,
  category, 
  brand, 
  stock, 
  sku,
  images,
  tags,
  features,
  is_active,
  is_featured
) VALUES
('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 129.99, 'Electronics', 'TechBrand', 50, 'WBH001', ARRAY['/placeholder.svg?height=300&width=300'], ARRAY['wireless', 'bluetooth', 'headphones'], ARRAY['Noise Cancellation', 'Long Battery Life', 'Comfortable Fit'], true, true),
('Smartphone Case', 'Durable protective case for smartphones', 24.99, 34.99, 'Accessories', 'ProtectPro', 100, 'SPC002', ARRAY['/placeholder.svg?height=300&width=300'], ARRAY['case', 'protection', 'smartphone'], ARRAY['Drop Protection', 'Scratch Resistant', 'Easy Access'], true, false),
('Laptop Stand', 'Adjustable aluminum laptop stand', 49.99, NULL, 'Electronics', 'DeskTech', 30, 'LPS003', ARRAY['/placeholder.svg?height=300&width=300'], ARRAY['laptop', 'stand', 'aluminum'], ARRAY['Adjustable Height', 'Aluminum Build', 'Ergonomic Design'], true, false),
('Coffee Mug', 'Ceramic coffee mug with heat retention', 15.99, 19.99, 'Home & Kitchen', 'BrewMaster', 75, 'CFM004', ARRAY['/placeholder.svg?height=300&width=300'], ARRAY['coffee', 'mug', 'ceramic'], ARRAY['Heat Retention', 'Ceramic Material', 'Comfortable Handle'], true, false),
('Fitness Tracker', 'Smart fitness tracker with heart rate monitor', 79.99, 99.99, 'Health & Fitness', 'FitTech', 25, 'FTR005', ARRAY['/placeholder.svg?height=300&width=300'], ARRAY['fitness', 'tracker', 'health'], ARRAY['Heart Rate Monitor', 'Step Counter', 'Sleep Tracking'], true, true),
('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 34.99, NULL, 'Electronics', 'TechBrand', 60, 'WMS006', ARRAY['/placeholder.svg?height=300&width=300'], ARRAY['mouse', 'wireless', 'ergonomic'], ARRAY['Precision Tracking', 'Ergonomic Design', 'Long Battery'], true, false),
('Water Bottle', 'Stainless steel insulated water bottle', 22.99, 29.99, 'Sports & Outdoors', 'HydroFlow', 40, 'WTB007', ARRAY['/placeholder.svg?height=300&width=300'], ARRAY['water', 'bottle', 'insulated'], ARRAY['Insulated', 'Stainless Steel', 'Leak Proof'], true, false),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 39.99, NULL, 'Home & Office', 'LightPro', 35, 'DSL008', ARRAY['/placeholder.svg?height=300&width=300'], ARRAY['lamp', 'led', 'desk'], ARRAY['LED Technology', 'Adjustable Brightness', 'Energy Efficient'], true, false);
