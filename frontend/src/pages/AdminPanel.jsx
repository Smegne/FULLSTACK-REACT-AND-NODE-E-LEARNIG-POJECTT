import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`padding: 20px; max-width: 1200px; margin: 0 auto;`;
const Section = styled.section`margin-bottom: 30px;`;
const Form = styled.form`display: flex; flex-direction: column; gap: 10px; max-width: 400px;`;
const ErrorMessage = styled.p`color: red; font-size: 0.9rem;`;
const List = styled.ul`list-style: none; padding: 0;`;
const ListItem = styled.li`display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #ddd;`;
const Button = styled.button`padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; margin-left: 10px; &:hover { background-color: #0056b3; }`;
const DeleteButton = styled(Button)`background-color: #dc3545; &:hover { background-color: #c82333; }`;
const Spinner = styled.span`display: inline-block; width: 16px; height: 16px; border: 2px solid #007bff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
const Input = styled.input`padding: 10px; border: 1px solid #ccc; border-radius: 3px;`;
const Textarea = styled.textarea`padding: 10px; border: 1px solid #ccc; border-radius: 3px; min-height: 100px;`;

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'student' });
  const [newCourse, setNewCourse] = useState({ title: '', description: '', instructorId: '', thumbnail: null, thumbnailUrl: '', category: '' });
  const [editCourse, setEditCourse] = useState(null);
  const [newCarouselImage, setNewCarouselImage] = useState(null);
  const [editCarouselImage, setEditCarouselImage] = useState(null);
  const [newAssessment, setNewAssessment] = useState({ courseId: '', title: '', questions: [{ question_text: '', correct_answer: '' }] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Grade Four Tutorial', 'Grade Five Tutorial', 'Grade Six Tutorial', 
    'Grade Seven Tutorial', 'Grade Eight Tutorial', 'Grade Nine Tutorial', 
    'Grade Ten Tutorial', 'Grade Eleven Tutorial', 'Grade Twelve Tutorial', 
    'Web Development', 'App Development'
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
  
      const [userRes, courseRes, carouselRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/carousel')
      ]);
      setUsers(userRes.data);
      setCourses(courseRes.data);
      setCarouselImages(carouselRes.data.slice(0, 6));
    } catch (err) {
      setError(err.response?.status === 404 ? 'API endpoint not found - check backend' : err.message || 'Failed to load data');
      console.error('Fetch error:', err);
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
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/users/register', newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => [...prev, { ...newUser, id: res.data.userId }]);
      setNewUser({ username: '', email: '', password: '', role: 'student' });
    } catch (err) {
      setError(err.response?.status === 403 ? 'Admin access required' : err.response?.data?.error || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('description', newCourse.description);
      formData.append('instructorId', newCourse.instructorId);
      formData.append('category', newCourse.category);
      if (newCourse.thumbnailUrl) {
        await axios.head(newCourse.thumbnailUrl);
        formData.append('thumbnail_url', newCourse.thumbnailUrl);
      } else if (newCourse.thumbnail) {
        formData.append('thumbnail', newCourse.thumbnail);
      } else {
        throw new Error('Please provide either a thumbnail file or URL');
      }

      const res = await axios.post('http://localhost:5000/api/courses', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses((prev) => [...prev, { id: res.data.courseId, ...newCourse, thumbnail_url: newCourse.thumbnailUrl || 'pending' }]);
      setNewCourse({ title: '', description: '', instructorId: '', thumbnail: null, thumbnailUrl: '', category: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editCourse.title);
      formData.append('description', editCourse.description);
      formData.append('instructorId', editCourse.instructorId);
      formData.append('category', editCourse.category);
      if (editCourse.thumbnailUrl) {
        await axios.head(editCourse.thumbnailUrl);
        formData.append('thumbnail_url', editCourse.thumbnailUrl);
      } else if (editCourse.thumbnail) {
        formData.append('thumbnail', editCourse.thumbnail);
      } else {
        formData.append('thumbnail_url', editCourse.thumbnail_url || null);
      }

      await axios.put(`http://localhost:5000/api/courses/${editCourse.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditCourse(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarouselImage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', newCarouselImage);

      const res = await axios.post('http://localhost:5000/api/carousel', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCarouselImages((prev) => [...prev, { id: res.data.id, image_url: res.data.image_url }].slice(0, 6));
      setNewCarouselImage(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add carousel image');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCarouselImage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', editCarouselImage.image);

      await axios.put(`http://localhost:5000/api/carousel/${editCarouselImage.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditCarouselImage(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update carousel image');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCarouselImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this carousel image?')) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/carousel/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete carousel image');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditCourse({ ...editCourse, thumbnail: file, thumbnailUrl: '' });
      } else {
        setNewCourse({ ...newCourse, thumbnail: file, thumbnailUrl: '' });
      }
    }
  };

  const handleUrlChange = (e, isEdit = false) => {
    const url = e.target.value;
    if (isEdit) {
      setEditCourse({ ...editCourse, thumbnailUrl: url, thumbnail: null });
    } else {
      setNewCourse({ ...newCourse, thumbnailUrl: url, thumbnail: null });
    }
  };

  const handleCarouselFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditCarouselImage({ ...editCarouselImage, image: file });
      } else {
        setNewCarouselImage(file);
      }
    }
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/assessments', newAssessment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewAssessment({ courseId: '', title: '', questions: [{ question_text: '', correct_answer: '' }] });
      setError('Assessment added successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add assessment');
      console.error('Assessment submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setNewAssessment(prev => ({
      ...prev,
      questions: [...prev.questions, { question_text: '', correct_answer: '' }]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newAssessment.questions];
    updatedQuestions[index][field] = value;
    setNewAssessment({ ...newAssessment, questions: updatedQuestions });
  };

  const handleRemoveQuestion = (index) => {
    setNewAssessment(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  return (
    <Container>
      <h1>Admin Panel</h1>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {loading && <p><Spinner /> Loading...</p>}
      <Section>
        <h2>Add New User</h2>
        <Form onSubmit={handleAddUser}>
          <Input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required disabled={loading} />
          <Input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required disabled={loading} />
          <Input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required disabled={loading} />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} disabled={loading}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
          <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add User'}</Button>
        </Form>
      </Section>
      <Section>
        <h2>Add New Course</h2>
        <Form onSubmit={handleAddCourse} encType="multipart/form-data">
          <Input type="text" placeholder="Course Title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} required disabled={loading} />
          <Textarea placeholder="Course Description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} required disabled={loading} />
          <Input type="number" placeholder="Instructor ID" value={newCourse.instructorId} onChange={(e) => setNewCourse({ ...newCourse, instructorId: e.target.value })} required disabled={loading} />
          <select value={newCourse.category} onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })} required disabled={loading}>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Input type="url" placeholder="Thumbnail URL (optional)" value={newCourse.thumbnailUrl} onChange={handleUrlChange} disabled={loading} />
          <Input type="file" name="thumbnail" accept="image/jpeg,image/png" onChange={handleFileChange} disabled={loading || newCourse.thumbnailUrl} />
          {newCourse.thumbnail && !newCourse.thumbnailUrl && (
            <img src={URL.createObjectURL(newCourse.thumbnail)} alt="Thumbnail Preview" style={{ width: '100px', marginTop: '10px' }} />
          )}
          {newCourse.thumbnailUrl && (
            <img src={newCourse.thumbnailUrl} alt="Thumbnail Preview" style={{ width: '100px', marginTop: '10px' }} onError={() => setError('Invalid or inaccessible URL')} />
          )}
          <Button type="submit" disabled={loading || (!newCourse.thumbnail && !newCourse.thumbnailUrl)}>
            {loading ? 'Uploading...' : 'Add Course'}
          </Button>
        </Form>
      </Section>
      {editCourse && (
        <Section>
          <h2>Edit Course</h2>
          <Form onSubmit={handleEditCourse} encType="multipart/form-data">
            <Input type="text" placeholder="Course Title" value={editCourse.title} onChange={(e) => setEditCourse({ ...editCourse, title: e.target.value })} required disabled={loading} />
            <Textarea placeholder="Course Description" value={editCourse.description} onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })} required disabled={loading} />
            <Input type="number" placeholder="Instructor ID" value={editCourse.instructorId} onChange={(e) => setEditCourse({ ...editCourse, instructorId: e.target.value })} required disabled={loading} />
            <select value={editCourse.category} onChange={(e) => setEditCourse({ ...editCourse, category: e.target.value })} required disabled={loading}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Input type="url" placeholder="Thumbnail URL (optional)" value={editCourse.thumbnailUrl} onChange={(e) => handleUrlChange(e, true)} disabled={loading} />
            <Input type="file" name="thumbnail" accept="image/jpeg,image/png" onChange={(e) => handleFileChange(e, true)} disabled={loading || editCourse.thumbnailUrl} />
            {(editCourse.thumbnail || editCourse.thumbnailUrl || editCourse.thumbnail_url) && (
              <img 
                src={editCourse.thumbnail ? URL.createObjectURL(editCourse.thumbnail) : (editCourse.thumbnailUrl || editCourse.thumbnail_url)} 
                alt="Thumbnail Preview" 
                style={{ width: '100px', marginTop: '10px' }} 
              />
            )}
            <Button type="submit" disabled={loading}>Save Changes</Button>
            <Button type="button" onClick={() => setEditCourse(null)} disabled={loading}>Cancel</Button>
          </Form>
        </Section>
      )}
      <Section>
        <h2>Add Carousel Image</h2>
        <Form onSubmit={handleAddCarouselImage} encType="multipart/form-data">
          <Input type="file" name="image" accept="image/jpeg,image/png" onChange={(e) => handleCarouselFileChange(e)} required disabled={loading} />
          {newCarouselImage && (
            <img src={URL.createObjectURL(newCarouselImage)} alt="Preview" style={{ width: '100px', marginTop: '10px' }} />
          )}
          <Button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Add Image'}</Button>
        </Form>
      </Section>
      {editCarouselImage && (
        <Section>
          <h2>Edit Carousel Image</h2>
          <Form onSubmit={handleEditCarouselImage} encType="multipart/form-data">
            <Input type="file" name="image" accept="image/jpeg,image/png" onChange={(e) => handleCarouselFileChange(e, true)} required disabled={loading} />
            {editCarouselImage.image && (
              <img src={URL.createObjectURL(editCarouselImage.image)} alt="Preview" style={{ width: '100px', marginTop: '10px' }} />
            )}
            <Button type="submit" disabled={loading}>Save Changes</Button>
            <Button type="button" onClick={() => setEditCarouselImage(null)} disabled={loading}>Cancel</Button>
          </Form>
        </Section>
      )}
      <Section>
        <h2>Add Assessment Questions</h2>
        <Form onSubmit={handleAssessmentSubmit}>
          <Input
            type="text"
            placeholder="Course ID"
            value={newAssessment.courseId}
            onChange={(e) => setNewAssessment({ ...newAssessment, courseId: e.target.value })}
            required
            disabled={loading}
          />
          <Input
            type="text"
            placeholder="Assessment Title"
            value={newAssessment.title}
            onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
            required
            disabled={loading}
          />
          {newAssessment.questions.map((q, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <Textarea
                placeholder={`Question ${index + 1}`}
                value={q.question_text}
                onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                required
                disabled={loading}
              />
              <Input
                type="text"
                placeholder="Correct Answer"
                value={q.correct_answer}
                onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                required
                disabled={loading}
              />
              {newAssessment.questions.length > 1 && (
                <DeleteButton type="button" onClick={() => handleRemoveQuestion(index)} disabled={loading}>
                  Remove
                </DeleteButton>
              )}
            </div>
          ))}
          <Button type="button" onClick={handleAddQuestion} disabled={loading}>Add Question</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Assessment'}</Button>
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
              <span>
                {course.title} - Instructor ID: {course.instructorId} - Category: {course.category}
                {course.thumbnail_url && (
                  <img 
                    src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:5000${course.thumbnail_url}`} 
                    alt={course.title} 
                    style={{ width: '50px', marginLeft: '10px' }} 
                    onError={() => console.log(`Failed to load ${course.thumbnail_url}`)}
                  />
                )}
              </span>
              <div>
                <Button onClick={() => setEditCourse({ ...course, thumbnail: null, thumbnailUrl: course.thumbnail_url || '' })} disabled={loading}>Edit</Button>
                <DeleteButton onClick={() => handleDeleteCourse(course.id)} disabled={loading}>Delete</DeleteButton>
              </div>
            </ListItem>
          ))}
        </List>
      </Section>
      <Section>
        <h2>Carousel Images</h2>
        <List>
          {carouselImages.map((image) => (
            <ListItem key={image.id}>
              <span>
                <img src={image.image_url} alt="Carousel" style={{ width: '50px', marginRight: '10px' }} />
                ID: {image.id}
              </span>
              <div>
                <Button onClick={() => setEditCarouselImage({ id: image.id, image_url: image.image_url, image: null })} disabled={loading}>Edit</Button>
                <DeleteButton onClick={() => handleDeleteCarouselImage(image.id)} disabled={loading}>Delete</DeleteButton>
              </div>
            </ListItem>
          ))}
        </List>
      </Section>
    </Container>
  );
};

export default AdminPanel;