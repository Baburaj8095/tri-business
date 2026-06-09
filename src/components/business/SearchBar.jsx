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
  text: "#1f2937",
  textMuted: "#6b7280",
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
      bgcolor: '#1a1a1a', 
      pt: 1.5, 
      pb: 2.2, 
      px: 2, 
      borderBottomLeftRadius: 28, 
      borderBottomRightRadius: 28,
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <Stack spacing={2.1}>
        {/* Search Bar */}
        <Paper
          onClick={onClick}
          elevation={0}
          sx={{
            p: "3px 10px",
            display: "flex",
            alignItems: "center",
            borderRadius: 10,
            bgcolor: "rgba(255, 255, 255, 1)",
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            cursor: onClick ? "pointer" : "default",
          }}
        >
          <IconButton sx={{ p: "7px", color: UI.text }}>
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, fontWeight: 600, fontSize: 15, color: UI.text }}
            placeholder="Search for anything nearby..."
          />
          <IconButton sx={{ p: "7px", color: UI.text }}>
            <MicIcon />
          </IconButton>
        </Paper>

        {/* Top cities / default categories */}
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 0.5, px: 0.25, '&::-webkit-scrollbar': { display: 'none' } }}>
          {(hasTopCities ? topCities : DEFAULT_CATEGORIES).map((item) => (
            <Stack
              key={item.id}
              alignItems="center"
              spacing={0.75}
              onClick={() => {
                if (hasTopCities && onCitySelect) onCitySelect(item.name);
              }}
              sx={{ minWidth: 66, cursor: hasTopCities && onCitySelect ? "pointer" : "default" }}
            >
              <Avatar sx={{ 
                width: 50, 
                height: 50, 
                bgcolor: item.bg || '#f0fdf4', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              src={item.image}
              >
                {item.icon}
              </Avatar>
              <Typography sx={{ 
                fontSize: 10.5, 
                fontWeight: 800, 
                color: '#fff', 
                textAlign: 'center',
                lineHeight: 1.1,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
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
