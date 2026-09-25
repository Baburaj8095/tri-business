import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Stack,
  alpha,
} from '@mui/material';
import {
  ArrowBack,
  Group,
  School,
  Explore,
  Event,
  HeadsetMic,
  OpenInNew,
  YouTube,
  WhatsApp,
  Instagram,
  Facebook,
  Telegram,
  VolunteerActivism,
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';

const PRIMARY = '#228B22';
const PRIMARY_DARK = '#1B4D3E';
const BG = '#faf8f3';

// Community & initiative cards adapted from reference specification
const SOCIETY_CARDS = [
  {
    id: 'meeting',
    icon: Group,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    title: 'Community Meeting',
    subtitle: 'Weekly Town Hall',
    description: 'Join weekly discussions, merchant open houses & community town halls.',
    route: '/business/for-better-society/meeting',
    tag: 'Live Sessions',
  },
  {
    id: 'training',
    icon: School,
    iconBg: '#cffafe',
    iconColor: '#0891b2',
    title: 'Skill Training',
    subtitle: 'Programs & Resources',
    description: 'B2B skill development programs, digital tools training & growth guides.',
    route: '/business/for-better-society/training',
    tag: 'Free Courses',
  },
  {
    id: 'career',
    icon: Explore,
    iconBg: '#d1fae5',
    iconColor: '#059669',
    title: 'Career Guidance',
    subtitle: 'Mentorship & Support',
    description: 'Connect with experienced industry mentors, business advisors and coaches.',
    route: '/business/for-better-society/career-guidance',
    tag: '1-on-1 Mentorship',
  },
  {
    id: 'events',
    icon: Event,
    iconBg: '#fce7f3',
    iconColor: '#db2777',
    title: 'Social Drives',
    subtitle: 'Upcoming Gatherings',
    description: 'Explore social welfare initiatives, tree plantation drives & food camps.',
    route: '/business/for-better-society/events',
    tag: 'Local Drives',
  },
  {
    id: 'helpdesk',
    icon: HeadsetMic,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    title: '24/7 Helpdesk',
    subtitle: 'Volunteer Support',
    description: '24/7 volunteer and administrative emergency assistance for families & shops.',
    route: '/business/support',
    tag: 'Instant Help',
  },
  {
    id: 'youtube',
    icon: YouTube,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    title: 'YouTube Channel',
    subtitle: 'Watch Initiatives',
    description: 'Subscribe to our informative videos, merchant stories & social campaigns.',
    route: 'https://youtube.com',
    external: true,
    tag: 'Video Hub',
  },
  {
    id: 'whatsapp',
    icon: WhatsApp,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    title: 'WhatsApp Group',
    subtitle: 'Connect Instantly',
    description: 'Join the instant chat community group to coordinate local social relief.',
    route: 'https://wa.me',
    external: true,
    tag: 'Chat Network',
  },
  {
    id: 'instagram',
    icon: Instagram,
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    title: 'Instagram',
    subtitle: 'Daily Updates',
    description: 'Follow our photo stories, grassroots updates, and impact gallery.',
    route: 'https://instagram.com',
    external: true,
    tag: 'Photo Stories',
  },
  {
    id: 'facebook',
    icon: Facebook,
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    title: 'Facebook Page',
    subtitle: 'Community Page',
    description: 'Like our page and share initiatives to mobilize public support across India.',
    route: 'https://facebook.com',
    external: true,
    tag: 'Community',
  },
  {
    id: 'telegram',
    icon: Telegram,
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    title: 'Telegram Broadcast',
    subtitle: 'Broadcast Channel',
    description: 'Get fast broadcasts, disaster alerts, and community notices on Telegram.',
    route: 'https://t.me',
    external: true,
    tag: 'Broadcasts',
  },
];

export default function ForBetterSocietyPage() {
  const navigate = useNavigate();

  const handleCardClick = (card) => {
    if (card.external) {
      window.open(card.route, '_blank', 'noopener,noreferrer');
    } else {
      // Internal navigation with fallback toast or alert
      navigate(card.route);
    }
  };

  return (
    <AppShell activeTab="/business-dashboard" title="For Better Society">
      <Box sx={{ minHeight: '100vh', bgcolor: BG, pb: 10 }}>
        {/* Sticky Header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            px: { xs: 2, sm: 3 },
            py: 1.75,
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#334155',
                  width: 38,
                  height: 38,
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
                aria-label="Go back"
              >
                <ArrowBack sx={{ fontSize: 20 }} />
              </IconButton>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.05rem', sm: '1.25rem' },
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <VolunteerActivism sx={{ color: PRIMARY, fontSize: 22 }} />
                  For Better Society
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                  Trikonekt Community Initiatives, Social Welfare & Empowerment
                </Typography>
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* Hero Banner */}
        <Container maxWidth="lg" sx={{ mt: 2.5, px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1B4D3E 0%, #228B22 100%)',
              borderRadius: '20px',
              p: { xs: 2.5, sm: 3.5 },
              color: '#ffffff',
              boxShadow: '0 10px 25px rgba(34, 139, 34, 0.18)',
              position: 'relative',
              overflow: 'hidden',
              mb: 3,
            }}
          >
            {/* Background decorative circles */}
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 160,
                height: 160,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                pointerEvents: 'none',
              }}
            />
            <Box sx={{ maxWidth: 650, position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: 'rgba(255, 255, 255, 0.18)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  mb: 1.25,
                }}
              >
                🌿 Community Driven Social Impact
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.65rem' },
                  fontWeight: 900,
                  lineHeight: 1.25,
                  mb: 1,
                }}
              >
                Building an Inclusive Society Together
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '0.82rem', sm: '0.92rem' },
                  color: 'rgba(255, 255, 255, 0.88)',
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                Explore TRIKONEKT's community programs, social platforms, and support services designed
                to build a better, stronger society. Join our weekly town halls, access skill training, and participate in local social drives.
              </Typography>
            </Box>
          </Box>

          {/* Cards Grid */}
          <Typography
            sx={{
              fontSize: '0.95rem',
              fontWeight: 850,
              color: '#0f172a',
              mb: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Explore Community Programs & Channels
          </Typography>

          <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
            {SOCIETY_CARDS.map((card) => {
              const IconComponent = card.icon;
              return (
                <Grid item xs={6} sm={4} md={3} key={card.id}>
                  <Card
                    onClick={() => handleCardClick(card)}
                    sx={{
                      height: '100%',
                      borderRadius: '18px',
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                      transition: 'all 0.22s ease-in-out',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
                        borderColor: '#cbd5e1',
                      },
                      '&:active': {
                        transform: 'scale(0.98)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.75, sm: 2.25 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Top row: Icon + External or Tag indicator */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Box
                          sx={{
                            width: { xs: 44, sm: 52 },
                            height: { xs: 44, sm: 52 },
                            borderRadius: '14px',
                            bgcolor: card.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent sx={{ fontSize: { xs: 24, sm: 28 }, color: card.iconColor }} />
                        </Box>
                        {card.external && (
                          <Box
                            sx={{
                              p: 0.5,
                              borderRadius: '8px',
                              bgcolor: '#f1f5f9',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <OpenInNew sx={{ fontSize: 14 }} />
                          </Box>
                        )}
                      </Stack>

                      {/* Title & subtitle */}
                      <Typography
                        sx={{
                          fontSize: { xs: '0.88rem', sm: '1rem' },
                          fontWeight: 850,
                          color: '#0f172a',
                          lineHeight: 1.25,
                          mb: 0.5,
                        }}
                      >
                        {card.title}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: card.iconColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          mb: 0.75,
                        }}
                      >
                        {card.subtitle}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: { xs: '0.72rem', sm: '0.78rem' },
                          color: '#64748b',
                          lineHeight: 1.45,
                          fontWeight: 500,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flexGrow: 1,
                        }}
                      >
                        {card.description}
                      </Typography>

                      {/* Bottom action pill */}
                      <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed #f1f5f9' }}>
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: PRIMARY,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          {card.external ? 'Visit Channel →' : 'Explore Program →'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    </AppShell>
  );
}
