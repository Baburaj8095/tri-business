import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Notifications as BellIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

/**
 * Unified Captain Top Hero Header
 * Matches the approved light cream, peach & orange illustrated design from the visual reference.
 * Shared across Home, Merchants, Analytics, Profile, and other Captain screens for complete consistency.
 */
export default function CaptainHeader({
  captainName: propName,
  pincode: propPincode,
  rightActions,
  onRefresh,
  refreshLoading = false,
  children,
  subtitle,
}) {
  const [captainName, setCaptainName] = useState(propName || '');
  const [pincode, setPincode] = useState(propPincode || '');
  const [isOnline, setIsOnline] = useState(true);
  const [statusAnchor, setStatusAnchor] = useState(null);

  useEffect(() => {
    if (propName) {
      setCaptainName(propName);
    } else {
      const stored = localStorage.getItem('fullname_captain') || localStorage.getItem('business_full_name');
      if (stored) setCaptainName(stored);
    }
  }, [propName]);

  useEffect(() => {
    if (propPincode) {
      setPincode(propPincode);
    } else {
      const storedPin = localStorage.getItem('pincode_captain') || '560073';
      setPincode(storedPin);
    }
  }, [propPincode]);

  const displayName = captainName || 'Tri Captain';
  const displayInitial = (captainName || 'T').charAt(0).toUpperCase();

  return (
    <Box
      className="captain-header"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        bgcolor: '#FFF8F0',
        backgroundImage: `linear-gradient(90deg, rgba(255, 248, 240, 0.98) 0%, rgba(255, 248, 240, 0.88) 50%, rgba(255, 248, 240, 0.15) 85%), url(${process.env.PUBLIC_URL || ''}/assets/captain-header-background.png)`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: { xs: 'right 25% top', sm: 'right top' },
        backgroundSize: 'cover',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        boxShadow: '0 8px 24px rgba(234, 88, 12, 0.08)',
        pt: 3,
        pb: children ? 3 : 2.6,
        px: 2.5,
        mb: 2,
      }}
    >
      {/* ── Row 1: Avatar, Greeting "Hi, {Name}", Gold Tier badge, PIN & Actions ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.8, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Avatar Circle with initial */}
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: '#431407',
            border: '2px solid rgba(255, 255, 255, 0.85)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            fontSize: '1.3rem',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(67, 20, 7, 0.25)',
            flexShrink: 0,
          }}>
            {displayInitial}
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.18rem', color: '#172033', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Hi, {displayName}
              </Typography>
              <Chip
                label="⭐ Gold Tier"
                size="small"
                sx={{
                  bgcolor: '#FEF08A',
                  color: '#854D0E',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 20,
                  border: '1px solid #FDE047',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2 }}>
              <LocationIcon sx={{ fontSize: 15, color: '#EA580C' }} />
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#172033' }}>
                PIN: {pincode || '560073'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Header Action Controls */}
        <Stack direction="row" spacing={0.8} alignItems="center">
          {onRefresh && (
            <IconButton
              size="small"
              onClick={onRefresh}
              disabled={refreshLoading}
              title="Refresh"
              sx={{
                color: '#EA580C',
                bgcolor: '#ffffff',
                p: 1,
                borderRadius: '50%',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                '&:hover': { bgcolor: '#FFF7ED' },
              }}
            >
              <RefreshIcon sx={{ fontSize: 19 }} />
            </IconButton>
          )}

          {rightActions}

          {/* Right Notification Bell Icon */}
          <IconButton
            size="small"
            sx={{
              color: '#EA580C',
              bgcolor: '#ffffff',
              p: 1,
              borderRadius: '50%',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              '&:hover': { bgcolor: '#FFF7ED' },
            }}
          >
            <Badge color="error" variant="dot">
              <BellIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Stack>
      </Box>

      {/* ── Row 2: Online Status Pill + Receiving Tasks Pill side-by-side ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        position: 'relative',
        zIndex: 1,
        mb: subtitle || children ? 2 : 0.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Online/Offline Status Pill */}
          <Box
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: '#ffffff',
              px: 1.4,
              py: 0.5,
              borderRadius: '20px',
              cursor: 'pointer',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#FFF7ED' },
            }}
          >
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isOnline ? '#22c55e' : '#f87171',
              boxShadow: isOnline ? '0 0 6px #22c55e' : 'none',
            }} />
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#172033' }}>
              {isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>

          {/* Receiving Tasks Dropdown Pill */}
          <Box
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              bgcolor: '#ffffff',
              px: 1.4,
              py: 0.5,
              borderRadius: '20px',
              cursor: 'pointer',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#FFF7ED' },
            }}
          >
            <Box sx={{ width: 6, height: 6, bgcolor: '#EA580C', transform: 'rotate(45deg)' }} />
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#172033' }}>
              Receiving Tasks ⌵
            </Typography>
          </Box>
        </Box>

        {subtitle && (
          <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
            {subtitle}
          </Typography>
        )}

        {/* Status Dropdown Menu */}
        <Menu
          anchorEl={statusAnchor}
          open={Boolean(statusAnchor)}
          onClose={() => setStatusAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              mt: 0.5,
            }
          }}
        >
          <MenuItem
            onClick={() => { setIsOnline(true); setStatusAnchor(null); }}
            sx={{ fontSize: '0.82rem', fontWeight: 700, py: 1 }}
          >
            🟢 Online (Receiving Tasks)
          </MenuItem>
          <MenuItem
            onClick={() => { setIsOnline(false); setStatusAnchor(null); }}
            sx={{ fontSize: '0.82rem', fontWeight: 700, py: 1 }}
          >
            🔴 Offline
          </MenuItem>
        </Menu>
      </Box>

      {/* ── Optional Children (e.g. promotional banners or page-specific tools) ── */}
      {children && (
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
