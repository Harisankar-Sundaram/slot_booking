package com.petbooking.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("====== CHECKING DATABASE SCHEMA ======");

        // 1. Add book column to exam_slot_seats
        try {
            jdbcTemplate.execute("ALTER TABLE exam_slot_seats ADD COLUMN IF NOT EXISTS book BOOLEAN DEFAULT FALSE");
            System.out.println("Checked/Added 'book' column to exam_slot_seats");
        } catch (Exception e) {
            System.out.println("Error adding book column: " + e.getMessage());
        }

        // 2. Add time window columns to exams
        try {
            jdbcTemplate.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS day_scholar_start_time TIME");
            jdbcTemplate.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS day_scholar_end_time TIME");
            jdbcTemplate.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS hostel_start_time TIME");
            jdbcTemplate.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS hostel_end_time TIME");
            jdbcTemplate.execute("ALTER TABLE exams ADD COLUMN IF NOT EXISTS systems_per_slot INTEGER DEFAULT 30");
            System.out.println("Checked/Added time window columns to exams");
        } catch (Exception e) {
            System.out.println("Error adding time window columns: " + e.getMessage());
        }

        // 3. Add Unique Index for duplicate prevention
        try {
            // Note: unexpected unique index name conflicts might occur, so catching
            // exception
            jdbcTemplate.execute(
                    "CREATE UNIQUE INDEX IF NOT EXISTS uniq_exam_student ON exam_slot_seats (exam_id, roll_number)");
            System.out.println("Checked/Added unique index uniq_exam_student");
        } catch (Exception e) {
            System.out.println("Error adding unique index: " + e.getMessage());
        }

        System.out.println("====== DATABASE SCHEMA CHECK COMPLETE ======");
    }
}
