-- Create publication for Boxer WAL consumer
-- Migration: 003_publication
-- Purpose: Enable at-least-once CDC delivery via Boxer

-- Create a publication for all tables so Boxer can consume WAL changes.
-- Boxer reads this publication via logical replication and delivers changes
-- to the configured BOXER_DELIVERY_URL with at-least-once guarantees.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'boxer_pub'
  ) THEN
    CREATE PUBLICATION boxer_pub FOR ALL TABLES;
  END IF;
END
$$;
