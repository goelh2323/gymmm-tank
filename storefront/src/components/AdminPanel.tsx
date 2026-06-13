import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import type { Product, Order, User } from '../context/StoreContext';
import {
  Lock,
  Plus,
  RefreshCw,
  LogOut,
  Edit2,
  Trash2,
  AlertTriangle,
  EyeOff,
  Image as ImageIcon,
  X,
  TrendingUp,
  BarChart2,
  CheckCircle,
  Printer
} from 'lucide-react';

interface LabelPreset {
  id: string;
  name: string;
  width: number; // in mm
  height: number; // in mm
  tagline: string;
  flavor: string;
  netWt: string;
  mfgBy: string;
  directions: string;
  warnings: string;
  storage: string;
  keyFeatures: string[];
  nutrients: { name: string; amount: string; dv: string }[];
}

const labelPresets: LabelPreset[] = [
  {
    id: 'double-shot-pre-workout',
    name: 'DOUBLE SHOT PRE-WORKOUT',
    width: 280,
    height: 130,
    tagline: 'EXPLOSIVE PUMP & INSTANT PERFORMANCE SHOT',
    flavor: 'SOUR WATERMELON',
    netWt: '300G (30 SERVINGS)',
    mfgBy: 'Ripped Up Nutrition',
    directions: 'Mix 1 scoop (10g) in 250ml of cold water. Shake vigorously in a shaker for 20-30 seconds. Consume 15-30 minutes prior to intense workout sessions. Do not exceed 1 serving in any 24-hour period.',
    warnings: 'WARNING: Contains high caffeine (300mg/serving). Not recommended for children, pregnant or nursing women, or anyone sensitive to caffeine. Avoid taking with other stimulants. Consult your doctor before use.',
    storage: 'Store in a cool, dry place away from direct sunlight. Close lid tightly after every use. Mild clumping may occur due to hygroscopic ingredients (like Citrulline), which is normal and does not impact product quality.',
    keyFeatures: ['CLINICALLY DOSED L-CITRULLINE', 'EXPLOSIVE BETA-ALANINE RUNS', 'COGNITIVE FOCUS & VOLTAGE CAFFEINE'],
    nutrients: [
      { name: 'Calories', amount: '0 kcal', dv: '0%' },
      { name: 'Total Carbohydrates', amount: '0 g', dv: '0%' },
      { name: 'L-Citrulline Malate (2:1)', amount: '6000 mg', dv: '*' },
      { name: 'Beta-Alanine', amount: '3200 mg', dv: '*' },
      { name: 'Taurine', amount: '1000 mg', dv: '*' },
      { name: 'Caffeine Anhydrous', amount: '300 mg', dv: '*' },
      { name: 'Vitamin B12 (as Cyanocobalamin)', amount: '2.4 mcg', dv: '100%' }
    ]
  },
  {
    id: 'hyper-shot-pre-workout',
    name: 'HYPER SHOT PRE-WORKOUT',
    width: 280,
    height: 130,
    tagline: 'ANABOLIC VOLTAGE OVERLOAD & EXTREME STIM FLOW',
    flavor: 'FRUIT PUNCH',
    netWt: '300G (30 SERVINGS)',
    mfgBy: 'Ripped Up Nutrition',
    directions: 'Mix 1 scoop (10g) in 250-300ml of cold water. Shake well for 30 seconds. Drink 20-30 minutes before heavy lifting. Assess tolerance with a half scoop first.',
    warnings: 'EXTREME CAUTION: Extremely potent formula. Contains 400mg Caffeine. Do not consume if you suffer from heart conditions, high blood pressure, or thyroid disorders. Discontinue use immediately if nausea or tremors occur.',
    storage: 'Store below 25°C in a dry place. Keep container tightly sealed. Keep away from heat and moisture.',
    keyFeatures: ['ULTRA STIM CAFFEINE BLEND', 'VASCULAR PUMPS L-ARGININE', 'MIND-MUSCLE SYNERGY L-TYROSINE'],
    nutrients: [
      { name: 'Calories', amount: '5 kcal', dv: '<1%' },
      { name: 'Total Carbohydrates', amount: '1 g', dv: '<1%' },
      { name: 'Beta-Alanine', amount: '3200 mg', dv: '*' },
      { name: 'L-Arginine Alpha-Ketoglutarate', amount: '3000 mg', dv: '*' },
      { name: 'L-Tyrosine', amount: '1000 mg', dv: '*' },
      { name: 'Caffeine Anhydrous', amount: '400 mg', dv: '*' },
      { name: 'Vitamin B6 (as Pyridoxine HCl)', amount: '2 mg', dv: '118%' }
    ]
  },
  {
    id: 'citrulline-250g',
    name: 'PURE CITRULLINE MALATE',
    width: 280,
    height: 130,
    tagline: '100% PURE PHARMACEUTICAL GRADE VASODILATION PUMP',
    flavor: 'UNFLAVORED',
    netWt: '250G (125 SERVINGS)',
    mfgBy: 'Ripped Up Nutrition',
    directions: 'Mix 1 scoop (2g) in water, juice, or pre-workout shake. Consume twice daily, or 30 minutes prior to physical activity. Can be stacked with Creatine or BCAAs.',
    warnings: 'Consult a healthcare professional prior to use if you have a medical condition, or are taking nitrates or heart medications. Keep out of reach of children.',
    storage: 'Store in a cool, dry place. Replace cap immediately after use. Highly moisture sensitive.',
    keyFeatures: ['MAXIMUM NITRIC OXIDE BOOSTER', 'INCREASES MUSCULAR ENDURANCE', 'PROMOTES ULTRA DEEP PUMP'],
    nutrients: [
      { name: 'Calories', amount: '0 kcal', dv: '0%' },
      { name: 'L-Citrulline Malate (2:1)', amount: '2000 mg', dv: '*' }
    ]
  },
  {
    id: 'eaa-hydration',
    name: 'EAA + HYDRATION',
    width: 280,
    height: 130,
    tagline: 'INTRA-WORKOUT ESSENTIAL AMINO ACIDS & ELECTROLYTES',
    flavor: 'PINEAPPLE RUSH',
    netWt: '300G (30 SERVINGS)',
    mfgBy: 'Ripped Up Nutrition',
    directions: 'Mix 1 scoop (10g) in 300-400ml cold water. Sip throughout your workout or throughout the day on non-training days to support continuous protein synthesis.',
    warnings: 'For adult use only. Consult physician if pregnant, nursing, taking medication, or have a medical condition. Do not exceed recommended dosage.',
    storage: 'Store in cool, dry conditions. Close lid tightly to keep moisture out and prevent clumping.',
    keyFeatures: ['ALL 9 ESSENTIAL AMINO ACIDS', 'COCONUT WATER HYDRATION FUEL', 'CRITICAL MUSCLE REPAIR & RECOVERY'],
    nutrients: [
      { name: 'Calories', amount: '10 kcal', dv: '<1%' },
      { name: 'Total Carbohydrates', amount: '1 g', dv: '<1%' },
      { name: 'L-Leucine (BCAA)', amount: '3000 mg', dv: '*' },
      { name: 'L-Isoleucine (BCAA)', amount: '1500 mg', dv: '*' },
      { name: 'L-Valine (BCAA)', amount: '1500 mg', dv: '*' },
      { name: 'L-Lysine HCl', amount: '1000 mg', dv: '*' },
      { name: 'Coconut Water Powder', amount: '500 mg', dv: '*' },
      { name: 'Pink Himalayan Crystal Salt', amount: '100 mg', dv: '*' }
    ]
  },
  {
    id: 'impact-whey-1kg',
    name: '100% IMPACT WHEY ISOLATE (1 KG)',
    width: 400,
    height: 145,
    tagline: 'PREMIUM COLD-FILTERED WHEY PROTEIN ISOLATE',
    flavor: 'DOUBLE CHOCOLATE',
    netWt: '1 KG (30 SERVINGS)',
    mfgBy: 'Ripped Up Nutrition',
    directions: 'Mix 1 level scoop (33g) with 200-250ml of water or low-fat milk in a shaker cup. Shake for 25-30 seconds. Consume immediately post-workout or any time you need high-quality protein.',
    warnings: 'Contains milk and soy ingredients. Manufactured in a facility that also processes wheat, egg, and nuts. Not suitable for individuals with lactose intolerance.',
    storage: 'Keep bag zipped and store in a cool, dry place. Do not use if safety seal is broken.',
    keyFeatures: ['25G PURE PROTEIN PER SERVING', '5.5G NATURAL BCAAs TO RECOVERY', 'ZERO ADDED SUGAR & ULTRA LOW CARBS'],
    nutrients: [
      { name: 'Calories', amount: '120 kcal', dv: '6%' },
      { name: 'Protein (Dry Basis)', amount: '25 g', dv: '50%' },
      { name: 'Total Carbohydrates', amount: '1.5 g', dv: '<1%' },
      { name: 'Total Fat', amount: '1 g', dv: '1.2%' },
      { name: 'Dietary Fiber', amount: '0 g', dv: '0%' },
      { name: 'Sodium', amount: '120 mg', dv: '5%' },
      { name: 'Calcium', amount: '130 mg', dv: '10%' }
    ]
  },
  {
    id: 'impact-whey-2kg',
    name: '100% IMPACT WHEY ISOLATE (2 KG)',
    width: 580,
    height: 167,
    tagline: 'PREMIUM COLD-FILTERED WHEY PROTEIN ISOLATE',
    flavor: 'DOUBLE CHOCOLATE',
    netWt: '2 KG (60 SERVINGS)',
    mfgBy: 'Ripped Up Nutrition',
    directions: 'Mix 1 level scoop (33g) with 200-250ml of water or milk. Shake for 25-30 seconds. Consume post-workout or throughout the day as a high-protein supplement.',
    warnings: 'Contains milk and soy. Keep out of reach of children. Store in a cool, dark place.',
    storage: 'Keep bag closed. Avoid heat and moisture exposure. Keep out of direct sunlight.',
    keyFeatures: ['25G PURE PROTEIN PER SERVING', '5.5G NATURAL BCAAs TO RECOVERY', 'ZERO ADDED SUGAR & ULTRA LOW CARBS'],
    nutrients: [
      { name: 'Calories', amount: '120 kcal', dv: '6%' },
      { name: 'Protein (Dry Basis)', amount: '25 g', dv: '50%' },
      { name: 'Total Carbohydrates', amount: '1.5 g', dv: '<1%' },
      { name: 'Total Fat', amount: '1 g', dv: '1.2%' },
      { name: 'Dietary Fiber', amount: '0 g', dv: '0%' },
      { name: 'Sodium', amount: '120 mg', dv: '5%' },
      { name: 'Calcium', amount: '130 mg', dv: '10%' }
    ]
  },
  {
    id: 'mass-gainer-3kg',
    name: 'MASSIVE MASS GAINER (3 KG)',
    width: 580,
    height: 167,
    tagline: 'ULTRA-CLEAN HIGH CALORIE CARB & PROTEIN COMPLEX',
    flavor: 'DOUBLE CHOCOLATE',
    netWt: '3 KG (30 SERVINGS)',
    mfgBy: 'Ripped Up Nutrition',
    directions: 'Mix 3 scoops (100g) with 350ml of milk or water. For massive gains, consume 1 serving (3 scoops) twice daily, once in the morning and once immediately post-training.',
    warnings: 'Diabetics and individuals with blood sugar regulation disorders should consult a physician before using this product. Store out of reach of children.',
    storage: 'Store in a dry, ventilated box. Seal tight after use to maintain dry texture.',
    keyFeatures: ['1200 HIGH BULK CALORIES PER DAY', '50G SHOCK PROTEIN RECOVERY MATRIX', '3G CREATINE MONOHYDRATE POWER'],
    nutrients: [
      { name: 'Calories (Per 300g Daily Serv.)', amount: '1200 kcal', dv: '60%' },
      { name: 'Protein', amount: '50 g', dv: '100%' },
      { name: 'Total Carbohydrates', amount: '240 g', dv: '80%' },
      { name: 'Dietary Sugars', amount: '15 g', dv: '*' },
      { name: 'Total Fat', amount: '6 g', dv: '8%' },
      { name: 'Creatine Monohydrate', amount: '3000 mg', dv: '*' },
      { name: 'Digestive DigeZyme® Blend', amount: '150 mg', dv: '*' }
    ]
  }
];

