import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Stack,
  Chip,
  InputAdornment,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add,
  Search,
  ShoppingCart,
  Inventory,
  DeleteOutline,
  EditOutlined,
  CloudUploadOutlined,
  ArrowBack
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const UI = {
  primary: '#228B22',
  secondary: '#1B4D3E',
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
};

const ProductAddition = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const businessCategory = location.state?.category || 'General';
  
  const [products, setProducts] = useState([
    { id: 1, name: 'Example Product', price: '999', stock: '50', category: businessCategory },
  ]);

  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: businessCategory });

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      setProducts([...products, { ...newProduct, id: Date.now() }]);
      setNewProduct({ name: '', price: '', stock: '', category: businessCategory });
      setOpen(false);
    }
  };

  const removeProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <Box sx={{ bgcolor: UI.bg, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Button 
              startIcon={<ArrowBack />} 
              onClick={() => navigate('/')}
              sx={{ color: UI.textMuted, mb: 1, textTransform: 'none' }}
            >
              Back to Registration
            </Button>
            <Typography variant="h4" fontWeight={900} color={UI.text}>
              Product Management
            </Typography>
            <Typography sx={{ color: UI.textMuted }}>
              Manage inventory for your <Chip label={businessCategory} size="small" sx={{ fontWeight: 800, bgcolor: '#dbeafe', color: '#1e40af' }} /> business
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 800,
              bgcolor: UI.primary,
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
              '&:hover': { bgcolor: '#1d4ed8' }
            }}
          >
            Add New Product
          </Button>
        </Stack>

        {/* SEARCH BAR */}
        <Box mb={4}>
          <TextField
            fullWidth
            placeholder="Search products by name or SKU..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: UI.textMuted }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 4, bgcolor: UI.surface, border: `1px solid ${UI.border}` }
            }}
          />
        </Box>

        {/* PRODUCT LIST */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <Card sx={{ borderRadius: 5, border: `1px solid ${UI.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: 140, 
                          bgcolor: '#f1f5f9', 
                          borderRadius: 3, 
                          mb: 2,
                          display: 'grid',
                          placeItems: 'center',
                          color: UI.textMuted
                        }}
                      >
                        <CloudUploadOutlined sx={{ fontSize: 40, opacity: 0.5 }} />
                      </Box>
                      <Typography variant="h6" fontWeight={800} color={UI.text} noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: UI.textMuted, mb: 2 }}>
                        Stock: {product.stock} units
                      </Typography>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={900} color={UI.primary}>
                          ₹{product.price}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" sx={{ color: UI.textMuted, bgcolor: '#f8fafc' }}>
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => removeProduct(product.id)} sx={{ color: '#ef4444', bgcolor: '#fef2f2' }}>
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {/* EMPTY STATE */}
        {products.length === 0 && (
          <Box textAlign="center" py={10}>
            <Inventory sx={{ fontSize: 80, color: '#e2e8f0', mb: 2 }} />
            <Typography variant="h6" fontWeight={800} color={UI.text}>No products added yet</Typography>
            <Typography sx={{ color: UI.textMuted }}>Start building your inventory for {businessCategory}</Typography>
          </Box>
        )}
      </Container>

      {/* ADD DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 5, p: 2, maxWidth: 450 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Add New Product</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              sx={inputStyles}
            />
            <TextField
              fullWidth
              label="Price (₹)"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              sx={inputStyles}
            />
            <TextField
              fullWidth
              label="Stock Quantity"
              type="number"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              sx={inputStyles}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: 800, textTransform: 'none', color: UI.textMuted }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddProduct}
            sx={{ borderRadius: 2, px: 4, fontWeight: 800, textTransform: 'none', bgcolor: UI.primary }}
          >
            Save Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
  }
};

export default ProductAddition;
