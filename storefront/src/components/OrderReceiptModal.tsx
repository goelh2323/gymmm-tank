import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { Order } from '../context/StoreContext';

interface OrderReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({ order, onClose }) => {
  const formatPrice = (num: number) => {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invoice-container scroll-reveal visible animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Stamp */}
        <div className="invoice-success-icon-wrap">
          <CheckCircle size={52} className="invoice-success-icon text-gold animate-pulse" />
        </div>
        
        <h2 className="invoice-title">POWER TANK RECEIPTS</h2>
        <p className="invoice-subtitle">DECLARED ANABOLIC TRANSACTION LOG</p>

        <div className="invoice-divider"></div>

        {/* Order Details Grid */}
        <div className="invoice-details-grid">
          <div className="invoice-row">
            <span className="text-muted">ORDER ID:</span>
            <span className="font-bold text-gold">{order.id}</span>
          </div>
          <div className="invoice-row">
            <span className="text-muted">DATE & TIME:</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="invoice-row">
            <span className="text-muted">PAYMENT METHOD:</span>
            <span className="font-bold">{order.paymentMethod} ({order.paymentStatus})</span>
          </div>
          <div className="invoice-row">
            <span className="text-muted">FULFILLMENT STATUS:</span>
            <span className="admin-table-badge badge-new" style={{ textTransform: 'uppercase' }}>
              {order.fulfillment}
            </span>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Delivery address details */}
        <div className="invoice-address-block">
          <h4>DELIVERY DESTINATION</h4>
          <div className="address-lines">
            <div><strong>{order.customerName}</strong></div>
            <div>{order.address}</div>
            <div>{order.city}, {order.state} - {order.pincode}</div>
            <div>Phone: {order.customerPhone}</div>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Items Summary Table */}
        <div className="invoice-items">
          <h4>CONSOLIDATED ORDER ITEMS</h4>
          <div className="invoice-items-list-wrap">
            {order.items.map((item) => (
              <div className="invoice-item-row" key={item.id}>
                <div className="invoice-item-left">
                  <span className="invoice-item-name">{item.productName}</span>
                  <span className="invoice-item-qty">x{item.quantity}</span>
                  <div className="text-muted invoice-item-flavor">
                    {item.flavor} | {item.size}
                  </div>
                </div>
                <span className="invoice-item-price-col">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Invoice Totals */}
        <div className="invoice-details">
          <div className="invoice-row">
            <span className="text-muted">Subtotal:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.savings > 0 && (
            <div className="invoice-row text-gold" style={{ color: 'var(--gold-primary)' }}>
              <span>Total Savings Applied:</span>
              <span>-{formatPrice(order.savings)}</span>
            </div>
          )}
          {order.coinsRedeemed > 0 && (
            <div className="invoice-row text-gold">
              <span>Coins Redeemed:</span>
              <span>-{order.coinsRedeemed} coins</span>
            </div>
          )}
          <div className="invoice-total-row">
            <span>Total Amount Charged:</span>
            <span className="text-gold font-bold">{formatPrice(order.total)}</span>
          </div>
          
          {order.coinsEarned > 0 && (
            <div className="invoice-coins-earned-box">
              🔥 <strong>+{order.coinsEarned}</strong> Loyalty Coins accrued to your profile.
            </div>
          )}
        </div>

        <div className="invoice-divider"></div>

        {/* Print Barcode Simulation */}
        <div className="invoice-barcode-wrapper">
          <svg className="barcode-svg" viewBox="0 0 100 20" width="100%" height="40">
            <rect width="100" height="20" fill="none" />
            {/* Simulated Barcode Lines */}
            <rect x="2" y="2" width="2" height="16" fill="#ffffff" />
            <rect x="5" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="7" y="2" width="3" height="16" fill="#ffffff" />
            <rect x="11" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="13" y="2" width="4" height="16" fill="#ffffff" />
            <rect x="18" y="2" width="2" height="16" fill="#ffffff" />
            <rect x="21" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="23" y="2" width="3" height="16" fill="#ffffff" />
            <rect x="27" y="2" width="2" height="16" fill="#ffffff" />
            <rect x="30" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="32" y="2" width="4" height="16" fill="#ffffff" />
            <rect x="37" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="39" y="2" width="2" height="16" fill="#ffffff" />
            <rect x="42" y="2" width="3" height="16" fill="#ffffff" />
            <rect x="46" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="48" y="2" width="2" height="16" fill="#ffffff" />
            <rect x="51" y="2" width="4" height="16" fill="#ffffff" />
            <rect x="56" y="2" width="2" height="16" fill="#ffffff" />
            <rect x="59" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="61" y="2" width="3" height="16" fill="#ffffff" />
            <rect x="65" y="2" width="2" height="16" fill="#ffffff" />
            <rect x="68" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="70" y="2" width="4" height="16" fill="#ffffff" />
            <rect x="75" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="77" y="2" width="2" height="16" fill="#ffffff" />
            <rect x="80" y="2" width="3" height="16" fill="#ffffff" />
            <rect x="84" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="86" y="2" width="4" height="16" fill="#ffffff" />
            <rect x="91" y="2" width="2" height="16" fill="#ffffff" />
            <rect x="94" y="2" width="1" height="16" fill="#ffffff" />
            <rect x="96" y="2" width="3" height="16" fill="#ffffff" />
          </svg>
          <span className="barcode-number">PTN-{order.id.substring(0, 8).toUpperCase()}</span>
        </div>

        <button className="invoice-close-btn" onClick={onClose}>
          Close & Print Invoice
        </button>
      </div>
    </div>
  );
};
