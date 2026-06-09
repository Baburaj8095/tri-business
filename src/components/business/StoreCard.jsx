import React from "react";
import { Box, Typography, Stack, alpha } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";

const UI = {
  primary: "#228B22",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#1f2937",
  textMuted: "#6b7280",
  success: "#1B4D3E",
};

export default function StoreCard({ store, onClick }) {
  if (!store) return null;

  return (
    <Box
      onClick={onClick}
      sx={{
        px: 2,
        py: 1,
        cursor: "pointer",
        "&:active": { opacity: 0.7 },
      }}
    >
      <Box
        sx={{
          borderRadius: 2.5,
          bgcolor: UI.surface,
          border: `1px solid ${UI.border}`,
          boxShadow: "0 8px 22px rgba(34,139,34,0.07)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 140,
            bgcolor: "#f1f5f9",
            backgroundImage: `url(${store.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Box sx={{ p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color={UI.text} noWrap>
                {store.name || "Unnamed Store"}
              </Typography>
              <Typography variant="caption" color={UI.textMuted} sx={{ fontWeight: 600 }}>
                {store.category || "General"} • {store.distance || "0.5 km"}
              </Typography>
            </Box>
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                bgcolor: alpha(UI.primary, 0.1),
                px: 1,
                py: 0.25,
                borderRadius: 1.5,
              }}
            >
              <StarRoundedIcon sx={{ color: UI.primary, fontSize: 16, mr: 0.25 }} />
              <Typography variant="caption" fontWeight={800} color={UI.primary}>
                {store.rating || "4.5"}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
