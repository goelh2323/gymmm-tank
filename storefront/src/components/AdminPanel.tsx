import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import type { Product, Order } from '../context/StoreContext';
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
  CheckCircle
} from 'lucide-react';

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
  } = useStore();

  // Dashboard Tabs & Orders Data States
  const [adminTab, setAdminTab] = useState<'products' | 'orders'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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
    const data = await fetchAdminOrders();
    setOrders(data);
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadOrders();
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
      ) : (
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
    </div>
  );
};
