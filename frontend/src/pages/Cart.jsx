import React from 'react';
import { useCart } from '../context/CartContext';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CartContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
`;

const ItemDetails = styled.div`
  flex-grow: 1;
`;

const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
`;

const RemoveButton = styled.button`
  padding: 5px 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  &:hover { background-color: #c82333; }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const Cart = () => {
  const { cart, removeFromCart, isLoading, error } = useCart();

  const handleRemove = (courseId) => {
    removeFromCart(courseId);
    toast.success('Course removed from cart!', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  if (isLoading) return <p>Loading cart...</p>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (cart.length === 0) return <p>Your cart is empty.</p>;

  return (
    <CartContainer>
      <h1>Your Cart</h1>
      {cart.map(item => (
        <CartItem key={item.id}>
          <Thumbnail 
            src={item.thumbnail_url.startsWith('http') ? item.thumbnail_url : `http://localhost:5000${item.thumbnail_url}`} 
            alt={item.title} 
          />
          <ItemDetails>
            <h3>{item.title}</h3>
            <p>Category: {item.category}</p>
          </ItemDetails>
          <RemoveButton
            onClick={() => handleRemove(item.id)}
            onKeyPress={(e) => e.key === 'Enter' && handleRemove(item.id)}
            aria-label={`Remove ${item.title} from cart`}
          >
            Remove
          </RemoveButton>
        </CartItem>
      ))}
      <ToastContainer />
    </CartContainer>
  );
};

export default Cart;