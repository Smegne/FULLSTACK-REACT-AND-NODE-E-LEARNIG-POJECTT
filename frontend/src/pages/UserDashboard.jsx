import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDashboard = () => {
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/progress', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setProgress(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Your Progress</h1>
      {progress.map(item => (
        <div key={item.id}>
          <p>Lesson: {item.lesson_title} - {item.completed ? 'Completed' : 'In Progress'}</p>
        </div>
      ))}
    </div>
  );
};

export default UserDashboard;