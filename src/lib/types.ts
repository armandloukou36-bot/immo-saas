/* Types partagés entre les composants serveur et client. */

export type Property = {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string | null;
  surface: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  price: number | null;
  rental_price: number | null;
  status: string;
  featured: number;
  description: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  property_id: string | null;
  type: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export type ClientWithProperty = Client & { property_name: string | null };

export type Lease = {
  id: string;
  reference: string;
  property_id: string | null;
  client_id: string | null;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  deposit: number;
  status: string;
  notes: string | null;
  created_at: string;
};

export type LeaseWithRelations = Lease & {
  property_name: string | null;
  client_name: string | null;
};

export type Invoice = {
  id: string;
  lease_id: string | null;
  client_id: string | null;
  property_id: string | null;
  invoice_number: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  recurrence: string;
  description: string | null;
  created_at: string;
};

export type InvoiceWithRelations = Invoice & {
  client_name: string | null;
  property_name: string | null;
  lease_reference: string | null;
  paid_total: number;
};

export type Payment = {
  id: string;
  invoice_id: string | null;
  amount: number;
  payment_date: string;
  method: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

export type Reminder = {
  id: string;
  invoice_id: string | null;
  client_id: string | null;
  type: string;
  subject: string | null;
  message: string | null;
  scheduled_date: string;
  sent_at: string | null;
  status: string;
  channel: string;
  created_at: string;
};

export type ReminderWithRelations = Reminder & {
  client_name: string | null;
  invoice_number: string | null;
};

export type RecoveryCase = {
  id: string;
  reference: string;
  invoice_id: string | null;
  client_id: string | null;
  property_id: string | null;
  amount_due: number;
  opened_at: string;
  status: string;
  assigned_to: string | null;
  resolution: string | null;
  notes: string | null;
  closure_date: string | null;
  created_at: string;
};

export type RecoveryWithRelations = RecoveryCase & {
  client_name: string | null;
  property_name: string | null;
  invoice_number: string | null;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  address: string | null;
  email: string | null;
  phone: string | null;
};

export type TeamUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  enabled: number;
  last_login_at: string | null;
  created_at: string;
};

/** Option minimaliste pour les listes déroulantes. */
export type Option = { value: string; label: string };
