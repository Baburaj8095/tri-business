import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const isCaptain = !!localStorage.getItem('token_captain');
      const isBusiness = !!localStorage.getItem('token_business');

      if (isCaptain) {
        navigate('/captain/home', { replace: true });
      } else if (isBusiness) {
        navigate('/business-dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    const isBusiness = !!localStorage.getItem('token_business');
    if (isBusiness) {
      navigate('/business-dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <Box
      onClick={handleSkip}
      sx={{
        minHeight: '100dvh',
        width: '100%',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
        background: 'radial-gradient(circle at 50% 30%, #ecfdf5 0%, #ffffff 70%)',
      }}
    >
      {/* Top Subtle Status Bar Area */}
      <Box sx={{ pt: 3 }} />

      {/* Center Brand Identity (Matching Screen 1) */}
      <Container
        maxWidth="xs"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 2,
          mt: -4,
        }}
      >
        {/* Trikonekt Hexagon / Cart Logo Icon */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '28px',
            bgcolor: '#047857',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(4, 120, 87, 0.3)',
            mb: 2.5,
            position: 'relative',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.05)' },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 4,
              borderRadius: '24px',
              border: '2px dashed rgba(255,255,255,0.4)',
            }}
          />
          <ShoppingCartIcon sx={{ fontSize: 52, color: '#ffffff' }} />
        </Box>

        {/* Brand Name */}
        <Typography
          sx={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
            mb: 0.75,
          }}
        >
          Trikonekt
        </Typography>

        {/* Tagline */}
        <Typography
          sx={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#059669',
            letterSpacing: '0.3px',
          }}
        >
          Wholesale. Local. Faster.
        </Typography>
      </Container>

      {/* Bottom Illustration (Wholesale & Fresh Produce Theme matching Screen 1) */}
      <Box
        sx={{
          width: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          overflow: 'hidden',
          lineHeight: 0,
        }}
      >
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
          alt="Fresh Wholesale Produce"
          sx={{
            width: '100%',
            maxHeight: 280,
            objectFit: 'cover',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
          }}
        />
      </Box>
    </Box>
  );
}
