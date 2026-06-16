import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Switch,
  TextField,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  FormGroup,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline
} from '@mui/material';
import {
  AdminPanelSettings as ShieldIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  PendingActions as PendingIcon,
  Cancel as RejectedIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExitToApp as LogoutIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
  SupervisorAccount as AdminSettingsIcon,
  Storefront as StoreIcon
} from '@mui/icons-material';

const T = {
  primary: '#1e3a8a', // Dark Navy
  primaryLight: '#3b82f6',
  bg: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  headerGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState({ totalCaptains: 0, activeCaptains: 0, pendingKyc: 0, registeredThisMonth: 0, totalB2B: 0, totalB2C: 0 });
  const [captains, setCaptains] = useState([]);
  const [totalCaptains, setTotalCaptains] = useState(0);
  const [merchants, setMerchants] = useState([]);
  const [totalMerchants, setTotalMerchants] = useState(0);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [loading, setLoading] = useState(true);

  // Sub-Admins list
  const [subAdmins, setSubAdmins] = useState([]);
  const [subAdminModalOpen, setSubAdminModalOpen] = useState(false);
  const [editingSubAdmin, setEditingSubAdmin] = useState(null);
  const [subAdminForm, setSubAdminForm] = useState({ username: '', password: '', email: '', modules: { captains: false, kyc: false, sub_admins: false } });

  // Detail Modal
  const [selectedCaptain, setSelectedCaptain] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionPrompt, setShowRejectionPrompt] = useState(false);

  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    setPage(1);
    setSearch('');
    setKycFilter('');
    setActiveFilter('');
    setMobileOpen(false);
  };

  const API_URL = process.env.REACT_APP_CAPTAIN_API_URL || window.REACT_APP_CAPTAIN_API_URL || 'http://localhost:8081/api';
  const role = localStorage.getItem('admin_role') || 'SUB_ADMIN';
  const myModules = localStorage.getItem('admin_modules') || 'all';

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchData();
    }
  }, [navigate, search, kycFilter, activeFilter, page, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      // 1. Fetch Stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch Captains List
      if (activeTab === 1) {
        let queryParams = `?page=${page}&size=${size}`;
        if (search.trim()) queryParams += `&search=${encodeURIComponent(search)}`;
        if (kycFilter) queryParams += `&kycStatus=${kycFilter}`;
        if (activeFilter !== '') queryParams += `&isActive=${activeFilter}`;

        const capRes = await fetch(`${API_URL}/admin/captains${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (capRes.ok) {
          const capData = await capRes.json();
          setCaptains(capData.captains || []);
          setTotalCaptains(capData.total || 0);
        }
      }

      // 3. Fetch Merchants List (B2B = tab 2, B2C = tab 3)
      if (activeTab === 2 || activeTab === 3) {
        const cat = activeTab === 2 ? 'merchant' : 'business';
        let mercQueryParams = `?category=${cat}&page=${page}&size=${size}`;
        if (search.trim()) mercQueryParams += `&search=${encodeURIComponent(search)}`;

        const mercRes = await fetch(`${API_URL}/admin/merchants${mercQueryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (mercRes.ok) {
          const mercData = await mercRes.json();
          setMerchants(mercData.merchants || []);
          setTotalMerchants(mercData.total || 0);
        }
      }

      // 4. Fetch Sub Admins if SUPER_ADMIN
      if (role === 'SUPER_ADMIN' && activeTab === 4) {
        const subRes = await fetch(`${API_URL}/admin/sub-admins`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubAdmins(subData || []);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const handleMerchantStatusToggle = async (userId, currentStatus) => {
    if (!checkModulePermission('captains')) return;
    const token = localStorage.getItem('admin_token');
    const newStatus = !currentStatus;

    try {
      const res = await fetch(`${API_URL}/admin/merchants/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: newStatus })
      });

      if (res.ok) {
        setToast({ open: true, type: 'success', message: 'Account status updated successfully.' });
        fetchData();
      } else {
        throw new Error('Update failed');
      }
    } catch (e) {
      setMerchants(prev => prev.map(m => m.id === userId ? { ...m, is_active: newStatus } : m));
      setToast({ open: true, type: 'success', message: '[Mock] Account status toggled.' });
    }
  };

  const generateMockData = () => {
    setStats({ totalCaptains: 4, activeCaptains: 2, pendingKyc: 2, registeredThisMonth: 4, totalB2B: 3, totalB2C: 2 });
    setCaptains([
      { id: 1, username: 'CB9876543210', full_name: 'Baburaj Balaji', phone: '9876543210', pincode: '600001', sponsor_id: 'TRPN8095809500', is_active: true, date_joined: new Date().toISOString(), kyc_status: 'APPROVED' },
      { id: 2, username: 'CB9876543211', full_name: 'Anish Kumar', phone: '9876543211', pincode: '600002', sponsor_id: 'CB9876543210', is_active: false, date_joined: new Date().toISOString(), kyc_status: 'PENDING' },
      { id: 3, username: 'CB9876543212', full_name: 'Rahul Nair', phone: '9876543212', pincode: '600003', sponsor_id: 'TRPN8095809500', is_active: false, date_joined: new Date().toISOString(), kyc_status: 'REJECTED' },
      { id: 4, username: 'CB9876543213', full_name: 'Suresh Raina', phone: '9876543213', pincode: '600004', sponsor_id: 'CB9876543210', is_active: true, date_joined: new Date().toISOString(), kyc_status: 'PENDING' }
    ]);
    setTotalCaptains(4);

    setMerchants([
      { id: 101, username: 'NSB2B9876543210', full_name: 'Baburaj Balaji B2B', phone: '9876543210', pincode: '600001', shop_name: 'Baburaj Wholesale Store', address: '456 Market Lane', city: 'Chennai', is_active: true, discount_percent: 10.0, date_joined: new Date().toISOString() },
      { id: 102, username: 'NSB2C9876543210', full_name: 'Baburaj Balaji B2C', phone: '9876543210', pincode: '600001', shop_name: 'Baburaj Retail Shop', address: '123 Retail Road', city: 'Chennai', is_active: true, discount_percent: 5.0, date_joined: new Date().toISOString() }
    ]);
    setTotalMerchants(2);

    if (role === 'SUPER_ADMIN') {
      setSubAdmins([
        { id: 1, username: 'subadmin1', email: 'sub1@trikonekt.com', role: 'SUB_ADMIN', modules: 'captains,kyc' }
      ]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_modules');
    navigate('/admin/login');
  };

  const handleCaptainClick = async (captainUsername) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_URL}/admin/captains/${captainUsername}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCaptain(data);
        setDetailModalOpen(true);
      }
    } catch (e) {
      // Find locally for mock fallback
      const found = captains.find(c => c.username === captainUsername);
      if (found) {
        setSelectedCaptain({
          id: found.id,
          username: found.username,
          fullName: found.full_name,
          phone: found.phone,
          pincode: found.pincode,
          active: found.is_active,
          kycStatus: found.kyc_status,
          email: 'captain@demo.com',
          dob: '1995-05-15',
          gender: 'Male',
          addressLine1: '123 Tech Park Drive',
          addressLine2: 'Phase 2, Block C',
          city: 'Chennai',
          stateName: 'Tamil Nadu',
          aadhaarNumber: '1234 5678 9012',
          panNumber: 'ABCDE1234F',
          aadhaarFrontUrl: 'https://res.cloudinary.com/demo-cloud/image/upload/v1612345678/mock_front.png',
          aadhaarBackUrl: 'https://res.cloudinary.com/demo-cloud/image/upload/v1612345678/mock_back.png',
          panCardUrl: 'https://res.cloudinary.com/demo-cloud/image/upload/v1612345678/mock_pan.png',
          selfieUrl: 'https://res.cloudinary.com/demo-cloud/image/upload/v1612345678/mock_selfie.png',
          nomineeName: 'Priya Balaji',
          nomineeRelationship: 'Spouse',
          nomineePhone: '9876543299',
          nomineeAadhaar: '9876 5432 1098',
          nomineeDob: '1997-09-20',
          bankHolderName: 'Baburaj Balaji',
          bankName: 'HDFC Bank',
          bankAccountNumber: '501002345678',
          bankIfsc: 'HDFC0000123',
          bankAccountType: 'Savings',
          joinedAt: found.date_joined
        });
        setDetailModalOpen(true);
      }
    }
  };

  const handleStatusToggle = async (captainId, currentStatus) => {
    if (!checkModulePermission('captains')) return;
    const token = localStorage.getItem('admin_token');
    const newStatus = !currentStatus;

    try {
      const res = await fetch(`${API_URL}/admin/captains/${captainId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: newStatus })
      });

      if (res.ok) {
        setToast({ open: true, type: 'success', message: 'Account status updated successfully.' });
        fetchData();
        if (selectedCaptain && selectedCaptain.id === captainId) {
          setSelectedCaptain(prev => ({ ...prev, active: newStatus }));
        }
      } else {
        throw new Error('Update failed');
      }
    } catch (e) {
      // Offline fallback
      setCaptains(prev => prev.map(c => c.id === captainId ? { ...c, is_active: newStatus } : c));
      setToast({ open: true, type: 'success', message: '[Mock] Account status toggled.' });
    }
  };

  const handleKycAction = async (status) => {
    if (!checkModulePermission('kyc')) return;
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      setShowRejectionPrompt(true);
      return;
    }

    const token = localStorage.getItem('admin_token');
    const captainId = selectedCaptain.id;

    try {
      const res = await fetch(`${API_URL}/admin/captains/${captainId}/kyc`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, reason: rejectionReason })
      });

      if (res.ok) {
        setToast({ open: true, type: 'success', message: `KYC marked as ${status} successfully.` });
        setDetailModalOpen(false);
        setShowRejectionPrompt(false);
        setRejectionReason('');
        fetchData();
      } else {
        throw new Error('KYC review failed');
      }
    } catch (e) {
      // Offline fallback
      setCaptains(prev => prev.map(c => c.id === captainId ? { ...c, kyc_status: status } : c));
      setToast({ open: true, type: 'success', message: `[Mock] KYC marked as ${status}.` });
      setDetailModalOpen(false);
      setShowRejectionPrompt(false);
      setRejectionReason('');
    }
  };

  // Sub-Admins CRUD handlers
  const handleOpenSubAdminModal = (subAdmin = null) => {
    if (subAdmin) {
      setEditingSubAdmin(subAdmin);
      const activeMods = subAdmin.modules ? subAdmin.modules.split(',') : [];
      setSubAdminForm({
        username: subAdmin.username,
        password: '',
        email: subAdmin.email,
        modules: {
          captains: activeMods.includes('captains'),
          kyc: activeMods.includes('kyc'),
          sub_admins: activeMods.includes('sub_admins')
        }
      });
    } else {
      setEditingSubAdmin(null);
      setSubAdminForm({ username: '', password: '', email: '', modules: { captains: false, kyc: false, sub_admins: false } });
    }
    setSubAdminModalOpen(true);
  };

  const handleSaveSubAdmin = async () => {
    const token = localStorage.getItem('admin_token');
    
    // Build comma-separated modules list
    const activeMods = Object.keys(subAdminForm.modules).filter(k => subAdminForm.modules[k]).join(',');

    try {
      if (editingSubAdmin) {
        // Edit Sub-Admin
        const res = await fetch(`${API_URL}/admin/sub-admins/${editingSubAdmin.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ email: subAdminForm.email, modules: activeMods })
        });
        if (res.ok) {
          setToast({ open: true, type: 'success', message: 'Sub-Admin updated successfully.' });
          setSubAdminModalOpen(false);
          fetchData();
        } else {
          const err = await res.json();
          setToast({ open: true, type: 'error', message: err.message || 'Failed to update sub-admin.' });
        }
      } else {
        // Create Sub-Admin
        const res = await fetch(`${API_URL}/admin/sub-admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            username: subAdminForm.username,
            password: subAdminForm.password,
            email: subAdminForm.email,
            modules: activeMods
          })
        });
        if (res.ok) {
          setToast({ open: true, type: 'success', message: 'Sub-Admin created successfully.' });
          setSubAdminModalOpen(false);
          fetchData();
        } else {
          const err = await res.json();
          setToast({ open: true, type: 'error', message: err.message || 'Failed to create sub-admin.' });
        }
      }
    } catch (e) {
      setToast({ open: true, type: 'error', message: 'Error communicating with server.' });
    }
  };

  const handleDeleteSubAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sub-admin?")) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_URL}/admin/sub-admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ open: true, type: 'success', message: 'Sub-Admin deleted successfully.' });
        fetchData();
      }
    } catch (e) {
      setToast({ open: true, type: 'error', message: 'Error deleting sub-admin.' });
    }
  };

  const checkModulePermission = (mod) => {
    if (role === 'SUPER_ADMIN') return true;
    if (myModules.includes('all') || myModules.includes(mod)) return true;
    setToast({ open: true, type: 'error', message: `Access denied. You do not have permissions for the '${mod}' module.` });
    return false;
  };

  const getKycChipColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return T.success;
      case 'REJECTED': return T.danger;
      default: return T.warning;
    }
  };

  const drawerWidth = 260;

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0f172a', color: '#94a3b8' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#1e293b' }}>
        <ShieldIcon sx={{ color: T.primaryLight, fontSize: 24 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: '900', color: 'white', letterSpacing: 0.5 }}>
          TRIKONEKT ADMIN
        </Typography>
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={activeTab === 0}
            onClick={() => handleTabChange(0)}
            sx={{
              borderRadius: '8px',
              color: activeTab === 0 ? 'white' : '#94a3b8',
              bgcolor: activeTab === 0 ? 'rgba(59,130,246,0.15) !important' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              '& .MuiListItemIcon-root': { color: activeTab === 0 ? 'white' : '#64748b' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Overview" primaryTypographyProps={{ fontWeight: activeTab === 0 ? '800' : '500', fontSize: '0.85rem' }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={activeTab === 1}
            onClick={() => handleTabChange(1)}
            sx={{
              borderRadius: '8px',
              color: activeTab === 1 ? 'white' : '#94a3b8',
              bgcolor: activeTab === 1 ? 'rgba(59,130,246,0.15) !important' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              '& .MuiListItemIcon-root': { color: activeTab === 1 ? 'white' : '#64748b' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Captains List" primaryTypographyProps={{ fontWeight: activeTab === 1 ? '800' : '500', fontSize: '0.85rem' }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={activeTab === 2}
            onClick={() => handleTabChange(2)}
            sx={{
              borderRadius: '8px',
              color: activeTab === 2 ? 'white' : '#94a3b8',
              bgcolor: activeTab === 2 ? 'rgba(59,130,246,0.15) !important' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              '& .MuiListItemIcon-root': { color: activeTab === 2 ? 'white' : '#64748b' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}><StoreIcon /></ListItemIcon>
            <ListItemText primary="B2B Merchants" primaryTypographyProps={{ fontWeight: activeTab === 2 ? '800' : '500', fontSize: '0.85rem' }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={activeTab === 3}
            onClick={() => handleTabChange(3)}
            sx={{
              borderRadius: '8px',
              color: activeTab === 3 ? 'white' : '#94a3b8',
              bgcolor: activeTab === 3 ? 'rgba(59,130,246,0.15) !important' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              '& .MuiListItemIcon-root': { color: activeTab === 3 ? 'white' : '#64748b' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}><StoreIcon /></ListItemIcon>
            <ListItemText primary="B2C Merchants" primaryTypographyProps={{ fontWeight: activeTab === 3 ? '800' : '500', fontSize: '0.85rem' }} />
          </ListItemButton>
        </ListItem>

        {role === 'SUPER_ADMIN' && (
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeTab === 4}
              onClick={() => handleTabChange(4)}
              sx={{
                borderRadius: '8px',
                color: activeTab === 4 ? 'white' : '#94a3b8',
                bgcolor: activeTab === 4 ? 'rgba(59,130,246,0.15) !important' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                '& .MuiListItemIcon-root': { color: activeTab === 4 ? 'white' : '#64748b' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><AdminSettingsIcon /></ListItemIcon>
              <ListItemText primary="Sub-Admins Setup" primaryTypographyProps={{ fontWeight: activeTab === 4 ? '800' : '500', fontSize: '0.85rem' }} />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* Admin User Footer info */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#1e293b' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: T.primaryLight, width: 32, height: 32, fontWeight: 'bold', fontSize: '0.8rem', color: 'white' }}>
            {localStorage.getItem('admin_username')?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {localStorage.getItem('admin_username')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.7rem', textTransform: 'capitalize' }}>
              {role.toLowerCase().replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontWeight: 'bold',
            fontSize: '0.75rem',
            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)', borderColor: '#ef4444' }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: T.bg, width: '100vw', overflowX: 'hidden' }}>
      <CssBaseline />
      {/* Sidebar - Drawer for mobile viewports */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Sidebar - Fixed for desktop viewports */}
      <Box
        component="nav"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' }
        }}
      >
        <Box sx={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: drawerWidth }}>
          {sidebarContent}
        </Box>
      </Box>

      {/* Right Content Panel */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          overflowX: 'hidden'
        }}
      >
        {/* Top Clean Header */}
        <Box
          sx={{
            bgcolor: 'white',
            borderBottom: `1px solid ${T.border}`,
            px: { xs: 2.5, md: 4 },
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 64,
            boxSizing: 'border-box'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: T.text }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: '800', color: T.text, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
              {activeTab === 0 ? 'Dashboard Overview' : activeTab === 1 ? 'Captain Registrations' : activeTab === 2 ? 'B2B Merchants' : activeTab === 3 ? 'B2C Merchants' : 'Sub-Admin User Management'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={fetchData} size="small" sx={{ border: `1px solid ${T.border}`, p: 0.8 }}>
              <RefreshIcon sx={{ fontSize: 18, color: T.textSecondary }} />
            </IconButton>
            <Chip
              avatar={
                <Avatar sx={{ bgcolor: T.primary, color: 'white !important', fontWeight: 'bold' }}>
                  {localStorage.getItem('admin_username')?.charAt(0).toUpperCase()}
                </Avatar>
              }
              label={localStorage.getItem('admin_username')}
              variant="outlined"
              sx={{ fontWeight: 'semibold', borderColor: T.border, display: { xs: 'none', sm: 'inline-flex' } }}
            />
          </Box>
        </Box>

        {/* Content Body */}
        <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* VIEW 0: Dashboard Overview */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Dashboard Stats Row */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md={2}>
                  <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, height: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                      <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(30, 58, 138, 0.06)', color: T.primary, display: 'flex' }}>
                        <PeopleIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, display: 'block', fontSize: '0.65rem', lineHeight: 1.2 }}>
                          Total Captains
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: '900', mt: 0.2 }}>
                          {stats.totalCaptains}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, height: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                      <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.06)', color: T.success, display: 'flex' }}>
                        <ActiveIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, display: 'block', fontSize: '0.65rem', lineHeight: 1.2 }}>
                          Active Captains
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: '900', mt: 0.2 }}>
                          {stats.activeCaptains}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, height: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                      <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(245, 158, 11, 0.06)', color: T.warning, display: 'flex' }}>
                        <PendingIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, display: 'block', fontSize: '0.65rem', lineHeight: 1.2 }}>
                          Pending KYC
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: '900', mt: 0.2 }}>
                          {stats.pendingKyc}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, height: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                      <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(59, 130, 246, 0.06)', color: T.primaryLight, display: 'flex' }}>
                        <PeopleIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, display: 'block', fontSize: '0.65rem', lineHeight: 1.2 }}>
                          Registered Month
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: '900', mt: 0.2 }}>
                          {stats.registeredThisMonth}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, height: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                      <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(13, 148, 136, 0.06)', color: '#0d9488', display: 'flex' }}>
                        <StoreIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, display: 'block', fontSize: '0.65rem', lineHeight: 1.2 }}>
                          B2B Merchants
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: '900', mt: 0.2 }}>
                          {stats.totalB2B || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, height: '100%' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                      <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: 'rgba(6, 182, 212, 0.06)', color: '#06b6d4', display: 'flex' }}>
                        <StoreIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, display: 'block', fontSize: '0.65rem', lineHeight: 1.2 }}>
                          B2C Merchants
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: '900', mt: 0.2 }}>
                          {stats.totalB2C || 0}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Extra visual summary widgets */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, p: 3, bgcolor: '#ffffff' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: '800', color: T.text, mb: 2 }}>
                      KYC Verification Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary">Approved Captains</Typography>
                        <Chip label={`${stats.activeCaptains} Verified`} color="success" size="small" sx={{ fontWeight: 'bold' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary">Pending Review</Typography>
                        <Chip label={`${stats.pendingKyc} Awaiting`} color="warning" size="small" sx={{ fontWeight: 'bold' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary">Rejected Submissions</Typography>
                        <Chip label="Requires Re-upload" color="error" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, p: 3, bgcolor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: '800', color: T.text, mb: 1.5 }}>
                      System Administration Notice
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1.5 }}>
                      You are logged in as a <b>{role}</b>. Ensure you review all Aadhaar and PAN documents closely before marking KYC as Approved. Sub-admins are restricted to the modules assigned to them by a Super Admin.
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* VIEW 1: Captain Registrations */}
          {activeTab === 1 && (
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Filters Row */}
              <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    placeholder="Search by ID, name or phone..."
                    fullWidth
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon sx={{ color: T.textSecondary, mr: 1 }} /> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={3}>
                  <TextField
                    select
                    label="KYC Status"
                    fullWidth
                    size="small"
                    value={kycFilter}
                    onChange={(e) => setKycFilter(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="PENDING">Pending Review</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={3} md={3}>
                  <TextField
                    select
                    label="Account Status"
                    fullWidth
                    size="small"
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  >
                    <MenuItem value="">All Accounts</MenuItem>
                    <MenuItem value="true">Active Only</MenuItem>
                    <MenuItem value="false">Inactive Only</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {loading ? (
                <Box sx={{ display: 'flex', py: 5, justifyContent: 'center' }}><CircularProgress /></Box>
              ) : (
                <>
                  {/* Mobile View Card List */}
                  <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                    {captains.length === 0 ? (
                      <Typography variant="body2" sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                        No Captain registrations found.
                      </Typography>
                    ) : (
                      captains.map((cap) => (
                        <Card
                          key={cap.id}
                          sx={{
                            borderRadius: '16px',
                            border: `1px solid ${T.border}`,
                            boxShadow: 'none',
                            bgcolor: '#ffffff',
                            p: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: '800', color: T.text }}>
                                {cap.username}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Registered: {new Date(cap.date_joined).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Chip
                              label={cap.kyc_status}
                              size="small"
                              sx={{
                                bgcolor: getKycChipColor(cap.kyc_status) + '15',
                                color: getKycChipColor(cap.kyc_status),
                                fontWeight: 'bold',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>

                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary" display="block">Full Name</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'semibold', color: T.text, fontSize: '0.85rem' }}>{cap.full_name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary" display="block">Phone Number</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'semibold', color: T.text, fontSize: '0.85rem' }}>{cap.phone}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary" display="block">Pincode</Typography>
                              <Typography variant="body2" sx={{ color: T.text, fontSize: '0.85rem' }}>{cap.pincode}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary" display="block">Sponsor ID</Typography>
                              <Typography variant="body2" sx={{ color: T.text, fontSize: '0.85rem' }}>{cap.sponsor_id}</Typography>
                            </Grid>
                          </Grid>

                          <Divider sx={{ mb: 1.5 }} />

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="textSecondary">Active</Typography>
                              <Switch
                                checked={cap.is_active}
                                onChange={() => handleStatusToggle(cap.id, cap.is_active)}
                                color="primary"
                                size="small"
                              />
                            </Box>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleCaptainClick(cap.username)}
                              startIcon={<ViewIcon />}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                borderColor: T.primary,
                                color: T.primary
                              }}
                            >
                              View Profile
                            </Button>
                          </Box>
                        </Card>
                      ))
                    )}
                  </Box>

                  {/* Desktop View Table */}
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <TableContainer component={Box}>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Captain ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phone Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Pincode</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Sponsor ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Registered On</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>KYC Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Account Active</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {captains.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={9} align="center">No Captain registrations found.</TableCell>
                            </TableRow>
                          ) : (
                            captains.map((cap) => (
                              <TableRow key={cap.id} hover>
                                <TableCell sx={{ fontWeight: 'semibold' }}>{cap.username}</TableCell>
                                <TableCell>{cap.full_name}</TableCell>
                                <TableCell>{cap.phone}</TableCell>
                                <TableCell>{cap.pincode}</TableCell>
                                <TableCell>{cap.sponsor_id}</TableCell>
                                <TableCell>{new Date(cap.date_joined).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={cap.kyc_status}
                                    size="small"
                                    sx={{
                                      bgcolor: getKycChipColor(cap.kyc_status) + '15',
                                      color: getKycChipColor(cap.kyc_status),
                                      fontWeight: 'bold'
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Switch
                                    checked={cap.is_active}
                                    onChange={() => handleStatusToggle(cap.id, cap.is_active)}
                                    color="primary"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="View Profile & Documents">
                                    <IconButton onClick={() => handleCaptainClick(cap.username)} color="primary">
                                      <ViewIcon />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </>
              )}
            </Paper>
          )}

          {/* VIEW 2 & 3: B2B/B2C Merchants */}
          {(activeTab === 2 || activeTab === 3) && (
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Filters Row */}
              <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    placeholder={`Search ${activeTab === 2 ? 'B2B' : 'B2C'} by name, shop, or phone...`}
                    fullWidth
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon sx={{ color: T.textSecondary, mr: 1 }} /> }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  />
                </Grid>
              </Grid>

              {loading ? (
                <Box sx={{ display: 'flex', py: 5, justifyContent: 'center' }}><CircularProgress /></Box>
              ) : (
                <>
                  {/* Mobile View Card List */}
                  <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                    {merchants.length === 0 ? (
                      <Typography variant="body2" sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                        No merchants found.
                      </Typography>
                    ) : (
                      merchants.map((m) => (
                        <Card
                          key={m.id}
                          sx={{
                            borderRadius: '16px',
                            border: `1px solid ${T.border}`,
                            boxShadow: 'none',
                            bgcolor: '#ffffff',
                            p: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: '800', color: T.text }}>
                                {m.shop_name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Registered: {new Date(m.date_joined).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="textSecondary">Active</Typography>
                              <Switch
                                checked={m.is_active}
                                onChange={() => handleMerchantStatusToggle(m.id, m.is_active)}
                                color="primary"
                                size="small"
                              />
                            </Box>
                          </Box>

                          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary" display="block">Owner ID</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'semibold', color: T.text, fontSize: '0.85rem' }}>{m.username}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary" display="block">Owner Name</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'semibold', color: T.text, fontSize: '0.85rem' }}>{m.full_name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary" display="block">Phone Number</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'semibold', color: T.text, fontSize: '0.85rem' }}>{m.phone}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="textSecondary" display="block">Discount (%)</Typography>
                              <Chip
                                label={`${m.discount_percent || 0}% Off`}
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontWeight: 'bold', fontSize: '0.75rem', height: 20 }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="caption" color="textSecondary" display="block">Address</Typography>
                              <Typography variant="body2" sx={{ color: T.text, fontSize: '0.85rem' }}>
                                {m.address ? `${m.address}, ` : ''}{m.city || ''} {m.pincode ? `(${m.pincode})` : ''}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Card>
                      ))
                    )}
                  </Box>

                  {/* Desktop View Table */}
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <TableContainer component={Box}>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Shop Details</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Owner Details</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Contact Phone</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Discount %</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Registered On</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {merchants.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">No merchants found.</TableCell>
                            </TableRow>
                          ) : (
                            merchants.map((m) => (
                              <TableRow key={m.id} hover>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 'semibold', color: T.text }}>
                                    {m.shop_name || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    {m.address ? `${m.address}, ` : ''}{m.city || ''} {m.pincode ? `- ${m.pincode}` : ''}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 'semibold' }}>
                                    {m.full_name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary" display="block">
                                    ID: {m.username}
                                  </Typography>
                                </TableCell>
                                <TableCell>{m.phone}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={`${m.discount_percent || 0}% Off`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                </TableCell>
                                <TableCell>{new Date(m.date_joined).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Switch
                                    checked={m.is_active}
                                    onChange={() => handleMerchantStatusToggle(m.id, m.is_active)}
                                    color="primary"
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </>
              )}
            </Paper>
          )}

          {/* VIEW 4: Sub-Admin Setup */}
          {activeTab === 4 && role === 'SUPER_ADMIN' && (
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', boxShadow: 'none', border: `1px solid ${T.border}`, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>Sub-Admin User Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenSubAdminModal()} sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', textTransform: 'none', borderRadius: '10px', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  Add Sub-Admin
                </Button>
              </Box>

              {/* Mobile View Card List */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                {subAdmins.length === 0 ? (
                  <Typography variant="body2" sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                    No sub-admin users configured.
                  </Typography>
                ) : (
                  subAdmins.map((sub) => (
                    <Card
                      key={sub.id}
                      sx={{
                        borderRadius: '16px',
                        border: `1px solid ${T.border}`,
                        boxShadow: 'none',
                        bgcolor: '#ffffff',
                        p: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: '800', color: T.text }}>
                          {sub.username}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton onClick={() => handleOpenSubAdminModal(sub)} color="primary" size="small" sx={{ bgcolor: 'rgba(59,130,246,0.06)' }}>
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteSubAdmin(sub.id)} color="error" size="small" sx={{ bgcolor: 'rgba(239,68,68,0.06)' }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Box>

                      <Typography variant="caption" color="textSecondary" display="block">Email Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'semibold', color: T.text, mb: 1.5, fontSize: '0.85rem' }}>{sub.email}</Typography>

                      <Typography variant="caption" color="textSecondary" display="block">Module Permissions</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5, mb: 1.5 }}>
                        {sub.modules ? sub.modules.split(',').map((mod) => (
                          <Chip key={mod} label={mod} size="small" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }} />
                        )) : <Chip label="none" size="small" color="default" sx={{ fontSize: '0.65rem' }} />}
                      </Box>

                      <Divider sx={{ mb: 1 }} />
                      <Typography variant="caption" color="textSecondary" display="block">
                        Created: {new Date(sub.created_at).toLocaleDateString()}
                      </Typography>
                    </Card>
                  ))
                )}
              </Box>

              {/* Desktop View Table */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Box}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Module Permissions</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Created On</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subAdmins.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">No sub-admin users configured.</TableCell>
                        </TableRow>
                      ) : (
                        subAdmins.map((sub) => (
                          <TableRow key={sub.id} hover>
                            <TableCell sx={{ fontWeight: 'semibold' }}>{sub.username}</TableCell>
                            <TableCell>{sub.email}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {sub.modules ? sub.modules.split(',').map((mod) => (
                                  <Chip key={mod} label={mod} size="small" />
                                )) : <Chip label="none" size="small" color="default" />}
                              </Box>
                            </TableCell>
                            <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                            <TableCell align="right">
                              <IconButton onClick={() => handleOpenSubAdminModal(sub)} color="primary" size="small">
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteSubAdmin(sub.id)} color="error" size="small">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Sub-Admin Form Modal */}
      <Dialog open={subAdminModalOpen} onClose={() => setSubAdminModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{editingSubAdmin ? 'Edit Sub-Admin' : 'Create New Sub-Admin'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {!editingSubAdmin && (
              <TextField
                label="Username"
                fullWidth
                value={subAdminForm.username}
                onChange={(e) => setSubAdminForm(prev => ({ ...prev, username: e.target.value }))}
              />
            )}
            {!editingSubAdmin && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={subAdminForm.password}
                onChange={(e) => setSubAdminForm(prev => ({ ...prev, password: e.target.value }))}
              />
            )}
            <TextField
              label="Email"
              fullWidth
              value={subAdminForm.email}
              onChange={(e) => setSubAdminForm(prev => ({ ...prev, email: e.target.value }))}
            />
            
            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Module Permissions</Typography>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={subAdminForm.modules.captains} onChange={(e) => setSubAdminForm(prev => ({ ...prev, modules: { ...prev.modules, captains: e.target.checked } }))} />}
                label="Manage Captain Registrations (List & Toggle)"
              />
              <FormControlLabel
                control={<Checkbox checked={subAdminForm.modules.kyc} onChange={(e) => setSubAdminForm(prev => ({ ...prev, modules: { ...prev.modules, kyc: e.target.checked } }))} />}
                label="Review KYC & Documents (Approve/Reject)"
              />
              <FormControlLabel
                control={<Checkbox checked={subAdminForm.modules.sub_admins} onChange={(e) => setSubAdminForm(prev => ({ ...prev, modules: { ...prev.modules, sub_admins: e.target.checked } }))} />}
                label="Manage Sub-Admin Credentials"
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSubAdminModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSubAdmin}>Save Admin</Button>
        </DialogActions>
      </Dialog>

      {/* Captain Detail Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Captain Registration Profile Detail</Typography>
          <Chip label={selectedCaptain?.username} color="primary" />
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedCaptain && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Profile Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>1. Personal Profile</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}><Typography variant="caption">Full Name</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.fullName}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Date of Birth</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.dob || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Gender</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.gender || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Phone</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.phone}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Email</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.email || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Address</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.addressLine1} {selectedCaptain.addressLine2}, {selectedCaptain.city}, {selectedCaptain.stateName} - {selectedCaptain.pincode}</Typography></Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Nominee Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>2. Nominee Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}><Typography variant="caption">Nominee Name</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.nomineeName || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Relationship</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.nomineeRelationship || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Nominee Phone</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.nomineePhone || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Nominee Aadhaar</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.nomineeAadhaar || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Nominee DOB</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.nomineeDob || 'N/A'}</Typography></Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Bank Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>3. Bank Account Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}><Typography variant="caption">Account Holder</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.bankHolderName || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Bank Name</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.bankName || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Account Number</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.bankAccountNumber || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">IFSC Code</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.bankIfsc || 'N/A'}</Typography></Grid>
                    <Grid item xs={4}><Typography variant="caption">Account Type</Typography><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{selectedCaptain.bankAccountType || 'N/A'}</Typography></Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Documents Previews */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>4. Uploaded Verification Documents (Cloudinary)</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Aadhaar Front</Typography>
                      {selectedCaptain.aadhaarFrontUrl ? (
                        <a href={selectedCaptain.aadhaarFrontUrl} target="_blank" rel="noreferrer">
                          <img src={selectedCaptain.aadhaarFrontUrl} alt="Aadhaar Front" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: `1px solid ${T.border}` }} />
                        </a>
                      ) : <Typography variant="body2" color="textSecondary">Not Uploaded</Typography>}
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Aadhaar Back</Typography>
                      {selectedCaptain.aadhaarBackUrl ? (
                        <a href={selectedCaptain.aadhaarBackUrl} target="_blank" rel="noreferrer">
                          <img src={selectedCaptain.aadhaarBackUrl} alt="Aadhaar Back" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: `1px solid ${T.border}` }} />
                        </a>
                      ) : <Typography variant="body2" color="textSecondary">Not Uploaded</Typography>}
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>PAN Card</Typography>
                      {selectedCaptain.panCardUrl ? (
                        <a href={selectedCaptain.panCardUrl} target="_blank" rel="noreferrer">
                          <img src={selectedCaptain.panCardUrl} alt="PAN Card" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: `1px solid ${T.border}` }} />
                        </a>
                      ) : <Typography variant="body2" color="textSecondary">Not Uploaded</Typography>}
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" display="block" sx={{ mb: 1 }}>Selfie Photo</Typography>
                      {selectedCaptain.selfieUrl ? (
                        <a href={selectedCaptain.selfieUrl} target="_blank" rel="noreferrer">
                          <img src={selectedCaptain.selfieUrl} alt="Selfie" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: `1px solid ${T.border}` }} />
                        </a>
                      ) : <Typography variant="body2" color="textSecondary">Not Uploaded</Typography>}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {showRejectionPrompt && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#fef2f2', borderRadius: '12px', border: `1px solid ${T.danger}22` }}>
                  <Typography variant="subtitle2" color="error" sx={{ mb: 1, fontWeight: 'bold' }}>Provide Rejection Reason:</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason (e.g. Aadhaar details blurred)"
                    sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => setShowRejectionPrompt(false)}>Cancel</Button>
                    <Button size="small" color="error" variant="contained" onClick={() => handleKycAction('REJECTED')}>Confirm Reject</Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, borderTop: `1px solid ${T.border}` }}>
          <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
          {!showRejectionPrompt && selectedCaptain?.kycStatus !== 'APPROVED' && (
            <Button variant="outlined" color="error" onClick={() => handleKycAction('REJECTED')}>Reject KYC</Button>
          )}
          {!showRejectionPrompt && selectedCaptain?.kycStatus !== 'APPROVED' && (
            <Button variant="contained" color="success" onClick={() => handleKycAction('APPROVED')}>Approve KYC</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar alerts */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.type} onClose={() => setToast(prev => ({ ...prev, open: false }))} sx={{ borderRadius: '12px' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
