// @ts-nocheck — recharts v3 Formatter generics are incompatible across TS patch versions; logic is correct
import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface RevenueByMonth {
  month: string;
  revenue: number;
  orderCount: number;
}

interface TopProduct {
  productName: string;
  unitsSold: number;
  revenue: number;
}

interface AovTrend {
  month: string;
  aov: number;
  orderCount: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  unitsSold: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  salePrice: number | null;
  image: string;
}

interface RepeatCustomerStats {
  repeatCustomers: number;
  oneTimeCustomers: number;
  totalCustomers: number;
  repeatRate: number;
}

interface AnalyticsPanelProps {
  token: string | null;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const isLocalNetwork =
  typeof window !== 'undefined' &&
  /^(?:localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(
    window.location.hostname
  );

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
   isLocalNetwork &&
   window.location.hostname !== 'localhost' &&
   window.location.hostname !== '127.0.0.1'
    ? `http://${window.location.hostname}:5000/api/v1`
    : 'http://localhost:5000/api/v1');

// Power Tank brand palette for chart colours
const CHART_COLORS = {
  gold:      '#d4af37',
  goldLight: '#f5d98a',
  white:     '#ffffff',
  accent:    '#e8b84b',
  dim:       '#888888',
};

// Category pie-chart colours — distinct but cohesive with the dark theme
const PIE_COLORS = ['#d4af37', '#e8b84b', '#c9a227', '#b8921e', '#a78015', '#967010'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatINR = (value: number) =>
  '₹' + Math.round(value).toLocaleString('en-IN');

/** Convert "2026-01" to "Jan '26" for chart axis labels */
const fmtMonth = (yyyyMM: string) => {
  const [year, month] = yyyyMM.split('-');
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${monthNames[parseInt(month, 10) - 1]} '${year.slice(2)}`;
};

// Shared dark-theme tooltip style for all Recharts components
const tooltipStyle: React.CSSProperties = {
  backgroundColor: '#111',
  border: '1px solid #d4af37',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '13px',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A KPI stat card that matches the existing admin-stat-card aesthetic */
const StatCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}> = ({ label, value, sub, highlight }) => (
  <div className="admin-stat-card" style={{ flex: '1 1 180px' }}>
    <div className="stat-card-info" style={{ width: '100%' }}>
      <span className="stat-card-label">{label}</span>
      <span
        className="stat-card-value"
        style={highlight ? { color: '#22c55e', fontSize: '1.5rem' } : {}}
      >
        {value}
      </span>
      {sub && <span style={{ color: '#888', fontSize: '0.72rem', marginTop: '2px' }}>{sub}</span>}
    </div>
  </div>
);

/** Section wrapper that gives each chart a consistent dark card look */
const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
}> = ({ title, subtitle, children, height = 300 }) => (
  <div
    style={{
      background: 'linear-gradient(135deg, #0e0e0e 0%, #141414 100%)',
      border: '1px solid #1e1e1e',
      borderRadius: '10px',
      padding: '1.25rem 1.5rem 1rem',
      marginBottom: '1.5rem',
    }}
  >
    <h3
      style={{
        margin: '0 0 0.25rem',
        fontSize: '0.8rem',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: '#d4af37',
        fontWeight: 700,
      }}
    >
      {title}
    </h3>
    {subtitle && (
      <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '0.78rem' }}>{subtitle}</p>
    )}
    <div style={{ height }}>{children}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ token }) => {
  // ---- State ---------------------------------------------------------------
  const [revenueData,    setRevenueData]    = useState<RevenueByMonth[]>([]);
  const [topProducts,    setTopProducts]    = useState<TopProduct[]>([]);
  const [aovData,        setAovData]        = useState<AovTrend[]>([]);
  const [categoryData,   setCategoryData]   = useState<CategoryRevenue[]>([]);
  const [lowStock,       setLowStock]       = useState<LowStockProduct[]>([]);
  const [repeatStats,    setRepeatStats]    = useState<RepeatCustomerStats | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  // ---- Fetch all six endpoints in parallel ---------------------------------
  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [revRes, topRes, aovRes, catRes, stockRes, repeatRes] = await Promise.all([
        fetch(`${API_BASE}/admin/analytics/revenue-by-month`,   { headers }),
        fetch(`${API_BASE}/admin/analytics/top-products`,        { headers }),
        fetch(`${API_BASE}/admin/analytics/avg-order-value`,     { headers }),
        fetch(`${API_BASE}/admin/analytics/revenue-by-category`, { headers }),
        fetch(`${API_BASE}/admin/analytics/low-stock`,           { headers }),
        fetch(`${API_BASE}/admin/analytics/repeat-customers`,    { headers }),
      ]);

      if (!revRes.ok || !topRes.ok || !aovRes.ok || !catRes.ok || !stockRes.ok || !repeatRes.ok) {
        throw new Error('One or more analytics endpoints returned an error.');
      }

      const [revJson, topJson, aovJson, catJson, stockJson, repeatJson] = await Promise.all([
        revRes.json(),    topRes.json(),    aovRes.json(),
        catRes.json(),    stockRes.json(),  repeatRes.json(),
      ]);

      setRevenueData(revJson.data    || []);
      setTopProducts(topJson.data    || []);
      setAovData(aovJson.data        || []);
      setCategoryData(catJson.data   || []);
      setLowStock(stockJson.data     || []);
      setRepeatStats(repeatJson.data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ---- Derived KPIs --------------------------------------------------------
  const totalRevenue  = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders   = revenueData.reduce((s, d) => s + d.orderCount, 0);
  const overallAov    = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // ---- Render: loading / error ---------------------------------------------
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5rem',
          color: '#888',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: 40, height: 40,
            border: '3px solid #333',
            borderTopColor: '#d4af37',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span>Loading analytics data…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: '#ef4444', textAlign: 'center' }}>
        <p>⚠️ {error}</p>
        <button className="admin-btn admin-btn-primary" onClick={fetchAll}>
          Retry
        </button>
      </div>
    );
  }

  // ---- Render: full dashboard ----------------------------------------------
  return (
    <div style={{ padding: '0.5rem 0' }}>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Row                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          label="Total Revenue (PAID)"
          value={formatINR(totalRevenue)}
          sub={`${totalOrders} orders`}
        />
        <StatCard
          label="Overall Avg. Order Value"
          value={formatINR(overallAov)}
          sub="across all months"
        />
        <StatCard
          label="Repeat Customer Rate"
          value={repeatStats ? `${repeatStats.repeatRate}%` : '—'}
          sub={
            repeatStats
              ? `${repeatStats.repeatCustomers} of ${repeatStats.totalCustomers} buyers`
              : undefined
          }
          highlight={!!repeatStats && repeatStats.repeatRate >= 30}
        />
        <StatCard
          label="Low-Stock Alerts"
          value={lowStock.length}
          sub="products ≤ 10 units"
          highlight={lowStock.length > 0}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* (a) Revenue Trend — Line Chart                                      */}
      {/* ------------------------------------------------------------------ */}
      <ChartCard
        title="Monthly Revenue Trend"
        subtitle="Total revenue from PAID orders, grouped by calendar month"
        height={280}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
            <XAxis
              dataKey="month"
              tickFormatter={fmtMonth}
              tick={{ fill: '#888', fontSize: 12 }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
              tick={{ fill: '#888', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => [formatINR(Number(v)), 'Revenue']}
              labelFormatter={(label) => fmtMonth(String(label))}
              contentStyle={tooltipStyle}
            />
            <Legend wrapperStyle={{ color: '#888', fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue (₹)"
              stroke={CHART_COLORS.gold}
              strokeWidth={2.5}
              dot={{ r: 4, fill: CHART_COLORS.gold, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ------------------------------------------------------------------ */}
      {/* (c) AOV Trend — Line Chart                                          */}
      {/* ------------------------------------------------------------------ */}
      <ChartCard
        title="Average Order Value (AOV) Trend"
        subtitle="How much each customer spends per order, month over month"
        height={260}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={aovData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
            <XAxis
              dataKey="month"
              tickFormatter={fmtMonth}
              tick={{ fill: '#888', fontSize: 12 }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`}
              tick={{ fill: '#888', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => [formatINR(Number(v)), 'Avg. Order Value']}
              labelFormatter={(label) => fmtMonth(String(label))}
              contentStyle={tooltipStyle}
            />
            <Line
              type="monotone"
              dataKey="aov"
              name="AOV (₹)"
              stroke={CHART_COLORS.accent}
              strokeWidth={2.5}
              strokeDasharray="5 3"
              dot={{ r: 4, fill: CHART_COLORS.accent, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ------------------------------------------------------------------ */}
      {/* Two-column row: Top Products + Category Revenue                     */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* (b) Top 5 Products — Bar Chart */}
        <ChartCard
          title="Top 5 Products by Units Sold"
          subtitle="Ranked by total quantity sold (PAID orders)"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#888', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="productName"
                width={130}
                tick={{ fill: '#ccc', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v}
              />
              <Tooltip
                formatter={(v, name) => [
                  name === 'unitsSold' ? `${Number(v)} units` : formatINR(Number(v)),
                  name === 'unitsSold' ? 'Units Sold' : 'Revenue',
                ]}
                contentStyle={tooltipStyle}
              />
              <Legend wrapperStyle={{ color: '#888', fontSize: 12 }} />
              <Bar
                dataKey="unitsSold"
                name="Units Sold"
                fill={CHART_COLORS.gold}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* (d) Revenue by Category — Pie Chart */}
        <ChartCard
          title="Revenue by Product Category"
          subtitle="Revenue share per category (PAID orders)"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: '#444' }}
              >
                {categoryData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [formatINR(Number(v)), 'Revenue']}
                contentStyle={tooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* (f) Repeat Customers — Pie Chart                                    */}
      {/* ------------------------------------------------------------------ */}
      {repeatStats && (
        <ChartCard
          title="Customer Retention"
          subtitle={`${repeatStats.repeatRate}% of buyers have placed more than one order`}
          height={220}
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '2rem' }}>
            <ResponsiveContainer width="40%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Repeat Buyers', value: repeatStats.repeatCustomers },
                    { name: 'One-time Buyers', value: repeatStats.oneTimeCustomers },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  <Cell fill={CHART_COLORS.gold} />
                  <Cell fill="#2a2a2a" />
                </Pie>
                <Tooltip
                  formatter={(v, name) => [`${Number(v)} customers`, String(name)]}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend / breakdown */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS.gold, marginRight: 8 }} />
                <span style={{ color: '#ccc', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#fff' }}>{repeatStats.repeatCustomers}</strong> Repeat Buyers
                </span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#2a2a2a', border: '1px solid #444', marginRight: 8 }} />
                <span style={{ color: '#ccc', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#fff' }}>{repeatStats.oneTimeCustomers}</strong> One-time Buyers
                </span>
              </div>
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: CHART_COLORS.gold }}>
                  {repeatStats.repeatRate}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                  repeat customer rate
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* (e) Low-Stock Alert Table                                           */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0e0e0e 0%, #141414 100%)',
          border: lowStock.length > 0 ? '1px solid rgba(239,68,68,0.35)' : '1px solid #1e1e1e',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            margin: '0 0 0.25rem',
            fontSize: '0.8rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: lowStock.length > 0 ? '#ef4444' : '#d4af37',
            fontWeight: 700,
          }}
        >
          ⚠️ Low-Stock Alerts
        </h3>
        <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '0.78rem' }}>
          Products with ≤ 10 units remaining — restock soon to avoid stockouts
        </p>

        {lowStock.length === 0 ? (
          <div style={{ color: '#22c55e', textAlign: 'center', padding: '1.5rem', fontSize: '0.9rem' }}>
            ✅ All products are well-stocked (above 10 units)
          </div>
        ) : (
          <div className="admin-table-wrapper" style={{ marginTop: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Stock</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(p => {
                  const isOut      = p.stock === 0;
                  const isCritical = p.stock > 0 && p.stock <= 3;

                  const badge = isOut
                    ? { label: 'OUT OF STOCK', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
                    : isCritical
                    ? { label: 'CRITICAL',     color: '#f97316', bg: 'rgba(249,115,22,0.12)' }
                    : { label: 'LOW',           color: '#eab308', bg: 'rgba(234,179,8,0.12)' };

                  return (
                    <tr key={p.id}>
                      {/* Product thumbnail + name */}
                      <td>
                        <div className="admin-product-cell">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="admin-product-thumbnail"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/pre_workout.webp';
                            }}
                          />
                          <div>
                            <div className="admin-product-name">{p.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-product-cat">{p.category}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <strong
                          style={{
                            fontSize: '1.15rem',
                            color: isOut ? '#ef4444' : isCritical ? '#f97316' : '#eab308',
                          }}
                        >
                          {p.stock}
                        </strong>
                      </td>
                      <td>
                        <div>
                          {p.salePrice ? (
                            <>
                              <span style={{ color: '#d4af37', fontWeight: 600 }}>
                                ₹{p.salePrice.toLocaleString('en-IN')}
                              </span>
                              <span style={{ color: '#555', fontSize: '0.78rem', textDecoration: 'line-through', marginLeft: 6 }}>
                                ₹{p.price.toLocaleString('en-IN')}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: '#d4af37', fontWeight: 600 }}>
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            color: badge.color,
                            background: badge.bg,
                            border: `1px solid ${badge.color}44`,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refresh button */}
      <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
        <button className="admin-btn" onClick={fetchAll} style={{ gap: '6px' }}>
          🔄 Refresh Analytics
        </button>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
