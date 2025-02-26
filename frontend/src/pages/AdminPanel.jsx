import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`padding: 20px; max-width: 1200px; margin: 0 auto;`;
const Section = styled.section`margin-bottom: 30px;`;
const Form = styled.form`display: flex; flex-direction: column; gap: 10px; max-width: 400px;`;
const ErrorMessage = styled.p`color: red; font-size: 0.9rem;`;
const List = styled.ul`list-style: none; padding: 0;`;
const ListItem = styled.li`display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #ddd;`;

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'student' });
  const [newCourse, setNewCourse] = useState({ 
    title: '', 
    description: '', 
    instructorId: '', 
    thumbnail: null, 
    thumbnailUrl: '' // New field for URL
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const [userRes, courseRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setUsers(userRes.data);
      setCourses(courseRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.status === 404 ? 'API endpoint not found - check backend' : err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/users/register', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => [...prev, { ...newUser, id: res.data.userId }]);
      setNewUser({ username: '', email: '', password: '', role: 'student' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('description', newCourse.description);
      formData.append('instructorId', newCourse.instructorId);
      
      if (newCourse.thumbnailUrl) {
        await axios.head(newCourse.thumbnailUrl); // Basic accessibility check
        formData.append('thumbnailUrl', newCourse.thumbnailUrl);
      } else if (newCourse.thumbnail) {
        formData.append('thumbnail', newCourse.thumbnail);
      } else {
        throw new Error('Please provide either a thumbnail file or URL');
      }
  
      console.log('FormData:', [...formData.entries()]);
      
      const res = await axios.post('http://localhost:5000/api/courses', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setCourses((prev) => [...prev, { id: res.data.courseId, ...newCourse, thumbnail_url: newCourse.thumbnailUrl || 'pending' }]);
      setNewCourse({ title: '', description: '', instructorId: '', thumbnail: null, thumbnailUrl: '' });
      await fetchData();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };
  
  // In render:
  <List>
    {courses.map((course) => (
      <ListItem key={course.id}>
        {course.title} - Instructor ID: {course.instructorId}
        {course.thumbnail_url && (
          <img 
            src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:5000${course.thumbnail_url}`} 
            alt={course.title} 
            style={{ width: '50px', marginLeft: '10px' }} 
            onError={() => console.log(`Failed to load ${course.thumbnail_url}`)}
          />
        )}
      </ListItem>
    ))}
  </List>

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewCourse({ ...newCourse, thumbnail: file, thumbnailUrl: '' }); // Clear URL if file is selected
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setNewCourse({ ...newCourse, thumbnailUrl: url, thumbnail: null }); // Clear file if URL is entered
  };

  return (
    <Container>
      <h1>Admin Panel</h1>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {loading && <p>Loading...</p>}
      <Section>
        <h2>Add New User</h2>
        <Form onSubmit={handleAddUser}>
          <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required disabled={loading} />
          <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required disabled={loading} />
          <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required disabled={loading} />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} disabled={loading}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add User'}</button>
        </Form>
      </Section>
      <Section>
        <h2>Add New Course</h2>
        <Form onSubmit={handleAddCourse} encType="multipart/form-data">
          <input type="text" placeholder="Course Title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} required disabled={loading} />
          <textarea placeholder="Course Description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} required disabled={loading} />
          <input type="number" placeholder="Instructor ID" value={newCourse.instructorId} onChange={(e) => setNewCourse({ ...newCourse, instructorId: e.target.value })} required disabled={loading} />
          <input type="url" placeholder="Thumbnail URL (optional)" value={newCourse.thumbnailUrl} onChange={handleUrlChange} disabled={loading} />
          <input type="file" name="thumbnail" accept="image/jpeg,image/png" onChange={handleFileChange} disabled={loading || newCourse.thumbnailUrl} />
          {newCourse.thumbnail && !newCourse.thumbnailUrl && (
            <img src={URL.createObjectURL(newCourse.thumbnail)} alt="Thumbnail Preview" style={{ width: '100px', marginTop: '10px' }} />
          )}
          {newCourse.thumbnailUrl && (
            <img src={newCourse.thumbnailUrl} alt="Thumbnail Preview" style={{ width: '100px', marginTop: '10px' }} onError={() => setError('Invalid or inaccessible URL')} />
          )}
          <button type="submit" disabled={loading || (!newCourse.thumbnail && !newCourse.thumbnailUrl)}>
            {loading ? 'Uploading...' : 'Add Course'}
          </button>
        </Form>
      </Section>
      <Section>
        <h2>Existing Users</h2>
        <List>
          {users.map((user) => (
            <ListItem key={user.id}>
              {user.username} ({user.email}) - Role: {user.role}
            </ListItem>
          ))}
        </List>
      </Section>
      <Section>
        <h2>Existing Courses</h2>
        <List>
          {courses.map((course) => (
            <ListItem key={course.id}>
              {course.title} - Instructor ID: {course.instructorId}
              {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.title} style={{ width: '50px', marginLeft: '10px' }} />}
            </ListItem>
          ))}
        </List>
      </Section>
    </Container>
  );
};

export default AdminPanel;