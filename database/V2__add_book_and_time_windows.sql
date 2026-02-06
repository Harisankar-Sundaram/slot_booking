-- Migration: Add book flag and time windows for Exam Slot Booking System
-- Run this migration on your PostgreSQL database

-- Step 1: Add 'book' column to exam_slot_seats table
ALTER TABLE exam_slot_seats ADD COLUMN IF NOT EXISTS book BOOLEAN NOT NULL DEFAULT FALSE;

-- Step 2: Add time window columns to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS day_scholar_start_time TIME;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS day_scholar_end_time TIME;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS hostel_start_time TIME;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS hostel_end_time TIME;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS systems_per_slot INT NOT NULL DEFAULT 30;

-- Step 3: Create unique index to prevent duplicate bookings per exam
-- This ensures one student can only book one seat per exam
CREATE UNIQUE INDEX IF NOT EXISTS uniq_exam_student 
ON exam_slot_seats (exam_id, roll_number) 
WHERE roll_number IS NOT NULL;

-- Step 4: Add index for faster slot lookup
CREATE INDEX IF NOT EXISTS idx_slot_seat_booking 
ON exam_slot_seats (exam_id, dept_id, category_type, slot_date, book) 
WHERE roll_number IS NULL;