export const AdminPanel: React.FC = () => {
  const {
    products,
    token,
    login,
    logout,
    createProduct,
    updateProduct,
    deleteProduct,
    resetAndSeed,
    fetchAdminOrders,
    updateOrderStatus,
    fetchAdminUsers,
  } = useStore();

  // Dashboard Tabs & Orders Data States
  const [adminTab, setAdminTab] = useState<'products' | 'orders' | 'users' | 'labels'>('products');
  const [selectedLabelPreset, setSelectedLabelPreset] = useState<string>('double-shot-pre-workout');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersNextCursor, setOrdersNextCursor] = useState<string | null>(null);
  const [ordersHasNextPage, setOrdersHasNextPage] = useState(false);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);

  // Label preview scaling ref, state, and resize listener
  const labelWrapperRef = React.useRef<HTMLDivElement>(null);
  const [labelScale, setLabelScale] = useState(1);

  useEffect(() => {
    if (adminTab !== 'labels' || !labelWrapperRef.current) return;
    const updateScale = () => {
      if (labelWrapperRef.current) {
        const width = labelWrapperRef.current.getBoundingClientRect().width;
        // Target canvas width is 1200px, add a bit of padding (48px)
        const newScale = Math.min(1, (width - 48) / 1200);
        setLabelScale(newScale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    const timer = setTimeout(updateScale, 100);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [adminTab, selectedLabelPreset]);


  // Auth local states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Modal / Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSalePrice, setFormSalePrice] = useState('');
  const [formCategory, setFormCategory] = useState('Whey Protein');
  const [formGoal, setFormGoal] = useState('Muscle Building');
  const [formFlavors, setFormFlavors] = useState('');
  const [formSizes, setFormSizes] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formImage, setFormImage] = useState('/images/pre_workout.png');
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(false);
  const [formIsHidden, setFormIsHidden] = useState(false);

  // Preset mockup list
  const presetImages = [
    { name: 'Default Logo', path: '/images/logo.jpg' },
    { name: 'Pre-Workout', path: '/images/pre_workout.png' },
    { name: 'Whey Protein', path: '/images/whey_protein.png' },
    { name: 'Creatine', path: '/images/creatine.png' },
    { name: 'EAA + BCAA', path: '/images/eaa_bcaa.png' },
    { name: 'Fat Burner', path: '/images/fat_burner.png' },
    { name: 'Mass Gainer', path: '/images/mass_gainer.png' }
  ];

  // ----------------------------------------------------
  // Orders Handling
  // ----------------------------------------------------
  const loadOrders = async () => {
    if (!token) return;
    setOrdersLoading(true);
    const result = await fetchAdminOrders(); // first page, no cursor
    setOrders(result.orders);
    setOrdersNextCursor(result.nextCursor);
    setOrdersHasNextPage(result.hasNextPage);
    setOrdersLoading(false);
  };

  // Appends the next page of orders to the existing list
  const loadMoreOrders = async () => {
    if (!ordersNextCursor || loadingMoreOrders) return;
    setLoadingMoreOrders(true);
    const result = await fetchAdminOrders(ordersNextCursor);
    setOrders(prev => [...prev, ...result.orders]);
    setOrdersNextCursor(result.nextCursor);
    setOrdersHasNextPage(result.hasNextPage);
    setLoadingMoreOrders(false);
  };

  // ----------------------------------------------------
  // Users Handling
  // ----------------------------------------------------
  const loadUsers = async () => {
    if (!token) return;
    setUsersLoading(true);
    const data = await fetchAdminUsers();
    setUsers(data);
    setUsersLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadOrders();
      if (adminTab === 'users') {
        loadUsers();
      }
    }
  }, [token, adminTab]);

  const handleUpdateStatus = async (orderId: string, fulfillment: string) => {
    const success = await updateOrderStatus(orderId, { fulfillment });
    if (success) {
      loadOrders();
    }
  };

  const handleUpdatePayment = async (orderId: string, paymentStatus: string) => {
    const success = await updateOrderStatus(orderId, { paymentStatus });
    if (success) {
      loadOrders();
    }
  };

  const handlePrintLabel = (preset: LabelPreset) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocker blocked the print window. Please allow popups for this site.');
      return;
    }

    const nutrientsRows = preset.nutrients.map(nut => `
      <tr class="${['calories', 'protein', 'total'].some(k => nut.name.toLowerCase().includes(k)) ? 'bold-row' : ''}">
        <td style="padding: 4px 0; border-bottom: 1px solid #333;">${nut.name}</td>
        <td style="text-align: right; font-weight: 600; padding: 4px 0; border-bottom: 1px solid #333;">${nut.amount} (${nut.dv})</td>
      </tr>
    `).join('');

    const highlightsHtml = preset.keyFeatures.map(feat => `
      <div class="highlight-tag">${feat}</div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label - ${preset.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;800&family=Roboto:wght@400;700&display=swap');
            
            body {
              margin: 0;
              padding: 0;
              background-color: #000000;
              color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: 'Roboto', sans-serif;
              box-sizing: border-box;
            }

            @page {
              size: ${preset.width}mm ${preset.height}mm;
              margin: 0;
            }

            @media print {
              html, body {
                background-color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                min-height: auto;
              }
              .label-print-canvas {
                width: ${preset.width}mm !important;
                height: ${preset.height}mm !important;
                border: none !important;
                box-shadow: none !important;
                margin: 0 !important;
                page-break-after: avoid;
              }
            }

            /* Container matching exact dimensions */
            .label-print-canvas {
              width: ${preset.width}mm;
              height: ${preset.height}mm;
              background-color: #050505;
              border: 1px solid #d4af37;
              box-sizing: border-box;
              display: grid;
              grid-template-columns: 27% 46% 27%;
              overflow: hidden;
              position: relative;
            }

            /* Separator lines for folds */
            .label-print-canvas::before {
              content: '';
              position: absolute;
              left: 27%;
              top: 0;
              bottom: 0;
              width: 1px;
              border-left: 1px dashed rgba(212, 175, 55, 0.25);
              pointer-events: none;
            }
            .label-print-canvas::after {
              content: '';
              position: absolute;
              right: 27%;
              top: 0;
              bottom: 0;
              width: 1px;
              border-left: 1px dashed rgba(212, 175, 55, 0.25);
              pointer-events: none;
            }

            .print-panel {
              height: 100%;
              padding: 6mm 4mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              overflow: hidden;
            }

            /* Left Panel Styles */
            .panel-left {
              border-right: 1px solid #1a1a1a;
            }
            .panel-section {
              margin-bottom: 2mm;
            }
            .panel-section h4 {
              margin: 0 0 0.5mm 0;
              font-family: 'Bebas Neue', sans-serif;
              font-size: 10pt;
              color: #d4af37;
              letter-spacing: 0.8px;
            }
            .panel-section p {
              margin: 0;
              font-size: 6.5pt;
              line-height: 1.3;
              color: #dddddd;
            }
            .panel-section p.warning-text {
              color: #ff4d4d;
              font-weight: bold;
            }

            .veg-badge-wrap {
              display: flex;
              align-items: center;
              gap: 1.5mm;
              margin-top: 1mm;
            }
            .veg-badge-icon {
              width: 3.5mm;
              height: 3.5mm;
              border: 1px solid #22c55e;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .veg-badge-icon::after {
              content: '';
              width: 1.8mm;
              height: 1.8mm;
              background-color: #22c55e;
              border-radius: 50%;
              display: block;
            }

            /* Middle Panel Styles */
            .panel-middle {
              align-items: center;
              justify-content: center;
              text-align: center;
              background: radial-gradient(circle at center, #111 0%, #030303 100%);
              position: relative;
            }
            .label-logo-img {
              width: 14mm;
              height: auto;
              margin-bottom: 2mm;
              border: 1.5px solid #d4af37;
              border-radius: 50%;
              background-color: #000;
            }
            .label-brand-heading {
              font-family: 'Bebas Neue', sans-serif;
              font-size: 22pt;
              letter-spacing: 3px;
              color: #ffffff;
              margin-bottom: 1mm;
            }
            .label-brand-heading span {
              color: #d4af37;
            }
            .label-product-title {
              font-family: 'Bebas Neue', sans-serif;
              font-size: 18pt;
              color: #ffffff;
              letter-spacing: 1px;
              margin-bottom: 1.5mm;
              text-shadow: 0 0 8px rgba(212,175,55,0.4);
            }
            .label-product-tagline {
              font-size: 6.5pt;
              font-weight: 600;
              color: #888888;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin-bottom: 3mm;
            }
            .label-highlights-row {
              display: flex;
              flex-wrap: wrap;
              gap: 1.2mm;
              justify-content: center;
              margin-bottom: 3mm;
              max-width: 95%;
            }
            .highlight-tag {
              font-size: 5.5pt;
              font-weight: bold;
              background-color: #121212;
              color: #d4af37;
              border: 1px solid #d4af37;
              padding: 0.6mm 1.5mm;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .label-middle-footer {
              display: flex;
              width: 90%;
              justify-content: space-between;
              border-top: 1px solid #221c0e;
              padding-top: 2mm;
              margin-top: 2mm;
            }
            .label-middle-flavor, .label-middle-net {
              font-size: 7pt;
              font-weight: bold;
              text-transform: uppercase;
              color: #ffffff;
            }
            .label-middle-flavor {
              color: #d4af37;
            }

            /* Right Panel Styles */
            .panel-right {
              border-left: 1px solid #1a1a1a;
            }
            .supplement-facts-container {
              border: 1px solid #ffffff;
              padding: 1.5mm;
              display: flex;
              flex-direction: column;
            }
            .supplement-facts-container h3 {
              margin: 0 0 0.8mm 0;
              font-family: 'Montserrat', sans-serif;
              font-size: 9pt;
              font-weight: 800;
              text-transform: uppercase;
              border-bottom: 3px solid #ffffff;
              padding-bottom: 0.5mm;
            }
            .facts-servings {
              font-size: 6pt;
              font-weight: bold;
              margin-bottom: 1mm;
              border-bottom: 1px solid #ffffff;
              padding-bottom: 0.5mm;
            }
            .facts-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 6pt;
            }
            .facts-table th {
              border-bottom: 2px solid #ffffff;
              padding-bottom: 0.5mm;
              font-size: 6pt;
              font-weight: bold;
            }
            .facts-table tr.bold-row {
              font-weight: bold;
            }
            .facts-footer {
              font-size: 5pt;
              color: #aaaaaa;
              line-height: 1.2;
              margin-top: 1mm;
            }

            .label-barcode-section {
              display: flex;
              align-items: center;
              gap: 2mm;
              margin-top: 1.5mm;
            }
            .barcode-mockup {
              display: flex;
              height: 6mm;
              background-color: #ffffff;
              padding: 0.8mm 1.2mm;
              align-items: center;
            }
            .barcode-bar {
              height: 100%;
              background-color: #000;
              margin-right: 0.3mm;
            }
            .barcode-bar.b1 { width: 0.3mm; }
            .barcode-bar.b2 { width: 0.6mm; }
            .barcode-bar.b3 { width: 0.9mm; }
            
            .barcode-meta {
              font-size: 5pt;
              color: #888888;
              font-family: monospace;
              line-height: 1.1;
            }
          </style>
        </head>
        <body>
          <div class="label-print-canvas">
            <!-- Left Panel -->
            <div class="print-panel panel-left">
              <div class="panel-section">
                <h4>SUGGESTED USE</h4>
                <p>${preset.directions}</p>
              </div>
              <div class="panel-section">
                <h4>STORAGE GUIDELINES</h4>
                <p>${preset.storage}</p>
              </div>
              <div class="panel-section">
                <h4>WARNINGS</h4>
                <p class="warning-text">${preset.warnings}</p>
              </div>
              <div class="panel-footer-info">
                <div class="veg-badge-wrap">
                  <span class="veg-badge-icon"></span>
                  <span style="font-size: 6.5pt; font-weight: bold; color: #22c55e;">100% VEGETARIAN</span>
                </div>
                <div style="font-size: 6pt; color: #888; margin-top: 1mm;">
                  Manufactured by: <strong>${preset.mfgBy}</strong>
                </div>
              </div>
            </div>

            <!-- Middle Panel -->
            <div class="print-panel panel-middle">
              <img src="https://gymmm-tank.vercel.app/images/logo.png" alt="GYMMM TANK" class="label-logo-img" />
              <div class="label-brand-heading">
                <span>GYMMM</span> TANK
              </div>
              <div class="label-product-title">${preset.name.replace(/\s*\(\d+\s*KG\)/i, '')}</div>
              <div class="label-product-tagline">${preset.tagline}</div>
              
              <div class="label-highlights-row">
                ${highlightsHtml}
              </div>

              <div class="label-middle-footer">
                <div class="label-middle-flavor">FLAVOR: ${preset.flavor}</div>
                <div class="label-middle-net">${preset.netWt}</div>
              </div>
            </div>

            <!-- Right Panel -->
            <div class="print-panel panel-right">
              <div class="supplement-facts-container">
                <h3>Supplement Facts</h3>
                <div class="facts-servings">
                  ${preset.netWt.toLowerCase().includes('serving') 
                    ? preset.netWt.toUpperCase() 
                    : `NET WEIGHT: ${preset.netWt}`}
                </div>
                <table class="facts-table">
                  <thead>
                    <tr>
                      <th>Amount Per Serving</th>
                      <th style="text-align: right;">% DV</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${nutrientsRows}
                  </tbody>
                </table>
                <div class="facts-footer">
                  * Daily Value (DV) not established.<br />
                  Percent Daily Values are based on a 2,000 calorie diet.
                </div>
              </div>

              <div class="label-barcode-section">
                <div class="barcode-mockup">
                  <span class="barcode-bar b1"></span>
                  <span class="barcode-bar b2"></span>
                  <span class="barcode-bar b1"></span>
                  <span class="barcode-bar b3"></span>
                  <span class="barcode-bar b2"></span>
                  <span class="barcode-bar b1"></span>
                  <span class="barcode-bar b2"></span>
                  <span class="barcode-bar b3"></span>
                  <span class="barcode-bar b1"></span>
                  <span class="barcode-bar b2"></span>
                </div>
                <div class="barcode-meta">
                  <div>BATCH: GT${preset.id.substring(0, 3).toUpperCase()}-99A</div>
                  <div>MFG: 06/2026</div>
                  <div>EXP: 06/2028</div>
                </div>
              </div>
            </div>
          </div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ----------------------------------------------------
  // Form Actions
  // ----------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const success = await login(email, password);
    setAuthLoading(false);
    if (success) {
      setEmail('');
      setPassword('');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormSalePrice('');
    setFormCategory('Whey Protein');
    setFormGoal('Muscle Building');
    setFormFlavors('Chocolate, Vanilla, Coffee');
    setFormSizes('1 kg, 2 kg');
    setFormStock('10');
    setFormImage('/images/whey_protein.png');
    setFormIsBestSeller(false);
    setFormIsNewArrival(true);
    setFormIsHidden(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDesc(product.description);
    setFormPrice(product.price.toString());
    setFormSalePrice(product.salePrice ? product.salePrice.toString() : '');
    setFormCategory(product.category);
    setFormGoal(product.goal);
    setFormFlavors(product.flavors);
    setFormSizes(product.sizes);
    setFormStock(product.stock.toString());
    setFormImage(product.image);
    setFormIsBestSeller(product.isBestSeller);
    setFormIsNewArrival(product.isNewArrival);
    setFormIsHidden(product.isHidden);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formName.trim()) return alert('Name is required');
    if (!formDesc.trim()) return alert('Description is required');
    if (isNaN(Number(formPrice)) || Number(formPrice) <= 0) return alert('Price must be a valid positive number');
    if (formSalePrice && (isNaN(Number(formSalePrice)) || Number(formSalePrice) <= 0)) {
      return alert('Sale Price must be a valid positive number');
    }
    if (isNaN(Number(formStock)) || Number(formStock) < 0) return alert('Stock must be a non-negative number');

    const productPayload = {
      name: formName.trim(),
      description: formDesc.trim(),
      price: Number(formPrice),
      salePrice: formSalePrice ? Number(formSalePrice) : null,
      category: formCategory,
      goal: formGoal,
      flavors: formFlavors.trim() || 'Unflavored',
      sizes: formSizes.trim() || 'Standard',
      stock: Math.floor(Number(formStock)),
      image: formImage,
      isBestSeller: formIsBestSeller,
      isNewArrival: formIsNewArrival,
      isHidden: formIsHidden,
    };

    let success = false;
    if (editingProduct) {
      success = await updateProduct(editingProduct.id, productPayload);
    } else {
      success = await createProduct(productPayload);
    }

    if (success) {
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteProduct(id);
    }
  };

  const handleDbReset = async () => {
    if (
      window.confirm(
        'WARNING: This will delete any custom products and reset the database to default seed products. Continue?'
      )
    ) {
      const success = await resetAndSeed();
      if (success) {
        alert('Database successfully reset and seeded!');
      }
    }
  };

  // ----------------------------------------------------
  // Render: 1. Login Screen
  // ----------------------------------------------------
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-title-wrapper">
          <img src="/images/logo.jpg" alt="GYMMM TANK Logo" className="login-logo" />
          <h2>Admin Access Portal</h2>
          <p className="form-help-text">Enter credentials to manage GYMMM TANK inventory.</p>
        </div>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. admin@gymmmtank.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="checkout-btn" style={{ marginTop: '0.5rem' }} disabled={authLoading}>
            <Lock size={16} />
            {authLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="invoice-details" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
          <span className="text-gold">💡 Default Admin Credentials</span>
          <div style={{ marginTop: '0.2rem' }}>
            Email: <code>admin@gymmmtank.com</code> <br />
            Password: <code>admin123</code>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Render: 2. Admin Dashboard
  // ----------------------------------------------------
  const formatPrice = (num: number) => {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const lowStockCount = products.filter(p => p.stock <= 5 && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="admin-view-container">
      {/* Header Controls */}
      <div className="admin-header-area">
        <div className="admin-title-wrap">
          <h1>Product Inventory Dashboard</h1>
          <span className="admin-badge">Admin Mode</span>
        </div>

        <div className="admin-actions-bar">
          <button className="admin-btn admin-btn-warning" onClick={handleDbReset}>
            <RefreshCw size={14} />
            Reset & Seed DB
          </button>
          <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            Add Product
          </button>
          <button className="admin-btn" onClick={logout}>
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      {/* Top Stats Overview Section */}
      <div className="admin-stats-overview-grid">
        <div className="admin-stat-card">
          <div className="stat-card-icon-wrap">
            <TrendingUp size={20} className="text-gold" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Revenue</span>
            <span className="stat-card-value">{formatPrice(totalRevenue)}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon-wrap">
            <BarChart2 size={20} className="text-gold" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Orders Placed</span>
            <span className="stat-card-value">{totalOrdersCount}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon-wrap">
            <AlertTriangle size={20} className="text-gold" />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Low Stock Items</span>
            <span className="stat-card-value">{lowStockCount}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon-wrap" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <X size={20} style={{ color: 'var(--accent-red)' }} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Out of Stock</span>
            <span className="stat-card-value" style={{ color: 'var(--accent-red)' }}>{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Subtabs Selector */}
      <div className="admin-tabs-row">
        <button 
          className={`admin-tab-btn ${adminTab === 'products' ? 'active' : ''}`}
          onClick={() => setAdminTab('products')}
        >
          📁 Catalog Products ({products.length})
        </button>
        <button 
          className={`admin-tab-btn ${adminTab === 'orders' ? 'active' : ''}`}
          onClick={() => setAdminTab('orders')}
        >
          📦 Checkout Orders ({orders.length})
        </button>
        <button 
          className={`admin-tab-btn ${adminTab === 'users' ? 'active' : ''}`}
          onClick={() => setAdminTab('users')}
        >
          👥 Registered Customers ({users.length})
        </button>
        <button 
          className={`admin-tab-btn ${adminTab === 'labels' ? 'active' : ''}`}
          onClick={() => setAdminTab('labels')}
        >
          🏷️ Printable Labels
        </button>
      </div>

      {/* Main Tab Content */}
      {adminTab === 'products' ? (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th>Goal / Category</th>
                <th>Price (INR)</th>
                <th>Stock Status</th>
                <th>Badges</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '3rem', textAlign: 'center' }}>
                    No products found. Click 'Add Product' or 'Reset & Seed DB' to populate.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isLowStock = product.stock <= 5;
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <tr key={product.id} style={{ opacity: product.isHidden ? 0.6 : 1 }}>
                      {/* Thumbnail + Name */}
                      <td>
                        <div className="admin-product-cell">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="admin-product-thumbnail"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/pre_workout.png';
                            }}
                          />
                          <div>
                            <div className="admin-product-name">{product.name}</div>
                            <div className="admin-product-cat">{product.category}</div>
                          </div>
                        </div>
                      </td>

                      {/* Goal & Category */}
                      <td>
                        <div style={{ fontWeight: 500 }}>{product.goal}</div>
                      </td>

                      {/* Price & Sales */}
                      <td>
                        {product.salePrice ? (
                          <div>
                            <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>
                              {formatPrice(product.salePrice)}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '0.4rem' }}>
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontWeight: 600 }}>{formatPrice(product.price)}</div>
                        )}
                      </td>

                      {/* Stock level */}
                      <td>
                        {isOutOfStock ? (
                          <span className="admin-table-badge badge-low-stock">OUT OF STOCK</span>
                        ) : isLowStock ? (
                          <span className="admin-table-badge badge-low-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <AlertTriangle size={10} />
                            LOW STOCK ({product.stock})
                          </span>
                        ) : (
                          <span className="admin-table-badge badge-instock">IN STOCK ({product.stock})</span>
                        )}
                      </td>

                      {/* Badges indicators */}
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {product.isBestSeller && <span className="admin-table-badge badge-bestseller" style={{ fontSize: '0.65rem' }}>Best Seller</span>}
                          {product.isNewArrival && <span className="admin-table-badge badge-new" style={{ fontSize: '0.65rem' }}>New</span>}
                          {product.isHidden && (
                            <span className="admin-table-badge badge-hidden" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem' }}>
                              <EyeOff size={10} /> Hidden
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td>
                        <div className="admin-action-icons">
                          <button
                            className="admin-icon-btn admin-icon-btn-edit"
                            onClick={() => openEditModal(product)}
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="admin-icon-btn admin-icon-btn-delete"
                            onClick={() => handleDelete(product.id, product.name)}
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : adminTab === 'orders' ? (
        <div className="admin-table-wrapper">
          <table className="admin-table orders-table">
            <thead>
              <tr>
                <th>Order ID & Customer Details</th>
                <th>Delivery Address</th>
                <th>Purchased Items</th>
                <th>Order Amount</th>
                <th>Fulfillment & Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 2s linear infinite' }} />
                    <p style={{ marginTop: '0.5rem' }}>Loading Orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    No checkout submissions found. Complete orders in storefront first.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    {/* Order ID & Name */}
                    <td>
                      <div className="admin-order-id-txt">#{order.id.substring(0, 8).toUpperCase()}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }}>{order.customerName}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{order.customerEmail}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{order.customerPhone}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        🗓️ {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Address details */}
                    <td>
                      <div className="address-cell-text" title={order.address}>
                        <div>{order.address}</div>
                        <div>{order.city}, {order.state} - {order.pincode}</div>
                      </div>
                    </td>

                    {/* Items Purchased */}
                    <td>
                      <div className="admin-order-items-list">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="admin-order-item-row">
                            • <span className="item-name-bold">{item.productName}</span> 
                            <span className="text-gold"> (x{item.quantity})</span>
                            <div className="item-details-sub">{item.flavor} | {item.size}</div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Price totals */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>{formatPrice(order.total)}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Sub: {formatPrice(order.subtotal)}</div>
                      {order.savings > 0 && (
                        <div className="text-muted" style={{ fontSize: '0.7rem', color: '#10b981' }}>
                          Save: -{formatPrice(order.savings)}
                        </div>
                      )}
                      {order.coinsRedeemed > 0 && (
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                          Coins Redeemed: {order.coinsRedeemed}
                        </div>
                      )}
                    </td>

                    {/* Status badges */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {/* Fulfillment status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ship:</span>
                          <span className={`admin-table-badge ${
                            order.fulfillment === 'DELIVERED' 
                              ? 'badge-instock' 
                              : order.fulfillment === 'SHIPPED' 
                              ? 'badge-bestseller' 
                              : order.fulfillment === 'CANCELLED'
                              ? 'badge-low-stock'
                              : 'badge-low-stock'
                          }`}>
                            {order.fulfillment}
                          </span>
                        </div>
                        {/* Payment status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay:</span>
                          <span className={`admin-table-badge ${order.paymentStatus === 'PAID' ? 'badge-instock' : 'badge-low-stock'}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          💳 {order.paymentMethod}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {order.fulfillment === 'PENDING' && (
                          <button 
                            className="admin-btn admin-btn-primary" 
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', marginTop: 0 }}
                            onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                          >
                            🚚 Mark Shipped
                          </button>
                        )}
                        {order.fulfillment === 'SHIPPED' && (
                          <button 
                            className="admin-btn admin-btn-warning" 
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', marginTop: 0 }}
                            onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          >
                            ✅ Mark Delivered
                          </button>
                        )}
                        {order.paymentStatus === 'PENDING' && (
                          <button 
                            className="admin-btn" 
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', marginTop: 0, border: '1px solid var(--border-glass)' }}
                            onClick={() => handleUpdatePayment(order.id, 'PAID')}
                          >
                            💰 Mark Paid
                          </button>
                        )}
                        {order.fulfillment !== 'DELIVERED' && order.fulfillment !== 'CANCELLED' && (
                          <button 
                            className="admin-btn" 
                            style={{ 
                              padding: '0.3rem 0.5rem', 
                              fontSize: '0.75rem', 
                              marginTop: 0, 
                              backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                              color: 'var(--accent-red)', 
                              border: '1px solid var(--accent-red)' 
                            }}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to cancel order #${order.id.substring(0, 8).toUpperCase()}? This will restore stock levels.`)) {
                                handleUpdateStatus(order.id, 'CANCELLED');
                              }
                            }}
                          >
                            ❌ Cancel Order
                          </button>
                        )}
                        {order.fulfillment === 'CANCELLED' && (
                          <span style={{ color: 'var(--accent-red)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            ❌ Order Cancelled
                          </span>
                        )}
                        {order.fulfillment === 'DELIVERED' && order.paymentStatus === 'PAID' && (
                          <span style={{ color: '#10b981', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle size={12} /> Fulfillment Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Load More Orders button — shown when there are more pages */}
          {ordersHasNextPage && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0 0.5rem' }}>
              <button
                className="admin-btn admin-btn-primary"
                onClick={loadMoreOrders}
                disabled={loadingMoreOrders}
                style={{ minWidth: '180px', opacity: loadingMoreOrders ? 0.7 : 1 }}
              >
                {loadingMoreOrders ? '⏳ Loading...' : `⬇️ Load More Orders (${orders.length} loaded)`}
              </button>
            </div>
          )}
          {!ordersHasNextPage && orders.length > 0 && (
            <div style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              ✓ All {orders.length} orders loaded
            </div>
          )}
        </div>
      ) : adminTab === 'users' ? (
        <div className="admin-table-wrapper">
          <table className="admin-table users-table">
            <thead>
              <tr>
                <th>Customer Name & ID</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Coins Balance</th>
                <th>Join Date</th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw size={24} style={{ animation: 'spin 2s linear infinite' }} />
                    <p style={{ marginTop: '0.5rem' }}>Loading Customers...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                    No registered customers found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id}
                    onClick={() => setSelectedUserForModal(user)}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        ID: {user.id}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>{user.email}</div>
                    </td>
                    <td>
                      <span className={`admin-table-badge ${user.role === 'ADMIN' ? 'badge-bestseller' : 'badge-instock'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gold-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        🪙 {user.coins}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Printable Label designs dashboard view */
        <div className="admin-labels-tab-layout">
          {/* Sidebar */}
          <div className="admin-labels-sidebar">
            <h3 style={{ margin: '0 0 1rem 0', textTransform: 'uppercase', fontFamily: 'var(--font-display)', color: 'var(--gold-primary)', letterSpacing: '1px', fontSize: '1.25rem' }}>Label Presets</h3>
            <div className="admin-labels-presets-list">
              {labelPresets.map((preset) => (
                <button
                  key={preset.id}
                  className={`admin-labels-preset-btn ${selectedLabelPreset === preset.id ? 'active' : ''}`}
                  onClick={() => setSelectedLabelPreset(preset.id)}
                >
                  <div className="preset-btn-title">{preset.name}</div>
                  <div className="preset-btn-dim">{preset.width}mm x {preset.height}mm</div>
                </button>
              ))}
            </div>
          </div>

          {/* Central Preview Area */}
          {(() => {
            const preset = labelPresets.find(p => p.id === selectedLabelPreset) || labelPresets[0];
            const targetWidth = 1200;
            const targetHeight = (targetWidth * preset.height) / preset.width;
            const scaledHeight = targetHeight * labelScale;
            return (
              <div className="admin-labels-preview-panel">
                <div className="preview-panel-header">
                  <div className="preview-header-info">
                    <span className="info-title">{preset.name}</span>
                    <span className="info-dim">📐 Target Size: {preset.width}mm x {preset.height}mm</span>
                  </div>
                  <button
                    className="admin-btn admin-btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontWeight: 700 }}
                    onClick={() => handlePrintLabel(preset)}
                  >
                    <Printer size={16} />
                    Print Sticker Label
                  </button>
                </div>

                <div className="preview-instructions-alert">
                  💡 <strong>Sticker Print Tip:</strong> In the browser print dialog, set <strong>Margins</strong> to <em>None</em>, enable <strong>Background graphics</strong>, and set paper size to custom or match the target dimensions.
                </div>

                {/* Viewport label mockup container */}
                <div 
                  ref={labelWrapperRef}
                  className="label-viewport-wrapper"
                  style={{
                    height: `${scaledHeight + 32}px`,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    '--label-width': preset.width,
                    '--label-height': preset.height,
                    width: `${targetWidth}px`,
                    height: `${targetHeight}px`,
                    transform: `scale(${labelScale})`,
                    transformOrigin: 'center center',
                    flexShrink: 0
                  } as React.CSSProperties} className="label-visual-canvas">
                    {/* Left Panel */}
                    <div className="label-visual-panel panel-left">
                      <div className="panel-section">
                        <h4>SUGGESTED USE</h4>
                        <p>{preset.directions}</p>
                      </div>
                      <div className="panel-section">
                        <h4>STORAGE GUIDELINES</h4>
                        <p>{preset.storage}</p>
                      </div>
                      <div className="panel-section">
                        <h4>WARNINGS</h4>
                        <p className="warning-text">{preset.warnings}</p>
                      </div>
                      <div className="panel-footer-info">
                        <div className="veg-badge-wrap">
                          <span className="veg-badge-icon"></span>
                          <span style={{ fontSize: '10px', fontWeight: 700 }}>100% VEGETARIAN</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#888', marginTop: '0.4rem' }}>
                          Manufactured by: <strong>{preset.mfgBy}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Middle Panel */}
                    <div className="label-visual-panel panel-middle">
                      <img src="/images/logo.png" alt="GYMMM TANK" className="label-logo-img" />
                      <div className="label-brand-heading">
                        <span className="gold-txt">GYMMM</span> TANK
                      </div>
                      <div className="label-product-title">{preset.name.replace(/\s*\(\d+\s*KG\)/i, '')}</div>
                      <div className="label-product-tagline">{preset.tagline}</div>
                      
                      <div className="label-highlights-row">
                        {preset.keyFeatures.map((feat, idx) => (
                          <div key={idx} className="highlight-tag">{feat}</div>
                        ))}
                      </div>

                      <div className="label-middle-footer">
                        <div className="label-middle-flavor">FLAVOR: {preset.flavor}</div>
                        <div className="label-middle-net">{preset.netWt}</div>
                      </div>
                    </div>

                    {/* Right Panel */}
                    <div className="label-visual-panel panel-right">
                      <div className="supplement-facts-container">
                        <h3>Supplement Facts</h3>
                        <div className="facts-servings">
                          {preset.netWt.toLowerCase().includes('serving') 
                            ? preset.netWt.toUpperCase() 
                            : `NET WEIGHT: ${preset.netWt}`}
                        </div>
                        <table className="facts-table">
                          <thead>
                            <tr>
                              <th>Amount Per Serving</th>
                              <th style={{ textAlign: 'right' }}>% DV</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preset.nutrients.map((nut, idx) => (
                              <tr key={idx} className={nut.name.toUpperCase() === 'CALORIES' || nut.name.toUpperCase() === 'PROTEIN' || nut.name.toLowerCase().includes('total') ? 'bold-row' : ''}>
                                <td style={{ borderBottom: '1px solid #222', padding: '3px 0' }}>{nut.name}</td>
                                <td style={{ borderBottom: '1px solid #222', textAlign: 'right', fontWeight: 600, padding: '3px 0' }}>{nut.amount} ({nut.dv})</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="facts-footer">
                          * Daily Value (DV) not established.<br />
                          Percent Daily Values are based on a 2,000 calorie diet.
                        </div>
                      </div>

                      {/* Barcode & Batch Details */}
                      <div className="label-barcode-section">
                        <div className="barcode-mockup">
                          <span className="barcode-bar b1"></span>
                          <span className="barcode-bar b2"></span>
                          <span className="barcode-bar b1"></span>
                          <span className="barcode-bar b3"></span>
                          <span className="barcode-bar b2"></span>
                          <span className="barcode-bar b1"></span>
                          <span className="barcode-bar b2"></span>
                          <span className="barcode-bar b3"></span>
                          <span className="barcode-bar b1"></span>
                          <span className="barcode-bar b2"></span>
                        </div>
                        <div className="barcode-meta">
                          <div>BATCH: GT{preset.id.substring(0, 3).toUpperCase()}-99A</div>
                          <div>MFG: 06/2026</div>
                          <div>EXP: 06/2028</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. Add/Edit Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '620px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2 className="brand-text" style={{ fontSize: '1.3rem', animation: 'none' }}>
                {editingProduct ? 'Edit Supplement' : 'Add New Supplement'}
              </h2>
              <button
                className="cart-close-btn"
                onClick={() => setIsModalOpen(false)}
                style={{ width: '28px', height: '28px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. DOUBLE SHOT PRE-WORKOUT"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description & specs</label>
                <textarea
                  placeholder="Describe benefits, main ingredients, and servings amount..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    <option value="Whey Protein">Whey Protein</option>
                    <option value="Creatine">Creatine</option>
                    <option value="Pre-workout">Pre-workout</option>
                    <option value="EAA + BCAA">EAA + BCAA</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Mass Gainer">Mass Gainer</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Goal Filter</label>
                  <select value={formGoal} onChange={(e) => setFormGoal(e.target.value)}>
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Recovery">Recovery</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Standard Price (₹)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="2999"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Discounted Price (₹) (Optional)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="2499"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Flavors (comma-separated list)</label>
                  <input
                    type="text"
                    placeholder="e.g. Chocolate, Vanilla, Strawberry"
                    value={formFlavors}
                    onChange={(e) => setFormFlavors(e.target.value)}
                    required
                  />
                  <span className="form-help-text">Type names separated by commas.</span>
                </div>

                <div className="form-group">
                  <label>Sizes / Weights (comma-separated list)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 kg, 2 kg, 30 Servings"
                    value={formSizes}
                    onChange={(e) => setFormSizes(e.target.value)}
                    required
                  />
                  <span className="form-help-text">Type sizes/weights separated by commas.</span>
                </div>
              </div>

              {/* Stock and Image inputs */}
              <div className="form-row">
                <div className="form-group">
                  <label>Inventory Stock Count</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Product Image URL</label>
                  <input
                    type="text"
                    placeholder="URL to online image"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Preset Stock Mockup Images Gallery */}
              <div className="form-group">
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={14} />
                  Choose Pre-uploaded Mockup
                </label>
                <div className="preset-images-grid">
                  {presetImages.map((img) => (
                    <div
                      key={img.path}
                      className={`preset-image-option ${formImage === img.path ? 'selected' : ''}`}
                      onClick={() => setFormImage(img.path)}
                      title={img.name}
                    >
                      <img src={img.path} alt={img.name} onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/pre_workout.png';
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Toggles */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginTop: '0.4rem',
                }}
              >
                <div
                  className={`toggle-switch-container ${formIsBestSeller ? 'active' : ''}`}
                  onClick={() => setFormIsBestSeller(!formIsBestSeller)}
                >
                  <div className="toggle-switch">
                    <div className="toggle-switch-thumb"></div>
                  </div>
                  <span>Best Seller</span>
                </div>

                <div
                  className={`toggle-switch-container ${formIsNewArrival ? 'active' : ''}`}
                  onClick={() => setFormIsNewArrival(!formIsNewArrival)}
                >
                  <div className="toggle-switch">
                    <div className="toggle-switch-thumb"></div>
                  </div>
                  <span>New Arrival</span>
                </div>

                <div
                  className={`toggle-switch-container ${formIsHidden ? 'active' : ''}`}
                  onClick={() => setFormIsHidden(!formIsHidden)}
                >
                  <div className="toggle-switch">
                    <div className="toggle-switch-thumb"></div>
                  </div>
                  <span>Hide Product</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="invoice-close-btn"
                  style={{ border: '1px solid var(--border-glass)', marginTop: 0 }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="checkout-btn"
                  style={{ marginTop: 0 }}
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Customer Details & Orders History Modal */}
      {selectedUserForModal && (
        <div className="modal-overlay" onClick={() => setSelectedUserForModal(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '850px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '0.8rem'
              }}
            >
              <h2 className="brand-text" style={{ fontSize: '1.4rem', animation: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👤 Customer Profile & Orders
              </h2>
              <button
                className="cart-close-btn"
                onClick={() => setSelectedUserForModal(null)}
                style={{ width: '28px', height: '28px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Details Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
              {/* Profile Card */}
              <div 
                style={{ 
                  backgroundColor: 'rgba(25, 25, 25, 0.5)', 
                  border: '1px solid var(--border-glass)', 
                  padding: '1.2rem', 
                  borderRadius: '6px' 
                }}
              >
                <h3 className="text-gold" style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-athletic)', textTransform: 'uppercase' }}>
                  Account Summary
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>FULL NAME</span>
                    <strong style={{ fontSize: '1rem' }}>{selectedUserForModal.name}</strong>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>EMAIL ADDRESS</span>
                    <span style={{ fontSize: '0.9rem' }}>{selectedUserForModal.email}</span>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>ACCOUNT ROLE</span>
                    <span 
                      className={`admin-table-badge ${selectedUserForModal.role === 'ADMIN' ? 'badge-bestseller' : 'badge-instock'}`}
                      style={{ marginTop: '0.2rem', display: 'inline-block' }}
                    >
                      {selectedUserForModal.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>TANK COINS BALANCE</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--gold-primary)' }}>🪙 {selectedUserForModal.coins}</strong>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>REGISTRATION DATE</span>
                    <span style={{ fontSize: '0.85rem' }}>
                      {selectedUserForModal.createdAt ? new Date(selectedUserForModal.createdAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>CUSTOMER DATABASE ID</span>
                    <code style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>{selectedUserForModal.id}</code>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-athletic)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Orders Log</span>
                  <span className="text-gold" style={{ fontSize: '0.85rem' }}>
                    ({orders.filter(o => o.userId === selectedUserForModal.id || o.customerEmail === selectedUserForModal.email).length} Orders)
                  </span>
                </h3>

                {orders.filter(o => o.userId === selectedUserForModal.id || o.customerEmail === selectedUserForModal.email).length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: '6px' }} className="text-muted">
                    No orders recorded for this customer account.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders
                      .filter(o => o.userId === selectedUserForModal.id || o.customerEmail === selectedUserForModal.email)
                      .map((order) => (
                        <div 
                          key={order.id}
                          style={{
                            border: '1px solid var(--border-glass)',
                            borderRadius: '6px',
                            padding: '1rem',
                            backgroundColor: 'rgba(20, 20, 20, 0.4)'
                          }}
                        >
                          {/* Order Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                            <div>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--gold-primary)' }}>
                                #{order.id.substring(0, 8).toUpperCase()}
                              </span>
                              <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.6rem' }}>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                              <span className={`admin-table-badge ${
                                order.fulfillment === 'DELIVERED' 
                                  ? 'badge-instock' 
                                  : order.fulfillment === 'SHIPPED' 
                                  ? 'badge-bestseller' 
                                  : order.fulfillment === 'CANCELLED'
                                  ? 'badge-low-stock'
                                  : 'badge-low-stock'
                              }`}>
                                {order.fulfillment}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>
                                  • <strong>{item.productName}</strong> <span className="text-gold">x{item.quantity}</span>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '0.6rem' }}>
                                    {item.flavor} | {item.size}
                                  </div>
                                </span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Total Info */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem', fontSize: '0.85rem' }}>
                            <span className="text-muted">Paid via {order.paymentMethod}</span>
                            <span>Total: <strong style={{ color: 'var(--gold-primary)' }}>{formatPrice(order.total)}</strong></span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
