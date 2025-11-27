-- Insert Admin and Import groups into backendGroups table
INSERT INTO "backendGroups" ("name") VALUES ('Admin'), ('Import') ON CONFLICT DO NOTHING;

