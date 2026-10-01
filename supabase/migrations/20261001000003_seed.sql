-- ============================================================
-- Jeu de données de démonstration
-- Inséré dans l'organisation du compte demo@immo-saas.ci.
-- Idempotent : ne fait rien si des biens existent déjà.
-- ============================================================

do $$
declare
  v_org uuid;
  v_user uuid;
  v_p1 uuid; v_p2 uuid; v_p3 uuid; v_p4 uuid; v_p5 uuid; v_p6 uuid; v_p7 uuid; v_p8 uuid;
  v_c1 uuid; v_c2 uuid; v_c3 uuid; v_c4 uuid; v_c5 uuid; v_c6 uuid;
  v_l1 uuid; v_l2 uuid; v_l3 uuid; v_l4 uuid; v_l5 uuid; v_l6 uuid;
  v_i1 uuid; v_i2 uuid; v_i3 uuid; v_i4 uuid; v_i5 uuid;
  v_year int := extract(year from now());
begin
  select id into v_org from organizations where slug = 'mon-agence-immobiliere' or name = 'Mon Agence Immobilière' limit 1;
  if v_org is null then
    raise notice 'Organisation de démonstration introuvable';
    return;
  end if;

  select id into v_user from profiles where organization_id = v_org limit 1;

  if exists (select 1 from properties where organization_id = v_org) then
    raise notice 'Données de démonstration déjà présentes';
    return;
  end if;

  -- ---------- BIENS ----------
  insert into properties (organization_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured)
  values (v_org, 'Villa Cocody', 'villa', 'Cocody Angré, Abidjan', 'Cocody', 280, 5, 4, 3, 45000000, 2500000, 'loué', true)
  returning id into v_p1;
  insert into properties (organization_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured)
  values (v_org, 'Appartement Les Palmiers', 'appartement', 'Les Palmiers, Cocody', 'Cocody', 145, 3, 2, 2, 18500000, 1800000, 'disponible', true)
  returning id into v_p2;
  insert into properties (organization_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured)
  values (v_org, 'Terrain Angré', 'terrain', 'Angré, Cocody', 'Cocody', 500, 0, 0, 0, 12000000, 0, 'disponible', false)
  returning id into v_p3;
  insert into properties (organization_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured)
  values (v_org, 'Villa Monte-Carlo', 'villa', 'Monte-Carlo, Cocody', 'Cocody', 350, 6, 5, 4, 68000000, 3200000, 'loué', true)
  returning id into v_p4;
  insert into properties (organization_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured)
  values (v_org, 'Appartement Résidence du Lac', 'appartement', 'Résidence du Lac, Cocody', 'Cocody', 98, 3, 2, 1, 22000000, 1500000, 'loué', false)
  returning id into v_p5;
  insert into properties (organization_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured)
  values (v_org, 'Local Commercial Cocody Centre', 'local', 'Cocody Centre', 'Cocody', 120, 1, 0, 1, 9500000, 700000, 'en_negociation', false)
  returning id into v_p6;
  insert into properties (organization_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured)
  values (v_org, 'Villa Angré Residence', 'villa', 'Angré Residence, Cocody', 'Cocody', 420, 5, 4, 3, 55000000, 3200000, 'loué', false)
  returning id into v_p7;
  insert into properties (organization_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured)
  values (v_org, 'Bureau Plateau', 'bureau', 'Plateau, Abidjan', 'Plateau', 85, 2, 0, 1, 3500000, 450000, 'disponible', false)
  returning id into v_p8;

  -- ---------- CLIENTS ----------
  insert into clients (organization_id, property_id, type, full_name, email, phone, city, status)
  values (v_org, v_p1, 'locataire', 'M. Kouassi Jean-Baptiste', 'jean.kouassi@email.com', '+225 05 05 12 34 56', 'Cocody Angré', 'actif')
  returning id into v_c1;
  insert into clients (organization_id, property_id, type, full_name, email, phone, city, status)
  values (v_org, v_p2, 'locataire', 'Mme Diallo Amina', 'amina.diallo@email.com', '+225 07 07 98 76 54', 'Cocody', 'actif')
  returning id into v_c2;
  insert into clients (organization_id, property_id, type, full_name, email, phone, city, status)
  values (v_org, v_p7, 'locataire', 'M. Traoré Idriss', 'idriss.traore@email.com', '+225 05 05 23 45 67', 'Cocody', 'actif')
  returning id into v_c3;
  insert into clients (organization_id, property_id, type, full_name, email, phone, city, status)
  values (v_org, v_p5, 'propriétaire', 'Mme Koné Fatoumata', 'fatoumata.kone@email.com', '+225 07 07 34 56 78', 'Cocody', 'actif')
  returning id into v_c4;
  insert into clients (organization_id, property_id, type, full_name, email, phone, city, status)
  values (v_org, v_p4, 'locataire', 'M. Bamba Seydou', 'seydou.bamba@email.com', '+225 05 05 45 67 89', 'Cocody', 'actif')
  returning id into v_c5;
  insert into clients (organization_id, property_id, type, full_name, email, phone, city, status)
  values (v_org, null, 'prospect', 'M. Guessan Koffi', 'koffi.guessan@email.com', '+225 07 07 56 78 90', 'Abidjan', 'lead')
  returning id into v_c6;

  -- ---------- BAUX ----------
  insert into leases (organization_id, reference, property_id, client_id, start_date, end_date, monthly_rent, deposit, status)
  values (v_org, 'LE-' || v_year || '-0001', v_p1, v_c1, current_date - interval '9 months', current_date + interval '3 months', 2500000, 5000000, 'active')
  returning id into v_l1;
  insert into leases (organization_id, reference, property_id, client_id, start_date, end_date, monthly_rent, deposit, status)
  values (v_org, 'LE-' || v_year || '-0002', v_p2, v_c2, current_date - interval '8 months', current_date + interval '4 months', 1800000, 3600000, 'active')
  returning id into v_l2;
  insert into leases (organization_id, reference, property_id, client_id, start_date, end_date, monthly_rent, deposit, status)
  values (v_org, 'LE-' || v_year || '-0003', v_p7, v_c3, current_date - interval '10 months', current_date + interval '2 months', 3200000, 6400000, 'active')
  returning id into v_l3;
  insert into leases (organization_id, reference, property_id, client_id, start_date, end_date, monthly_rent, deposit, status)
  values (v_org, 'LE-' || v_year || '-0004', v_p5, v_c4, current_date - interval '11 months', current_date + interval '1 month', 1500000, 3000000, 'active')
  returning id into v_l4;
  insert into leases (organization_id, reference, property_id, client_id, start_date, end_date, monthly_rent, deposit, status)
  values (v_org, 'LE-' || v_year || '-0005', v_p4, v_c5, current_date - interval '7 months', current_date + interval '5 months', 3200000, 6400000, 'active')
  returning id into v_l5;
  insert into leases (organization_id, reference, property_id, client_id, start_date, end_date, monthly_rent, deposit, status)
  values (v_org, 'LE-' || v_year || '-0006', v_p3, v_c6, current_date - interval '1 month', null, 0, 0, 'draft')
  returning id into v_l6;

  -- ---------- FACTURES ----------
  insert into invoices (organization_id, lease_id, client_id, property_id, invoice_number, amount, due_date, paid_date, status, recurrence, description)
  values (v_org, v_l1, v_c1, v_p1, 'INV-' || v_year || '-0045', 2500000, current_date + interval '5 days', null, 'pending', 'monthly', 'Loyer mensuel — Villa Cocody')
  returning id into v_i1;
  insert into invoices (organization_id, lease_id, client_id, property_id, invoice_number, amount, due_date, paid_date, status, recurrence, description)
  values (v_org, v_l2, v_c2, v_p2, 'INV-' || v_year || '-0044', 1800000, current_date - interval '6 days', current_date - interval '6 days', 'paid', 'monthly', 'Loyer mensuel — Appartement Les Palmiers')
  returning id into v_i2;
  insert into invoices (organization_id, lease_id, client_id, property_id, invoice_number, amount, due_date, paid_date, status, recurrence, description)
  values (v_org, v_l3, v_c3, v_p7, 'INV-' || v_year || '-0043', 3200000, current_date - interval '20 days', null, 'overdue', 'monthly', 'Loyer mensuel — Villa Angré Residence')
  returning id into v_i3;
  insert into invoices (organization_id, lease_id, client_id, property_id, invoice_number, amount, due_date, paid_date, status, recurrence, description)
  values (v_org, v_l4, v_c4, v_p5, 'INV-' || v_year || '-0042', 1500000, current_date - interval '12 days', current_date - interval '12 days', 'paid', 'monthly', 'Loyer mensuel — Appartement Résidence du Lac')
  returning id into v_i4;
  insert into invoices (organization_id, lease_id, client_id, property_id, invoice_number, amount, due_date, paid_date, status, recurrence, description)
  values (v_org, v_l5, v_c5, v_p4, 'INV-' || v_year || '-0041', 3200000, current_date - interval '1 day', null, 'pending', 'monthly', 'Loyer mensuel — Villa Monte-Carlo')
  returning id into v_i5;

  -- ---------- PAIEMENTS ----------
  insert into payments (organization_id, invoice_id, amount, payment_date, method, reference)
  values (v_org, v_i2, 1800000, current_date - interval '6 days', 'mobile_money', 'MM-889201');
  insert into payments (organization_id, invoice_id, amount, payment_date, method, reference)
  values (v_org, v_i4, 1500000, current_date - interval '12 days', 'bank_transfer', 'BT-441209');

  -- ---------- RELANCES ----------
  insert into reminders (organization_id, invoice_id, client_id, type, subject, message, scheduled_date, sent_at, status, channel)
  values (v_org, v_i3, v_c3, 'rent_reminder', 'Rappel de loyer', 'Votre loyer est arrivé à échéance.', current_date - interval '5 days', null, 'pending', 'email');
  insert into reminders (organization_id, invoice_id, client_id, type, subject, message, scheduled_date, sent_at, status, channel)
  values (v_org, v_i5, v_c5, 'payment_reminder', 'Rappel de paiement', 'Merci de régulariser votre situation.', current_date + interval '3 days', null, 'pending', 'sms');
  insert into reminders (organization_id, invoice_id, client_id, type, subject, message, scheduled_date, sent_at, status, channel)
  values (v_org, v_i3, v_c3, 'recovery_notice', 'Avis de recouvrement', 'Dossier transmis au service recouvrement.', current_date + interval '7 days', null, 'pending', 'email');
  insert into reminders (organization_id, invoice_id, client_id, type, subject, message, scheduled_date, sent_at, status, channel)
  values (v_org, v_i2, v_c2, 'rent_reminder', 'Rappel de loyer', 'Loyer à régler.', current_date - interval '15 days', now() - interval '15 days', 'sent', 'email');
  insert into reminders (organization_id, invoice_id, client_id, type, subject, message, scheduled_date, sent_at, status, channel)
  values (v_org, v_i1, v_c1, 'rent_reminder', 'Rappel de loyer', 'Loyer à régler avant échéance.', current_date - interval '2 days', null, 'pending', 'email');
  insert into reminders (organization_id, invoice_id, client_id, type, subject, message, scheduled_date, sent_at, status, channel)
  values (v_org, null, v_c6, 'general', 'Message général', 'Suite à votre demande de visite.', current_date - interval '1 day', null, 'pending', 'sms');

  -- ---------- RECOUVREMENT ----------
  insert into recovery_cases (organization_id, reference, invoice_id, client_id, property_id, amount_due, opened_at, status, assigned_to, notes)
  values (v_org, 'REC-' || v_year || '-0001', v_i3, v_c3, v_p7, 3200000, now() - interval '20 days', 'investigating', 'Administrateur', 'Le locataire n''a pas répondu aux relances. Contact téléphonique en cours.');
  insert into recovery_cases (organization_id, reference, invoice_id, client_id, property_id, amount_due, opened_at, status, assigned_to, notes)
  values (v_org, 'REC-' || v_year || '-0002', v_i5, v_c5, v_p4, 3200000, now() - interval '9 days', 'open', null, 'Nouveau dossier de recouvrement.');

  -- ---------- ACTIVITÉ ----------
  insert into activity_log (organization_id, user_id, action, detail, created_at) values
    (v_org, v_user, 'Facture payée', 'INV-' || v_year || '-0044 — Mme Diallo Amina', now() - interval '2 hours'),
    (v_org, v_user, 'Nouveau bail créé', 'LE-' || v_year || '-0005 — M. Bamba Seydou', now() - interval '4 hours'),
    (v_org, v_user, 'Bien ajouté', 'Villa Monte-Carlo — Cocody Angré', now() - interval '6 hours'),
    (v_org, v_user, 'Relance envoyée', 'INV-' || v_year || '-0043 — M. Traoré Idriss', now() - interval '8 hours'),
    (v_org, v_user, 'Paiement enregistré', '1 500 000 FCFA — Mme Koné Fatoumata', now() - interval '26 hours');

  raise notice 'Données de démonstration insérées';
end $$;
