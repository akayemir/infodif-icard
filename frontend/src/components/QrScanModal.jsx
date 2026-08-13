import { useEffect, useRef, useState } from "react";
import { Modal, message, Button, Typography } from "antd";
import jsQR from "jsqr";

const { Text } = Typography;
 
const QR_LIFETIME_SECONDS = 120;

export default function QrScanModal({ open, onClose, onDecoded, onRegenerate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const countdownRef = useRef(null);
  const decodedRef = useRef(false);

  const [secondsLeft, setSecondsLeft] = useState(QR_LIFETIME_SECONDS);
  const [expired, setExpired] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (open) {
      startSession();
    } else {
      stopCamera();
      stopCountdown();
    }
    return () => {
      stopCamera();
      stopCountdown();
    };
  }, [open]);


    const startSession = () => {
        decodedRef.current = false;
        setExpired(false);
        setSecondsLeft(QR_LIFETIME_SECONDS);
        startCamera();
        startCountdown();
      };

    const startCountdown = () => {
    stopCountdown();
    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopCountdown();
          stopCamera(); 
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
 
  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };


  const startCamera = async () => {
    try 
    {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      if (videoRef.current) 
      {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      rafRef.current = requestAnimationFrame(tick);
    } 
    catch (err) 
    {
      message.error("Kamera açılamadı: " + err.message);
      onClose();
    }
  };

  const stopCamera = () => {
    if (rafRef.current) 
    {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) 
    {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const tick = () => {
    if (decodedRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height);

      if (result && result.data) {
        decodedRef.current = true;
        stopCamera();
        stopCountdown();
        onDecoded(result.data);
        onClose();
        return;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await onRegenerate();
      startSession(); 
    } catch (err) {
      message.error("Yeni kod gönderilemedi");
    } finally {
      setRegenerating(false);
    }
  };
 
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
     <Modal open={open} onCancel={onClose} footer={null} title="QR Okut" destroyOnClose>
      {!expired ? (
        <>
          <video ref={videoRef} style={{ width: "100%" }} muted playsInline />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Text type="secondary">Kalan süre: {timeLabel}</Text>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Text type="danger" style={{ display: "block", marginBottom: 16 }}>
            QR kodun süresi doldu.
          </Text>
          <Button type="primary" onClick={handleRegenerate} loading={regenerating}>
            Yeni Kod Gönder
          </Button>
        </div>
      )}
    </Modal>
  );
}