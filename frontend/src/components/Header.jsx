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
  background: #fff;
  color: #000;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 2px solid #000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
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
  color: #000;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 12px;
`;

const SearchContainer = styled.div`
  position: relative;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileSearchContainer = styled(SearchContainer)`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const SearchInput = styled.input`
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  width: 200px;
  color: #000;
  @media (max-width: 768px) {
    width: 150px;
  }
`;

const Suggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  color: #000;
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ddd;
  border-radius: 3px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
`;

const SuggestionItem = styled.li`
  padding: 5px 10px;
  cursor: pointer;
  &:hover { background: #f0f0f0; }
`;

const SuggestionType = styled.span`
  font-style: italic;
  color: #666;
  margin-left: 5px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
  padding: 4px;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: #000;
  text-decoration: none;
  &:hover { color: #007bff; }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #000;
  cursor: pointer;
  font-size: 1rem;
  &:hover { color: #007bff; }
  @media (max-width: 768px) {
    display: none;
  }
`;

const CartIcon = styled(Link)`
  font-size: 1.5rem;
  color: #000;
  text-decoration: none;
  position: relative;
  &:hover { color: #007bff; }
`;

const CartCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileMenu = styled.div.attrs({
  shouldForwardProp: (prop) => prop !== 'isOpen'
})`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: #fff;
  color: #000;
  padding: 1rem;
  display: ${props => (props.isOpen ? 'block' : 'none')};
  z-index: 999;
  border-top: 1px solid #ddd;
`;

const MobileMenuItem = styled(Link)`
  display: block;
  padding: 10px 0;
  color: #000;
  text-decoration: none;
  &:hover { color: #007bff; }
`;

const MobileLogoutButton = styled.button`
  display: block;
  padding: 10px 0;
  background: none;
  border: none;
  color: #000;
  text-align: left;
  cursor: pointer;
  &:hover { color: #007bff; }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  color: #000;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 250px;
  @media (max-width: 768px) {
    width: 200px;
  }
`;

const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  cursor: pointer;
  margin-bottom: 10px;
`;

const ProfileDetail = styled.p`
  margin: 5px 0;
  font-size: 0.9rem;
  color: #000;
`;

const UploadSection = styled.div`
  margin-top: 10px;
`;

const SaveButton = styled.button`
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  &:hover { background-color: #0056b3; }
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