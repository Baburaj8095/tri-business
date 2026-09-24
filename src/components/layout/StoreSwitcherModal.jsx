import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  IconButton,
  InputAdornment,
  Radio,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Storefront as StoreIcon,
  Add as AddIcon,
  CheckCircle as SelectedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { T, primaryBtnSx, secondaryBtnSx } from '../../theme/tokens';

export default function StoreSwitcherModal({
  open,
  onClose,
  stores = [],
  activeShop,
  onSelectShop
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(() => activeShop?.id || stores[0]?.id || null);

  // Sync selectedId when activeShop changes
  React.useEffect(() => {
    if (activeShop?.id) setSelectedId(activeShop.id);
  }, [activeShop]);

  const filteredStores = stores.filter(store => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (store.shop_name && store.shop_name.toLowerCase().includes(q)) ||
      (store.city && store.city.toLowerCase().includes(q)) ||
      (store.address && store.address.toLowerCase().includes(q))
    );
  });

  const handleConfirmSwitch = () => {
    const chosen = stores.find(s => s.id === selectedId);
    if (chosen && onSelectShop) {
      onSelectShop(chosen);
    }
    onClose();
  };

  const contentBody = (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Search Input */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search stores by name, city or address..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: T.textMuted, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2.5,
          '& .MuiOutlinedInput-root': {
            borderRadius: T.radiusSm,
            bgcolor: T.surfaceAlt,
            '& fieldset': { borderColor: T.border },
            '&:hover fieldset': { borderColor: T.borderHover },
            '&.Mui-focused fieldset': { borderColor: T.primary },
          }
        }}
      />

      {/* Stores List */}
      <Stack spacing={1.5} sx={{ maxHeight: '360px', overflowY: 'auto', pr: 0.5 }}>
        {filteredStores.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: T.surfaceAlt, borderRadius: T.radiusMd }}>
            <Typography sx={{ color: T.textMuted, fontSize: '0.9rem', fontWeight: 600 }}>
              No store branches found
            </Typography>
          </Box>
        ) : (
          filteredStores.map((store) => {
            const isSelected = String(store.id) === String(selectedId);
            return (
              <Box
                key={store.id}
                onClick={() => setSelectedId(store.id)}
                sx={{
                  p: 1.75,
                  borderRadius: T.radiusMd,
                  border: isSelected ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                  bgcolor: isSelected ? T.primaryLight : T.surface,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.75,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: isSelected ? T.primary : T.borderHover,
                    bgcolor: isSelected ? T.primaryLight : T.surfaceAlt,
                  }
                }}
              >
                <Avatar
                  src={store.shop_image || ''}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: isSelected ? T.primary : T.surfaceAlt,
                    color: isSelected ? '#fff' : T.textSecondary,
                    borderRadius: T.radiusSm,
                  }}
                >
                  <StoreIcon sx={{ fontSize: 24 }} />
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: T.text }} noWrap>
                      {store.shop_name}
                    </Typography>
                    {store.service_mode && (
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: '4px', bgcolor: T.surfaceAlt, color: T.textSecondary }}>
                        {store.service_mode}
                      </Typography>
                    )}
                  </Stack>
                  <Typography sx={{ fontSize: '0.8rem', color: T.textSecondary, mt: 0.3 }} noWrap>
                    {store.address || store.city || 'Operating outlet'}
                  </Typography>
                </Box>

                <Radio
                  checked={isSelected}
                  onChange={() => setSelectedId(store.id)}
                  value={store.id}
                  sx={{
                    color: T.border,
                    '&.Mui-checked': { color: T.primary },
                    p: 0.5,
                  }}
                />
              </Box>
            );
          })
        )}
      </Stack>

      <Button
        fullWidth
        startIcon={<AddIcon />}
        onClick={() => {
          onClose();
          navigate('/business/shops');
        }}
        sx={{
          mt: 2.5,
          color: T.primary,
          fontWeight: 700,
          fontSize: '0.85rem',
          textTransform: 'none',
          py: 1,
          borderRadius: T.radiusSm,
          border: `1px dashed ${T.border}`,
          '&:hover': { bgcolor: T.primaryLight, borderColor: T.primary }
        }}
      >
        + Add New Store Branch
      </Button>
    </Box>
  );

  const actionsRow = (
    <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, borderTop: `1px solid ${T.border}` }}>
      <Button onClick={onClose} sx={secondaryBtnSx}>
        Cancel
      </Button>
      <Button onClick={handleConfirmSwitch} variant="contained" sx={primaryBtnSx}>
        Switch Store
      </Button>
    </DialogActions>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderTopLeftRadius: T.radiusXl,
            borderTopRightRadius: T.radiusXl,
            maxHeight: '85vh',
            bgcolor: T.surface,
          }
        }}
      >
        <Box sx={{ width: 40, height: 4, bgcolor: T.border, borderRadius: 2, mx: 'auto', mt: 1.5, mb: 1 }} />
        <Box sx={{ px: 2.5, pt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: T.text, fontSize: '1.1rem' }}>
              Switch Operating Store
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: T.textMuted }}>
              Select which branch location you are operating from
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {contentBody}
        {actionsRow}
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: T.radiusLg,
          boxShadow: T.shadowModal,
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, pt: 2.5, px: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: T.text, fontSize: '1.15rem' }}>
            Switch Operating Store
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: T.textSecondary, fontWeight: 500 }}>
            Select which store location/branch profile you are operating from.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: T.textMuted }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      {contentBody}
      {actionsRow}
    </Dialog>
  );
}
