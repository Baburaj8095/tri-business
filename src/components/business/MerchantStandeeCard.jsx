import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloseIcon from '@mui/icons-material/Close';

export default function MerchantStandeeCard({ shop, onClose, showActions = true }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!shop) return null;

  const shopName = shop.shop_name || shop.name || 'Trikonekt Merchant';
  const shopId = shop.id || '0';
  const category = shop.category || 'Retail Outlet';
  const city = shop.city || shop.address || 'Bengaluru';
  const pincode = shop.pincode ? `• PIN: ${shop.pincode}` : '';
  const payUrl = `https://asiyapp.com/near-store/${shopId}/pay`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payUrl)}`;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(payUrl);
      setCopied(true);
    } catch (_) {
      // Fallback
      setCopied(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = async () => {
    try {
      setDownloading(true);
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Trikonekt-QR-${shopName.replace(/\s+/g, '_')}-${shopId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.warn('Download fallback to new tab', err);
      window.open(qrUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
      {/* Print-specific style to isolate the standee card during window.print() */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-merchant-qr-standee, #printable-merchant-qr-standee * {
            visibility: visible !important;
          }
          #printable-merchant-qr-standee {
            position: fixed !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: 380px !important;
            border: 2px solid #ea580c !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* ── Standee Acrylic Card ── */}
      <Box
        id="printable-merchant-qr-standee"
        sx={{
          position: 'relative',
          bgcolor: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1.5px solid #FED7AA',
          boxShadow: '0 16px 40px -10px rgba(234, 88, 12, 0.18), 0 4px 16px rgba(15, 23, 42, 0.06)',
          textAlign: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top Header Plaque (Trikonekt Signature Gradient) */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #FF6508 0%, #EA580C 50%, #C2410C 100%)',
            pt: 2.75,
            pb: 2.5,
            px: 2.5,
            color: '#ffffff',
            position: 'relative',
          }}
        >
          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: '#ffffff',
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                width: 28,
                height: 28,
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}

          {/* Subtitle Badge */}
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75} sx={{ mb: 1 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(6px)',
                px: 1.5,
                py: 0.35,
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                }}
              >
                TRIKONEKT • SCAN & PAY
              </Typography>
            </Box>
          </Stack>

          {/* Store Name */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: '1.28rem',
              lineHeight: 1.25,
              color: '#ffffff',
              letterSpacing: '-0.3px',
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
              mb: 0.5,
            }}
          >
            {shopName}
          </Typography>

          {/* Location & Category Pill */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.5}
            sx={{ flexWrap: 'wrap', gap: 0.5 }}
          >
            <Chip
              size="small"
              icon={<StorefrontIcon sx={{ fontSize: '12px !important', color: '#ffffff !important' }} />}
              label={category.toUpperCase()}
              sx={{
                height: 20,
                fontSize: '0.62rem',
                fontWeight: 800,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
              {city} {pincode}
            </Typography>
          </Stack>
        </Box>

        {/* Voice Alert Pill Banner */}
        <Box
          sx={{
            bgcolor: '#FFF7ED',
            py: 0.85,
            px: 2,
            borderBottom: '1px solid #FFEDD5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
          }}
        >
          <VolumeUpIcon sx={{ fontSize: 16, color: '#EA580C' }} />
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#C2410C' }}>
            Voice Alert Active • Instant Audio Confirmation
          </Typography>
        </Box>

        {/* ── QR CODE DISPLAY SECTION ── */}
        <Box sx={{ p: 2.5, bgcolor: '#ffffff' }}>
          {/* QR Viewfinder with Corner Accents */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              p: 1.75,
              bgcolor: '#FAFAF9',
              borderRadius: '20px',
              border: '1px solid #E7E5E4',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Top-Left Corner Accent */}
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                left: 6,
                width: 22,
                height: 22,
                borderTop: '3px solid #EA580C',
                borderLeft: '3px solid #EA580C',
                borderTopLeftRadius: '10px',
              }}
            />
            {/* Top-Right Corner Accent */}
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 22,
                height: 22,
                borderTop: '3px solid #EA580C',
                borderRight: '3px solid #EA580C',
                borderTopRightRadius: '10px',
              }}
            />
            {/* Bottom-Left Corner Accent */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 6,
                left: 6,
                width: 22,
                height: 22,
                borderBottom: '3px solid #EA580C',
                borderLeft: '3px solid #EA580C',
                borderBottomLeftRadius: '10px',
              }}
            />
            {/* Bottom-Right Corner Accent */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 6,
                right: 6,
                width: 22,
                height: 22,
                borderBottom: '3px solid #EA580C',
                borderRight: '3px solid #EA580C',
                borderBottomRightRadius: '10px',
              }}
            />

            <img
              src={qrUrl}
              alt={`${shopName} QR Code`}
              style={{
                width: 210,
                height: 210,
                display: 'block',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
              }}
            />
          </Box>

          {/* Verification Badge */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.5}
            sx={{ mt: 1.75 }}
          >
            <CheckCircleIcon sx={{ fontSize: 16, color: '#16A34A' }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803D' }}>
              Verified Trikonekt Merchant
            </Typography>
          </Stack>

          {/* Accepted Payment Rails Pill Strip */}
          <Box
            sx={{
              mt: 1.75,
              pt: 1.5,
              borderTop: '1px dashed #E2E8F0',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.64rem',
                fontWeight: 800,
                color: '#94A3B8',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                mb: 1,
              }}
            >
              Accepted Payment Modes
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              justifyContent="center"
              flexWrap="wrap"
              useFlexGap
            >
              {['BHIM UPI', 'Google Pay', 'PhonePe', 'Paytm', 'RuPay'].map((rail) => (
                <Box
                  key={rail}
                  sx={{
                    px: 1,
                    py: 0.3,
                    borderRadius: '6px',
                    bgcolor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    color: '#334155',
                  }}
                >
                  {rail}
                </Box>
              ))}

              <Box
                sx={{
                  px: 1,
                  py: 0.3,
                  borderRadius: '6px',
                  bgcolor: '#FFF7ED',
                  border: '1px solid #FFD8A8',
                  fontSize: '0.66rem',
                  fontWeight: 900,
                  color: '#EA580C',
                }}
              >
                ★ TRI Coins Cashback
              </Box>
            </Stack>
          </Box>

          {/* Terminal Footer */}
          <Box
            sx={{
              mt: 2,
              py: 0.75,
              px: 1.5,
              borderRadius: '10px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography sx={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700 }}>
              MID: TK-{String(shopId).padStart(6, '0')} • Zero MDR • Instant Bank Settlement
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Standee Acrylic Footing Base ── */}
      <Box
        sx={{
          width: '78%',
          height: 10,
          bgcolor: '#E2E8F0',
          borderRadius: '0 0 12px 12px',
          mx: 'auto',
          boxShadow: '0 8px 16px rgba(15, 23, 42, 0.1)',
          border: '1px solid #CBD5E1',
          borderTop: 'none',
        }}
      />

      {/* ── Action Buttons ── */}
      {showActions && (
        <Stack direction="row" spacing={1.25} sx={{ mt: 2.5 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              borderRadius: '12px',
              bgcolor: '#0F172A',
              color: '#ffffff',
              fontWeight: 800,
              py: 1.1,
              fontSize: '0.82rem',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            Print Standee
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadQR}
            disabled={downloading}
            sx={{
              borderRadius: '12px',
              borderColor: '#EA580C',
              color: '#EA580C',
              fontWeight: 800,
              py: 1.1,
              fontSize: '0.82rem',
              textTransform: 'none',
              bgcolor: '#FFF7ED',
              '&:hover': { bgcolor: '#FFEDD5', borderColor: '#C2410C' },
            }}
          >
            {downloading ? 'Downloading...' : 'Save QR'}
          </Button>

          <IconButton
            onClick={handleCopy}
            title="Copy Pay Link"
            sx={{
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              bgcolor: '#ffffff',
              color: '#475569',
              width: 44,
              height: 44,
              flexShrink: 0,
              '&:hover': { bgcolor: '#F8FAFC', color: '#EA580C', borderColor: '#EA580C' },
            }}
          >
            <ContentCopyIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      )}

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', fontWeight: 700, borderRadius: '12px' }}>
          Payment link copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
