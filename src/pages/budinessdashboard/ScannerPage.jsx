import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { Box, Button, IconButton, Stack, Typography, Card } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import FlashOffRoundedIcon from '@mui/icons-material/FlashOffRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const TOKENS = {
  primary: '#FF5A0A',
  primaryDark: '#D94708',
  softPeach: '#FFF0E5',
  warmCream: '#FFF8EE',
  pageBg: '#0F172A',
  textMain: '#FFFFFF',
  textMuted: '#94A3B8',
  border: '#334155',
  successGreen: '#16805D',
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
  const [status, setStatus] = useState('Point camera at any UPI QR code');
  const [isSupported, setIsSupported] = useState(true);
  const [flashOn, setFlashOn] = useState(false);

  const stopScanLoop = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetScanner = useCallback(() => {
    scannedRef.current = false;
    setScanned(false);
    setStatus('Point camera at any UPI QR code');
  }, []);

  const handleUPICode = useCallback(
    (upiString = '') => {
      if (scannedRef.current) return;

      scannedRef.current = true;
      setScanned(true);
      stopScanLoop();

      if (!upiString.startsWith('upi://')) {
        setStatus('This QR code is not a UPI payment code.');
        window.alert('Not a UPI QR\n\nThis QR code is not a UPI payment code.');
        resetScanner();
        return;
      }

      setStatus('Opening UPI app...');

      try {
        window.location.href = upiString;
      } catch (_) {
        setStatus('Could not open UPI app.');
        window.alert('Error\n\nCould not open UPI app.');
        resetScanner();
      }
    },
    [resetScanner, stopScanLoop]
  );

  const toggleFlash = async () => {
    try {
      if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        if (track && track.getCapabilities && track.getCapabilities().torch) {
          const nextState = !flashOn;
          await track.applyConstraints({
            advanced: [{ torch: nextState }],
          });
          setFlashOn(nextState);
        } else {
          alert('Torch / Flashlight is not supported on this device/browser.');
        }
      }
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.BarcodeDetector) {
      alert('QR decoding from image is not supported in this browser. Please use live camera.');
      return;
    }

    const img = new Image();
    img.onload = async () => {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(img);
        if (barcodes && barcodes.length > 0) {
          handleUPICode(barcodes[0].rawValue);
        } else {
          alert('No QR code detected in the selected image.');
        }
      } catch (err) {
        alert('Could not decode QR code from image.');
      }
    };
    img.src = URL.createObjectURL(file);
  };

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access is not supported in this browser.');
        }

        if (!('BarcodeDetector' in window)) {
          if (isMounted) {
            setIsSupported(false);
            setStatus('QR scanning is not supported in this browser. Try Chrome on mobile.');
          }
          return;
        }

        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (isMounted) {
          setHasPermission(true);
          setStatus('Point camera at any UPI QR code');
        }

        timerRef.current = window.setInterval(async () => {
          try {
            if (scannedRef.current || !videoRef.current || videoRef.current.readyState < 2) return;

            const barcodes = await detectorRef.current.detect(videoRef.current);
            const rawValue = barcodes?.[0]?.rawValue || '';

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
          setStatus(error?.message || 'Camera permission is required');
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
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#0F172A',
          color: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          p: 3,
        }}
      >
        <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 400, textAlign: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              bgcolor: 'rgba(255, 90, 10, 0.12)',
              border: `1.5px solid ${TOKENS.primary}`,
              display: 'grid',
              placeItems: 'center',
              color: TOKENS.primary,
            }}
          >
            <QrCodeScannerRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 900 }}>
            Camera Access Required
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: TOKENS.textMuted }}>{status}</Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/business-dashboard')}
            sx={{
              bgcolor: TOKENS.primary,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              px: 3,
              py: 1,
              '&:hover': { bgcolor: TOKENS.primaryDark },
            }}
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#000000',
        color: TOKENS.textMain,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Live Video Feed */}
      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Dim Overlay */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(15, 23, 42, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          pt: { xs: 3, sm: 5 },
          pb: { xs: 4, sm: 6 },
          zIndex: 10,
        }}
      >
        {/* ─── TOP BAR ─── */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', maxWidth: 520 }}
        >
          <IconButton
            onClick={() => navigate('/business-dashboard')}
            sx={{
              color: '#ffffff',
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
            }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#ffffff', fontSize: 18, fontWeight: 900, letterSpacing: 0.3 }}>
              Scan QR Code
            </Typography>
            <Typography sx={{ color: TOKENS.textMuted, fontSize: 11, fontWeight: 500 }}>
              Point camera at any UPI QR code
            </Typography>
          </Box>

          {/* Flash & Gallery Upload Controls */}
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={toggleFlash}
              sx={{
                color: flashOn ? TOKENS.primary : '#ffffff',
                bgcolor: flashOn ? TOKENS.softPeach : 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              }}
            >
              {flashOn ? <FlashOnRoundedIcon /> : <FlashOffRoundedIcon />}
            </IconButton>

            <label htmlFor="qr-gallery-input">
              <input
                id="qr-gallery-input"
                type="file"
                accept="image/*"
                onChange={handleGalleryUpload}
                style={{ display: 'none' }}
              />
              <IconButton
                component="span"
                sx={{
                  color: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                }}
              >
                <PhotoLibraryRoundedIcon />
              </IconButton>
            </label>
          </Stack>
        </Stack>

        {/* ─── VIEWFINDER TARGET (Corner Brackets & Scan Animation) ─── */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 260, sm: 290 },
            height: { xs: 260, sm: 290 },
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {/* Top-Left Corner Bracket */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 38,
              height: 38,
              borderTop: `4px solid ${TOKENS.primary}`,
              borderLeft: `4px solid ${TOKENS.primary}`,
              borderTopLeftRadius: '16px',
            }}
          />
          {/* Top-Right Corner Bracket */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 38,
              height: 38,
              borderTop: `4px solid ${TOKENS.primary}`,
              borderRight: `4px solid ${TOKENS.primary}`,
              borderTopRightRadius: '16px',
            }}
          />
          {/* Bottom-Left Corner Bracket */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 38,
              height: 38,
              borderBottom: `4px solid ${TOKENS.primary}`,
              borderLeft: `4px solid ${TOKENS.primary}`,
              borderBottomLeftRadius: '16px',
            }}
          />
          {/* Bottom-Right Corner Bracket */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 38,
              height: 38,
              borderBottom: `4px solid ${TOKENS.primary}`,
              borderRight: `4px solid ${TOKENS.primary}`,
              borderBottomRightRadius: '16px',
            }}
          />

          {/* Center Guide Icon */}
          <QrCodeScannerRoundedIcon
            sx={{ color: alpha('#ffffff', 0.4), fontSize: 48 }}
          />

          {/* Animated Scanning Beam */}
          <Box
            sx={{
              position: 'absolute',
              left: 8,
              right: 8,
              height: 2,
              bgcolor: TOKENS.primary,
              boxShadow: `0 0 12px 2px ${TOKENS.primary}`,
              animation: 'scannerLaser 2.2s ease-in-out infinite alternate',
              '@keyframes scannerLaser': {
                '0%': { top: '12px', opacity: 0.8 },
                '50%': { opacity: 1 },
                '100%': { top: 'calc(100% - 12px)', opacity: 0.8 },
              },
            }}
          />
        </Box>

        {/* ─── BOTTOM SECTION: STATUS & 3 QUICK ACTION CARDS ─── */}
        <Stack spacing={2} alignItems="center" sx={{ width: '100%', maxWidth: 520 }}>
          {/* Status Chip */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: 'rgba(23, 32, 51, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              px: 2,
              py: 0.75,
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            <FiberManualRecordIcon
              sx={{
                fontSize: 10,
                color: scanned ? TOKENS.primary : TOKENS.successGreen,
                animation: 'blink 1.4s ease-in-out infinite',
                '@keyframes blink': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                },
              }}
            />
            <span>{status}</span>
          </Box>

          {scanned ? (
            <Button
              variant="contained"
              onClick={resetScanner}
              sx={{
                bgcolor: TOKENS.primary,
                color: '#ffffff',
                px: 3.5,
                py: 1.1,
                borderRadius: '999px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.86rem',
                boxShadow: '0 4px 14px rgba(255,90,10,0.4)',
                '&:hover': { bgcolor: TOKENS.primaryDark },
              }}
            >
              Tap to Scan Again
            </Button>
          ) : (
            /* 3 Action Cards matching Screen 8 */
            <Stack direction="row" spacing={1.2} sx={{ width: '100%', mt: 1 }}>
              <Card
                elevation={0}
                onClick={() => navigate('/business/nearby-stores')}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: TOKENS.primary,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <StorefrontRoundedIcon sx={{ fontSize: 22, color: TOKENS.primary, mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  Nearby Stores
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: TOKENS.textMuted, mt: 0.2 }}>
                  Scan & Pay
                </Typography>
              </Card>

              <Card
                elevation={0}
                onClick={() => navigate('/business/online-marketplace')}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: TOKENS.primary,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <LocalOfferRoundedIcon sx={{ fontSize: 22, color: '#F59E0B', mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  Check Offers
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: TOKENS.textMuted, mt: 0.2 }}>
                  Discounts & B2B
                </Typography>
              </Card>

              <Card
                elevation={0}
                onClick={() => navigate('/business/shops')}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: TOKENS.primary,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 22, color: '#38BDF8', mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  Shop Details
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: TOKENS.textMuted, mt: 0.2 }}>
                  My Outlets
                </Typography>
              </Card>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default ScannerPage;
