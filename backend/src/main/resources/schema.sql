-- ENUM for student type
CREATE TYPE student_type_enum AS ENUM ('DAY', 'HOSTEL');

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    dept_id BIGSERIAL PRIMARY KEY,
    dept_code CHAR(10) NOT NULL UNIQUE
);

-- Students Table (Updated)
CREATE TABLE IF NOT EXISTS students (
    roll_no VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    department VARCHAR(50),
    dept_id BIGINT REFERENCES departments(dept_id),
    student_type VARCHAR(10) CHECK (student_type IN ('DAY','HOSTEL')),
    gender VARCHAR(5) CHECK (gender IN ('M','F')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    admin_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Admin Config (Stores systems_per_session)
CREATE TABLE IF NOT EXISTS admin_config (
    id SERIAL PRIMARY KEY,
    systems_per_session INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exam Days Table
CREATE TABLE IF NOT EXISTS exam_days (
    id SERIAL PRIMARY KEY,
    exam_date DATE,
    day_number INT
);

-- Exam Slots Table (CRITICAL - Pre-computed slots)
CREATE TABLE IF NOT EXISTS exam_slots (
    id SERIAL PRIMARY KEY,
    exam_day_id INT REFERENCES exam_days(id),
    session VARCHAR(10) CHECK (session IN ('DAY','NIGHT')),
    department VARCHAR(50),
    student_type VARCHAR(10),
    gender VARCHAR(5), -- 'M','F','ANY'
    max_capacity INT,
    booked_count INT DEFAULT 0
);

-- Bookings Table (References exam_slots)
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(roll_no),
    exam_slot_id INT REFERENCES exam_slots(id),
    booked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id)
);

-- Old tables (keeping for compatibility, can be deprecated later)
CREATE TABLE IF NOT EXISTS slots (
    slot_id BIGSERIAL PRIMARY KEY,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    category VARCHAR(20) NOT NULL,
    purpose VARCHAR(255),
    booking_open BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dept_exam_strength (
    strength_id BIGSERIAL PRIMARY KEY,
    dept_id BIGINT REFERENCES departments(dept_id),
    day_count INT NOT NULL DEFAULT 0,
    hostel_male_count INT NOT NULL DEFAULT 0,
    hostel_female_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dept_quota (
    quota_id BIGSERIAL PRIMARY KEY,
    slot_id BIGINT REFERENCES slots(slot_id),
    dept_id BIGINT REFERENCES departments(dept_id),
    quota_capacity INT NOT NULL,
    booked_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_master_upload (
    id BIGSERIAL PRIMARY KEY,
    roll_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    dept_code CHAR(10) NOT NULL,
    student_type VARCHAR(20) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    uploaded_by_admin_id BIGINT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_exam_slots_lookup ON exam_slots(department, student_type, gender);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(exam_slot_id);

-- ========== NEW: Exam Initialization Tables ==========

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
    exam_id BIGSERIAL PRIMARY KEY,
    exam_name VARCHAR(100) NOT NULL,
    no_of_days INT NOT NULL,
    starting_date DATE NOT NULL,
    ending_date DATE NOT NULL,
    exam_purpose VARCHAR(255),
    total_day_scholars INT DEFAULT 0,
    total_hostel_boys INT DEFAULT 0,
    total_hostel_girls INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_exam_dates CHECK (starting_date <= ending_date)
);

-- Exam Slot Seats (Individual seat records)
CREATE TABLE IF NOT EXISTS exam_slot_seats (
    slot_id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(exam_id),
    slot_date DATE NOT NULL,
    roll_number VARCHAR(20), -- NULL until booked
    dept_id BIGINT REFERENCES departments(dept_id),
    category_type INT NOT NULL, -- 1=Day, 2=HostelM, 3=HostelF
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
);

-- Exam Quotas (Department quotas by category)
CREATE TABLE IF NOT EXISTS exam_quotas (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(exam_id),
    dept_id BIGINT NOT NULL REFERENCES departments(dept_id),
    category_type INT NOT NULL, -- 1=Day Scholar, 2=Hostel Boys, 3=Hostel Girls
    max_count INT NOT NULL,
    current_fill INT NOT NULL DEFAULT 0,
    is_closed BOOLEAN NOT NULL DEFAULT false
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_exam_slot_seats_lookup ON exam_slot_seats(exam_id, dept_id, category_type, status);
CREATE INDEX IF NOT EXISTS idx_exam_quotas_lookup ON exam_quotas(exam_id, dept_id, category_type);

