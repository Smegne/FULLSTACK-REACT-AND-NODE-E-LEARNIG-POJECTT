import React from 'react';
import { useCart } from '../context/CartContext';
import CourseCatalog from './CourseCatalog';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
`;

const CourseCardWrapper = styled.div`
  position: relative;
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
  z-index: 10;
  ${CourseCardWrapper}:hover & {
    display: block;
  }
`;

// Higher-order component to wrap CourseCatalog
const CourseCatalogWithCart = () => {
  const { addToCart } = useCart();

  const enhanceCourseCard = (children) => {
    return React.Children.map(children, (child) => {
      if (child.type === 'div' && child.props.className?.includes('CatalogContainer')) {
        return React.cloneElement(child, {
          children: React.Children.map(child.props.children, (grandchild) => {
            if (grandchild.type === 'div' && grandchild.props.className?.includes('CategorySection')) {
              return React.cloneElement(grandchild, {
                children: React.Children.map(grandchild.props.children, (greatGrandchild) => {
                  if (greatGrandchild.type === 'div' && greatGrandchild.props.className?.includes('CourseRow')) {
                    return React.cloneElement(greatGrandchild, {
                      children: React.Children.map(greatGrandchild.props.children, (courseCard) => {
                        if (courseCard.type === 'div' && courseCard.props.className?.includes('CourseCard')) {
                          const course = {
                            id: courseCard.props.children.find(c => c.key)?.key,
                            title: courseCard.props.children.find(c => c.type === CourseTitle)?.props.children,
                            category: courseCard.props.children.find(c => c.type === 'p' && c.props.children[0] === 'Category: ')?.props.children[1],
                            description: courseCard.props.children.find(c => c.type === CourseDescription)?.props.children,
                            instructor_id: courseCard.props.children.find(c => c.type === 'p' && c.props.children[0] === 'Instructor ID: ')?.props.children[1],
                            thumbnail_url: courseCard.props.children.find(c => c.type === Thumbnail)?.props.src
                          };
                          return (
                            <CourseCardWrapper>
                              {courseCard}
                              <AddToCartBox onClick={() => addToCart(course)}>
                                Add to Cart
                              </AddToCartBox>
                            </CourseCardWrapper>
                          );
                        }
                        return greatGrandchild;
                      })
                    });
                  }
                  return greatGrandchild;
                })
              });
            }
            return child;
          })
        });
      }
      return child;
    });
  };

  return (
    <Wrapper>
      <CourseCatalog />
      {enhanceCourseCard(<CourseCatalog />)}
    </Wrapper>
  );
};

export default CourseCatalogWithCart;