-- Shown when a visitor clicks any WhatsApp link on this course's page.
-- Nullable and purely additive: existing rows are unaffected; null falls
-- back to the site default (SiteSetting contact_whatsapp_message).
ALTER TABLE "courses" ADD COLUMN "whatsappMessage" TEXT;
