package com.infodif.icard.app.workSchedule;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.infodif.icard.app.department.Department;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalTime;

@Entity
@Table(name = "workSchedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)

public class WorkSchedule {
    @Id
    @UuidGenerator
    @Column(name= "id",unique = true)
    private String id;
    @ManyToOne
    private Department department;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer toleranceMinutes;
    private Instant createdDate;
}
