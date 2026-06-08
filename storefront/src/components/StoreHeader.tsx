import React from 'react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { Search, User, ShoppingBag } from 'lucide-react';

interface StoreHeaderProps {
  currentView: 'store' | 'admin';
  setView: (view: 'store' | 'admin') => void;
  onOpenAuthModal: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ currentView, setView, onOpenAuthModal }) => {
  const { search, setSearch, customerUser } = useStore();
  const { totalCount, setIsOpen } = useCart();

  return (
    <header className="store-header-v2">
      <div className="header-container-v2">
        {/* Left Side: Search Bar */}
        <div className="header-left">
          {currentView === 'store' ? (
            <div className="header-search-v2">
              <Search className="search-icon-v2" size={22} />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          ) : (
            <div className="header-admin-title">ADMIN CONTROL</div>
          )}
        </div>

        {/* Center: Brand Logo & Title */}
        <div className="header-center" onClick={() => setView('store')}>
          <img src="/images/logo.jpg" alt="GYMMM TANK Logo" className="brand-logo-img-v2" />
          <span className="brand-text-v2">
            <span className="brand-white">GYMMM</span>
            <span className="brand-gold">TANK</span>
          </span>
        </div>

        {/* Right Side: Account & Cart Icons */}
        <div className="header-right">
          <button 
            className={`account-icon-btn ${customerUser ? 'logged-in' : ''}`}
            onClick={onOpenAuthModal}
            title={customerUser ? `Welcome, ${customerUser.name}` : "My Account"}
          >
            <User size={26} />
            {customerUser && <span className="user-active-dot" />}
          </button>

          {currentView === 'store' && (
            <button 
              className="cart-icon-btn-v2" 
              onClick={() => setIsOpen(true)}
              title="Shopping Cart"
            >
              <ShoppingBag size={26} />
              {totalCount > 0 && <span className="cart-badge-v2">{totalCount}</span>}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
