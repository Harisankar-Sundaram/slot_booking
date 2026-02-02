package com.petbooking.service;

import com.petbooking.entity.*;
import com.petbooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class SlotGenerationService {

    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private AdminConfigRepository adminConfigRepository;
    @Autowired
    private ExamDayRepository examDayRepository;
    @Autowired
    private ExamSlotRepository examSlotRepository;

    @Transactional
    public Map<String, Object> generateSlots(int systemsPerSession, LocalDate startDate) {
        // Clear old slots (for regeneration)
        examSlotRepository.deleteAll();
        examDayRepository.deleteAll();

        // Save config
        AdminConfig config = new AdminConfig();
        config.setSystemsPerSession(systemsPerSession);
        adminConfigRepository.save(config);

        // Step 1: Count students
        List<Student> allStudents = studentRepository.findAll();
        long totalStudents = allStudents.size();

        // Map students to DAY / HOSTEL
        // Assuming Student.category maps:
        // DAY -> studentType=DAY, gender=ANY
        // HOSTEL_MALE -> studentType=HOSTEL, gender=M
        // HOSTEL_FEMALE -> studentType=HOSTEL, gender=F

        Map<String, List<Student>> dayByDept = new HashMap<>();
        Map<String, Map<String, List<Student>>> hostelByDeptGender = new HashMap<>();

        for (Student s : allStudents) {
            String dept = s.getDepartment() != null ? s.getDepartment().getDeptCode() : "UNKNOWN";
            Student.StudentCategory cat = s.getCategory();

            if (cat == Student.StudentCategory.DAY) {
                dayByDept.computeIfAbsent(dept, k -> new ArrayList<>()).add(s);
            } else {
                String gender = cat == Student.StudentCategory.HOSTEL_MALE ? "M" : "F";
                hostelByDeptGender
                        .computeIfAbsent(dept, k -> new HashMap<>())
                        .computeIfAbsent(gender, k -> new ArrayList<>())
                        .add(s);
            }
        }

        // Step 2: Calculate total exam days
        int totalDays = (int) Math.ceil((double) totalStudents / systemsPerSession);
        if (totalDays == 0)
            totalDays = 1;

        // Create ExamDays
        List<ExamDay> examDays = new ArrayList<>();
        for (int i = 1; i <= totalDays; i++) {
            ExamDay day = new ExamDay();
            day.setDayNumber(i);
            day.setExamDate(startDate.plusDays(i - 1));
            examDays.add(examDayRepository.save(day));
        }

        // Step 3: Create DAY SCHOLAR slots (Session = DAY, Gender = ANY)
        for (Map.Entry<String, List<Student>> entry : dayByDept.entrySet()) {
            String dept = entry.getKey();
            int deptCount = entry.getValue().size();
            int perDay = deptCount / totalDays;
            int remainder = deptCount % totalDays;

            for (ExamDay day : examDays) {
                int capacity = perDay;
                if (remainder > 0) {
                    capacity++;
                    remainder--;
                }
                if (capacity > 0) {
                    ExamSlot slot = new ExamSlot();
                    slot.setExamDay(day);
                    slot.setSession("DAY");
                    slot.setDepartment(dept);
                    slot.setStudentType("DAY");
                    slot.setGender("ANY");
                    slot.setMaxCapacity(capacity);
                    slot.setBookedCount(0);
                    examSlotRepository.save(slot);
                }
            }
        }

        // Step 4: Create HOSTEL slots (Session = NIGHT, Gender = M or F)
        for (Map.Entry<String, Map<String, List<Student>>> deptEntry : hostelByDeptGender.entrySet()) {
            String dept = deptEntry.getKey();
            for (Map.Entry<String, List<Student>> genderEntry : deptEntry.getValue().entrySet()) {
                String gender = genderEntry.getKey();
                int genderCount = genderEntry.getValue().size();
                int perDay = genderCount / totalDays;
                int remainder = genderCount % totalDays;

                for (ExamDay day : examDays) {
                    int capacity = perDay;
                    if (remainder > 0) {
                        capacity++;
                        remainder--;
                    }
                    if (capacity > 0) {
                        ExamSlot slot = new ExamSlot();
                        slot.setExamDay(day);
                        slot.setSession("NIGHT");
                        slot.setDepartment(dept);
                        slot.setStudentType("HOSTEL");
                        slot.setGender(gender);
                        slot.setMaxCapacity(capacity);
                        slot.setBookedCount(0);
                        examSlotRepository.save(slot);
                    }
                }
            }
        }

        // Return summary
        Map<String, Object> result = new HashMap<>();
        result.put("totalStudents", totalStudents);
        result.put("totalDays", totalDays);
        result.put("systemsPerSession", systemsPerSession);
        result.put("slotsCreated", examSlotRepository.count());
        return result;
    }
}
