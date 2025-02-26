import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactPlayer from 'react-player';

const CoursePlayer = () => {
  const { id } = useParams(); // Course ID from URL
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/lessons?courseId=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setLesson(res.data[0])) // Assuming first lesson for simplicity
      .catch(err => console.error(err));
  }, [id]);

  if (!lesson) return <div>Loading...</div>;

  return (
    <div>
      <h1>{lesson.title}</h1>
      <ReactPlayer url={lesson.video_url} controls width="100%" height="auto" />
      <p>Lesson Content goes here...</p>
    </div>
  );
};

export default CoursePlayer;