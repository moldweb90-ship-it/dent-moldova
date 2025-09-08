-- Add analytics events table
CREATE TABLE analytics_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id VARCHAR REFERENCES clinics(id),
  event_type VARCHAR NOT NULL,
  ip_address VARCHAR NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_analytics_events_clinic_id ON analytics_events(clinic_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_clinic_created ON analytics_events(clinic_id, created_at);

-- Add comment
COMMENT ON TABLE analytics_events IS 'Table for tracking user interactions with clinics';
COMMENT ON COLUMN analytics_events.event_type IS 'Type of event: view, click_details, click_book, click_phone, click_website';
