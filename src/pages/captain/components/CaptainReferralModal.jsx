import React, { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShareIcon from '@mui/icons-material/Share';

export default function CaptainReferralModal({ open, onClose, captainId, captainName }) {
  const [copied, setCopied] = useState(false);

  const cleanId = captainId || localStorage.getItem('username_captain') || 'CB_CAPTAIN';
  const name = captainName || localStorage.getItem('fullname_captain') || 'Captain Partner';

  const referralUrl = `${window.location.origin}/registration?sponsor=${encodeURIComponent(cleanId)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(referralUrl)}`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
    } catch (_) {
      setCopied(true);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Hello! Join the Trikonekt Merchant Network to take your retail store online, accept UPI payments with our voice alert Standee QR, and reach local shoppers. Register your business here:\n\n${referralUrl}\n\nSponsor Code: ${cleanId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Trikonekt Merchant Onboarding',
        text: `Register your store on Trikonekt with Sponsor Code ${cleanId}`,
        url: referralUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: { xs: 2, sm: 2.5 },
            bgcolor: '#ffffff',
            boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25)',
          },
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.18rem', color: '#0F172A', lineHeight: 1.2 }}>
              Refer Merchant Store
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500, mt: 0.25 }}>
              Sponsor code autofills on merchant's phone
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 1, borderColor: '#F1F5F9' }} />

        {/* Sponsor Code Highlight Plaque */}
        <Box
          sx={{
            p: 1.75,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            border: '1.5px solid #FED7AA',
            textAlign: 'center',
            my: 1,
          }}
        >
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Your Captain Sponsor Code
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 0.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', color: '#EA580C', letterSpacing: '1px', fontFamily: 'monospace' }}>
              {cleanId}
            </Typography>
            <IconButton
              size="small"
              onClick={handleCopyLink}
              title="Copy Referral Link"
              sx={{ bgcolor: '#ffffff', color: '#EA580C', p: 0.6, boxShadow: '0 2px 6px rgba(234, 88, 12, 0.15)' }}
            >
              <ContentCopyIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
          <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600, mt: 0.5 }}>
            Captain: {name}
          </Typography>
        </Box>

        {/* Scan to Register QR Code Viewport */}
        <Box sx={{ my: 1.5, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, mb: 1 }}>
            Point merchant's camera to register instantly:
          </Typography>
          <Box
            sx={{
              display: 'inline-block',
              p: 1.5,
              bgcolor: '#F8FAFC',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
            }}
          >
            <img
              src={qrUrl}
              alt="Merchant Referral QR"
              style={{ width: 160, height: 160, display: 'block', borderRadius: '8px' }}
            />
          </Box>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 14, color: '#16A34A' }} />
            <Typography sx={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700 }}>
              Sponsor Code {cleanId} is pre-linked
            </Typography>
          </Stack>
        </Box>

        {/* 2 Primary Action Buttons */}
        <Stack spacing={1.2} sx={{ mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsAppShare}
            sx={{
              bgcolor: '#16A34A',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.84rem',
              py: 1.15,
              borderRadius: '12px',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
              '&:hover': { bgcolor: '#15803D' },
            }}
          >
            Share on WhatsApp
          </Button>

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              sx={{
                borderColor: '#E2E8F0',
                color: '#0F172A',
                fontWeight: 800,
                fontSize: '0.8rem',
                py: 1,
                borderRadius: '12px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
              }}
            >
              Copy Link
            </Button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <IconButton
                onClick={handleNativeShare}
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  color: '#475569',
                  px: 1.5,
                  '&:hover': { bgcolor: '#F8FAFC', color: '#EA580C' },
                }}
              >
                <ShareIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', fontWeight: 700, borderRadius: '12px' }}>
          Merchant Referral Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
