export const schema = `
-- ============================================
-- IMMO SAAS — SCHEMA BASE DE DONNÉES
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Organizations (entreprises/abonnés)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free','basic','pro','enterprise')),
  subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active','expired','cancelled','past_due')),
  subscription_start_date DATE,
  subscription_end_date DATE,
  stripe_customer_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('admin','manager','agent','viewer')),
  enabled BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties (biens immobiliers)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('villa','appartement','terrain','local','bureau','hotel','autre')),
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Côte d''Ivoire',
  region VARCHAR(100) DEFAULT 'Abidjan',
  neighborhood VARCHAR(100),
  description TEXT,
  surface NUMERIC(10,2),
  land_surface NUMERIC(10,2),
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  construction_year INTEGER,
  price NUMERIC(15,2),
  rental_price NUMERIC(15,2),
  status VARCHAR(50) DEFAULT 'disponible' CHECK (status IN ('disponible','loué','en_negociation','vendu','reserve','en_construction')),
  features JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients (CRM)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('propriétaire','locataire','prospect','vendeur','autre')),
  title VARCHAR(50),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  phone_alt VARCHAR(50),
  address VARCHAR(500),
  city VARCHAR(100),
  status VARCHAR(50) DEFAULT 'actif' CHECK (status IN ('actif','inactif','lead','negotiation')),
  crud_notes TEXT,
  commercial_notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leases (baux)
CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_rent NUMERIC(15,2) NOT NULL,
  deposit NUMERIC(15,2) DEFAULT 0,
  deposit_returned BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','terminated','expired','pending','draft')),
  terms TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices (factures)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled','write_off')),
  description TEXT,
  recurrence VARCHAR(50) DEFAULT 'monthly' CHECK (recurrence IN ('monthly','yearly','one-time','weekly')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders (relances)
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('rent_reminder','payment_reminder','recovery_notice','general')),
  subject VARCHAR(255),
  message TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','cancelled')),
  channel VARCHAR(50) DEFAULT 'email' CHECK (channel IN ('email','sms','in_app','none')),
  sent_to VARCHAR(255),
  error_message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery cases (recouvrement)
CREATE TABLE IF NOT EXISTS recovery_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  amount_due NUMERIC(15,2) NOT NULL,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','investigating','notice_sent','legal_action','resolved','closed','waived')),
  assigned_to UUID REFERENCES users(id),
  resolution TEXT,
  notes TEXT,
  closure_date DATE,
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (paiements)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash','bank_transfer','card','cheque','mobile_money','stripe','other')),
  reference VARCHAR(255),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('create','read','update','delete','login','logout','export','import')),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_properties_org ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_type ON clients(type);
CREATE INDEX IF NOT EXISTS idx_leases_org ON leases(organization_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_org ON reminders(organization_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_org ON recovery_cases(organization_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_status ON recovery_cases(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Fonction pour obtenir l'org_id courant depuis le JWT
CREATE OR REPLACE FUNCTION get_org_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'org_id', '')::uuid;
$$ LANGUAGE SQL STABLE;

-- Policies par organisation
CREATE POLICY org_isolation ON organizations
  FOR ALL TO authenticated
  USING (id = get_org_id());

CREATE POLICY org_users_access ON users
  FOR ALL TO authenticated
  USING (organization_id = get_org_id());

CREATE POLICY org_properties_access ON properties
  FOR ALL TO authenticated
  USING (organization_id = get_org_id());

CREATE POLICY org_clients_access ON clients
  FOR ALL TO authenticated
  USING (organization_id = get_org_id());

CREATE POLICY org_leases_access ON leases
  FOR ALL TO authenticated
  USING (organization_id = get_org_id());

CREATE POLICY org_invoices_access ON invoices
  FOR ALL TO authenticated
  USING (organization_id = get_org_id());

CREATE POLICY org_reminders_access ON reminders
  FOR ALL TO authenticated
  USING (organization_id = get_org_id());

CREATE POLICY org_recovery_access ON recovery_cases
  FOR ALL TO authenticated
  USING (organization_id = get_org_id());

CREATE POLICY org_payments_access ON payments
  FOR ALL TO authenticated
  USING (organization_id = get_org_id());

CREATE POLICY org_audit_access ON audit_logs
  FOR ALL TO authenticated
  USING (organization_id = get_org_id());

-- ============================================
-- TRIGGERS
-- ============================================

-- Mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leases_updated_at
  BEFORE UPDATE ON leases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_recovery_updated_at
  BEFORE UPDATE ON recovery_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Fonction pour logger les actions
CREATE OR REPLACE FUNCTION log_action()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_entity_type TEXT;
  v_entity_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_entity_type := TG_TABLE_NAME;
    v_entity_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_entity_type := TG_TABLE_NAME;
    v_entity_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_entity_type := TG_TABLE_NAME;
    v_entity_id := OLD.id;
  END IF;

  INSERT INTO audit_logs (organization_id, user_id, action, entity_type, entity_id, details, ip_address)
  VALUES (
    get_org_id(),
    NULL,
    v_action,
    v_entity_type,
    v_entity_id,
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)),
    current_setting('request.jwt.claims', true)::jsonb->>'ip'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour audit (sauf audit_logs lui-même)
CREATE TRIGGER log_orgs_change
  AFTER INSERT OR UPDATE OR DELETE ON organizations FOR EACH ROW EXECUTE FUNCTION log_action();
CREATE TRIGGER log_properties_change
  AFTER INSERT OR UPDATE OR DELETE ON properties FOR EACH ROW EXECUTE FUNCTION log_action();
CREATE TRIGGER log_clients_change
  AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION log_action();
CREATE TRIGGER log_leases_change
  AFTER INSERT OR UPDATE OR DELETE ON leases FOR EACH ROW EXECUTE FUNCTION log_action();
CREATE TRIGGER log_invoices_change
  AFTER INSERT OR UPDATE OR DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION log_action();
CREATE TRIGGER log_reminders_change
  AFTER INSERT OR UPDATE OR DELETE ON reminders FOR EACH ROW EXECUTE FUNCTION log_action();
CREATE TRIGGER log_recovery_change
  AFTER INSERT OR UPDATE OR DELETE ON recovery_cases FOR EACH ROW EXECUTE FUNCTION log_action();

-- Fonction pour générer le numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number(org_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  last_num INTEGER;
  year INT;
  new_num VARCHAR;
BEGIN
  year := EXTRACT(YEAR FROM NOW());
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0)
  INTO last_num
  FROM invoices
  WHERE organization_id = org_id
    AND invoice_number LIKE ('INV-' || year || '-%');
  new_num := 'INV-' || year || '-' || LPAD((last_num + 1)::TEXT, 4, '0');
  RETURN new_num;
END;
$$ LANGUAGE plpgsql;

-- Vue pour le dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM properties WHERE organization_id = get_org_id()) AS total_properties,
  (SELECT COUNT(*) FROM properties WHERE organization_id = get_org_id() AND status = 'disponible') AS available_properties,
  (SELECT COUNT(*) FROM properties WHERE organization_id = get_org_id() AND status = 'loué') AS leased_properties,
  (SELECT COUNT(*) FROM clients WHERE organization_id = get_org_id()) AS total_clients,
  (SELECT COUNT(*) FROM leases WHERE organization_id = get_org_id() AND status = 'active') AS active_leases,
  (SELECT COUNT(*) FROM invoices WHERE organization_id = get_org_id() AND status = 'pending') AS pending_invoices,
  (SELECT COUNT(*) FROM invoices WHERE organization_id = get_org_id() AND status = 'overdue') AS overdue_invoices,
  (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE organization_id = get_org_id() AND status = 'pending') AS pending_amount,
  (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE organization_id = get_org_id() AND status = 'overdue') AS overdue_amount,
  (SELECT COUNT(*) FROM recovery_cases WHERE organization_id = get_org_id() AND status IN ('open','investigating')) AS open_recovery_cases,
  (SELECT COUNT(*) FROM invoices WHERE organization_id = get_org_id() AND status = 'paid' AND paid_date >= DATE_TRUNC('month', NOW())) AS paid_this_month
;

-- Vue pour les factures du mois
CREATE OR REPLACE VIEW monthly_invoices AS
SELECT
  i.id,
  i.invoice_number,
  i.amount,
  i.due_date,
  i.paid_date,
  i.status,
  i.recurrence,
  l.monthly_rent,
  p.name AS property_name,
  c.full_name AS client_name
FROM invoices i
JOIN leases l ON i.lease_id = l.id
JOIN properties p ON i.property_id = p.id
JOIN clients c ON i.client_id = c.id
WHERE i.organization_id = get_org_id()
  AND i.status NOT IN ('cancelled', 'write_off')
ORDER BY i.due_date ASC;

-- Fonction pour créer une facture de loyer automatique
CREATE OR REPLACE FUNCTION create_monthly_rent_invoice(org_id UUID, lease_id UUID, invoice_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
  v_lease RECORD;
  v_client RECORD;
  v_property RECORD;
  v_invoice_id UUID;
  v_next_due DATE;
  v_amount NUMERIC;
BEGIN
  SELECT * INTO v_lease FROM leases WHERE id = lease_id AND organization_id = org_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bail non trouvé';
  END IF;

  IF v_lease.status != 'active' THEN
    RAISE EXCEPTION 'Bail non actif';
  END IF;

  SELECT * INTO v_client FROM clients WHERE id = v_lease.client_id;
  SELECT * INTO v_property FROM properties WHERE id = v_lease.property_id;

  -- Calcul date d'échéance (1er du mois suivant)
  v_next_due := DATE_TRUNC('month', invoice_date + INTERVAL '1 month');
  v_amount := v_lease.monthly_rent;

  INSERT INTO invoices (
    organization_id, lease_id, client_id, property_id,
    invoice_number, amount, due_date, status, description, recurrence,
    created_by, created_at
  ) VALUES (
    org_id, lease_id, v_lease.client_id, v_lease.property_id,
    generate_invoice_number(org_id), v_amount, v_next_due,
    'pending', 'Loyer mensuel - ' || v_property.name, 'monthly',
    NULL, NOW()
  ) RETURNING id INTO v_invoice_id;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;
`;
