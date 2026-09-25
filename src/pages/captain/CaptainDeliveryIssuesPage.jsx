import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Stack,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  ReportProblem,
  Phone,
  WhatsApp,
  CheckCircle,
  LocalShipping,
  AccessTime,
  Store,
  Person
} from '@mui/icons-material';

const T = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  bg: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981'
};

const MOCK_ISSUES = [
  {
    id: "ISS-401",
    orderId: "ORD-9821",
    issueType: "Delayed Delivery Dispatch",
    severity: "HIGH",
    merchantName: "Sri Lakshmi Venkateshwara Traders",
    merchantPhone: "9845012345",
    customerName: "Kavitha R.",
    customerPhone: "9876543201",
    address: "Flat 302, Green Glen Layout, HSR Sector 1",
    delayMins: 25,
    status: "OPEN",
    notes: "Delivery partner assigned but merchant dispatch delayed due to packing."
  },
  {
    id: "ISS-402",
    orderId: "ORD-9834",
    issueType: "Wrong Delivery Landmark / Address Unclear",
    severity: "MEDIUM",
    merchantName: "Fresh Daily Organic Mart",
    merchantPhone: "9876543210",
    customerName: "Rajesh Nair",
    customerPhone: "9988112233",
    address: "Near Water Tank, 14th Main, HSR Layout",
    delayMins: 15,
    status: "OPEN",
    notes: "Rider at location but unable to locate house gate. Captain intervention requested."
  }
];

export default function CaptainDeliveryIssuesPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const [toast, setToast] = useState({ open: false, msg: '' });

  const captainPincode = localStorage.getItem('pincode_captain') || '560102';
  const captainUsername = localStorage.getItem('username_captain') || 'CB_CAPTAIN';

  const handleResolve = (id) => {
    setIssues(prev => prev.map(issue => issue.id === id ? { ...issue, status: 'RESOLVED' } : issue));
    setToast({ open: true, msg: `Issue ${id} marked as resolved!` });
  };

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', pb: 8 }}>
      {/* Top Header */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderBottom: `1px solid ${T.border}`,
          px: { xs: 2, md: 4 },
          py: 2.5,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <Container maxWidth="lg" sx={{ px: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton onClick={() => navigate('/captain/home')} sx={{ bgcolor: '#f1f5f9' }}>
              <ArrowBack sx={{ fontSize: 20, color: T.text }} />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: T.text, lineHeight: 1.2 }}>
                Pincode Delivery Issues & Support
              </Typography>
              <Typography variant="caption" sx={{ color: T.textSecondary }}>
                Pincode: <b>{captainPincode}</b> • First-Line Support System
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Alert
          severity="warning"
          icon={<ReportProblem sx={{ color: T.warning }} />}
          sx={{ mb: 3, borderRadius: '16px', fontWeight: 600, bgcolor: '#fffbeb', border: '1px solid #fef3c7' }}
        >
          <b>Captain Ground Support:</b> As the captain for pincode {captainPincode}, you are the primary support bridge between merchants, delivery partners, and consumers. Reach out directly to resolve delayed or stranded orders.
        </Alert>

        <Grid container spacing={2.5}>
          {issues.map((issue) => {
            const isResolved = issue.status === 'RESOLVED';
            return (
              <Grid item xs={12} md={6} key={issue.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '20px',
                    border: `1.5px solid ${isResolved ? '#bbf7d0' : issue.severity === 'HIGH' ? '#fecaca' : '#fed7aa'}`,
                    bgcolor: '#fff',
                    p: 2.5
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box>
                      <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: T.text }}>
                        {issue.issueType}
                      </Typography>
                      <Typography variant="caption" sx={{ color: T.textSecondary }}>
                        Ticket: <b>{issue.id}</b> • Order: <b>{issue.orderId}</b>
                      </Typography>
                    </Box>
                    <Chip
                      label={isResolved ? "Resolved" : `Delayed by ${issue.delayMins}m`}
                      size="small"
                      sx={{
                        bgcolor: isResolved ? '#dcfce7' : '#fee2e2',
                        color: isResolved ? '#16a34a' : '#dc2626',
                        fontWeight: 900,
                        fontSize: '0.72rem'
                      }}
                    />
                  </Stack>

                  <Typography variant="body2" sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: '12px', color: '#334155', mb: 2, fontSize: '0.82rem' }}>
                    {issue.notes}
                  </Typography>

                  {/* Merchant & Customer Info */}
                  <Grid container spacing={1.5} mb={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: T.textSecondary, fontWeight: 700 }}>Merchant Contact:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{issue.merchantName}</Typography>
                      <Stack direction="row" spacing={1} mt={0.5}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Phone sx={{ fontSize: 14 }} />}
                          href={`tel:${issue.merchantPhone}`}
                          sx={{ borderRadius: '8px', fontSize: '0.72rem', textTransform: 'none', py: 0.3 }}
                        >
                          Call
                        </Button>
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: T.textSecondary, fontWeight: 700 }}>Consumer Contact:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{issue.customerName}</Typography>
                      <Stack direction="row" spacing={1} mt={0.5}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Phone sx={{ fontSize: 14 }} />}
                          href={`tel:${issue.customerPhone}`}
                          sx={{ borderRadius: '8px', fontSize: '0.72rem', textTransform: 'none', py: 0.3 }}
                        >
                          Call
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Action Bar */}
                  {!isResolved ? (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleResolve(issue.id)}
                      startIcon={<CheckCircle />}
                      sx={{
                        bgcolor: T.primary,
                        fontWeight: 900,
                        borderRadius: '12px',
                        py: 1,
                        textTransform: 'none',
                        '&:hover': { bgcolor: T.primaryDark }
                      }}
                    >
                      Mark Issue Resolved
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled
                      startIcon={<CheckCircle sx={{ color: T.success }} />}
                      sx={{ borderRadius: '12px', color: T.success, borderColor: '#bbf7d0', py: 1, textTransform: 'none', fontWeight: 800 }}
                    >
                      Issue Resolved by Captain
                    </Button>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ open: false, msg: '' })}
        message={toast.msg}
      />
    </Box>
  );
}
