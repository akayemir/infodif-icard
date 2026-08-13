package com.infodif.icard.app.workSchedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkScheduleRepo extends JpaRepository<WorkSchedule, String> {

    List<WorkSchedule> findByDepartment_Id(String departmentId);

    List<WorkSchedule> findByDepartmentIsNull();
}