import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  color: #1a1a1a;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileNav = styled.div`
  display: none;
  align-items: center;
  gap: 10px;
  @media (max-width: 768px) {
    display: flex;
  }
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  color: #1a1a1a;
  font-size: 1.8rem;
  cursor: pointer;
  padding-left: 0px;
  transition: color 0.3s ease, transform 0.3s ease;
  &:hover {
    color: #007bff;
    transform: scale(1.1);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex-grow: 1; /* Allows it to stretch */
  max-width: 700px; /* Wider on desktop, like Udemy */
  
  padding-right:60px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileSearchContainer = styled(SearchContainer)`
  display: none;
  @media (max-width: 768px) {
    display: block;
    // margin: 0 10px;
    width:80%;
    max-width: 150px; /* Adjusted for mobile */
  }
`;

const SearchInput = styled.input`
  padding: 12px 20px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 25px;
  width: 100%; /* Takes full container width */
  color: #1a1a1a;
  font-size: 1rem;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  &:focus {
    border-color: #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
    outline: none;
  }
  &::placeholder {
    color: #888;
    font-style: italic;
  }
  @media (max-width: 768px) {
    width: 100%;
    padding: 8px 15px;
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const Suggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  color: #1a1a1a;
  list-style: none;
  padding: 10px 0;
  margin: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: opacity 0.2s ease;
`;

const SuggestionItem = styled.li`
  padding: 8px 15px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s ease;
  &:hover { 
    background: #f5f7fa; 
    color: #007bff; 
  }
`;

const SuggestionType = styled.span`
  font-style: italic;
  color: #666;
  margin-left: 8px;
  font-size: 0.85rem;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
  padding: 4px;
  border: 2px solid #e9ecef;
  transition: transform 0.3s ease, border-color 0.3s ease;
  &:hover {
    transform: scale(1.05);
    border-color: #007bff;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`;

const NavLink = styled(Link)`
  color: #1a1a1a;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  &:hover { color: #007bff; }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #1a1a1a;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  &:hover { color: #007bff; }
  @media (max-width: 768px) {
    display: none;
  }
`;

const CartIcon = styled(Link)`
  font-size: 1.6rem;
  color: #1a1a1a;
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease, transform 0.3s ease;
  &:hover { 
    color: #007bff; 
    transform: scale(1.1); 
  }
`;

const CartCount = styled.span`
  position: absolute;
  top: -10px;
  right: -10px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const MobileMenu = styled.div.attrs({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #fff;
  color: #1a1a1a;
  padding: 1.5rem;
  display: ${props => (props.isOpen ? 'block' : 'none')};
  z-index: 999;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const MobileMenuItem = styled(Link)`
  display: block;
  padding: 12px 0;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  &:hover { color: #007bff; }
`;

const MobileLogoutButton = styled.button`
  display: block;
  padding: 12px 0;
  background: none;
  border: none;
  color: #1a1a1a;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.3s ease;
  &:hover { color: #007bff; }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  color: #1a1a1a;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 260px;
  transition: opacity 0.2s ease;
  @media (max-width: 768px) {
    width: 220px;
  }
`;

const ProfileImage = styled.img`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  cursor: pointer;
  margin-bottom: 15px;
  border: 2px solid #e9ecef;
  transition: transform 0.3s ease;
  &:hover { transform: scale(1.05); }
`;

const ProfileDetail = styled.p`
  margin: 8px 0;
  font-size: 0.95rem;
  color: #1a1a1a;
  font-weight: 400;
`;

const UploadSection = styled.div`
  margin-top: 15px;
`;

const SaveButton = styled.button`
  margin-top: 15px;
  padding: 8px 15px;
  background: linear-gradient(90deg, #007bff, #0056b3);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.3s ease, transform 0.3s ease;
  &:hover { 
    background: linear-gradient(90deg, #0056b3, #003d82);
    transform: scale(1.05);
  }
`;

const Header = () => {
  const { user, logout, updateProfileImage } = useContext(AuthContext);
  const { cart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const defaultAvatar = 'https://via.placeholder.com/40';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/courses');
        setCourses(res.data);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions([]);
      return;
    }
    const queryLower = searchQuery.toLowerCase();
    const titleMatches = courses
      .filter(course => course.title.toLowerCase().includes(queryLower))
      .map(course => ({ type: 'title', value: course.title, id: course.id }));
    const categoryMatches = [...new Set(courses
      .filter(course => course.category.toLowerCase().includes(queryLower))
      .map(course => course.category))]
      .map(category => ({ type: 'category', value: category }));
    const combinedSuggestions = [...titleMatches, ...categoryMatches].slice(0, 5);
    setSuggestions(combinedSuggestions);
  }, [searchQuery, courses]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}&type=any`);
      setSearchQuery('');
      setSuggestions([]);
      setMenuOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.value);
    navigate(`/?search=${encodeURIComponent(suggestion.value)}&type=${suggestion.type}`);
    setSuggestions([]);
    setMenuOpen(false);
  };

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
    setShowUpload(false);
    setNewImage(null);
    setError('');
    setMenuOpen(false);
  };

  const handleImageClick = () => {
    setShowUpload(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewImage(file);
  };

  const handleSaveImage = async () => {
    if (!newImage) return;
    const formData = new FormData();
    formData.append('profileImage', newImage);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateProfileImage(res.data.user.profile_image);
      setNewImage(null);
      setShowUpload(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile image');
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setShowDropdown(false);
  };

  return (
    <Nav>
      <NavLeft>
        <NavLink to="/">E-Learning</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </NavLeft>
      <SearchContainer>
        <form onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        {suggestions.length > 0 && (
          <Suggestions>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem 
                key={`${suggestion.type}-${suggestion.id || suggestion.value}-${index}`} 
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.value}
                <SuggestionType>({suggestion.type})</SuggestionType>
              </SuggestionItem>
            ))}
          </Suggestions>
        )}
      </SearchContainer>
      <MobileNav>
        <HamburgerButton onClick={toggleMenu}>☰</HamburgerButton>
        <MobileSearchContainer>
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          {suggestions.length > 0 && (
            <Suggestions>
              {suggestions.map((suggestion, index) => (
                <SuggestionItem 
                  key={`${suggestion.type}-${suggestion.id || suggestion.value}-${index}`} 
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.value}
                  <SuggestionType>({suggestion.type})</SuggestionType>
                </SuggestionItem>
              ))}
            </Suggestions>
          )}
        </MobileSearchContainer>
      </MobileNav>
      <NavRight>
        {user ? (
          <>
            <CartIcon to="/cart" aria-label="View Cart">
              🛒
              {cart.length > 0 && <CartCount>{cart.length}</CartCount>}
            </CartIcon>
            <Avatar 
              src={user.profile_image || defaultAvatar} 
              alt="User Avatar" 
              onClick={handleAvatarClick} 
            />
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            {showDropdown && (
              <Dropdown>
                {!showUpload ? (
                  <>
                    <ProfileImage 
                      src={user.profile_image || defaultAvatar} 
                      alt="Profile" 
                      onClick={handleImageClick} 
                    />
                    <ProfileDetail><strong>Name:</strong> {user.username}</ProfileDetail>
                    <ProfileDetail><strong>Email:</strong> {user.email}</ProfileDetail>
                  </>
                ) : (
                  <UploadSection>
                    <input type="file" accept="image/jpeg,image/png" onChange={handleImageChange} />
                    {newImage && (
                      <>
                        <img src={URL.createObjectURL(newImage)} alt="Preview" style={{ width: '80px', marginTop: '10px' }} />
                        <SaveButton onClick={handleSaveImage}>Save</SaveButton>
                      </>
                    )}
                    {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}
                  </UploadSection>
                )}
              </Dropdown>
            )}
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            {/* <NavLink to="/signup">Sign In</NavLink> */}
          </>
        )}
      </NavRight>
      <MobileMenu isOpen={menuOpen}>
        <MobileMenuItem to="/" onClick={() => setMenuOpen(false)}>E-Learning</MobileMenuItem>
        <MobileMenuItem to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileMenuItem>
        <MobileMenuItem to="/cart" onClick={() => setMenuOpen(false)}>Cart</MobileMenuItem>
        {user?.role === 'admin' && (
          <MobileMenuItem to="/admin" onClick={() => setMenuOpen(false)}>Admin Settings</MobileMenuItem>
        )}
        {user ? (
          <MobileLogoutButton onClick={handleLogout}>Logout</MobileLogoutButton>
        ) : (
          <MobileMenuItem to="/login" onClick={() => setMenuOpen(false)}>Login</MobileMenuItem>
        )}
      </MobileMenu>
    </Nav>
  );
};

export default Header;