import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { Search, User, ShoppingBag } from 'lucide-react';

interface StoreHeaderProps {
  currentView: 'store' | 'admin';
  setView: (view: 'store' | 'admin') => void;
  onOpenAuthModal: () => void;
  navigate?: (path: string) => void;
}

const getSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-+$)/g, '');

export const StoreHeader: React.FC<StoreHeaderProps> = ({ currentView, setView, onOpenAuthModal, navigate }) => {
  const { search, setSearch, products, customerUser } = useStore();
  const { totalCount, setIsOpen } = useCart();
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="store-header-v2">
      <div className="header-container-v2">
        {/* Left Side: Search Bar */}
        <div className="header-left">
          {currentView === 'store' ? (
            <div className="header-search-v2" ref={searchRef}>
              <Search className="search-icon-v2" size={22} />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
              />
              {search.trim() !== '' && isFocused && (
                <div className="search-dropdown-v2">
                  {products.length > 0 ? (
                    products.map((p) => {
                      const activePrice = p.salePrice ?? p.price;
                      return (
                        <div
                          key={p.id}
                          className="search-dropdown-item-v2"
                          onMouseDown={() => {
                            setSearch('');
                            setIsFocused(false);
                            if (navigate) {
                              navigate(`/products/${getSlug(p.name)}`);
                            }
                          }}
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="search-dropdown-item-img-v2"
                          />
                          <div className="search-dropdown-item-info-v2">
                            <div className="search-dropdown-item-name-v2">{p.name}</div>
                            <div className="search-dropdown-item-price-v2">
                              ₹{Math.round(activePrice).toLocaleString('en-IN')}
                              {p.salePrice && (
                                <span className="search-dropdown-item-original-price-v2">
                                  ₹{Math.round(p.price).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="search-dropdown-no-results-v2">Not found</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="header-admin-title">ADMIN CONTROL</div>
          )}
        </div>

        {/* Center: Brand Logo & Title */}
        <div className="header-center" onClick={() => setView('store')}>
          <img src="/images/logo.jpg" alt="Power Tank Nutrition Logo" className="brand-logo-img-v2" />
          <span className="brand-text-v2">
            <span className="brand-title-main">POWER TANK</span>
            <span className="brand-title-sub">NUTRITION</span>
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
