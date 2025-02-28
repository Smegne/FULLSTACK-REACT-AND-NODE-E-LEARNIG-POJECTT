import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Carousel from '../components/Carousel';

const CatalogContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const CategorySection = styled.div`
  margin-bottom: 40px;
`;

const CategoryTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #333;
`;
const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5 items per row */
  gap: 20px; /* Space between items */
  max-width: 100%; /* Prevents horizontal scrolling */
  overflow-x: hidden; /* Ensures no unwanted horizontal scrolling */

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr); /* 4 items per row on medium screens */
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr); /* 3 items per row on smaller screens */
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr); /* 2 items per row on mobile */
  }

  @media (max-width: 400px) {
    grid-template-columns: repeat(1, 1fr); /* 1 item per row on very small screens */
  }
`;



const CourseCard = styled.div`
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  &:hover { transform: scale(1.02); }
`;

const CourseTitle = styled.h3`
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

const SeeMoreButton = styled.button`
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover { background-color: #0056b3; }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [carouselImages, setCarouselImages] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const location = useLocation();

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
      // ✅ Fetch courses & carousel without authentication
      const [courseRes, carouselRes] = await Promise.all([
        axios.get('http://localhost:5000/api/courses'),  // No token required
        axios.get('http://localhost:5000/api/carousel')
      ]);
  
      setCourses(courseRes.data);
      setCarouselImages(carouselRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search')?.toLowerCase() || '';
    const type = params.get('type') || 'any';

    let filtered;
    if (!query) {
      filtered = courses;
    } else if (type === 'title') {
      filtered = courses.filter(course => course.title.toLowerCase().includes(query));
    } else if (type === 'category') {
      filtered = courses.filter(course => course.category.toLowerCase() === query);
    } else {
      filtered = courses.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.category.toLowerCase().includes(query)
      );
    }
    setFilteredCourses(filtered);
  }, [courses, location.search]);

  const groupedCourses = categories.reduce((acc, category) => {
    acc[category] = filteredCourses.filter(course => course.category === category);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const DISPLAY_LIMIT = 5; // Updated to show 5 courses initially

  return (
    <CatalogContainer>
      <Carousel images={carouselImages} />
      <h1>E-Learning Courses</h1>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {loading ? (
        <p>Loading courses...</p>
      ) : filteredCourses.length === 0 ? (
        <p>No courses match your search.</p>
      ) : (
        categories.map(category => {
          const categoryCourses = groupedCourses[category] || [];
          const isExpanded = expandedCategories[category];
          const visibleCourses = isExpanded ? categoryCourses : categoryCourses.slice(0, DISPLAY_LIMIT);

          return categoryCourses.length > 0 ? (
            <CategorySection key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              <CourseGrid>
                {visibleCourses.map(course => (
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
                    <p>Category: {course.category}</p>
                    <Link to={`/course/${course.id}`}>View Course</Link>
                  </CourseCard>
                ))}
              </CourseGrid>
              {categoryCourses.length > DISPLAY_LIMIT && (
                <SeeMoreButton onClick={() => toggleCategory(category)}>
                  {isExpanded ? 'See Less' : 'See More'}
                </SeeMoreButton>
              )}
            </CategorySection>
          ) : null;
        })
      )}
    </CatalogContainer>
  );
};

export default React.memo(CourseCatalog);