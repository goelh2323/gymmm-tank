import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  image: string;
  category: string;
  goal: string;
  flavors: string;
  sizes: string;
  stock: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isHidden: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  coins: number;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  flavor: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: string;
  paymentStatus: string;
  fulfillment: string;
  subtotal: number;
  savings: number;
  total: number;
  promoCode: string | null;
  coinsRedeemed: number;
  coinsEarned: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface StoreContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (search: string) => void;
  category: string;
  setCategory: (category: string) => void;
  goal: string;
  setGoal: (goal: string) => void;
  token: string | null;
  adminUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProducts: () => Promise<void>;
  createProduct: (data: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, data: Omit<Product, 'id'>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  resetAndSeed: () => Promise<boolean>;
  tankMode: boolean;
  setTankMode: (mode: boolean) => void;

  // Customer Auth
  customerToken: string | null;
  customerUser: User | null;
  customerRegister: (name: string, email: string, password: string) => Promise<boolean>;
  customerLogin: (email: string, password: string) => Promise<boolean>;
  customerLogout: () => void;
  customerUpdateProfile: (name: string, email: string, password?: string) => Promise<boolean>;

  // Orders
  placeOrder: (orderPayload: any) => Promise<Order | null>;
  fetchAdminOrders: (cursorId?: string) => Promise<{ orders: Order[]; nextCursor: string | null; hasNextPage: boolean }>;
  updateOrderStatus: (orderId: string, statusPayload: { fulfillment?: string; paymentStatus?: string }) => Promise<boolean>;
  fetchCustomerOrders: () => Promise<Order[]>;
  fetchAdminUsers: () => Promise<User[]>;
  trackOrder: (orderId: string) => Promise<Order | null>;
  completedOrder: Order | null;
  setCompletedOrder: (order: Order | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [goal, setGoal] = useState('');
  const [tankMode, setTankMode] = useState(false);

  // Admin Auth States
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [adminUser, setAdminUser] = useState<User | null>(
    localStorage.getItem('adminUser') ? JSON.parse(localStorage.getItem('adminUser')!) : null
  );

  // Customer Auth States
  const [customerToken, setCustomerToken] = useState<string | null>(localStorage.getItem('customerToken'));
  const [customerUser, setCustomerUser] = useState<User | null>(
    localStorage.getItem('customerUser') ? JSON.parse(localStorage.getItem('customerUser')!) : null
  );

  // Completed Order state (for checkout receipt modal)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (goal) params.append('goal', goal);
      if (token) params.append('showHidden', 'true'); // Admins can see hidden products

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, goal, token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      setToken(data.token);
      setAdminUser(data.user);
      return true;
    } catch (err: any) {
      alert(err.message || 'Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setAdminUser(null);
  };

  const createProduct = async (data: Omit<Product, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create product');
      }

      await fetchProducts();
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  };

  const updateProduct = async (id: string, data: Omit<Product, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update product');
      }

      await fetchProducts();
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete product');
      }

      await fetchProducts();
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  };

  const resetAndSeed = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/admin/seed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to reset and seed database');
      }

      await fetchProducts();
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  };

  const customerRegister = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await res.json();
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      return true;
    } catch (err: any) {
      alert(err.message || 'Registration failed');
      return false;
    }
  };

  const customerLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      return true;
    } catch (err: any) {
      alert(err.message || 'Login failed');
      return false;
    }
  };

  const customerLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    setCustomerToken(null);
    setCustomerUser(null);
  };

  const customerUpdateProfile = async (name: string, email: string, password?: string): Promise<boolean> => {
    try {
      const payload: any = { name, email };
      if (password) payload.password = password;

      const res = await fetch(`${API_BASE}/auth/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await res.json();
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      setCustomerToken(data.token);
      setCustomerUser(data.user);
      return true;
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
      return false;
    }
  };

  const fetchCustomerProfile = async () => {
    if (!customerToken) return;
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('customerUser', JSON.stringify(data.user));
        setCustomerUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching customer profile:', err);
    }
  };

  const placeOrder = async (orderPayload: any): Promise<Order | null> => {
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (customerToken) {
        headers.Authorization = `Bearer ${customerToken}`;
      }
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const data = await res.json();
      
      // Refresh customer profile and points if logged in
      if (customerToken) {
        await fetchCustomerProfile();
      }
      
      // Refresh products (since stock is decremented)
      await fetchProducts();

      return data.order;
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
      return null;
    }
  };

  const fetchAdminOrders = async (cursorId?: string): Promise<{ orders: Order[]; nextCursor: string | null; hasNextPage: boolean }> => {
    try {
      const params = new URLSearchParams({ limit: '15' });
      if (cursorId) params.append('cursorId', cursorId);

      const res = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch admin orders');
      return await res.json(); // { orders, nextCursor, hasNextPage }
    } catch (err: any) {
      console.error(err.message);
      return { orders: [], nextCursor: null, hasNextPage: false };
    }
  };

  const fetchAdminUsers = async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch admin users');
      return await res.json();
    } catch (err: any) {
      console.error(err.message);
      return [];
    }
  };

  const updateOrderStatus = async (orderId: string, statusPayload: { fulfillment?: string; paymentStatus?: string }): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(statusPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update order status');
      }
      return true;
    } catch (err: any) {
      alert(err.message);
      return false;
    }
  };

  const fetchCustomerOrders = async (): Promise<Order[]> => {
    try {
      const res = await fetch(`${API_BASE}/auth/orders`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch order history');
      return await res.json();
    } catch (err: any) {
      console.error(err.message);
      return [];
    }
  };

  const trackOrder = async (orderId: string): Promise<Order | null> => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/track`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.order;
    } catch (err) {
      console.error('Track order error:', err);
      return null;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        loading,
        error,
        search,
        setSearch,
        category,
        setCategory,
        goal,
        setGoal,
        token,
        adminUser,
        login,
        logout,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        resetAndSeed,
        tankMode,
        setTankMode,
        customerToken,
        customerUser,
        customerRegister,
        customerLogin,
        customerLogout,
        customerUpdateProfile,
        placeOrder,
        fetchAdminOrders,
        updateOrderStatus,
        fetchCustomerOrders,
        fetchAdminUsers,
        trackOrder,
        completedOrder,
        setCompletedOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
