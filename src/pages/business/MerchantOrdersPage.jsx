import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Button, Stack, CircularProgress, Alert } from '@mui/material';
import { LuStore, LuPhone, LuDollarSign, LuCalendar, LuCheck, LuX, LuChevronLeft } from 'react-icons/lu';

const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'http://localhost:8081/api';

export default function MerchantOrdersPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('access_token_business') || localStorage.getItem('captain_access_token');

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
          localStorage.removeItem('access_token_business');
          localStorage.removeItem('captain_access_token');
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
          localStorage.removeItem('access_token_business');
          localStorage.removeItem('captain_access_token');
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

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
        <CircularProgress sx={{ color: '#228B22' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/business-dashboard')}
          sx={{ minWidth: 40, width: 40, height: 40, borderRadius: '50%', p: 0, color: '#475569', borderColor: '#cbd5e1' }}
        >
          <LuChevronLeft size={20} />
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 850, color: '#0f172a' }}>
          Customer Payments
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

      {payments.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          No pending customer payment requests.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {payments.map((pm) => (
            <Card key={pm.id} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(34, 139, 34, 0.1)', color: '#228B22', display: 'grid', placeItems: 'center' }}>
                      <LuStore size={22} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                        {pm.consumerName}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: '#64748b', mt: 0.25 }}>
                        <LuPhone size={12} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {pm.consumerPhone}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#228B22' }}>
                    ₹{pm.amount.toFixed(2)}
                  </Typography>
                </Stack>

                <Stack spacing={1} sx={{ mb: 3, pl: 7 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                    <LuDollarSign size={14} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Ref: {pm.refId}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                    <LuCalendar size={14} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {formatDate(pm.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ pl: 7 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<LuCheck />}
                    disabled={actioningId !== null}
                    onClick={() => handleAction(pm.id, 'ACCEPT')}
                    sx={{
                      flex: 1,
                      py: 1,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 800,
                      bgcolor: '#228B22',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#1b6d1b', boxShadow: 'none' }
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LuX />}
                    disabled={actioningId !== null}
                    onClick={() => handleAction(pm.id, 'REJECT')}
                    sx={{
                      flex: 1,
                      py: 1,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 800,
                      boxShadow: 'none'
                    }}
                  >
                    Reject
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
