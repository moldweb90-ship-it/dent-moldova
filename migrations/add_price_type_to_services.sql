-- Add priceType field to services table
ALTER TABLE services ADD COLUMN price_type VARCHAR NOT NULL DEFAULT 'fixed';

-- Add comment to explain the field
COMMENT ON COLUMN services.price_type IS 'Type of price: "fixed" for exact price, "from" for minimum price';




















