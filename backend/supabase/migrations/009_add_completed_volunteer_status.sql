-- ============================================================
-- Migration 009: Add 'completed' to volunteer_status enum
-- Enables marking volunteer assignments as 'completed' once duty is done.
-- ============================================================

ALTER TYPE volunteer_status ADD VALUE IF NOT EXISTS 'completed';
