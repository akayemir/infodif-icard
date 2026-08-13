package com.infodif.icard.app.qrcode;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeWriter;
import com.infodif.icard.app.user.AppUser;
import com.infodif.icard.app.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Service
public class QrCodeService {
    private static final String DEFAULT_IMAGE_FORMAT = "png";

    private final UserService userService;
    private final QrCodeRepo qrCodeRepo;

    public QrCodeService(UserService userService, QrCodeRepo qrCodeRepo) {
        this.userService = userService;
        this.qrCodeRepo = qrCodeRepo;
    }

    public byte[] generateQRCode(String email) throws WriterException, IOException {

        AppUser user = userService.getUsers(email);

        QrCode qrCode = new QrCode();
        qrCode.setCode(UUID.randomUUID().toString());
        qrCode.setUser(user);
        qrCode.setCreatedDate(Instant.now());
        qrCode.setExpireDate(Instant.now().plusSeconds(120));
        qrCode.setActive(true);
        qrCode.setUsed(false);
        qrCodeRepo.save(qrCode);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrCode.getCode(), BarcodeFormat.QR_CODE, 400, 400);

        var qrcodeImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        ImageIO.write(qrcodeImage, DEFAULT_IMAGE_FORMAT, pngOutputStream);

        return pngOutputStream.toByteArray();
    }

    public String decodeQRCode(MultipartFile file) throws IOException, NotFoundException {
        BufferedImage bufferedImage = ImageIO.read(file.getInputStream());

        LuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

        Result result = new MultiFormatReader().decode(bitmap);
        return result.getText();
    }


}