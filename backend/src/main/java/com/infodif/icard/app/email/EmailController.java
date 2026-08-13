package com.infodif.icard.app.email;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    public String sendEmail(Authentication authentication, @RequestBody EmailRequest request) {
        String to = authentication.getName();
        emailService.sendEmail(to, request.subject(), request.body(), request.image());
        return "Email gönderildi: " + to;
    }
}