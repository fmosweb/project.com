-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read access)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can insert categories" ON public.categories FOR INSERT WITH CHECK (false);
CREATE POLICY "Only admins can update categories" ON public.categories FOR UPDATE USING (false);
CREATE POLICY "Only admins can delete categories" ON public.categories FOR DELETE USING (false);

-- Insert default categories
INSERT INTO public.categories (name, description, icon, image_url, color) VALUES
('Electronics', 'Latest gadgets, smartphones, laptops and tech accessories', 'Smartphone', '/modern-electronics.png', 'bg-blue-500'),
('Fashion', 'Trendy clothing, shoes, and accessories for all occasions', 'Shirt', '/fashion-clothing-collection.png', 'bg-pink-500'),
('Home & Garden', 'Furniture, decor, and gardening essentials for your space', 'Home', '/cozy-living-room.png', 'bg-green-500'),
('Sports', 'Sports equipment, fitness gear, and outdoor activities', 'Dumbbell', '/sports-equipment-fitness.jpg', 'bg-orange-500'),
('Books', 'Educational books, novels, and digital publications', 'BookOpen', '/books-library-collection.jpg', 'bg-purple-500'),
('Toys', 'Fun toys, games, and educational items for children', 'Gamepad2', '/children-toys-games.jpg', 'bg-yellow-500');