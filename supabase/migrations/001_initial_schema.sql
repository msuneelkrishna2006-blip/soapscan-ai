-- SoapScan AI — Initial Database Schema for Supabase / PostgreSQL
-- Comprehensive schema with Row Level Security (RLS) and Audit Logging

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Family Members / Profiles Table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '👤',
    role TEXT DEFAULT 'Member', -- 'Admin', 'Adult', 'Child', 'Guest'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    variant TEXT,
    product_type TEXT NOT NULL CHECK (product_type IN ('soap_bar', 'liquid_handwash', 'body_wash', 'other')),
    initial_quantity NUMERIC(10, 2) NOT NULL CHECK (initial_quantity > 0),
    remaining_quantity NUMERIC(10, 2) NOT NULL CHECK (remaining_quantity >= 0),
    unit TEXT NOT NULL CHECK (unit IN ('g', 'ml', 'kg', 'l')),
    tare_weight_g NUMERIC(10, 2) DEFAULT 0 CHECK (tare_weight_g >= 0),
    cost_inr NUMERIC(10, 2) DEFAULT 0 CHECK (cost_inr >= 0),
    location TEXT DEFAULT 'Master Bathroom',
    assigned_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    barcode TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished', 'archived')),
    is_sample_data BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    finished_at TIMESTAMPTZ
);

-- 4. Usage Events Ledger & Audit Trail
CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    consumed_quantity NUMERIC(10, 2) NOT NULL CHECK (consumed_quantity >= 0),
    unit TEXT NOT NULL CHECK (unit IN ('g', 'ml')),
    previous_quantity NUMERIC(10, 2) NOT NULL CHECK (previous_quantity >= 0),
    new_quantity NUMERIC(10, 2) NOT NULL CHECK (new_quantity >= 0),
    method TEXT NOT NULL CHECK (method IN ('SCALE', 'MANUAL', 'PUMP_ESTIMATE', 'SAMPLE')),
    scale_reading NUMERIC(10, 2),
    tare_weight NUMERIC(10, 2),
    pump_count INTEGER,
    ml_per_pump NUMERIC(5, 2) DEFAULT 1.5,
    notes TEXT,
    is_sample_data BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    audit_trail JSONB DEFAULT '[]'::jsonb
);

-- 5. Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    low_stock_threshold_percent INTEGER DEFAULT 20,
    depletion_warning_days INTEGER DEFAULT 5,
    stale_measurement_alert_days INTEGER DEFAULT 7,
    browser_notifications_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Indices for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON public.inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_created ON public.inventory_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_product ON public.usage_events(product_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created ON public.usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_member ON public.usage_events(member_id);

-- 7. Trigger to Auto-Update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 8. Enable Row-Level Security (RLS)
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Default permissive policy for authenticated / anon users (can be scoped per household auth)
CREATE POLICY "Public full access on family_members" ON public.family_members FOR ALL USING (true);
CREATE POLICY "Public full access on inventory_items" ON public.inventory_items FOR ALL USING (true);
CREATE POLICY "Public full access on usage_events" ON public.usage_events FOR ALL USING (true);
CREATE POLICY "Public full access on notification_preferences" ON public.notification_preferences FOR ALL USING (true);
