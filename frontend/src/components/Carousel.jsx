import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
`;

const CarouselTrack = styled.div`
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
`;

const Arrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 10;
`;

const LeftArrow = styled(Arrow)`
  left: 10px;
`;

const RightArrow = styled(Arrow)`
  right: 10px;
`;

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Duplicate images for seamless looping
  const extendedImages = [...images, ...images.slice(0, 6 - images.length)]; // Ensure at least 6

  return (
    <CarouselContainer>
      <CarouselTrack style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {extendedImages.map((image, index) => (
          <CarouselImage key={index} src={image.image_url} alt={`Carousel ${index + 1}`} />
        ))}
      </CarouselTrack>
      <LeftArrow onClick={handlePrev}>&larr;</LeftArrow>
      <RightArrow onClick={handleNext}>&rarr;</RightArrow>
    </CarouselContainer>
  );
};

export default Carousel;