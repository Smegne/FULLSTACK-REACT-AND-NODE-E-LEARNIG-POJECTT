const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const lessonRoutes = require('./routes/lessons');
const progressRoutes = require('./routes/progress');
const carouselRoutes = require('./routes/carousel');
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);
const assessmentRoutes = require('./routes/assessments');
app.use('/api/assessments', assessmentRoutes);

app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes); // Must include /api/users
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/carousel', carouselRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});