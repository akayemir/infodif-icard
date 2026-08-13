package com.infodif.icard.app.qrcode;

import com.google.zxing.WriterException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("qrcode")
public class QrCodeController {

    private final QrCodeService qrService;

    public QrCodeController(QrCodeService qrService) {
        this.qrService = qrService;
    }

    //BYTE ARRAY
//    @GetMapping(value = "/generate", produces = MediaType.IMAGE_PNG_VALUE)
//    public ResponseEntity<byte[]> generateQRCode(@RequestParam String email) {
//        try {
//            byte[] code = qrService.generateQRCode(email);
//            return ResponseEntity.ok(code);
//        } catch (WriterException | IOException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
//        }
//    }


    //STRING
    @GetMapping(value = "/generate", produces = MediaType.IMAGE_PNG_VALUE)
    public String generateQRCode(Authentication authentication) {
        String email = authentication.getName();
        try {
            byte[] code = qrService.generateQRCode(email);
            String base64Image = Base64.getEncoder().encodeToString(code);
            return base64Image;
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (WriterException e) {
            throw new RuntimeException(e);
        }
    }


    @PostMapping(value = "/decode", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String,String>> decodeQRCode(@RequestParam("file") MultipartFile file) {
        Map<String,String> response = new HashMap<>();
        try {
            String decodedText = qrService.decodeQRCode(file);
            response.put("decodedText", decodedText);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Failed to decode QR code.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);        }
    }
}