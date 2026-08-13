package com.infodif.icard.app.email;


import com.infodif.icard.app.qrcode.QrCode;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) { this.mailSender = mailSender; }

    public void sendEmail(String to, String subject, String body, String base64Image) {
        try
        {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("iCARD <testspamfakemail@gmail.com>");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);


            if (base64Image != null && !base64Image.isBlank()) {
                byte[] imageBytes = Base64.getDecoder().decode(base64Image);
                helper.addInline("qrcode", new ByteArrayResource(imageBytes), "image/png");
            }

            mailSender.send(message);
        }

        catch (MessagingException e)
        {
            throw new RuntimeException("Mail gönderilemedi: " + e.getMessage(), e);
        }
    }

}


