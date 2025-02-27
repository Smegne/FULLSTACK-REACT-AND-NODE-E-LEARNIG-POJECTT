import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CourseCatalog from './pages/CourseCatalog';
import CoursePlayer from './pages/CoursePlayer';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<CourseCatalog />} />
          <Route path="/course/:id" element={<CoursePlayer />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route 
            path="/admin" 
            element={<PrivateRoute><AdminPanel /></PrivateRoute>} 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;