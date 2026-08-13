package com.infodif.icard.app.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<AppUser, String>, JpaSpecificationExecutor<AppUser> {
    Optional<AppUser> findByEmail(String email);

    List<AppUser> findByManager_Email(String managerEmail);

    List<AppUser> findByDepartment_Id(String departmentId);
}