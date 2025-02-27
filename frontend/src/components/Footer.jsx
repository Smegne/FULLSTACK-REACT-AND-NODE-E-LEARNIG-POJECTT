import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  width: 100%;
  max-width: 2400px;
  background: #222;
  color: #ddd;
  padding: 40px 20px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NavigationSection = styled(FooterSection)`
  @media (max-width: 768px) {
    display: none; /* Hide navigation on mobile */
  }
`;

const FooterLink = styled(Link)`
  color: #ddd;
  text-decoration: none;
  &:hover { color: #007bff; }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 15px;
`;

const SocialIcon = styled.a`
  color: #ddd;
  font-size: 1.5rem;
  text-decoration: none;
  &:hover { color: #007bff; }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <NavigationSection>
        <h3>Navigation</h3>
        <FooterLink to="/">Home</FooterLink>
        <FooterLink to="/dashboard">Dashboard</FooterLink>
        <FooterLink to="/help">Help</FooterLink>
      </NavigationSection>
      <FooterSection>
        <h3>Follow Us</h3>
        <SocialIcons>
          <SocialIcon href="https://twitter.com" target="_blank" aria-label="Twitter">𝕏</SocialIcon>
          <SocialIcon href="https://facebook.com" target="_blank" aria-label="Facebook">f</SocialIcon>
          <SocialIcon href="https://linkedin.com" target="_blank" aria-label="LinkedIn">in</SocialIcon>
        </SocialIcons>
      </FooterSection>
      <FooterSection>
        <h3>Contact</h3>
        <p>Email: <a href="mailto:support@elearning.com" style={{ color: '#ddd' }}>support@elearning.com</a></p>
        <FooterLink to="/contact">Contact Form</FooterLink>
      </FooterSection>
      <FooterSection>
        <h3>Legal</h3>
        <FooterLink to="/terms">Terms of Service</FooterLink>
        <FooterLink to="/privacy">Privacy Policy</FooterLink>
        <p>© 2025 E-Learning Platform. All rights reserved.</p>
      </FooterSection>
    </FooterContainer>
  );
};

export default Footer;