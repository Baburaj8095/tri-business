import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  AdminPanelSettings as ShieldIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const T = {
  primary: '#1e3a8a', // Dark Navy
  primaryLight: '#3b82f6', // Bright Blue
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  error: '#ef4444',
  gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)'
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';

  useEffect(() => {
    // If admin is already logged in, redirect to dashboard
    if (localStorage.getItem('admin_token')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_username', data.username);
        localStorage.setItem('admin_email', data.email);
        localStorage.setItem('admin_role', data.role);
        localStorage.setItem('admin_modules', data.modules || 'all');
        navigate('/admin/dashboard');
      } else {
        const err = await res.json();
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: T.gradient,
        px: 2
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 5 }}>
            {/* Header Identity */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: '16px', 
                  bgcolor: 'rgba(30, 58, 138, 0.08)', 
                  color: T.primary, 
                  mb: 2,
                  boxShadow: '0 8px 16px rgba(30,58,138,0.06)' 
                }}
              >
                <ShieldIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: '900', color: T.primary, letterSpacing: 0.5 }}>
                Business Admin
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, fontWeight: 'medium' }}>
                Trikonekt Portal Administration
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Admin Username"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <TextField
                  label="Password"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: T.textSecondary, fontSize: '1.2rem' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.8,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 8px 20px rgba(30,58,138,0.25)',
                    '&:hover': {
                      boxShadow: '0 10px 24px rgba(30,58,138,0.35)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login to Dashboard'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
