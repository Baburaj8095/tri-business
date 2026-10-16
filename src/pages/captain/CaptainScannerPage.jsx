import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function CaptainScannerPage() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);

  // Manual code entry dialog
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  // Start live camera
  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setHasCamera(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('[CaptainScannerPage] Camera stream notice:', err.message);
        setHasCamera(false);
      }
    }

    initCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const toggleTorch = async () => {
    try {
      if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        if (track && track.getCapabilities && track.getCapabilities().torch) {
          const next = !torchOn;
          await track.applyConstraints({ advanced: [{ torch: next }] });
          setTorchOn(next);
        } else {
          setToastMsg('Torch is not supported on this browser/device');
          setToastSeverity('info');
        }
      }
    } catch (_) {
      setToastMsg('Unable to toggle torch');
      setToastSeverity('info');
    }
  };

  const handleManualSubmit = () => {
    const clean = manualCode.trim();
    if (!clean) return;

    setToastMsg(`Processing Merchant QR: ${clean}`);
    setToastSeverity('success');
    setManualDialogOpen(false);
    setManualCode('');

    // If numerical or alphanumeric ID, navigate to merchant details
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length > 0) {
      setTimeout(() => {
        navigate(`/captain/merchant/${digitsOnly}`);
      }, 700);
    } else {
      setTimeout(() => {
        navigate('/captain/merchants');
      }, 700);
    }
  };

  return (
    <Box sx={{
      bgcolor: '#0F172A',
      minHeight: '100vh',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Top Header Bar (Back button, Title, Torch) ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        pt: 2.5,
        pb: 1.5,
        zIndex: 10,
      }}>
        <IconButton
          onClick={() => navigate('/captain/home')}
          sx={{ color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)', p: 1 }}
        >
          <ArrowBackIcon sx={{ fontSize: 22 }} />
        </IconButton>

        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff', letterSpacing: '-0.01em' }}>
          Scan Merchant QR
        </Typography>

        <IconButton
          onClick={toggleTorch}
          sx={{
            color: torchOn ? '#EA580C' : '#ffffff',
            bgcolor: torchOn ? '#FFF7ED' : 'rgba(255, 255, 255, 0.1)',
            p: 1,
          }}
        >
          {torchOn ? <FlashOnIcon sx={{ fontSize: 22 }} /> : <FlashOffIcon sx={{ fontSize: 22 }} />}
        </IconButton>
      </Box>

      {/* ── Central Scanner Viewfinder Area ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        my: 'auto',
      }}>
        {/* Frame Box with Corner Brackets */}
        <Box sx={{
          width: { xs: 240, sm: 260 },
          height: { xs: 240, sm: 260 },
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          bgcolor: 'rgba(15, 23, 42, 0.7)',
          boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6)',
        }}>
          {/* Live Video Camera */}
          {hasCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <Box sx={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              p: 2,
              textAlign: 'center',
            }}>
              <QrCode2Icon sx={{ fontSize: 100, color: 'rgba(255, 255, 255, 0.18)' }} />
            </Box>
          )}

          {/* 4 Corner Orange Brackets */}
          {/* Top-Left */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0,
            width: 38, height: 38,
            borderTop: '4px solid #EA580C',
            borderLeft: '4px solid #EA580C',
            borderTopLeftRadius: '20px',
          }} />
          {/* Top-Right */}
          <Box sx={{
            position: 'absolute', top: 0, right: 0,
            width: 38, height: 38,
            borderTop: '4px solid #EA580C',
            borderRight: '4px solid #EA580C',
            borderTopRightRadius: '20px',
          }} />
          {/* Bottom-Left */}
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0,
            width: 38, height: 38,
            borderBottom: '4px solid #EA580C',
            borderLeft: '4px solid #EA580C',
            borderBottomLeftRadius: '20px',
          }} />
          {/* Bottom-Right */}
          <Box sx={{
            position: 'absolute', bottom: 0, right: 0,
            width: 38, height: 38,
            borderBottom: '4px solid #EA580C',
            borderRight: '4px solid #EA580C',
            borderBottomRightRadius: '20px',
          }} />

          {/* Animated Orange Scan Laser */}
          <Box sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '3px',
            bgcolor: '#EA580C',
            boxShadow: '0 0 14px 2px #EA580C',
            animation: 'scannerLaser 2.2s ease-in-out infinite alternate',
            '@keyframes scannerLaser': {
              '0%': { top: '8%' },
              '100%': { top: '92%' },
            },
          }} />
        </Box>

        {/* Viewfinder Instructions */}
        <Typography sx={{
          fontSize: '0.78rem',
          color: '#94A3B8',
          textAlign: 'center',
          maxWidth: 240,
          mt: 2.5,
          fontWeight: 500,
          lineHeight: 1.45,
        }}>
          Position the QR code within the frame to scan and register merchant
        </Typography>
      </Box>

      {/* ── Bottom Action Sheet / Cards (Screen 5 Exact Match) ── */}
      <Box sx={{
        px: 2,
        pb: 3,
        zIndex: 10,
      }}>
        {/* Card 1: Scan to Register Merchant */}
        <Box
          onClick={() => navigate('/captain/merchants')}
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '16px',
            p: 1.6,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.15s ease',
            '&:hover': { bgcolor: '#FFF7ED' },
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          <Box sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            bgcolor: '#FFF7ED',
            color: '#EA580C',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            border: '1px solid #FED7AA',
          }}>
            <QrCode2Icon sx={{ fontSize: 24 }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', lineHeight: 1.2 }}>
              Scan to Register Merchant
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, mt: 0.25 }}>
              Scan merchant QR codes &amp; register shop counters automatically.
            </Typography>
          </Box>

          <ChevronRightIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
        </Box>

        {/* "OR" Divider */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          my: 1.6,
          px: 1,
        }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255, 255, 255, 0.18)' }} />
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.5px' }}>
            OR
          </Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255, 255, 255, 0.18)' }} />
        </Box>

        {/* Button 2: Enter QR Code Manually */}
        <Button
          fullWidth
          variant="outlined"
          onClick={() => setManualDialogOpen(true)}
          startIcon={<KeyboardIcon sx={{ fontSize: 18 }} />}
          sx={{
            borderColor: '#EA580C',
            color: '#EA580C',
            fontWeight: 800,
            fontSize: '0.84rem',
            py: 1.2,
            borderRadius: '14px',
            textTransform: 'none',
            bgcolor: 'rgba(234, 88, 12, 0.08)',
            '&:hover': {
              borderColor: '#C2410C',
              bgcolor: 'rgba(234, 88, 12, 0.15)',
              color: '#ffffff',
            },
          }}
        >
          Enter QR Code Manually
        </Button>
      </Box>

      {/* Manual QR Code Entry Modal */}
      <Dialog
        open={manualDialogOpen}
        onClose={() => setManualDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1.5,
            bgcolor: '#ffffff',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A', pb: 0.5 }}>
          Enter Merchant Code Manually
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mb: 2 }}>
            Type the 10-digit mobile number, Shop Counter ID, or UPI VPA code to activate.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Shop ID / Mobile Number"
            variant="outlined"
            size="small"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="e.g. 9868570448 or SHOP12"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setManualDialogOpen(false)}
            sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleManualSubmit}
            disabled={!manualCode.trim()}
            sx={{
              bgcolor: '#EA580C',
              color: '#ffffff',
              fontWeight: 800,
              borderRadius: '10px',
              textTransform: 'none',
              px: 2.5,
              '&:hover': { bgcolor: '#C2410C' },
            }}
          >
            Verify &amp; Activate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toastSeverity} onClose={() => setToastMsg('')} sx={{ borderRadius: '12px', fontWeight: 700 }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
