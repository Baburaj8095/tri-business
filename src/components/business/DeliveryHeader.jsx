import React from "react";
import { Box, Stack, IconButton, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const UI = {
  primary: "#93c193",
  secondary: "#93c193",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#1f2937",
};

export default function DeliveryHeader({ title, onBack }) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1300,
        bgcolor: UI.surface,
        borderBottom: `1px solid ${UI.border}`,
        boxShadow: "0 8px 24px rgba(34,139,34,0.08)",
      }}
    >
      <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 1.25, sm: 2 }, py: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={onBack} sx={{ color: UI.text }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={800} color={UI.text}>
            {title}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
