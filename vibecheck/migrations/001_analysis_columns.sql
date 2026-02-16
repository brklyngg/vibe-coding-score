-- Migration: Add columns for full detections, Opus analysis, and chat rate limiting
-- Run this in Supabase SQL Editor before deploying

ALTER TABLE results ADD COLUMN IF NOT EXISTS full_detections JSONB;
ALTER TABLE results ADD COLUMN IF NOT EXISTS analysis_text TEXT;
ALTER TABLE results ADD COLUMN IF NOT EXISTS analysis_generated_at TIMESTAMPTZ;
ALTER TABLE results ADD COLUMN IF NOT EXISTS chat_count INT DEFAULT 0;
ALTER TABLE results ADD COLUMN IF NOT EXISTS chat_window_start TIMESTAMPTZ;
