'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';

const courses = [
  {
    title: 'React - The Complete Guide 2024',
    instructor: 'Maximilian Schwarzmüller',
    duration: '8h 30m',
    level: 'Intermediate',
    rating: 4.8,
    students: '125,000',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    category: 'Web Development',
  },
  {
    title: 'Complete Python Bootcamp',
    instructor: 'Jose Portilla',
    duration: '12h 15m',
    level: 'Beginner',
    rating: 4.9,
    students: '280,000',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop',
    category: 'Programming',
  },
  {
    title: 'UI/UX Design Fundamentals',
    instructor: 'Sarah Johnson',
    duration: '6h 45m',
    level: 'Beginner',
    rating: 4.7,
    students: '95,000',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
    category: 'Design',
  },
  {
    title: 'AWS Certified Solutions Architect',
    instructor: 'Stephane Maarek',
    duration: '15h 20m',
    level: 'Advanced',
    rating: 4.9,
    students: '320,000',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=225&fit=crop',
    category: 'Cloud Computing',
  },
  {
    title: 'Machine Learning A-Z',
    instructor: 'Kirill Eremenko',
    duration: '20h 10m',
    level: 'Intermediate',
    rating: 4.8,
    students: '215,000',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop',
    category: 'Data Science',
  },
  {
    title: 'Digital Marketing Masterclass',
    instructor: 'Phil Ebiner',
    duration: '10h 30m',
    level: 'Beginner',
    rating: 4.6,
    students: '180,000',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
    category: 'Marketing',
  },
];

const myLearning = [
  {
    title: 'JavaScript: The Advanced Concepts',
    progress: 65,
    lastWatched: '2 days ago',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=225&fit=crop',
  },
  {
    title: 'Product Management Essentials',
    progress: 30,
    lastWatched: '1 week ago',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop',
  },
];

export default function LearningPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Web Development', 'Programming', 'Design', 'Cloud Computing', 'Data Science', 'Marketing'];

  const filteredCourses = activeCategory === 'All'
    ? courses
    : courses.filter(course => course.category === activeCategory);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Card sx={{ mb: 3, borderRadius: 2, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  LinkedIn Learning
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Unlock your potential with expert-led courses
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth
              placeholder="What do you want to learn?"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </CardContent>
        </Card>

        {/* My Learning */}
        {myLearning.length > 0 && (
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Continue Learning
              </Typography>
              <Grid2 container spacing={2}>
                {myLearning.map((course, index) => (
                  <Grid2 key={index} xs={12} sm={6}>
                    <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                      <Box
                        sx={{
                          height: 140,
                          backgroundImage: `url(${course.thumbnail})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <PlayCircleOutlineIcon sx={{ fontSize: 60, color: 'white', opacity: 0.9 }} />
                        </Box>
                      </Box>
                      <CardContent>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '12px' }}>
                          Last watched {course.lastWatched}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={course.progress}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2" sx={{ fontSize: '12px' }}>
                            {course.progress}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid2>
                ))}
              </Grid2>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setActiveCategory(category)}
              color={activeCategory === category ? 'primary' : 'default'}
              variant={activeCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {/* Courses */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recommended Courses
            </Typography>
            <Grid2 container spacing={3}>
              {filteredCourses.map((course, index) => (
                <Grid2 key={index} xs={12} sm={6} md={4}>
                  <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 3 }, cursor: 'pointer' }}>
                    <Box
                      sx={{
                        height: 180,
                        backgroundImage: `url(${course.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      <Chip
                        label={course.level}
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <PlayCircleOutlineIcon sx={{ fontSize: 60, color: 'white', opacity: 0.8 }} />
                      </Box>
                    </Box>
                    <CardContent>
                      <Chip label={course.category} size="small" sx={{ mb: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 1 }}>
                        {course.instructor}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <StarIcon sx={{ fontSize: 16, color: '#f4b400' }} />
                        <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600 }}>
                          {course.rating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                          ({course.students} students)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                          {course.duration}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
