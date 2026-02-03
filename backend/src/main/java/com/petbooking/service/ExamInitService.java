package com.petbooking.service;

import com.petbooking.dto.ExamDtos.*;
import com.petbooking.entity.*;
import com.petbooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExamInitService {

    @Autowired
    private ExamRepository examRepository;
    @Autowired
    private ExamSlotSeatRepository slotSeatRepository;
    @Autowired
    private ExamQuotaRepository quotaRepository;
    @Autowired
    private DepartmentRepository departmentRepository;

    /**
     * Initialize an Exam with Slot Inventory and Departmental Quotas.
     * This is a TRANSACTIONAL operation - if any step fails, everything rolls back.
     */
    @Transactional
    public ExamInitResponse initializeExam(ExamInitRequest request) {
        // ============ STEP A: Create Exam Entry ============
        Exam exam = new Exam();
        exam.setExamName(request.getExamName());
        exam.setStartingDate(request.getStartDate());
        exam.setEndingDate(request.getEndDate());
        exam.setNoOfDays(request.getTotalDays());
        exam.setExamPurpose(request.getExamPurpose());
        // Calculate total counts
        int totalDayScholars = request.getDeptCategories().stream()
                .mapToInt(com.petbooking.dto.ExamDtos.DeptCategoryCount::getDayScholarCount).sum();
        int totalHostelBoys = request.getDeptCategories().stream()
                .mapToInt(com.petbooking.dto.ExamDtos.DeptCategoryCount::getHostellerBoysCount).sum();
        int totalHostelGirls = request.getDeptCategories().stream()
                .mapToInt(com.petbooking.dto.ExamDtos.DeptCategoryCount::getHostellerGirlsCount).sum();

        exam.setTotalDayScholars(totalDayScholars);
        exam.setTotalHostelBoys(totalHostelBoys);
        exam.setTotalHostelGirls(totalHostelGirls);

        exam = examRepository.save(exam);

        Long examId = exam.getExamId();
        int totalSlotsGenerated = 0;
        int quotasCreated = 0;

        // ============ STEP B: Generate Slot Inventory ============
        // For each department category, create individual seat records
        List<ExamSlotSeat> allSlots = new ArrayList<>();

        for (DeptCategoryCount deptCat : request.getDeptCategories()) {
            Department dept = departmentRepository.findById(deptCat.getDeptId())
                    .orElseThrow(() -> new RuntimeException("Department not found: " + deptCat.getDeptId()));

            // Calculate slots per day for each category
            int dayScholarPerDay = deptCat.getDayScholarCount() / request.getTotalDays();
            int dayScholarRemainder = deptCat.getDayScholarCount() % request.getTotalDays();

            int hostelBoysPerDay = deptCat.getHostellerBoysCount() / request.getTotalDays();
            int hostelBoysRemainder = deptCat.getHostellerBoysCount() % request.getTotalDays();

            int hostelGirlsPerDay = deptCat.getHostellerGirlsCount() / request.getTotalDays();
            int hostelGirlsRemainder = deptCat.getHostellerGirlsCount() % request.getTotalDays();

            // Iterate through each exam day
            LocalDate currentDate = request.getStartDate();
            int dayIndex = 0;

            while (!currentDate.isAfter(request.getEndDate()) && dayIndex < request.getTotalDays()) {
                boolean isLastDay = (dayIndex == request.getTotalDays() - 1);

                // Day Scholars (Category 1)
                int daySlotsToday = dayScholarPerDay;
                if (isLastDay) {
                    daySlotsToday += dayScholarRemainder;
                }

                for (int i = 0; i < daySlotsToday; i++) {
                    ExamSlotSeat slot = new ExamSlotSeat();
                    slot.setExam(exam);
                    slot.setSlotDate(currentDate);
                    slot.setDepartment(dept);
                    slot.setCategoryType(1); // Day Scholar
                    slot.setStatus("AVAILABLE");
                    allSlots.add(slot);
                }

                // Hostel Boys (Category 2)
                int hostelBoysSlotsToday = hostelBoysPerDay;
                if (isLastDay) {
                    hostelBoysSlotsToday += hostelBoysRemainder;
                }

                for (int i = 0; i < hostelBoysSlotsToday; i++) {
                    ExamSlotSeat slot = new ExamSlotSeat();
                    slot.setExam(exam);
                    slot.setSlotDate(currentDate);
                    slot.setDepartment(dept);
                    slot.setCategoryType(2); // Hostel Boys
                    slot.setStatus("AVAILABLE");
                    allSlots.add(slot);
                }

                // Hostel Girls (Category 3)
                int hostelGirlsSlotsToday = hostelGirlsPerDay;
                if (isLastDay) {
                    hostelGirlsSlotsToday += hostelGirlsRemainder;
                }

                for (int i = 0; i < hostelGirlsSlotsToday; i++) {
                    ExamSlotSeat slot = new ExamSlotSeat();
                    slot.setExam(exam);
                    slot.setSlotDate(currentDate);
                    slot.setDepartment(dept);
                    slot.setCategoryType(3); // Hostel Girls
                    slot.setStatus("AVAILABLE");
                    allSlots.add(slot);
                }

                currentDate = currentDate.plusDays(1);
                dayIndex++;
            }

            // ============ STEP C: Create Quota Entries ============
            // Day Scholar Quota
            ExamQuota dayQuota = new ExamQuota();
            dayQuota.setExam(exam);
            dayQuota.setDepartment(dept);
            dayQuota.setCategoryType(1);
            dayQuota.setMaxCount(deptCat.getDayScholarCount());
            dayQuota.setCurrentFill(0);
            quotaRepository.save(dayQuota);
            quotasCreated++;

            // Hostel Boys Quota
            ExamQuota hostelBoysQuota = new ExamQuota();
            hostelBoysQuota.setExam(exam);
            hostelBoysQuota.setDepartment(dept);
            hostelBoysQuota.setCategoryType(2);
            hostelBoysQuota.setMaxCount(deptCat.getHostellerBoysCount());
            hostelBoysQuota.setCurrentFill(0);
            quotaRepository.save(hostelBoysQuota);
            quotasCreated++;

            // Hostel Girls Quota
            ExamQuota hostelGirlsQuota = new ExamQuota();
            hostelGirlsQuota.setExam(exam);
            hostelGirlsQuota.setDepartment(dept);
            hostelGirlsQuota.setCategoryType(3);
            hostelGirlsQuota.setMaxCount(deptCat.getHostellerGirlsCount());
            hostelGirlsQuota.setCurrentFill(0);
            quotaRepository.save(hostelGirlsQuota);
            quotasCreated++;
        }

        // Bulk insert all slots for performance
        slotSeatRepository.saveAll(allSlots);
        totalSlotsGenerated = allSlots.size();

        // ============ Return Summary ============
        ExamInitResponse response = new ExamInitResponse();
        response.setExamId(examId);
        response.setExamName(exam.getExamName());
        response.setTotalDays(exam.getNoOfDays());
        response.setTotalSlotsGenerated(totalSlotsGenerated);
        response.setQuotasCreated(quotasCreated);

        return response;
    }

    /**
     * Get all exams
     */
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    /**
     * Get exam by ID
     */
    public Exam getExamById(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found: " + examId));
    }

    /**
     * Get quotas for an exam
     */
    public List<ExamQuota> getQuotasForExam(Long examId) {
        return quotaRepository.findByExamExamId(examId);
    }

    /**
     * Delete an exam and all related data
     */
    @Transactional
    public void deleteExam(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new RuntimeException("Exam not found: " + examId);
        }

        // Delete related data first
        slotSeatRepository.deleteByExamExamId(examId);
        quotaRepository.deleteByExamExamId(examId);

        // Delete slots table entries if any (legacy check)
        // Note: If you have other tables referencing exam, handling them here is good
        // practice.

        // Delete the exam
        examRepository.deleteById(examId);
    }
}
