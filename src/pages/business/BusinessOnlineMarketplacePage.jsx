import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Rating,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  MicNone as MicIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  Tune as FilterIcon,
  SwapVert as SortIcon,
  KeyboardArrowDown as ArrowDownIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingBag as BagIcon,
  VerifiedUser as VerifiedIcon,
  LocationOn as LocationIcon,
  ElectricBolt as FastBoltIcon,
  ShieldOutlined as ShieldIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import AppShell from '../../components/layout/AppShell';
import { getMerchantCategories } from '../../api/api';

const CAPTAIN_API = process.env.REACT_APP_CAPTAIN_API_URL
  || window.REACT_APP_CAPTAIN_API_URL
  || 'https://api-captain.trikonektbusiness.com/api';

const B2B_CART_KEY = 'tri_business_b2b_cart';

function authHeaders() {
  const token = localStorage.getItem('token_business')
    || localStorage.getItem('token_captain')
    || localStorage.getItem('captain_token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function readB2BCart() {
  try {
    return JSON.parse(localStorage.getItem(B2B_CART_KEY) || 'null');
  } catch (_) {
    return null;
  }
}

function writeB2BCart(cart) {
  if (!cart || !cart.items?.length) {
    localStorage.removeItem(B2B_CART_KEY);
  } else {
    localStorage.setItem(B2B_CART_KEY, JSON.stringify(cart));
  }
}

// ── Blinkit Category & Subcategory Hierarchy ──────────────────────────────────────
const BLINKIT_CATEGORIES_DATA = {
  "Vegetables & Fruits": {
    label: "Vegetables & Fruits",
    banner: {
      title: "Fresh Seasonal Fruits & Veggies",
      subtitle: "Nutritional goodness sourced directly from local farm mandis",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
      bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    },
    subcategories: [
      { id: "all", label: "All", icon: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80" },
      { id: "fresh-veg", label: "Fresh Vegetables", icon: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=120&q=80" },
      { id: "fresh-fruits", label: "Fresh Fruits", icon: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=120&q=80" },
      { id: "exotics", label: "Exotics", icon: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=120&q=80" },
      { id: "coriander", label: "Coriander & Others", icon: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=120&q=80" },
      { id: "sprouts", label: "Freshly Cut & Sprouts", icon: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=120&q=80" },
      { id: "flowers", label: "Flowers & Leaves", icon: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=120&q=80" },
    ],
    catalog: [
      {
        id: 101,
        title: "Custard Apple (Seetha Phala)",
        subcat: "fresh-fruits",
        packSize: "300 g (2 pcs)",
        price: 73,
        mrp: 91,
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.8,
        description: "Fresh premium custard apples (Sitaphal) with soft, creamy pulp and natural high sweetness.",
      },
      {
        id: 102,
        title: "Thai Guava (Seebe Hannu)",
        subcat: "fresh-fruits",
        packSize: "400 g (2 pcs)",
        price: 73,
        mrp: 94,
        image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.7,
        description: "Crisp white flesh large Thai guavas with pleasant aroma and sweet mild taste.",
      },
      {
        id: 103,
        title: "Brown Coconut (Tenginakayi)",
        subcat: "coriander",
        packSize: "1 pc",
        price: 41,
        mrp: 50,
        image: "https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.9,
        description: "Fresh matured coconut full of sweet coconut water and thick tender kernel.",
      },
      {
        id: 104,
        title: "Mini Orange (Kittale Hannu)",
        subcat: "fresh-fruits",
        packSize: "250 g",
        price: 117,
        mrp: 150,
        image: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.6,
        description: "Juicy, easy-peel sweet mandarin oranges loaded with natural Vitamin C.",
      },
      {
        id: 105,
        title: "Fresh Desi Tomato (Hybrid)",
        subcat: "fresh-veg",
        packSize: "1 kg",
        price: 36,
        mrp: 48,
        image: "https://images.unsplash.com/photo-1546470427-e26264be0b11?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.7,
        description: "Firm, plump, naturally ripened farm tomatoes perfect for everyday Indian curries.",
      },
      {
        id: 106,
        title: "Green Capsicum (Shimla Mirch)",
        subcat: "fresh-veg",
        packSize: "500 g",
        price: 48,
        mrp: 65,
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.8,
        description: "Crunchy, dark green bell peppers freshly picked from polyhouse farms.",
      },
      {
        id: 107,
        title: "Dragon Fruit (Pitaya)",
        subcat: "exotics",
        packSize: "1 pc (350 g)",
        price: 89,
        mrp: 120,
        image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.9,
        description: "Exotic pink dragon fruit with antioxidant-packed vibrant purple pulp.",
      },
      {
        id: 108,
        title: "Fresh Coriander Bunch",
        subcat: "coriander",
        packSize: "100 g bunch",
        price: 15,
        mrp: 25,
        image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.9,
        description: "Aromatic freshly harvested green coriander leaves with intact roots.",
      },
    ]
  },

  "Atta, Rice & Dal": {
    label: "Atta, Rice & Dal",
    banner: {
      title: "Wholesale Staples & Grains",
      subtitle: "Best wholesale bulk rates on premium flours, basmati & pulses",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    },
    subcategories: [
      { id: "all", label: "All", icon: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=120&q=80" },
      { id: "atta", label: "Atta & Flours", icon: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=120&q=80" },
      { id: "rice", label: "Rice & Grains", icon: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=120&q=80" },
      { id: "dal", label: "Dals & Pulses", icon: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=120&q=80" },
    ],
    catalog: [
      {
        id: 201,
        title: "Aashirvaad Shudh Chakki Atta",
        subcat: "atta",
        packSize: "5 kg",
        price: 245,
        mrp: 290,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.9,
        description: "100% pure whole wheat grain flour processed with 4-step mechanical cleaning.",
      },
      {
        id: 202,
        title: "Daawat Rozana Super Basmati Rice",
        subcat: "rice",
        packSize: "5 kg",
        price: 385,
        mrp: 495,
        image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.8,
        description: "Long grain aromatic basmati rice aged naturally for ideal fluffy cooking.",
      },
      {
        id: 203,
        title: "Tata Sampann Unpolished Toor Dal",
        subcat: "dal",
        packSize: "1 kg",
        price: 168,
        mrp: 198,
        image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.8,
        description: "Unpolished high-protein toor dal with natural nutrients and wholesome flavor.",
      },
      {
        id: 204,
        title: "Fortune Sunlite Refined Sunflower Oil",
        subcat: "atta",
        packSize: "1 Ltr Pouch",
        price: 132,
        mrp: 165,
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.7,
        description: "Light and healthy refined sunflower oil enriched with Vitamins A & D.",
      },
    ]
  },

  "Dairy, Bread & Eggs": {
    label: "Dairy, Bread & Eggs",
    banner: {
      title: "Chilled Dairy & Morning Essentials",
      subtitle: "Fresh milk, soft breads & farm eggs dispatched under temperature control",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
      bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    },
    subcategories: [
      { id: "all", label: "All", icon: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=120&q=80" },
      { id: "milk", label: "Milk & Curd", icon: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=120&q=80" },
      { id: "bread", label: "Bread & Buns", icon: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=120&q=80" },
      { id: "butter", label: "Butter & Paneer", icon: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=120&q=80" },
      { id: "eggs", label: "Eggs", icon: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=120&q=80" },
      { id: "cheese", label: "Cheese", icon: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=120&q=80" },
      { id: "yogurt", label: "Yogurt", icon: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=120&q=80" },
      { id: "other", label: "Other Dairy", icon: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=120&q=80" },
    ],
    catalog: [
      {
        id: 301,
        title: "Amul Taaza Toned Milk",
        subcat: "milk",
        packSize: "500 ml Pouch",
        price: 27,
        mrp: 30,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.9,
        description: "Fresh pasteurised toned milk with 3.0% fat and 8.5% SNF.",
      },
      {
        id: 302,
        title: "Amul Malai Paneer",
        subcat: "butter",
        packSize: "200 g Block",
        price: 88,
        mrp: 95,
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.9,
        description: "Soft, rich, creamy cottage cheese made from pure cow milk.",
      },
      {
        id: 303,
        title: "Modern 100% Whole Wheat Bread",
        subcat: "bread",
        packSize: "400 g Pack",
        price: 45,
        mrp: 50,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.7,
        description: "Healthy high-fiber brown bread baked without refined maida.",
      },
      {
        id: 304,
        title: "Farm Fresh White Eggs (6 pcs)",
        subcat: "eggs",
        packSize: "Pack of 6",
        price: 54,
        mrp: 65,
        image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.8,
        description: "Nutritious farm fresh protein-rich table eggs, hygienically washed and packed.",
      },
      {
        id: 305,
        title: "Amul Processed Cheese Slices",
        subcat: "cheese",
        packSize: "200 g (10 slices)",
        price: 135,
        mrp: 150,
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.9,
        description: "Creamy pasteurized cheese slices ideal for sandwiches, burgers, and morning toasts.",
      },
      {
        id: 306,
        title: "Epigamia Greek Yogurt (Blueberry)",
        subcat: "yogurt",
        packSize: "90 g Cup",
        price: 45,
        mrp: 50,
        image: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.8,
        description: "High protein, zero preservative Greek yogurt infused with real blueberries.",
      },
    ]
  },

  "Snacks & Drinks": {
    label: "Snacks & Drinks",
    banner: {
      title: "Snacks, Chips & Cold Drinks",
      subtitle: "Instant wholesale cartons and packs for your store shelves",
      image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80",
      bg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    },
    subcategories: [
      { id: "all", label: "All", icon: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=120&q=80" },
      { id: "chips", label: "Chips & Namkeen", icon: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=120&q=80" },
      { id: "drinks", label: "Drinks & Juices", icon: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=120&q=80" },
      { id: "chocolates", label: "Chocolates", icon: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=120&q=80" },
    ],
    catalog: [
      {
        id: 401,
        title: "Lay's India's Magic Masala Chips",
        subcat: "chips",
        packSize: "90 g Pack",
        price: 36,
        mrp: 40,
        image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.8,
        description: "Crunchy ridged potato chips seasoned with quintessential spicy Indian masala.",
      },
      {
        id: 402,
        title: "Real Fruit Power Mango Juice",
        subcat: "drinks",
        packSize: "1 Ltr Tetra",
        price: 110,
        mrp: 130,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.7,
        description: "Rich and luscious Alphonso mango juice with authentic fruit pulp.",
      },
      {
        id: 403,
        title: "Cadbury Dairy Milk Silk Chocolate",
        subcat: "chocolates",
        packSize: "60 g Bar",
        price: 75,
        mrp: 85,
        image: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.9,
        description: "Indulgently smooth and silky milk chocolate crafted with rich cocoa.",
      },
    ]
  }
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const MASTER_CATEGORIES = [
  { id: 'cat-veg-fruit', label: 'Vegetables & Fruits', icon: '🥦', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80', count: '120+ items', badge: 'Fresh Farm' },
  { id: 'cat-dairy-bread', label: 'Dairy, Bread & Eggs', icon: '🥛', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80', count: '85+ items', badge: 'Chilled' },
  { id: 'cat-atta-rice', label: 'Atta, Rice & Dal', icon: '🌾', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80', count: '140+ items', badge: 'Wholesale' },
  { id: 'cat-snacks-drinks', label: 'Snacks & Drinks', icon: '🍿', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80', count: '210+ items', badge: 'Quick Bite' },
  { id: 'cat-instant-food', label: 'Instant Food & Noodles', icon: '🍜', image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80', count: '90+ items', badge: '10 Mins' },
  { id: 'cat-tea-coffee', label: 'Tea, Coffee & Health Drinks', icon: '☕', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80', count: '75+ items' },
  { id: 'cat-bakery-biscuits', label: 'Bakery & Biscuits', icon: '🍪', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80', count: '110+ items' },
  { id: 'cat-sweet-choc', label: 'Sweet Tooth & Chocolates', icon: '🍫', image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?auto=format&fit=crop&w=300&q=80', count: '65+ items' },
  { id: 'cat-cold-drinks', label: 'Cold Drinks & Juices', icon: '🥤', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80', count: '130+ items' },
  { id: 'cat-masalas-spices', label: 'Masalas & Spices', icon: '🌶️', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80', count: '95+ items' },
  { id: 'cat-sauces-spreads', label: 'Sauces & Spreads', icon: '🍯', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80', count: '45+ items' },
  { id: 'cat-cleaning', label: 'Cleaning & Household', icon: '🧹', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=300&q=80', count: '160+ items' },
  { id: 'cat-personal-care', label: 'Personal Care & Hygiene', icon: '🧼', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80', count: '180+ items' },
  { id: 'cat-baby-care', label: 'Baby Care & Diapers', icon: '👶', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=300&q=80', count: '55+ items' },
  { id: 'cat-pet-supplies', label: 'Pet Supplies & Food', icon: '🐾', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=300&q=80', count: '40+ items' },
  { id: 'cat-electronics', label: 'Electronics & Mobiles', icon: '📱', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80', count: '190+ items', badge: 'Hot' },
  { id: 'cat-kitchen-dining', label: 'Kitchen & Dining Essentials', icon: '🍽️', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80', count: '115+ items' },
  { id: 'cat-hardware', label: 'Hardware & Electricals', icon: '🔌', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80', count: '80+ items' },
  { id: 'cat-beauty', label: 'Beauty & Cosmetics', icon: '💄', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80', count: '120+ items' },
  { id: 'cat-stationery', label: 'Stationery & Office Supplies', icon: '✏️', image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=300&q=80', count: '70+ items' },
  { id: 'cat-restaurant-bulk', label: 'Restaurant & Hotel Supplies', icon: '👨‍🍳', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80', count: '60+ items', badge: 'B2B Bulk' },
  { id: 'cat-fashion', label: 'Fashion & Garments', icon: '👕', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=300&q=80', count: '250+ items' },
  { id: 'cat-meat-seafood', label: 'Fresh Meat & Seafood', icon: '🍗', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=300&q=80', count: '35+ items' },
  { id: 'cat-organic', label: 'Organic & Gourmet', icon: '🌱', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80', count: '50+ items' },
];

function resolveCategoryData(key) {
  if (!key) return BLINKIT_CATEGORIES_DATA["Vegetables & Fruits"];
  if (BLINKIT_CATEGORIES_DATA[key]) {
    return BLINKIT_CATEGORIES_DATA[key];
  }
  const foundKey = Object.keys(BLINKIT_CATEGORIES_DATA).find(
    k => k.toLowerCase() === String(key).toLowerCase()
  );
  if (foundKey) return BLINKIT_CATEGORIES_DATA[foundKey];

  const h = Math.abs(hashString(String(key)));
  return {
    label: key,
    banner: {
      title: `${key} Wholesale Hub`,
      subtitle: `Browse B2B wholesale prices, bulk cartons and direct distributor packs for ${key}`,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
      bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    },
    subcategories: [
      { id: "all", label: "All", icon: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80" },
      { id: "trending", label: "Top Sellers", icon: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=120&q=80" },
      { id: "wholesale", label: "Bulk Cartons", icon: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=120&q=80" },
      { id: "value", label: "Super Value", icon: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=120&q=80" },
    ],
    catalog: [
      {
        id: (h % 9000) + 1000,
        title: `${key} Premium Grade Pack`,
        subcat: "trending",
        packSize: "1 Standard Pack",
        price: 145,
        mrp: 195,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.8,
        description: `Verified merchant quality ${key} ready for express dispatch across local trade zones.`,
      },
      {
        id: (h % 9000) + 1001,
        title: `${key} Master Wholesale Carton`,
        subcat: "wholesale",
        packSize: "Box of 12 pcs",
        price: 1150,
        mrp: 1600,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "15-20 mins",
        rating: 4.9,
        description: `Wholesale distributor packaging with tier discounts and verified GST invoice.`,
      },
      {
        id: (h % 9000) + 1002,
        title: `${key} Economy Retail Pack`,
        subcat: "value",
        packSize: "500 g / Unit",
        price: 78,
        mrp: 99,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
        deliveryMins: "10-15 mins",
        rating: 4.7,
        description: `Fast moving retail units with attractive consumer margin and quick stock turn.`,
      },
    ],
  };
}

export default function BusinessOnlineMarketplacePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Selected Category from URL or default
  const paramCategory = searchParams.get('category');
  const initialCategory = paramCategory || "Vegetables & Fruits";

  const [currentCategoryKey, setCurrentCategoryKey] = useState(initialCategory);
  const [isCategoryScreen, setIsCategoryScreen] = useState(!paramCategory);
  const [activeSubcatId, setActiveSubcatId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

  const handleSelectCategory = (catLabel) => {
    setCurrentCategoryKey(catLabel);
    setActiveSubcatId("all");
    setIsCategoryScreen(false);
    setCategoryDrawerOpen(false);
    setSearchParams({ category: catLabel });
  };

  const handleBackFromBrowse = () => {
    setIsCategoryScreen(true);
    setSearchParams({});
  };

  // 100+ Category Selection Drawer & Search
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [apiCategories, setApiCategories] = useState([]);

  // Fetch live merchant categories from Spring Boot API
  useEffect(() => {
    let mounted = true;
    getMerchantCategories()
      .then(cats => {
        if (mounted && Array.isArray(cats) && cats.length > 0) {
          setApiCategories(cats);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Merge MASTER_CATEGORIES with API categories
  const allAvailableCategories = useMemo(() => {
    const list = [...MASTER_CATEGORIES];
    const existingLabels = new Set(list.map(c => c.label.toLowerCase()));

    apiCategories.forEach(apiCat => {
      const name = apiCat.name || apiCat.label;
      if (name && !existingLabels.has(name.toLowerCase())) {
        list.push({
          id: `api-cat-${apiCat.id || name}`,
          label: name,
          icon: '📦',
          image: apiCat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
          count: 'Live Merchant',
          badge: 'Verified',
        });
        existingLabels.add(name.toLowerCase());
      }
    });

    return list;
  }, [apiCategories]);

  // Filtered categories for Drawer
  const filteredMasterCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return allAvailableCategories;
    const q = categorySearchQuery.toLowerCase();
    return allAvailableCategories.filter(c =>
      c.label.toLowerCase().includes(q) || (c.badge && c.badge.toLowerCase().includes(q))
    );
  }, [allAvailableCategories, categorySearchQuery]);

  // Cart State (Synchronized with tri_business_b2b_cart)
  const [b2bCart, setB2bCart] = useState(() => readB2BCart());
  const [wishlist, setWishlist] = useState({});
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false);

  // Modals
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Sync category from URL parameter
  useEffect(() => {
    if (paramCategory) {
      setCurrentCategoryKey(paramCategory);
      setActiveSubcatId("all");
    }
  }, [paramCategory]);

  const activeCategoryData = useMemo(() => {
    return resolveCategoryData(currentCategoryKey);
  }, [currentCategoryKey]);

  // Quantity in cart helper
  const getProductQtyInCart = useCallback((productId) => {
    if (!b2bCart?.items?.length) return 0;
    const item = b2bCart.items.find(i => Number(i.productId) === Number(productId));
    return item ? Number(item.quantity || 0) : 0;
  }, [b2bCart]);

  // Add / Increment Item in B2B Cart
  const handleAddToCart = (product) => {
    const existing = readB2BCart();
    let nextCart = existing;

    if (!nextCart) {
      nextCart = {
        shopId: 1,
        sellerId: 1,
        shopName: 'Trikonekt Wholesale Hub',
        items: [],
      };
    }

    const productId = Number(product.id);
    const existingItem = nextCart.items.find(item => Number(item.productId) === productId);

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity || 0) + 1;
    } else {
      nextCart.items.push({
        productId,
        title: product.title,
        price: Number(product.price),
        mrp: Number(product.mrp || product.price),
        quantity: 1,
        packSize: product.packSize || '1 unit',
        image: product.image,
      });
    }

    writeB2BCart(nextCart);
    setB2bCart({ ...nextCart });
    setToastMsg(`Added "${product.title}" to cart`);
  };

  // Decrement / Remove Item from Cart
  const handleDecrementCart = (productId) => {
    const existing = readB2BCart();
    if (!existing?.items?.length) return;

    const id = Number(productId);
    const item = existing.items.find(i => Number(i.productId) === id);
    if (!item) return;

    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      existing.items = existing.items.filter(i => Number(i.productId) !== id);
    }

    writeB2BCart(existing);
    setB2bCart({ ...existing });
  };

  // Toggle Wishlist
  const toggleWishlist = (productId) => {
    setWishlist(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    let list = [...(activeCategoryData.catalog || [])];

    // Subcategory Filter
    if (activeSubcatId !== "all") {
      list = list.filter(p => p.subcat === activeSubcatId);
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    // Fast Delivery Filter
    if (fastDeliveryOnly) {
      list = list.filter(p => p.deliveryMins && (p.deliveryMins.includes('10') || p.deliveryMins.includes('15')));
    }

    // Sort By
    if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [activeCategoryData, activeSubcatId, searchQuery, sortBy, fastDeliveryOnly]);

  // Cart total summary
  const totalCartCount = (b2bCart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalCartSubtotal = (b2bCart?.items || []).reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  const lastAddedItem = b2bCart?.items?.length ? b2bCart.items[b2bCart.items.length - 1] : null;

  return (
    <AppShell activeTab="/business/online-marketplace" title="Online Shopping">
      <Box sx={{ width: '100%', bgcolor: '#f8fafc', minHeight: '100%', position: 'relative' }}>
        
        {isCategoryScreen ? (
          /* ════════════════════════════════════════════════════════════════════════════════
             SCREEN 9: ALL CATEGORIES (Master Design System Board)
             ════════════════════════════════════════════════════════════════════════════════ */
          <Box sx={{ width: '100%', pb: 4 }}>
            {/* Page Title & Context Header */}
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.4rem' }, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
                    All Categories ({filteredMasterCategories.length})
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                    Browse products across every business category
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => navigate('/business/online-marketplace/cart')}
                  sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', p: 1 }}
                >
                  <Badge badgeContent={totalCartCount} color="success" max={99}>
                    <BagIcon sx={{ fontSize: 20, color: '#059669' }} />
                  </Badge>
                </IconButton>
              </Stack>

              {/* Clean Full-Width Search Input */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  px: 2,
                  py: 0.85,
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  mt: 1.5,
                }}
              >
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1.25 }} />
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Search categories (e.g. Dairy, Fruits, Snacks, Fashion...)"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' },
                  }}
                />
                {categorySearchQuery && (
                  <IconButton size="small" onClick={() => setCategorySearchQuery("")} sx={{ color: '#94a3b8', p: 0.5 }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Popular Categories (4-item quick grid matching Screen 9) */}
            {!categorySearchQuery && (
              <Box sx={{ px: { xs: 2, sm: 3 }, mt: 2, mb: 3 }}>
                <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                  Popular Categories
                </Typography>
                <Grid container spacing={1.5}>
                  {allAvailableCategories.slice(0, 4).map((popCat) => (
                    <Grid item xs={3} key={popCat.id}>
                      <Box
                        onClick={() => handleSelectCategory(popCat.label)}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          cursor: 'pointer',
                          p: 0.5,
                          '&:hover': { transform: 'scale(1.03)' },
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 58, sm: 70 },
                            height: { xs: 58, sm: 70 },
                            borderRadius: '18px',
                            bgcolor: '#ffffff',
                            border: '1.5px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 1,
                            mb: 0.75,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                        >
                          <Box
                            component="img"
                            src={popCat.image}
                            alt={popCat.label}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80';
                            }}
                            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: 1.2,
                            height: '2.4em',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {popCat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* All Categories List / Grid (Matching Screen 9) */}
            <Box sx={{ px: { xs: 2, sm: 3 } }}>
              <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
                All Categories
              </Typography>
              <Stack spacing={1.25}>
                {filteredMasterCategories.map((cat) => {
                  const isSelected = currentCategoryKey.toLowerCase() === cat.label.toLowerCase();
                  return (
                    <Card
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.label)}
                      sx={{
                        borderRadius: '18px',
                        border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                        bgcolor: isSelected ? '#f0fdf4' : '#ffffff',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: '#10b981',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            width: 54,
                            height: 54,
                            borderRadius: '14px',
                            bgcolor: '#f8fafc',
                            p: 0.75,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <Box
                            component="img"
                            src={cat.image}
                            alt={cat.label}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80';
                            }}
                            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            sx={{
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              color: isSelected ? '#047857' : '#0f172a',
                              lineHeight: 1.25,
                            }}
                            noWrap
                          >
                            {cat.label}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.35 }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                              {cat.count || '80+ items'}
                            </Typography>
                            {cat.badge && (
                              <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#059669', bgcolor: '#ecfdf5', px: 0.75, py: 0.15, borderRadius: '4px' }}>
                                {cat.badge}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                      <ChevronRightIcon sx={{ color: isSelected ? '#10b981' : '#94a3b8', fontSize: 20 }} />
                    </Card>
                  );
                })}
              </Stack>
            </Box>
          </Box>
        ) : (
          /* ════════════════════════════════════════════════════════════════════════════════
             SCREEN 10: CATEGORY PRODUCT LISTING (Master Design System Board)
             ════════════════════════════════════════════════════════════════════════════════ */
          <Box sx={{ width: '100%', pb: 6 }}>
            {/* 1. Category Context Sticky Bar */}
            <Box
              sx={{
                bgcolor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                px: { xs: 2, sm: 3 },
                py: 1.25,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                {/* Back Button & Category Details */}
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                  <IconButton
                    size="small"
                    onClick={handleBackFromBrowse}
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#0f172a',
                      p: 0.8,
                      '&:hover': { bgcolor: '#e2e8f0' },
                    }}
                    title="Back to All Categories"
                  >
                    <BackIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.98rem', sm: '1.15rem' },
                        fontWeight: 900,
                        color: '#0f172a',
                        lineHeight: 1.2,
                      }}
                      noWrap
                    >
                      {activeCategoryData.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        color: '#059669',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 0.2,
                      }}
                      noWrap
                    >
                      <span>⚡ 10–15 min delivery</span>
                      <span>•</span>
                      <span>Wholesale B2B</span>
                    </Typography>
                  </Box>
                </Stack>

                {/* Right Action Icons: All Categories button, Cart Bag, Share */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <Button
                    size="small"
                    startIcon={<FilterIcon sx={{ fontSize: 16 }} />}
                    onClick={handleBackFromBrowse}
                    sx={{
                      bgcolor: '#ecfdf5',
                      color: '#047857',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      textTransform: 'none',
                      borderRadius: '10px',
                      border: '1px solid #a7f3d0',
                      py: 0.5,
                      px: 1.2,
                      display: { xs: 'none', sm: 'inline-flex' },
                      '&:hover': { bgcolor: '#d1fae5' },
                    }}
                  >
                    All Categories ({allAvailableCategories.length})
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => navigate('/business/online-marketplace/cart')}
                    sx={{
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#0f172a',
                      p: 0.8,
                      '&:hover': { bgcolor: '#f1f5f9' },
                    }}
                  >
                    <Badge badgeContent={totalCartCount} color="success" max={99}>
                      <BagIcon sx={{ fontSize: 20, color: '#059669' }} />
                    </Badge>
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      p: 0.8,
                      '&:hover': { bgcolor: '#f1f5f9' },
                    }}
                  >
                    <ShareIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.5 }}>
              {/* 2. Full-Width Clean Search Bar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  px: 1.5,
                  py: 0.4,
                  mb: 1.75,
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <SearchIcon sx={{ color: '#64748b', fontSize: 20, mr: 1 }} />
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder={`Search in "${activeCategoryData.label}"...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' },
                  }}
                />
                {searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: '#94a3b8', mr: 0.5 }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
                <IconButton size="small" sx={{ color: '#64748b' }}>
                  <MicIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Box>

              {/* 3. Subcategory Navigation: Horizontal Scroll Chips */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  overflowX: 'auto',
                  pb: 1,
                  mb: 1.5,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  msOverflowStyle: 'none',
                }}
              >
                {/* All Items Chip */}
                <Box
                  onClick={() => setActiveSubcatId('all')}
                  sx={{
                    px: 1.75,
                    py: 0.7,
                    borderRadius: '24px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    transition: 'all 0.15s ease',
                    bgcolor: activeSubcatId === 'all' ? '#047857' : '#ffffff',
                    color: activeSubcatId === 'all' ? '#ffffff' : '#334155',
                    border: activeSubcatId === 'all' ? '1.5px solid #047857' : '1px solid #e2e8f0',
                    boxShadow: activeSubcatId === 'all' ? '0 2px 8px rgba(4, 120, 87, 0.25)' : 'none',
                    '&:hover': {
                      bgcolor: activeSubcatId === 'all' ? '#065f46' : '#f8fafc',
                    },
                  }}
                >
                  All Items
                </Box>

                {/* Subcategory Chips */}
                {activeCategoryData.subcategories.map((subcat) => {
                  const isActive = activeSubcatId === subcat.id;
                  return (
                    <Box
                      key={subcat.id}
                      onClick={() => setActiveSubcatId(subcat.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.85,
                        px: 1.5,
                        py: 0.55,
                        borderRadius: '24px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontSize: '0.78rem',
                        fontWeight: isActive ? 800 : 600,
                        transition: 'all 0.15s ease',
                        bgcolor: isActive ? '#ecfdf5' : '#ffffff',
                        color: isActive ? '#047857' : '#334155',
                        border: isActive ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                        boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none',
                        '&:hover': {
                          bgcolor: isActive ? '#d1fae5' : '#f8fafc',
                          borderColor: '#10b981',
                        },
                      }}
                    >
                      {subcat.icon && (
                        <Box
                          component="img"
                          src={subcat.icon}
                          alt={subcat.label}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80';
                          }}
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      <span>{subcat.label}</span>
                    </Box>
                  );
                })}
              </Box>

              {/* 4. Compact Promotional Banner Module */}
              {activeCategoryData.banner && !searchQuery && (
                <Box
                  sx={{
                    borderRadius: '18px',
                    background: activeCategoryData.banner.bg || 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    p: { xs: 1.75, sm: 2.25 },
                    mb: 1.75,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)',
                    minHeight: 100,
                  }}
                >
                  <Box sx={{ maxWidth: '65%' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        bgcolor: 'rgba(5, 150, 105, 0.12)',
                        color: '#047857',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        px: 1,
                        py: 0.2,
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 0.5,
                      }}
                    >
                      CHILLED ESSENTIALS
                    </Box>
                    <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1.15rem' }, fontWeight: 900, color: '#0f172a', lineHeight: 1.25 }}>
                      {activeCategoryData.banner.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 600, mt: 0.35 }}>
                      {activeCategoryData.banner.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    component="img"
                    src={activeCategoryData.banner.image}
                    alt="Banner Promo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
                    }}
                    sx={{
                      width: { xs: 75, sm: 90 },
                      height: { xs: 75, sm: 90 },
                      objectFit: 'cover',
                      borderRadius: '14px',
                      flexShrink: 0,
                    }}
                  />
                </Box>
              )}

              {/* 5. Compact Filter & Sort Bar */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mb: 2,
                  overflowX: 'auto',
                  pb: 0.5,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                  msOverflowStyle: 'none',
                }}
              >
                <Chip
                  icon={<FilterIcon sx={{ fontSize: '15px !important', color: '#047857' }} />}
                  label="Filters"
                  size="small"
                  onClick={() => setCategoryDrawerOpen(true)}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    cursor: 'pointer',
                    flexShrink: 0,
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#10b981' },
                  }}
                />
                <Chip
                  label={`Sort: ${sortBy === 'price_asc' ? 'Price: Low to High' : sortBy === 'price_desc' ? 'Price: High to Low' : 'Relevance'} ▾`}
                  size="small"
                  onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                />
                <Menu
                  anchorEl={sortMenuAnchor}
                  open={Boolean(sortMenuAnchor)}
                  onClose={() => setSortMenuAnchor(null)}
                  PaperProps={{ sx: { borderRadius: '14px', minWidth: 160 } }}
                >
                  <MenuItem onClick={() => { setSortBy("relevance"); setSortMenuAnchor(null); }}>Relevance</MenuItem>
                  <MenuItem onClick={() => { setSortBy("price_asc"); setSortMenuAnchor(null); }}>Price: Low to High</MenuItem>
                  <MenuItem onClick={() => { setSortBy("price_desc"); setSortMenuAnchor(null); }}>Price: High to Low</MenuItem>
                </Menu>
                <Chip
                  icon={<FastBoltIcon sx={{ fontSize: '15px !important', color: fastDeliveryOnly ? '#ffffff' : '#059669' }} />}
                  label="Fast 10-15 Mins"
                  size="small"
                  onClick={() => setFastDeliveryOnly(prev => !prev)}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    bgcolor: fastDeliveryOnly ? '#047857' : '#ecfdf5',
                    color: fastDeliveryOnly ? '#ffffff' : '#059669',
                    border: fastDeliveryOnly ? '1px solid #047857' : '1px solid #a7f3d0',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                />
                <Chip
                  label="Wholesale B2B"
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    flexShrink: 0,
                  }}
                />
              </Stack>

              {/* 6. 2-Column Product Grid (Full Width, Quick Commerce Standard) */}
              {filteredProducts.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#64748b' }}>
                    No items found in this section
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => { setActiveSubcatId("all"); setSearchQuery(""); setFastDeliveryOnly(false); }}
                    sx={{ mt: 1.5, textTransform: 'none', fontWeight: 800, color: '#10b981' }}
                  >
                    View All {activeCategoryData.label}
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
                    gap: { xs: 1.25, sm: 2 },
                    width: '100%',
                  }}
                >
                  {filteredProducts.map((p) => {
                    const qtyInCart = getProductQtyInCart(p.id);
                    const isWish = wishlist[p.id];
                    const discountPct = Math.round(((p.mrp - p.price) / p.mrp) * 100);

                    return (
                      <Card
                        key={p.id}
                        elevation={0}
                        sx={{
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          bgcolor: '#ffffff',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)',
                          '&:hover': {
                            borderColor: '#10b981',
                            boxShadow: '0 6px 18px rgba(16, 185, 129, 0.1)',
                          },
                        }}
                      >
                        {/* Wishlist Heart Icon */}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2,
                            p: 0.5,
                            color: isWish ? '#ef4444' : '#94a3b8',
                            '&:hover': { bgcolor: '#ffffff' },
                          }}
                        >
                          {isWish ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                        </IconButton>

                        {/* Product Photo & Click to PDP */}
                        <Box
                          onClick={() => setSelectedProductDetails(p)}
                          sx={{
                            height: { xs: 125, sm: 145 },
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f8fafc',
                            p: 1.25,
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            component="img"
                            src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                            alt={p.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                            }}
                            sx={{
                              maxHeight: { xs: 110, sm: 125 },
                              maxWidth: '100%',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                        </Box>

                        {/* Card Content */}
                        <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box onClick={() => setSelectedProductDetails(p)} sx={{ cursor: 'pointer' }}>
                            {/* Pack size pill */}
                            <Box
                              sx={{
                                display: 'inline-block',
                                bgcolor: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                px: 0.8,
                                py: 0.25,
                                borderRadius: '6px',
                                mb: 0.5,
                              }}
                            >
                              {p.packSize}
                            </Box>

                            {/* Title */}
                            <Typography
                              sx={{
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                lineHeight: 1.25,
                                height: '2.5em',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                mb: 0.5,
                              }}
                            >
                              {p.title}
                            </Typography>

                            {/* Delivery ETA */}
                            <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, mb: 1 }}>
                              ⏱ {p.deliveryMins}
                            </Typography>
                          </Box>

                          {/* Price & ADD / Quantity Stepper Button */}
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto', pt: 0.5 }}>
                            <Box>
                              <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                                ₹{p.price}
                              </Typography>
                              {p.mrp > p.price && (
                                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                                  ₹{p.mrp}
                                </Typography>
                              )}
                            </Box>

                            {/* Quick Commerce ADD / Stepper Button */}
                            {qtyInCart === 0 ? (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleAddToCart(p)}
                                sx={{
                                  borderRadius: '10px',
                                  borderColor: '#10b981',
                                  color: '#059669',
                                  fontWeight: 900,
                                  fontSize: '0.78rem',
                                  px: 2,
                                  py: 0.4,
                                  minWidth: 64,
                                  textTransform: 'uppercase',
                                  bgcolor: '#ffffff',
                                  boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)',
                                  '&:hover': {
                                    bgcolor: '#ecfdf5',
                                    borderColor: '#059669',
                                  },
                                }}
                              >
                                ADD
                              </Button>
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  bgcolor: '#10b981',
                                  color: '#ffffff',
                                  borderRadius: '10px',
                                  px: 0.5,
                                  py: 0.2,
                                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleDecrementCart(p.id)}
                                  sx={{ color: '#ffffff', p: 0.25 }}
                                >
                                  <RemoveIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, px: 0.75 }}>
                                  {qtyInCart}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleAddToCart(p)}
                                  sx={{ color: '#ffffff', p: 0.25 }}
                                >
                                  <AddIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* ════════════════════════════════════════════════════════════════════════════════
            3. FLOATING BOTTOM CART PILL (Matching Screen 3)
           ════════════════════════════════════════════════════════════════════════════════ */}
        {totalCartCount > 0 && (
          <Box
            sx={{
              position: 'fixed',
              bottom: { xs: 74, sm: 80 },
              left: 0,
              right: 0,
              zIndex: 40,
              px: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              onClick={() => navigate('/business/online-marketplace/cart')}
              sx={{
                bgcolor: '#15803d',
                color: '#ffffff',
                borderRadius: '999px',
                px: 2,
                py: 1.15,
                boxShadow: '0 8px 24px rgba(21, 128, 61, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                cursor: 'pointer',
                maxWidth: 420,
                width: '100%',
                transition: 'transform 0.15s, background-color 0.15s',
                '&:hover': { bgcolor: '#166534', transform: 'scale(1.02)' },
              }}
            >
              {lastAddedItem?.image && (
                <Box
                  component="img"
                  src={lastAddedItem.image}
                  alt="Cart Preview"
                  sx={{ width: 34, height: 34, borderRadius: '8px', objectFit: 'cover', bgcolor: '#fff' }}
                />
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 900, lineHeight: 1.1 }}>
                  View cart
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#bbf7d0', fontWeight: 700 }}>
                  {totalCartCount} items • ₹{totalCartSubtotal.toFixed(2)}
                </Typography>
              </Box>
              <ChevronRightIcon sx={{ color: '#ffffff', fontSize: 22 }} />
            </Box>
          </Box>
        )}

        {/* ════════════════════════════════════════════════════════════════════════════════
            4. PRODUCT DETAIL BOTTOM SHEET (PDP Modal - Matching Screen 5)
           ════════════════════════════════════════════════════════════════════════════════ */}
        <Drawer
          anchor="bottom"
          open={Boolean(selectedProductDetails)}
          onClose={() => setSelectedProductDetails(null)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              bgcolor: '#ffffff',
              maxHeight: '90vh',
              maxWidth: 580,
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          {selectedProductDetails && (
            <>
              {/* Top grab bar & actions */}
              <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mt: 1.5, mb: 1 }} />
              <Box sx={{ px: 2.5, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IconButton size="small" onClick={() => setSelectedProductDetails(null)}>
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => toggleWishlist(selectedProductDetails.id)}>
                    {wishlist[selectedProductDetails.id] ? <FavoriteIcon sx={{ color: '#ef4444', fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ fontSize: 20 }} />}
                  </IconButton>
                  <IconButton size="small">
                    <ShareIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Stack>
              </Box>

              {/* Scrollable content */}
              <Box sx={{ px: 3, py: 1, overflowY: 'auto', flexGrow: 1 }}>
                {/* Large Product Photo */}
                <Box sx={{ bgcolor: '#f8fafc', borderRadius: '20px', p: 3, textAlign: 'center', mb: 2.5 }}>
                  <Box
                    component="img"
                    src={selectedProductDetails.image}
                    alt={selectedProductDetails.title}
                    sx={{ maxHeight: 220, maxWidth: '100%', objectFit: 'contain', mx: 'auto' }}
                  />
                </Box>

                {/* Delivery Badge */}
                <Typography sx={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800, mb: 0.5 }}>
                  ⚡ Delivering in {selectedProductDetails.deliveryMins}
                </Typography>

                {/* Title & Pack Size */}
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25, mb: 0.5 }}>
                  {selectedProductDetails.title}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700, mb: 1.5 }}>
                  {selectedProductDetails.packSize}
                </Typography>

                {/* Price Row */}
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
                    ₹{selectedProductDetails.price}
                  </Typography>
                  {selectedProductDetails.mrp > selectedProductDetails.price && (
                    <Typography sx={{ fontSize: '0.88rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                      MRP ₹{selectedProductDetails.mrp}
                    </Typography>
                  )}
                  <Chip
                    label="Inclusive of all taxes"
                    size="small"
                    sx={{ fontSize: '0.65rem', fontWeight: 800, bgcolor: '#f1f5f9' }}
                  />
                </Stack>

                {/* 48 hours replacement guarantee matching Screen 5 */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2.5,
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <ShieldIcon sx={{ color: '#059669', fontSize: 22 }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                      48 hours replacement guarantee
                    </Typography>
                  </Stack>
                  <ChevronRightIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                </Box>

                {/* Description */}
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  Product Details
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, mb: 3 }}>
                  {selectedProductDetails.description}
                </Typography>
              </Box>

              {/* Sticky Bottom Bar */}
              <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#ffffff' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                      {selectedProductDetails.packSize}
                    </Typography>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                      ₹{selectedProductDetails.price}
                    </Typography>
                  </Box>

                  {getProductQtyInCart(selectedProductDetails.id) === 0 ? (
                    <Button
                      variant="contained"
                      onClick={() => handleAddToCart(selectedProductDetails)}
                      sx={{
                        bgcolor: '#16a34a',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        px: 4,
                        py: 1.25,
                        borderRadius: '14px',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                        '&:hover': { bgcolor: '#15803d' },
                      }}
                    >
                      Add to cart
                    </Button>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: '#16a34a',
                        color: '#ffffff',
                        borderRadius: '14px',
                        px: 1.5,
                        py: 0.75,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleDecrementCart(selectedProductDetails.id)}
                        sx={{ color: '#ffffff' }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ fontWeight: 900, fontSize: '1rem', px: 2 }}>
                        {getProductQtyInCart(selectedProductDetails.id)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleAddToCart(selectedProductDetails)}
                        sx={{ color: '#ffffff' }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </Drawer>



        {/* ════════════════════════════════════════════════════════════════════════════════
            6. MASTER CATEGORY SELECTION BOTTOM DRAWER (Supports 100+ Categories)
           ════════════════════════════════════════════════════════════════════════════════ */}
        <Drawer
          anchor="bottom"
          open={categoryDrawerOpen}
          onClose={() => setCategoryDrawerOpen(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              bgcolor: '#ffffff',
              maxHeight: '90vh',
              maxWidth: 620,
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          {/* Drag Handle */}
          <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: '#cbd5e1', mx: 'auto', mt: 1.5, mb: 1 }} />

          {/* Drawer Header */}
          <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  All Categories ({allAvailableCategories.length})
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Select a category to browse wholesale products & subcategories
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setCategoryDrawerOpen(false)} sx={{ bgcolor: '#f8fafc' }}>
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>

            {/* Search Categories */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#f1f5f9',
                borderRadius: '12px',
                px: 1.5,
                py: 0.5,
              }}
            >
              <SearchIcon sx={{ color: '#64748b', fontSize: 20, mr: 1 }} />
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search across 100+ categories (e.g. Dairy, Fruits, Snacks, Mobiles)..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' },
                }}
              />
              {categorySearchQuery && (
                <IconButton size="small" onClick={() => setCategorySearchQuery('')} sx={{ p: 0.25 }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Categories Grid (Scrollable) */}
          <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
            <Grid container spacing={1.5}>
              {filteredMasterCategories.map((cat) => {
                const isSelected = cat.label.toLowerCase() === currentCategoryKey.toLowerCase();
                return (
                  <Grid item xs={4} sm={3} key={cat.label}>
                    <Box
                      onClick={() => {
                        handleSelectCategory(cat.label);
                        setCategorySearchQuery('');
                      }}
                      sx={{
                        p: 1.25,
                        borderRadius: '16px',
                        border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                        bgcolor: isSelected ? '#ecfdf5' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        boxShadow: isSelected ? '0 4px 12px rgba(5, 150, 105, 0.15)' : 'none',
                        '&:hover': {
                          borderColor: '#059669',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.12)',
                        },
                      }}
                    >
                      {cat.badge && (
                        <Chip
                          label={cat.badge}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -6,
                            height: 16,
                            fontSize: '0.58rem',
                            fontWeight: 900,
                            bgcolor: '#059669',
                            color: '#ffffff',
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          width: { xs: 52, sm: 60 },
                          height: { xs: 52, sm: 60 },
                          borderRadius: '14px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#f8fafc',
                          mb: 1,
                          mt: cat.badge ? 0.5 : 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={cat.image}
                          alt={cat.label}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';
                          }}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: { xs: '0.72rem', sm: '0.78rem' },
                          fontWeight: isSelected ? 900 : 700,
                          color: isSelected ? '#047857' : '#0f172a',
                          lineHeight: 1.2,
                          height: '2.4em',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {cat.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600, mt: 0.25 }}>
                        {cat.count || 'View items'}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Drawer>

        {/* Toast alert */}
        <Snackbar
          open={Boolean(toastMsg)}
          autoHideDuration={2500}
          onClose={() => setToastMsg("")}
          message={toastMsg}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </AppShell>
  );
}