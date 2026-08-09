-- ==============================================================================
-- SUPABASE DATABASE SCHEMA FOR EXECUTIVE FUNNEL & MULTI-TENANT LEADS PLATFORM
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLE: funnel_workspaces
-- Stores hosted landing page HTML, subdomains, custom domains, and dynamic survey questions
CREATE TABLE IF NOT EXISTS public.funnel_workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subdomain TEXT UNIQUE NOT NULL,
    custom_domain TEXT UNIQUE,
    landing_html TEXT NOT NULL,
    survey_questions JSONB NOT NULL DEFAULT '[
        {
            "id": "q1",
            "label": "Select Your Industry",
            "options": ["Service Business", "Manufacturer / Distributor", "Doctor / Clinic", "E-commerce", "Real Estate"]
        },
        {
            "id": "q2",
            "label": "Are You Ready to Invest in Growth?",
            "options": ["Yes", "Maybe", "No"]
        },
        {
            "id": "q3",
            "label": "Monthly Business Revenue",
            "options": ["Below ₹5L", "₹5L – ₹10L", "₹25L – ₹50L", "₹50L+"]
        },
        {
            "id": "q4",
            "label": "Your Current Role",
            "options": ["Founder / Owner", "Marketing Head", "Partner", "Manager"]
        }
    ]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE TABLE: leads
-- Stores all lead submissions captured from Popup 1 (Contact), Popup 2 (Survey), and Popup 3 (Meeting)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID REFERENCES public.funnel_workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    step_progress TEXT NOT NULL DEFAULT 'contact_only', -- Options: 'contact_only', 'survey_completed', 'meeting_booked'
    survey_responses JSONB DEFAULT '{}'::jsonb,
    meeting_date DATE,
    meeting_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.funnel_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for funnel_workspaces
CREATE POLICY "Users can manage their own workspace"
    ON public.funnel_workspaces
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Public read for subdomains"
    ON public.funnel_workspaces
    FOR SELECT
    USING (true);

-- 6. RLS Policies for leads
CREATE POLICY "Workspace owners can view their leads"
    ON public.leads
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Public insert for lead form popup submissions"
    ON public.leads
    FOR INSERT
    WITH CHECK (true);

-- 7. Indexes for Fast Subdomain & User Queries
CREATE INDEX IF NOT EXISTS idx_funnel_subdomain ON public.funnel_workspaces(subdomain);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_funnel_id ON public.leads(funnel_id);
