-- Enable Row Level Security (good practice, though we mostly use app-level logic)
-- Create ENUM type
CREATE TYPE student_category AS ENUM ('DAY', 'HOSTEL_MALE', 'HOSTEL_FEMALE');

-- Departments Table
CREATE TABLE departments (
    dept_id BIGSERIAL PRIMARY KEY,
    dept_code VARCHAR(10) NOT NULL UNIQUE
);

-- Students Table
CREATE TABLE students (
    roll_no VARCHAR(20) PRIMARY KEY,
    name VARCHAR(35) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    dept_id BIGINT NOT NULL REFERENCES departments(dept_id),
    category student_category NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Admins Table
CREATE TABLE admins (
    admin_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Slots Table
CREATE TABLE slots (
    slot_id BIGSERIAL PRIMARY KEY,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    category student_category NOT NULL,
    purpose VARCHAR(255),
    booking_open BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Dept Exam Strength (How many students expected)
CREATE TABLE dept_exam_strength (
    strength_id BIGSERIAL PRIMARY KEY,
    dept_id BIGINT NOT NULL UNIQUE REFERENCES departments(dept_id),
    day_count INT NOT NULL DEFAULT 0,
    hostel_male_count INT NOT NULL DEFAULT 0,
    hostel_female_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_strength CHECK (day_count >= 0 AND hostel_male_count >= 0 AND hostel_female_count >= 0)
);

-- Dept Quota (Calculated specific seats for a slot)
CREATE TABLE dept_quota (
    quota_id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT NOT NULL REFERENCES slots(slot_id),
    dept_id BIGINT NOT NULL REFERENCES departments(dept_id),
    quota_capacity INT NOT NULL,
    booked_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_slot_dept UNIQUE(slot_id, dept_id),
    CONSTRAINT valid_quota CHECK (quota_capacity >= 0),
    CONSTRAINT valid_booking CHECK (booked_count <= quota_capacity)
);

-- Bookings Table
CREATE TABLE bookings (
    booking_id BIGSERIAL PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL UNIQUE REFERENCES students(roll_no),
    slot_id BIGINT NOT NULL REFERENCES slots(slot_id),
    dept_id BIGINT NOT NULL REFERENCES departments(dept_id),
    booked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_students_dept_cat ON students(dept_id, category);
CREATE INDEX idx_slots_cat_open ON slots(category, booking_open);
CREATE INDEX idx_dept_quota_slot_dept ON dept_quota(slot_id, dept_id);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_bookings_dept ON bookings(dept_id);
CREATE INDEX idx_bookings_roll ON bookings(roll_no);
