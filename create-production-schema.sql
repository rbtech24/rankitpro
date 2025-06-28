-- Create all necessary tables for Rank It Pro production database
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    slug TEXT UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    subscription_status TEXT DEFAULT 'trial',
    subscription_plan TEXT DEFAULT 'starter',
    trial_ends_at TIMESTAMP,
    monthly_ai_limit INTEGER DEFAULT 10,
    ai_usage_count INTEGER DEFAULT 0,
    wordpress_url TEXT,
    wordpress_username TEXT,
    wordpress_password TEXT,
    social_media_accounts JSONB DEFAULT '{}',
    company_settings JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('super_admin', 'company_admin', 'technician')),
    company_id INTEGER REFERENCES companies(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    notification_preferences JSONB DEFAULT '{"emailNotifications": true, "newCheckIns": true, "newBlogPosts": true, "reviewRequests": true, "billingUpdates": true, "pushNotifications": true, "notificationSound": true}',
    appearance_preferences JSONB DEFAULT '{"theme": "light", "language": "en", "timezone": "UTC", "defaultView": "dashboard"}'
);

CREATE TABLE IF NOT EXISTS technicians (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id),
    phone TEXT,
    specialization TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_types (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS check_ins (
    id SERIAL PRIMARY KEY,
    technician_id INTEGER REFERENCES technicians(id),
    company_id INTEGER REFERENCES companies(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    service_address TEXT NOT NULL,
    job_type_id INTEGER REFERENCES job_types(id),
    job_description TEXT,
    before_photos TEXT[],
    after_photos TEXT[],
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    check_in_time TIMESTAMP DEFAULT NOW(),
    notes TEXT,
    price DECIMAL(10,2),
    customer_rating INTEGER,
    blog_post_generated BOOLEAN DEFAULT false,
    review_requested BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    check_in_id INTEGER REFERENCES check_ins(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT,
    meta_description TEXT,
    featured_image_url TEXT,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    wordpress_post_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    check_in_id INTEGER REFERENCES check_ins(id),
    company_id INTEGER REFERENCES companies(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    approved BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'checkin',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    check_in_id INTEGER REFERENCES check_ins(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video')),
    media_url TEXT NOT NULL,
    transcript TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    approved BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_requests (
    id SERIAL PRIMARY KEY,
    check_in_id INTEGER REFERENCES check_ins(id),
    company_id INTEGER REFERENCES companies(id),
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'reviewed')),
    email_sent_at TIMESTAMP,
    email_opened_at TIMESTAMP,
    link_clicked_at TIMESTAMP,
    review_submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    user_id INTEGER REFERENCES users(id),
    service_provider TEXT NOT NULL,
    usage_type TEXT NOT NULL,
    tokens_used INTEGER,
    cost DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_people (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_commissions (
    id SERIAL PRIMARY KEY,
    sales_person_id INTEGER REFERENCES sales_people(id),
    check_in_id INTEGER REFERENCES check_ins(id),
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle TEXT NOT NULL,
    features JSONB DEFAULT '{}',
    ai_limit INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_credentials (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    service_name TEXT NOT NULL,
    credentials JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wordpress_custom_fields (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    field_name TEXT NOT NULL,
    field_value TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session (
    sid TEXT PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    user_id INTEGER REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_ticket_responses (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(id),
    user_id INTEGER REFERENCES users(id),
    response TEXT NOT NULL,
    is_staff_response BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_company_id ON check_ins(company_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_technician_id ON check_ins(technician_id);
CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_company_id ON blog_posts(company_id);

-- Insert the super admin user
INSERT INTO users (email, username, password, role, active, created_at) 
VALUES (
    'bill@mrsprinklerrepair.com',
    'billsprinkler1',
    '$2b$12$oZgSKNhwzWBVGXJEPyZ9S.sTDGgmU/eMWJQmLKIJvFDFAjkq2vI4u',
    'super_admin',
    true,
    NOW()
) ON CONFLICT (email) DO NOTHING;