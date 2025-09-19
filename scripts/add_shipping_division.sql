-- Add shipping_division column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_division TEXT;

-- Update existing orders to have a default value
UPDATE public.orders SET shipping_division = 'Unknown' WHERE shipping_division IS NULL;

-- Add a comment to the column
COMMENT ON COLUMN public.orders.shipping_division IS 'The division/state/province for shipping';