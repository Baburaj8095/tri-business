import React from 'react';
import { Box, Typography, Stack, IconButton, Card, CardContent } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const UI = {
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#1f2937",
  textMuted: "#6b7280",
  primary: "#228B22",
  secondary: "#1B4D3E",
  onPrimary: "#ffffff",
};

const GIFT_CARDS = [
  { id: 1, title: 'Summer Gift', balance: '₹500', color: '#228B22' },
  { id: 2, title: 'Birthday Special', balance: '₹1000', color: '#1B4D3E' },
  { id: 3, title: 'Corporate Perk', balance: '₹2000', color: '#2e7d32' },
];

export default function GiftCardCarousel() {
  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={800} color={UI.text}>Your Gift Cards</Typography>
        <Stack direction="row" spacing={1}>
          <IconButton size="small" sx={{ border: `1px solid ${UI.border}` }}><ChevronLeft /></IconButton>
          <IconButton size="small" sx={{ border: `1px solid ${UI.border}` }}><ChevronRight /></IconButton>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
        {GIFT_CARDS.map(card => (
          <Card key={card.id} sx={{ 
            minWidth: 260, 
            borderRadius: 4, 
            bgcolor: card.color, 
            color: '#fff',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>Gift Card</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mt: 1 }}>{card.balance}</Typography>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>{card.title}</Typography>
            </CardContent>
            <Box sx={{ 
              position: 'absolute', 
              right: -20, 
              bottom: -20, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              bgcolor: 'rgba(255,255,255,0.1)' 
            }} />
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
