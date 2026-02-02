package com.petbooking.config;

import com.petbooking.entity.*;
import com.petbooking.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;

    public DataSeeder(AdminRepository adminRepository,
            DepartmentRepository departmentRepository,
            StudentRepository studentRepository) {
        this.adminRepository = adminRepository;
        this.departmentRepository = departmentRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdmin();
        seedDepartments();
        seedStudents();
    }

    private void seedAdmin() {
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setEmail("admin@college.edu");
            admin.setPasswordHash("admin123"); // In prod, use BCrypt
            adminRepository.save(admin);
            System.out.println("Seeded Default Admin: admin@college.edu / admin123");
        }
    }

    private void seedDepartments() {
        if (departmentRepository.count() == 0) {
            createDept("CSE");
            createDept("ECE");
            createDept("MECH");
            System.out.println("Seeded Departments");
        }
    }

    private void createDept(String code) {
        Department d = new Department();
        d.setDeptCode(code);
        departmentRepository.save(d);
    }

    private void seedStudents() {
        if (studentRepository.count() == 0) {
            Department cse = departmentRepository.findByDeptCode("CSE").orElse(null);
            if (cse != null) {
                createStudent("101", "Alice", "alice@college.edu", cse, Student.StudentCategory.DAY);
                createStudent("102", "Bob", "bob@college.edu", cse, Student.StudentCategory.HOSTEL_MALE);
                System.out.println("Seeded Students");
            }
        }
    }

    private void createStudent(String roll, String name, String email, Department dept, Student.StudentCategory cat) {
        Student s = new Student();
        s.setRollNo(roll);
        s.setName(name);
        s.setEmail(email);
        s.setDepartment(dept);
        s.setCategory(cat);
        studentRepository.save(s);
    }
}
