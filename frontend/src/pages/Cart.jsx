import React from 'react';
import { useCart } from '../context/CartContext';
import styled from 'styled-components';

const CartContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const CartTitle = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const CartList = styled.ul`
  list-style: none;
  padding: 0;
`;

const CartItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  gap: 10px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CourseImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
`;

const CourseDetails = styled.div`
  flex: 1;
  margin-left: 10px;
`;

const CourseTitle = styled.span`
  font-weight: bold;
`;

const RemoveButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
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
  const defaultImage = 'https://via.placeholder.com/50';

  if (isLoading) return <CartContainer><p>Loading cart...</p></CartContainer>;
  if (error) return <CartContainer><ErrorMessage>{error}</ErrorMessage></CartContainer>;

  return (
    <CartContainer>
      <CartTitle>Your Cart</CartTitle>
      {cart.length === 0 ? (
        <p>No items in cart yet. Start adding courses!</p>
      ) : (
        <CartList>
          {cart.map(item => (
            <CartItem key={item.course_id}>
              <CourseImage 
                src={item.thumbnail_url || defaultImage} 
                alt={item.title} 
                loading="lazy"
                onError={(e) => {
                  e.target.src = defaultImage;
                  console.log(`Failed to load image for ${item.title}`);
                }}
              />
              <CourseDetails>
                <CourseTitle>{item.title}</CourseTitle> - {item.category}
              </CourseDetails>
              <RemoveButton 
                onClick={() => removeFromCart(item.course_id)}
                aria-label={`Remove ${item.title} from cart`}
              >
                Remove
              </RemoveButton>
            </CartItem>
          ))}
        </CartList>
      )}
    </CartContainer>
  );
};

export default Cart;