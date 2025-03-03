import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoading(true);
        try {
          const res = await axios.get('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Normalize to use 'id' consistently
          const normalizedCart = res.data.map(item => ({
            id: item.course_id,
            title: item.title,
            thumbnail_url: item.thumbnail_url,
            category: item.category,
          }));
          setCart(normalizedCart);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch cart');
          console.error('Fetch cart error:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (err) {
            console.error('Failed to parse local cart:', err);
            setCart([]);
          }
        }
      }
    };
    fetchCart();
  }, []);

  // Sync localStorage for guests
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = async (course) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('http://localhost:5000/api/cart', { courseId: course.id }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(prev => prev.some(item => item.id === course.id) ? prev : [...prev, {
          id: course.id,
          title: course.title,
          thumbnail_url: course.thumbnail_url,
          category: course.category,
        }]);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to add to cart');
        console.error('Add to cart error:', err);
      }
    } else {
      setCart(prev => prev.some(item => item.id === course.id) ? prev : [...prev, course]);
    }
  };

  const removeFromCart = async (courseId) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.delete(`http://localhost:5000/api/cart/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(prev => prev.filter(item => item.id !== courseId));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to remove from cart');
        console.error('Remove from cart error:', err);
      }
    } else {
      setCart(prev => prev.filter(item => item.id !== courseId));
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, isLoading, error }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);