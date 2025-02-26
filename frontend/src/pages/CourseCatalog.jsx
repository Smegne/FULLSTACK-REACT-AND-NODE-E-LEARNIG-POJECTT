import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

// Styled components for a polished UI
const CatalogContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const CourseCard = styled.div`
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.02);
  }
`;

const CourseTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 10px;
`;

const CourseDescription = styled.p`
  color: #666;
  margin: 0 0 15px;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: auto;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for fetching

  // Fetch courses from backend
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
      setError('');
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Please log in to view courses'
          : err.response?.data?.error || 'Failed to load courses'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load courses on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <CatalogContainer>
      <h1>Course Catalog</h1>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p>No courses available yet.</p>
      ) : (
        <CourseGrid>
        {courses.map((course) => (
          <CourseCard key={course.id}>
            {course.thumbnail_url && (
              <Thumbnail 
                src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:5000${course.thumbnail_url}`} 
                alt={course.title} 
                onError={() => console.log(`Failed to load ${course.thumbnail_url}`)}
              />
            )}
            <CourseTitle>{course.title}</CourseTitle>
            <CourseDescription>{course.description}</CourseDescription>
            <p>Instructor ID: {course.instructor_id}</p>
            <Link to={`/course/${course.id}`}>View Course</Link>
          </CourseCard>
        ))}
      </CourseGrid>
      )}
    </CatalogContainer>
  );
};

// Memoize to prevent unnecessary re-renders if props don’t change (future-proofing)
export default React.memo(CourseCatalog);