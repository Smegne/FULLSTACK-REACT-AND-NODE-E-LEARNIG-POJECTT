import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import styled from 'styled-components';
import Carousel from '../components/Carousel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  max-width: 100%;
  overflow-x: hidden;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 400px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const CourseCard = styled.div`
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  position: relative;
  &:hover {
    transform: scale(1.02);
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 8px;
`;

const CourseTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 8px;
`;

const CourseDescription = styled.p`
  color: #666;
  margin: 0 0 10px;
  font-size: 0.9rem;
`;

const AddToCartBox = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #007bff;
  color: white;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  display: none;
  transition: background-color 0.2s;
  &:hover {
    background-color: #0056b3;
  }
  ${CourseCard}:hover & {
    display: block;
  }
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
  const { addToCart } = useCart();

  const categories = [
    'Grade Four Tutorial', 'Grade Five Tutorial', 'Grade Six Tutorial',
    'Grade Seven Tutorial', 'Grade Eight Tutorial', 'Grade Nine Tutorial',
    'Grade Ten Tutorial', 'Grade Eleven Tutorial', 'Grade Twelve Tutorial',
    'Web Development', 'App Development'
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, carouselRes] = await Promise.all([
        axios.get('http://localhost:5000/api/courses'),
        axios.get('http://localhost:5000/api/carousel')
      ]);
      setCourses(courseRes.data);
      setCarouselImages(carouselRes.data);
      setError('');
    } catch (err) {
      setError('Unable to load courses. Please check your connection or try again later.');
      console.error('Fetch error:', err);
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

  const handleAddToCart = useCallback((course) => {
    addToCart(course);
    toast.success(`Added ${course.title} to cart!`, {
      position: "top-right",
      autoClose: 2000,
    });
  }, [addToCart]);

  const DISPLAY_LIMIT = 5;

  return (
    <CatalogContainer>
      <Carousel images={carouselImages} />
      <h1>E-Learning</h1>
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
                    <AddToCartBox 
                      onClick={() => handleAddToCart(course)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddToCart(course)}
                      tabIndex={0}
                      aria-label={`Add ${course.title} to cart`}
                    >
                      🛒 Add to Cart
                    </AddToCartBox>
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
      <ToastContainer />
    </CatalogContainer>
  );
};

export default React.memo(CourseCatalog);