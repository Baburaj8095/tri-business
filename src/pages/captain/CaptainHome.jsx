import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Chip, IconButton, Badge,
  Menu, MenuItem, Button, Stack,
} from '@mui/material';
import {
  Notifications as BellIcon,
  ChatBubbleOutline as ChatIcon,
  Store as StoreIcon,
  CheckCircle as ActiveIcon,
  ShoppingCart as CartIcon,
  QrCodeScanner as QrIcon,
  AssignmentLate as TaskIcon,
  NotificationsActive as AlertIcon,
  ChevronRight as ChevronRightIcon,
  VerifiedUser as KycActionIcon,
  Storefront as FollowupActionIcon,
  LocalShipping as DeliveryActionIcon,
  QrCode2 as ScannerActionIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

export default function CaptainHome() {
  const navigate = useNavigate();

  const [captainName, setCaptainName] = useState('Baburaj');
  const [captainId, setCaptainId] = useState('CB9868570448');
  const [isOnline, setIsOnline] = useState(true);
  const [locationName, setLocationName] = useState('Bengaluru, Karnataka');

  // Status menu anchor
  const [statusAnchor, setStatusAnchor] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem('fullname_captain');
    const storedId = localStorage.getItem('username_captain');
    if (storedName) setCaptainName(storedName);
    if (storedId) setCaptainId(storedId);
  }, []);

  return (
    <Box sx={{ pb: 3 }}>

      {/* ── Top Curved Dark Emerald Header (Matches Mockup Screen 1) ── */}
      <Box sx={{
        background: 'linear-gradient(145deg, #022c22 0%, #064e3b 55%, #047857 100%)',
        color: '#ffffff',
        pt: 3,
        pb: 3.5,
        px: 2.5,
        borderBottomLeftRadius: '28px',
        borderBottomRightRadius: '28px',
        boxShadow: '0 8px 24px rgba(2, 44, 34, 0.25)',
      }}>
        {/* Row 1: Avatar, Greeting, Name, Badges & Header Action Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Avatar Circle with initial */}
            <Box sx={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.18)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 900,
              fontSize: '1.25rem',
              color: '#ffffff',
            }}>
              {(captainName || 'B').charAt(0).toUpperCase()}
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
                Good Morning
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {captainName}
                </Typography>
                <Chip
                  label="⭐ Gold Tier"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(253, 224, 71, 0.22)',
                    color: '#fef08a',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: 20,
                    border: '1px solid rgba(253, 224, 71, 0.4)',
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 600, fontFamily: 'monospace' }}>
                Captain ID: {captainId}
              </Typography>
            </Box>
          </Box>

          {/* Right Notification & Chat Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <IconButton
              size="small"
              sx={{ color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.15)', p: 0.8 }}
            >
              <Badge color="error" variant="dot">
                <BellIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            <IconButton
              size="small"
              sx={{ color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.15)', p: 0.8 }}
            >
              <ChatIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Row 2: Online Status Pill & Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
          <Box
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              px: 1.4,
              py: 0.5,
              borderRadius: '20px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: isOnline ? '#4ade80' : '#f87171',
              boxShadow: isOnline ? '0 0 8px #4ade80' : 'none',
            }} />
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#ffffff' }}>
              {isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>

          <Menu
            anchorEl={statusAnchor}
            open={Boolean(statusAnchor)}
            onClose={() => setStatusAnchor(null)}
          >
            <MenuItem onClick={() => { setIsOnline(true); setStatusAnchor(null); }}>
              🟢 Online (Receiving Tasks)
            </MenuItem>
            <MenuItem onClick={() => { setIsOnline(false); setStatusAnchor(null); }}>
              🔴 Offline
            </MenuItem>
          </Menu>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255, 255, 255, 0.9)' }}>
            <LocationIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 600 }}>
              {locationName} ⌵
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Page Content Container ── */}
      <Box sx={{ px: 2, mt: 2.5 }}>

        {/* ── Banner: Grow Your Network (Exact Match to Mockup Screen 1) ── */}
        <Box sx={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)',
          borderRadius: '20px',
          p: 2.5,
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(4, 120, 87, 0.2)',
          mb: 3,
        }}>
          {/* Subtle line chart background decoration */}
          <Box sx={{
            position: 'absolute', right: -10, top: 0, bottom: 0, width: '45%',
            opacity: 0.25, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendUpIcon sx={{ fontSize: 120, color: '#ffffff' }} />
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '75%' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', mb: 0.4 }}>
              Grow Your Network
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.45, mb: 1.8, fontWeight: 500 }}>
              Connect merchants, enable orders and earn more with Trikonekt.
            </Typography>
            <Button
              onClick={() => navigate('/captain/analytics')}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
              sx={{
                bgcolor: '#ffffff',
                color: '#064e3b',
                fontWeight: 900,
                fontSize: '0.76rem',
                textTransform: 'none',
                borderRadius: '10px',
                px: 1.8,
                py: 0.6,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                '&:hover': { bgcolor: '#f0fdf4' },
              }}
            >
              View Growth Insights
            </Button>
          </Box>
        </Box>

        {/* ── 6 Metric Cards (Exact 2x3 Grid from Mockup Screen 1) ── */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {[
            {
              title: 'Assigned Merchants',
              val: '250',
              trend: '+12%',
              trendUp: true,
              icon: <StoreIcon sx={{ fontSize: 20, color: '#047857' }} />,
              iconBg: '#ecfdf5',
              onClick: () => navigate('/captain/merchants'),
            },
            {
              title: 'Active Merchants',
              val: '225',
              trend: '+8%',
              trendUp: true,
              icon: <ActiveIcon sx={{ fontSize: 20, color: '#16a34a' }} />,
              iconBg: '#f0fdf4',
              onClick: () => navigate('/captain/merchants?filter=active'),
            },
            {
              title: 'Total Orders',
              val: '680',
              trend: '+18%',
              trendUp: true,
              icon: <CartIcon sx={{ fontSize: 20, color: '#2563eb' }} />,
              iconBg: '#eff6ff',
              onClick: () => navigate('/captain/analytics'),
            },
            {
              title: 'This Month',
              val: '₹75,000',
              trend: '+22%',
              trendUp: true,
              icon: <Typography sx={{ fontWeight: 900, fontSize: 18, color: '#16a34a' }}>₹</Typography>,
              iconBg: '#f0fdf4',
              onClick: () => navigate('/captain/analytics'),
            },
            {
              title: 'QR Scans',
              val: '1,250',
              trend: '+15%',
              trendUp: true,
              icon: <QrIcon sx={{ fontSize: 20, color: '#06b6d4' }} />,
              iconBg: '#ecfeff',
              onClick: () => navigate('/captain/analytics'),
            },
            {
              title: 'Pending Tasks',
              val: '18',
              trend: '-5%',
              trendUp: false,
              icon: <TaskIcon sx={{ fontSize: 20, color: '#dc2626' }} />,
              iconBg: '#fef2f2',
              onClick: () => navigate('/captain/merchants?filter=pending'),
            },
          ].map((card, i) => (
            <Grid item xs={4} key={i}>
              <Box
                onClick={card.onClick}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '16px',
                  p: 1.5,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease',
                  '&:active': { transform: 'scale(0.97)' },
                }}
              >
                <Box sx={{
                  width: 34, height: 34, borderRadius: '10px', bgcolor: card.iconBg,
                  display: 'grid', placeItems: 'center', mb: 1,
                }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.1 }}>
                    {card.val}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, mt: 0.3, mb: 0.5 }}>
                    {card.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    {card.trendUp ? (
                      <TrendUpIcon sx={{ fontSize: 13, color: '#16a34a' }} />
                    ) : (
                      <TrendDownIcon sx={{ fontSize: 13, color: '#dc2626' }} />
                    )}
                    <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: card.trendUp ? '#16a34a' : '#dc2626' }}>
                      {card.trend}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ── KYC Approvals Pending Banner (Exact Match to Mockup Screen 1) ── */}
        <Box
          onClick={() => navigate('/captain/merchants?filter=pending')}
          sx={{
            bgcolor: '#fff7ed',
            border: '1.5px solid #fed7aa',
            borderRadius: '16px',
            p: 1.8,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            mb: 3,
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.08)',
          }}
        >
          <Box sx={{
            width: 40, height: 40, borderRadius: '12px', bgcolor: '#ffedd5',
            display: 'grid', placeItems: 'center', color: '#ea580c', flexShrink: 0,
          }}>
            <AlertIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#9a3412' }}>
              KYC Approvals Pending
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 500 }}>
              3 merchants awaiting verification
            </Typography>
          </Box>
          <ChevronRightIcon sx={{ color: '#ea580c' }} />
        </Box>

        {/* ── Action Center Section (Exact Match to Mockup Screen 1) ── */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a' }}>
              Action Center
            </Typography>
            <Typography
              onClick={() => navigate('/captain/merchants')}
              sx={{ fontSize: '0.78rem', color: '#047857', fontWeight: 800, cursor: 'pointer' }}
            >
              See All
            </Typography>
          </Box>

          <Stack spacing={1.3}>
            {[
              {
                icon: <KycActionIcon sx={{ fontSize: 20, color: '#7c3aed' }} />,
                iconBg: '#f5f3ff',
                title: 'KYC Approvals',
                badge: '3',
                badgeBg: '#ef4444',
                desc: 'Verify pending merchant documents',
                onClick: () => navigate('/captain/merchants?filter=pending'),
              },
              {
                icon: <FollowupActionIcon sx={{ fontSize: 20, color: '#16a34a' }} />,
                iconBg: '#f0fdf4',
                title: 'Merchant Follow-ups',
                badge: '5',
                badgeBg: '#f59e0b',
                desc: 'Inactive merchants (> 7 days)',
                onClick: () => navigate('/captain/merchants?filter=attention'),
              },
              {
                icon: <DeliveryActionIcon sx={{ fontSize: 20, color: '#2563eb' }} />,
                iconBg: '#eff6ff',
                title: 'Delivery Issues',
                badge: '2',
                badgeBg: '#ef4444',
                desc: 'Resolve order delivery issues',
                onClick: () => navigate('/captain/delivery-issues'),
              },
              {
                icon: <ScannerActionIcon sx={{ fontSize: 20, color: '#0891b2' }} />,
                iconBg: '#ecfeff',
                title: 'Scanner Activation',
                badge: '4',
                badgeBg: '#2563eb',
                desc: 'Install and activate QR scanners',
                onClick: () => navigate('/scanner'),
              },
            ].map((action, i) => (
              <Box
                key={i}
                onClick={action.onClick}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '16px',
                  p: 1.6,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                }}
              >
                <Box sx={{
                  width: 38, height: 38, borderRadius: '10px', bgcolor: action.iconBg,
                  display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                  {action.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.2 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>
                      {action.title}
                    </Typography>
                    {action.badge && (
                      <Box sx={{
                        width: 18, height: 18, borderRadius: '50%', bgcolor: action.badgeBg,
                        color: '#ffffff', fontSize: '0.66rem', fontWeight: 900,
                        display: 'grid', placeItems: 'center',
                      }}>
                        {action.badge}
                      </Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                    {action.desc}
                  </Typography>
                </Box>
                <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
              </Box>
            ))}
          </Stack>
        </Box>

      </Box>
    </Box>
  );
}
