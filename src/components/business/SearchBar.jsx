import React from "react";
import { Box, Paper, InputBase, IconButton, Stack, Typography, Avatar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GrassIcon from "@mui/icons-material/Grass";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const UI = {
  primary: "#228B22",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#0f172a",
  textMuted: "#64748b",
};

const DEFAULT_CATEGORIES = [
  { id: 1, label: "Local Market", icon: <StorefrontIcon sx={{ color: '#228B22' }} />, bg: '#f0fdf4' },
  { id: 2, label: "Farmers", icon: <GrassIcon sx={{ color: '#166534' }} />, bg: '#f0fdf4' },
  { id: 3, label: "Grocery", icon: <ShoppingBasketIcon sx={{ color: '#9a3412' }} />, bg: '#fff7ed' },
  { id: 4, label: "Restaurants", icon: <RestaurantIcon sx={{ color: '#991b1b' }} />, bg: '#fef2f2' },
  { id: 5, label: "More", icon: <MoreHorizIcon sx={{ color: '#374151' }} />, bg: '#f3f4f6' },
];

export default function SearchBar({ onClick, topCities = [], onCitySelect }) {
  const hasTopCities = topCities.length > 0;

  return (
    <Box sx={{ 
      bgcolor: '#ffffff', 
      pt: 2.5, 
      pb: 3, 
      px: 2, 
      borderBottomLeftRadius: 24, 
      borderBottomRightRadius: 24,
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
    }}>
      <Stack spacing={2.5}>
        {/* Search Bar Input */}
        <Paper
          onClick={onClick}
          elevation={0}
          sx={{
            p: "4px 12px",
            display: "flex",
            alignItems: "center",
            borderRadius: '16px',
            bgcolor: "#f8fafc",
            border: '1px solid #e2e8f0',
            cursor: onClick ? "pointer" : "default",
            transition: 'all 0.2s',
            "&:hover": {
              borderColor: '#cbd5e1',
              bgcolor: '#f1f5f9'
            }
          }}
        >
          <IconButton sx={{ p: "6px", color: UI.primary }}>
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, fontWeight: 500, fontSize: 15, color: UI.text }}
            placeholder="Search for anything nearby..."
            disabled
          />
          <IconButton sx={{ p: "6px", color: UI.textMuted }}>
            <MicIcon />
          </IconButton>
        </Paper>

        {/* Top cities / default categories */}
        <Stack 
          direction="row" 
          spacing={2.5} 
          sx={{ 
            overflowX: 'auto', 
            pb: 0.5, 
            px: 0.25, 
            '&::-webkit-scrollbar': { display: 'none' } 
          }}
        >
          {(hasTopCities ? topCities : DEFAULT_CATEGORIES).map((item) => (
            <Stack
              key={item.id}
              alignItems="center"
              spacing={1}
              onClick={() => {
                if (hasTopCities && onCitySelect) onCitySelect(item.name);
              }}
              sx={{ minWidth: 68, cursor: hasTopCities && onCitySelect ? "pointer" : "default" }}
            >
              <Avatar sx={{ 
                width: 52, 
                height: 52, 
                bgcolor: item.bg || '#f8fafc', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                border: '2px solid #e2e8f0',
                transition: 'all 0.2s',
                "&:hover": {
                  borderColor: UI.primary,
                  transform: 'scale(1.05)'
                }
              }}
              src={item.image}
              >
                {item.icon}
              </Avatar>
              <Typography sx={{ 
                fontSize: 11, 
                fontWeight: 700, 
                color: '#475569', 
                textAlign: 'center',
                lineHeight: 1.15
              }}>
                {item.name || item.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
