CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
ALTER TABLE DisposalPlace ALTER COLUMN id SET DEFAULT uuid_generate_v4();