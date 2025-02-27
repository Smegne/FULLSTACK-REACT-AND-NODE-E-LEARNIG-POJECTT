import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  position: relative;
`;

const Avatar = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
`;

const InfoBox = styled.div`
  position: fixed;
  top: 20%;
  right: 20px;
  width: 300px;
  padding: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const InfoAvatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
`;

const FileInput = styled.input`
  margin-top: 10px;
`;

const SaveButton = styled.button`
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const Profile = () => {
  const { user, updateProfileImage } = useContext(AuthContext);
  const [showInfo, setShowInfo] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState('');

  const defaultAvatar = 'https://via.placeholder.com/150'; // Default image if none set

  const handleAvatarClick = () => {
    setShowInfo(!showInfo);
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
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile image');
      console.error('Profile image update error:', err);
    }
  };

  return (
    <ProfileContainer>
      <Avatar 
        src={user?.profile_image || defaultAvatar} 
        alt="Profile Avatar" 
        onClick={handleAvatarClick} 
      />
      {showInfo && (
        <InfoBox>
          <InfoAvatar src={user?.profile_image || defaultAvatar} alt="Profile Avatar" />
          <p><strong>Name:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <FileInput type="file" accept="image/jpeg,image/png" onChange={handleImageChange} />
          {newImage && (
            <>
              <img src={URL.createObjectURL(newImage)} alt="New Avatar Preview" style={{ width: '100px', marginTop: '10px' }} />
              <SaveButton onClick={handleSaveImage}>Save Image</SaveButton>
            </>
          )}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </InfoBox>
      )}
    </ProfileContainer>
  );
};

export default Profile;