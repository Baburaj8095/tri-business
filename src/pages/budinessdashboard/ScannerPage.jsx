import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";

const UI = {
  bg: "#000000",
  primary: "#93c193",
  onPrimary: "#ffffff",
  muted: "#cbd5e1",
};

function ScannerPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const timerRef = useRef(null);
  const scannedRef = useRef(false);

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [status, setStatus] = useState("Opening camera...");
  const [isSupported, setIsSupported] = useState(true);

  const stopScanLoop = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetScanner = useCallback(() => {
    scannedRef.current = false;
    setScanned(false);
    setStatus("Point camera at any UPI QR code");
  }, []);

  const handleUPICode = useCallback(
    (upiString = "") => {
      if (scannedRef.current) return;

      scannedRef.current = true;
      setScanned(true);
      stopScanLoop();

      if (!upiString.startsWith("upi://")) {
        setStatus("This QR code is not a UPI payment code.");
        window.alert("Not a UPI QR\n\nThis QR code is not a UPI payment code.");
        resetScanner();
        return;
      }

      setStatus("Opening UPI app...");

      try {
        window.location.href = upiString;
      } catch (_) {
        setStatus("Could not open UPI app.");
        window.alert("Error\n\nCould not open UPI app.");
        resetScanner();
      }
    },
    [resetScanner, stopScanLoop]
  );

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported in this browser.");
        }

        if (!("BarcodeDetector" in window)) {
          if (isMounted) {
            setIsSupported(false);
            setStatus("QR scanning is not supported in this browser. Try Chrome on mobile.");
          }
          return;
        }

        detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (isMounted) {
          setHasPermission(true);
          setStatus("Point camera at any UPI QR code");
        }

        timerRef.current = window.setInterval(async () => {
          try {
            if (scannedRef.current || !videoRef.current || videoRef.current.readyState < 2) return;

            const barcodes = await detectorRef.current.detect(videoRef.current);
            const rawValue = barcodes?.[0]?.rawValue || "";

            if (rawValue) {
              handleUPICode(rawValue);
            }
          } catch (_) {
            // Keep scanning quietly while camera frames settle.
          }
        }, 200);
      } catch (error) {
        if (isMounted) {
          setHasPermission(false);
          setStatus(error?.message || "Camera permission is required");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [handleUPICode, stopScanLoop]);

  if (hasPermission === false || !isSupported) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: UI.bg, color: UI.onPrimary, display: "grid", placeItems: "center", p: 3 }}>
        <Stack spacing={2} alignItems="center">
          <Typography sx={{ fontSize: 16, textAlign: "center" }}>{status}</Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/demo/budiness-dashboard")}
            sx={{ bgcolor: UI.primary, borderRadius: 999, textTransform: "none", fontWeight: 800 }}
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: UI.bg, color: UI.onPrimary, position: "relative", overflow: "hidden" }}>
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: { xs: 5, sm: 7.5 },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%", maxWidth: 520 }}>
          <IconButton
            onClick={() => navigate("/demo/budiness-dashboard")}
            sx={{ color: UI.onPrimary, bgcolor: alpha("#ffffff", 0.12), "&:hover": { bgcolor: alpha("#ffffff", 0.18) } }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography sx={{ color: UI.onPrimary, fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>
            Scan UPI QR Code
          </Typography>
          <Box sx={{ width: 40 }} />
        </Stack>

        <Box
          sx={{
            position: "relative",
            width: { xs: 240, sm: 280 },
            height: { xs: 240, sm: 280 },
            border: `2.5px solid ${UI.primary}`,
            borderRadius: 4,
            display: "grid",
            placeItems: "center",
            boxShadow: `0 0 0 9999px ${alpha("#000", 0.18)}`,
          }}
        >
          <QrCodeScannerRoundedIcon sx={{ color: alpha("#ffffff", 0.84), fontSize: 46 }} />
        </Box>

        <Stack spacing={2} alignItems="center" sx={{ minHeight: 88 }}>
          <Typography sx={{ color: UI.muted, fontSize: 14, textAlign: "center" }}>
            {status}
          </Typography>

          {scanned ? (
            <Button
              variant="contained"
              onClick={resetScanner}
              sx={{
                bgcolor: UI.primary,
                color: UI.onPrimary,
                px: 3.5,
                py: 1.2,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                "&:hover": { bgcolor: UI.primary },
              }}
            >
              Tap to Scan Again
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

export default ScannerPage;
