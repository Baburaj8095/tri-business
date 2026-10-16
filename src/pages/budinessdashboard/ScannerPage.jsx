import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Card,
  CircularProgress,
  Chip,
  Container,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import FlashOffRoundedIcon from '@mui/icons-material/FlashOffRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import StoreIcon from '@mui/icons-material/Store';

import { listMyShops } from '../../api/api';
import MerchantStandeeCard from '../../components/business/MerchantStandeeCard';

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

  // Mode: 'SCAN' (Camera Scanner) or 'STANDEE' (Merchant's Own Counter QR Standee)
  const [activeTab, setActiveTab] = useState('SCAN');

  // Scanner state
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

  // Merchant Stores state (for My Standee QR mode)
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loadingShops, setLoadingShops] = useState(false);

  // Fetch shops for Standee mode
  useEffect(() => {
    let isMounted = true;
    const loadShops = async () => {
      setLoadingShops(true);
      try {
        const res = await listMyShops();
        const data = Array.isArray(res) ? res : res?.results || res?.data || [];
        if (isMounted) {
          setShops(data);
          if (data.length > 0) {
            setSelectedShop(data[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load merchant shops for standee:', err);
      } finally {
        if (isMounted) setLoadingShops(false);
      }
    };

    loadShops();
    return () => { isMounted = false; };
  }, []);

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
        setStatus('Scanned: ' + upiString);
        window.alert(`Scanned Content:\n\n${upiString}`);
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

  // Start / Stop camera depending on activeTab
  useEffect(() => {
    if (activeTab !== 'SCAN') {
      stopScanLoop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

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
        streamRef.current = null;
      }
    };
  }, [activeTab, handleUPICode, stopScanLoop]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: activeTab === 'SCAN' ? '#000000' : '#FFF9F4',
        color: activeTab === 'SCAN' ? TOKENS.textMain : '#0F172A',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* ─── TOP GLOBAL NAVIGATION & MODE SWITCHER ─── */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          p: { xs: 1.5, sm: 2.5 },
          bgcolor: activeTab === 'SCAN' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${activeTab === 'SCAN' ? 'rgba(255,255,255,0.1)' : '#E8E3DD'}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          <IconButton
            onClick={() => navigate('/business-dashboard')}
            sx={{
              color: activeTab === 'SCAN' ? '#ffffff' : '#0F172A',
              bgcolor: activeTab === 'SCAN' ? 'rgba(255, 255, 255, 0.12)' : '#F1F5F9',
              '&:hover': { bgcolor: activeTab === 'SCAN' ? 'rgba(255, 255, 255, 0.22)' : '#E2E8F0' },
            }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>

          {/* Segmented Mode Switcher */}
          <Box
            sx={{
              display: 'inline-flex',
              p: 0.5,
              borderRadius: '999px',
              bgcolor: activeTab === 'SCAN' ? 'rgba(255, 255, 255, 0.14)' : '#F1F5F9',
              border: `1px solid ${activeTab === 'SCAN' ? 'rgba(255,255,255,0.18)' : '#E2E8F0'}`,
            }}
          >
            <Button
              size="small"
              onClick={() => setActiveTab('SCAN')}
              startIcon={<QrCodeScannerRoundedIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                borderRadius: '999px',
                px: 1.75,
                py: 0.5,
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: activeTab === 'SCAN' ? TOKENS.primary : 'transparent',
                color: activeTab === 'SCAN' ? '#ffffff' : (activeTab === 'SCAN' ? '#94A3B8' : '#64748B'),
                boxShadow: activeTab === 'SCAN' ? '0 2px 8px rgba(255,90,10,0.35)' : 'none',
                '&:hover': { bgcolor: activeTab === 'SCAN' ? TOKENS.primaryDark : 'transparent' },
              }}
            >
              Scan Code
            </Button>

            <Button
              size="small"
              onClick={() => setActiveTab('STANDEE')}
              startIcon={<QrCode2RoundedIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                borderRadius: '999px',
                px: 1.75,
                py: 0.5,
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: activeTab === 'STANDEE' ? TOKENS.primary : 'transparent',
                color: activeTab === 'STANDEE' ? '#ffffff' : '#64748B',
                boxShadow: activeTab === 'STANDEE' ? '0 2px 8px rgba(255,90,10,0.35)' : 'none',
                '&:hover': { bgcolor: activeTab === 'STANDEE' ? TOKENS.primaryDark : 'transparent' },
              }}
            >
              My Standee QR
            </Button>
          </Box>

          {/* Flash & Gallery Controls (visible only in SCAN mode) */}
          {activeTab === 'SCAN' ? (
            <Stack direction="row" spacing={0.75}>
              <IconButton
                size="small"
                onClick={toggleFlash}
                sx={{
                  color: flashOn ? TOKENS.primary : '#ffffff',
                  bgcolor: flashOn ? TOKENS.softPeach : 'rgba(255, 255, 255, 0.12)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.22)' },
                  width: 36,
                  height: 36,
                }}
              >
                {flashOn ? <FlashOnRoundedIcon sx={{ fontSize: 18 }} /> : <FlashOffRoundedIcon sx={{ fontSize: 18 }} />}
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
                  size="small"
                  component="span"
                  sx={{
                    color: '#ffffff',
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.22)' },
                    width: 36,
                    height: 36,
                  }}
                >
                  <PhotoLibraryRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </label>
            </Stack>
          ) : (
            <Box sx={{ width: 40 }} />
          )}
        </Stack>
      </Box>

      {/* ======================================================== */}
      {/* MODE 1: CAMERA SCANNER VIEW                              */}
      {/* ======================================================== */}
      {activeTab === 'SCAN' && (
        <Box sx={{ pt: 10, minHeight: '100vh', position: 'relative' }}>
          {hasPermission === false || !isSupported ? (
            /* Permission Required Screen with switch to Standee option */
            <Box
              sx={{
                minHeight: '80vh',
                display: 'grid',
                placeItems: 'center',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 380 }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '24px',
                    bgcolor: 'rgba(255, 90, 10, 0.15)',
                    border: `1.5px solid ${TOKENS.primary}`,
                    display: 'grid',
                    placeItems: 'center',
                    color: TOKENS.primary,
                  }}
                >
                  <QrCodeScannerRoundedIcon sx={{ fontSize: 38 }} />
                </Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
                  Camera Access Required
                </Typography>
                <Typography sx={{ fontSize: '0.88rem', color: TOKENS.textMuted }}>
                  {status}
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveTab('STANDEE')}
                    startIcon={<QrCode2RoundedIcon />}
                    sx={{
                      bgcolor: TOKENS.primary,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 800,
                      px: 2.5,
                      py: 1,
                      '&:hover': { bgcolor: TOKENS.primaryDark },
                    }}
                  >
                    Show My Standee QR
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/business-dashboard')}
                    sx={{
                      borderColor: '#475569',
                      color: '#ffffff',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 2.5,
                      py: 1,
                    }}
                  >
                    Dashboard
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ) : (
            /* Active Live Camera Viewport */
            <Box>
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
                  zIndex: 1,
                }}
              />

              {/* Viewfinder Overlay */}
              <Box
                sx={{
                  position: 'fixed',
                  inset: 0,
                  bgcolor: 'rgba(15, 23, 42, 0.52)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  pt: { xs: 12, sm: 14 },
                  pb: 5,
                  zIndex: 2,
                }}
              >
                {/* Instruction Banner */}
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 700 }}>
                  Align the QR code within the frame to scan
                </Typography>

                {/* Corner-Accented Viewfinder Box */}
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: 260, sm: 290 },
                    height: { xs: 260, sm: 290 },
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {/* Top-Left Corner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 40,
                      height: 40,
                      borderTop: `4px solid ${TOKENS.primary}`,
                      borderLeft: `4px solid ${TOKENS.primary}`,
                      borderTopLeftRadius: '16px',
                    }}
                  />
                  {/* Top-Right Corner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 40,
                      height: 40,
                      borderTop: `4px solid ${TOKENS.primary}`,
                      borderRight: `4px solid ${TOKENS.primary}`,
                      borderTopRightRadius: '16px',
                    }}
                  />
                  {/* Bottom-Left Corner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: 40,
                      height: 40,
                      borderBottom: `4px solid ${TOKENS.primary}`,
                      borderLeft: `4px solid ${TOKENS.primary}`,
                      borderBottomLeftRadius: '16px',
                    }}
                  />
                  {/* Bottom-Right Corner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 40,
                      height: 40,
                      borderBottom: `4px solid ${TOKENS.primary}`,
                      borderRight: `4px solid ${TOKENS.primary}`,
                      borderBottomRightRadius: '16px',
                    }}
                  />

                  {/* Center Guide Icon */}
                  <QrCodeScannerRoundedIcon sx={{ color: alpha('#ffffff', 0.35), fontSize: 50 }} />

                  {/* Animated Laser Beam */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 8,
                      right: 8,
                      height: 3,
                      bgcolor: TOKENS.primary,
                      boxShadow: `0 0 16px 3px ${TOKENS.primary}`,
                      animation: 'scannerLaser 2.2s ease-in-out infinite alternate',
                      '@keyframes scannerLaser': {
                        '0%': { top: '12px', opacity: 0.8 },
                        '50%': { opacity: 1 },
                        '100%': { top: 'calc(100% - 12px)', opacity: 0.8 },
                      },
                    }}
                  />
                </Box>

                {/* Bottom Controls */}
                <Stack spacing={2} alignItems="center" sx={{ width: '100%', maxWidth: 500 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.8,
                      bgcolor: 'rgba(23, 32, 51, 0.85)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '999px',
                      px: 2.25,
                      py: 0.85,
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
                    <Stack direction="row" spacing={1.2} sx={{ width: '100%', mt: 0.5 }}>
                      <Card
                        elevation={0}
                        onClick={() => navigate('/business/nearby-stores')}
                        sx={{
                          flex: 1,
                          p: 1.25,
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
                          },
                        }}
                      >
                        <StorefrontRoundedIcon sx={{ fontSize: 20, color: TOKENS.primary, mb: 0.25 }} />
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                          Nearby Stores
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: TOKENS.textMuted, mt: 0.2 }}>
                          Scan & Pay
                        </Typography>
                      </Card>

                      <Card
                        elevation={0}
                        onClick={() => navigate('/business/online-marketplace')}
                        sx={{
                          flex: 1,
                          p: 1.25,
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
                          },
                        }}
                      >
                        <LocalOfferRoundedIcon sx={{ fontSize: 20, color: '#F59E0B', mb: 0.25 }} />
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                          Offers
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: TOKENS.textMuted, mt: 0.2 }}>
                          Discounts & B2B
                        </Typography>
                      </Card>

                      <Card
                        elevation={0}
                        onClick={() => navigate('/business/shops')}
                        sx={{
                          flex: 1,
                          p: 1.25,
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
                          },
                        }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 20, color: '#38BDF8', mb: 0.25 }} />
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                          My Stores
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: TOKENS.textMuted, mt: 0.2 }}>
                          Manage Outlets
                        </Typography>
                      </Card>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* ======================================================== */}
      {/* MODE 2: MERCHANT'S COUNTER QR STANDEE VIEW               */}
      {/* ======================================================== */}
      {activeTab === 'STANDEE' && (
        <Container maxWidth="sm" sx={{ pt: 11, pb: 6, px: 2.5 }}>
          {loadingShops ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <CircularProgress sx={{ color: TOKENS.primary }} />
              <Typography sx={{ mt: 2, color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>
                Loading your official QR standee...
              </Typography>
            </Box>
          ) : shops.length === 0 ? (
            /* No Store Registered Empty State */
            <Card
              elevation={0}
              sx={{
                p: { xs: 3.5, sm: 5 },
                borderRadius: '24px',
                bgcolor: '#ffffff',
                border: '1.5px solid #E8E3DD',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
                mt: 4,
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: '#FFF0E5',
                  color: TOKENS.primary,
                  display: 'grid',
                  placeItems: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <StoreIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#172033', mb: 1 }}>
                No Store Registered Yet
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#64748B', maxWidth: 360, mx: 'auto', mb: 3 }}>
                Register your retail storefront to generate your personalized Trikonekt Scan & Pay QR Standee with voice alerts.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/registration-wizard')}
                sx={{
                  bgcolor: TOKENS.primary,
                  color: '#ffffff',
                  borderRadius: '12px',
                  fontWeight: 800,
                  px: 3,
                  py: 1.1,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(255,90,10,0.3)',
                  '&:hover': { bgcolor: TOKENS.primaryDark },
                }}
              >
                Register Store Now
              </Button>
            </Card>
          ) : (
            /* Live Standee Showcase */
            <Box>
              {/* Store Switcher (if multiple stores) */}
              {shops.length > 1 && (
                <Box sx={{ mb: 2.5, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Select Outlet Standee
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    sx={{ overflowX: 'auto', py: 0.5 }}
                  >
                    {shops.map((s) => {
                      const isSelected = selectedShop?.id === s.id;
                      return (
                        <Chip
                          key={s.id}
                          label={s.shop_name || s.name}
                          onClick={() => setSelectedShop(s)}
                          sx={{
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '0.78rem',
                            bgcolor: isSelected ? TOKENS.primary : '#ffffff',
                            color: isSelected ? '#ffffff' : '#64748B',
                            border: `1.5px solid ${isSelected ? TOKENS.primary : '#E2E8F0'}`,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: isSelected ? TOKENS.primaryDark : '#F8FAFC' },
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {/* The Official Modern Standee */}
              <MerchantStandeeCard
                shop={selectedShop || shops[0]}
                showActions={true}
              />
            </Box>
          )}
        </Container>
      )}
    </Box>
  );
}

export default ScannerPage;
