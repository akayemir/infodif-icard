package com.infodif.icard.app.qrcode;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.infodif.icard.app.attendance.Attendance;
import com.infodif.icard.app.user.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;

@Entity
@Table(name = "qrcodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)

public class QrCode {
    @Id
    @UuidGenerator
    @Column(name= "id",unique = true)
    private String id;
    @UuidGenerator
    @Column(name= "code",unique = true)
    private String code;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;
    private Instant createdDate;
    private Instant expireDate;
    private Boolean used;
    private Boolean active;

}
