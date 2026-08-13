package com.infodif.icard.app.qrcode;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QrCodeRepo extends JpaRepository<QrCode, String> {

    Optional<QrCode> findByCode(String code);
}