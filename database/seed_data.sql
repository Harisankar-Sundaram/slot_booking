-- Seed Departments
INSERT INTO departments (dept_code) VALUES ('CSE') ON CONFLICT DO NOTHING;
INSERT INTO departments (dept_code) VALUES ('ECE') ON CONFLICT DO NOTHING;
INSERT INTO departments (dept_code) VALUES ('MECH') ON CONFLICT DO NOTHING;
INSERT INTO departments (dept_code) VALUES ('IT') ON CONFLICT DO NOTHING;
INSERT INTO departments (dept_code) VALUES ('EEE') ON CONFLICT DO NOTHING;
INSERT INTO departments (dept_code) VALUES ('AIDS') ON CONFLICT DO NOTHING;
INSERT INTO departments (dept_code) VALUES ('AIML') ON CONFLICT DO NOTHING;

-- Seed Admin (Password: admin123)
-- Note: AuthService currently uses plain text comparison for prototype as per code.
INSERT INTO admins (email, password_hash) VALUES ('admin@college.edu', 'admin123') ON CONFLICT DO NOTHING;

-- Seed Students
-- CSE Day Scholar
INSERT INTO students (roll_no, name, email, dept_id, category) 
VALUES ('101', 'Alice', 'alice@college.edu', (SELECT dept_id FROM departments WHERE dept_code='CSE'), 'DAY')
ON CONFLICT DO NOTHING;

-- CSE Hostel Male
INSERT INTO students (roll_no, name, email, dept_id, category) 
VALUES ('102', 'Bob', 'bob@college.edu', (SELECT dept_id FROM departments WHERE dept_code='CSE'), 'HOSTEL_MALE')
ON CONFLICT DO NOTHING;

-- ECE Hostel Female
INSERT INTO students (roll_no, name, email, dept_id, category) 
VALUES ('103', 'Clara', 'clara@college.edu', (SELECT dept_id FROM departments WHERE dept_code='ECE'), 'HOSTEL_FEMALE')
ON CONFLICT DO NOTHING;

-- Seed Exam Slots (Optional, for testing)
INSERT INTO slots (exam_date, start_time, end_time, category, booking_open)
VALUES ('2023-11-20', '10:00:00', '12:00:00', 'DAY', TRUE);
INSERT INTO slots (exam_date, start_time, end_time, category, booking_open)
VALUES ('2023-11-20', '14:00:00', '16:00:00', 'HOSTEL_MALE', TRUE);

-- Seed Dept Quota (Required for booking to work)
-- Slot 1 (Day) for CSE
INSERT INTO dept_quota (slot_id, dept_id, quota_capacity)
VALUES (
    (SELECT slot_id FROM slots WHERE category='DAY' LIMIT 1),
    (SELECT dept_id FROM departments WHERE dept_code='CSE'),
    50
);

-- Slot 2 (Hostel Male) for CSE (This was missing!)
INSERT INTO dept_quota (slot_id, dept_id, quota_capacity)
VALUES (
    (SELECT slot_id FROM slots WHERE category='HOSTEL_MALE' LIMIT 1),
    (SELECT dept_id FROM departments WHERE dept_code='CSE'),
    30
);
