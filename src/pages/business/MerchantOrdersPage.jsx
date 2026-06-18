import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Button, Stack, CircularProgress, Alert, Container, Tabs, Tab, IconButton, Chip } from '@mui/material';
import { LuStore, LuPhone, LuDollarSign, LuCalendar, LuCheck, LuX, LuChevronLeft } from 'react-icons/lu';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

const PRIMARY = "#228B22";
const PRIMARY_DARK = "#1B4D3E";
const BG = "#f1f5f9";
const SURFACE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SECONDARY = "#475569";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#e2e8f0";

export default function MerchantOrdersPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const token = localStorage.getItem('token_business') || localStorage.getItem('token_captain');

  const fetchPendingPayments = () => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get(`${CAPTAIN_API_URL}/captain/offline-payments/merchant`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPayments(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token_business');
          localStorage.removeItem('token_captain');
          navigate('/login');
          return;
        }
        console.error('Failed to load merchant pending payments:', err);
        setError('Error loading pending customer payments.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPendingPayments();
  }, [navigate, token]);

  const handleAction = (id, action) => {
    setActioningId(id);
    setError('');
    setSuccess('');

    axios.post(
      `${CAPTAIN_API_URL}/captain/offline-payments/${id}/action`,
      { action: action },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
      .then(res => {
        setSuccess(res.data?.message || `Payment ${action.toLowerCase()}ed successfully.`);
        setActioningId(null);
        fetchPendingPayments();
      })
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token_business');
          localStorage.removeItem('token_captain');
          navigate('/login');
          return;
        }
        console.error(`Failed to ${action.toLowerCase()} payment:`, err);
        setError(err.response?.data?.message || `Failed to process payment ${action.toLowerCase()} request.`);
        setActioningId(null);
      });
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return dateStr;
    }
  };

  const pendingPayments = payments.filter(p => p.status?.toUpperCase() === 'PENDING');
  const historyPayments = payments.filter(p => p.status?.toUpperCase() !== 'PENDING');


  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: BG }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  const displayPayments = tabValue === 0 ? pendingPayments : historyPayments;

  return (
    <Box sx={{ bgcolor: BG, minHeight: '100vh', pb: 4 }}>
      {/* Header with Back Button */}
      <Box sx={{ bgcolor: SURFACE, py: 2, borderBottom: `1px solid ${BORDER}`, mb: 2 }}>
        <Container maxWidth="md">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              size="small"
              onClick={() => navigate('/business-dashboard')}
              sx={{
                bgcolor: '#f1f5f9',
                color: TEXT,
                '&:hover': { bgcolor: BORDER },
              }}
            >
              <LuChevronLeft size={20} />
            </IconButton>
            <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, color: TEXT }}>
              Customer Payments
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md">
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

        {/* TABS */}
        <Card sx={{ mb: 3, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none' }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, val) => setTabValue(val)}
            sx={{
              borderBottom: `1px solid ${BORDER}`,
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.95rem',
                color: TEXT_MUTED,
                textTransform: 'none',
                minWidth: 150,
              },
              '& .Mui-selected': {
                color: PRIMARY,
              },
              '& .MuiTabs-indicator': {
                bgcolor: PRIMARY,
                height: 3,
              }
            }}
          >
            <Tab label={`Pending (${pendingPayments.length})`} />
            <Tab label={`History`} />
          </Tabs>

          {displayPayments.length === 0 ? (
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: TEXT_MUTED, fontWeight: 600 }}>
                {tabValue === 0 ? 'No pending payments' : 'No payment history'}
              </Typography>
            </CardContent>
          ) : (
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={2}>
                {displayPayments.map((pm) => (
                  <Card key={pm.id} sx={{ borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: 'none', bgcolor: SURFACE }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box sx={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: '12px', 
                            bgcolor: `rgba(${parseInt(PRIMARY.slice(1), 16) >> 16}, ${(parseInt(PRIMARY.slice(1), 16) >> 8) & 0xff}, ${parseInt(PRIMARY.slice(1), 16) & 0xff}, 0.15)`, 
                            color: PRIMARY, 
                            display: 'grid', 
                            placeItems: 'center',
                            fontWeight: 900,
                            fontSize: '1.2rem'
                          }}>
                            {String(pm.consumerName || 'U')[0].toUpperCase()}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 800, color: TEXT, fontSize: '1rem' }}>
                              {pm.consumerName}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: TEXT_MUTED, mt: 0.5 }}>
                              <LuPhone size={12} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {pm.consumerPhone}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: PRIMARY }}>
                            ₹{pm.amount.toFixed(2)}
                          </Typography>
                          <Chip 
                            label={pm.status || 'PENDING'} 
                            size="small" 
                            color={pm.status === 'APPROVED' ? 'success' : pm.status === 'REJECTED' ? 'error' : 'default'}
                            sx={{ fontWeight: 700, mt: 0.5 }}
                          />
                        </Box>
                      </Stack>

                      <Stack spacing={1} sx={{ mb: 2.5, pl: 0, fontSize: '0.9rem', color: TEXT_MUTED }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: TEXT_MUTED }}>
                          <LuDollarSign size={14} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Order ID: {pm.refId}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: TEXT_MUTED }}>
                          <LuCalendar size={14} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {formatDate(pm.createdAt)}
                          </Typography>
                        </Stack>
                      </Stack>

                      {pm.status === 'PENDING' && (
                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="contained"
                            startIcon={<LuCheck />}
                            disabled={actioningId !== null}
                            onClick={() => handleAction(pm.id, 'ACCEPT')}
                            size="small"
                            sx={{
                              flex: 1,
                              bgcolor: PRIMARY,
                              textTransform: 'none',
                              fontWeight: 800,
                              borderRadius: '10px',
                              '&:hover': { bgcolor: PRIMARY_DARK }
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<LuX />}
                            disabled={actioningId !== null}
                            onClick={() => handleAction(pm.id, 'REJECT')}
                            size="small"
                            sx={{
                              flex: 1,
                              borderColor: '#ef4444',
                              color: '#ef4444',
                              textTransform: 'none',
                              fontWeight: 800,
                              borderRadius: '10px',
                              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' }
                            }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          )}
        </Card>
      </Container>
    </Box>
  );
}

