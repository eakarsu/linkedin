'use client';

import { useState, useEffect } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  instructor: string;
  duration: string | null;
  level: string | null;
  category: string | null;
  rating: number;
  students: number;
  price: number;
  isFree: boolean;
}

interface Enrollment {
  id: string;
  progress: number;
  completed: boolean;
  lastWatched: string | null;
  course: Course;
}

export default function LearningPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [myLearning, setMyLearning] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Web Development', 'Programming', 'Design', 'Cloud Computing', 'Data Science', 'Marketing', 'Business', 'DevOps'];

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  const fetchData = async () => {
    try {
      const [coursesRes, learningRes] = await Promise.all([
        fetch(`/api/courses${activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`),
        fetch('/api/courses/my-learning'),
      ]);

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }

      if (learningRes.ok) {
        const learningData = await learningRes.json();
        setMyLearning(Array.isArray(learningData) ? learningData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  const formatLastWatched = (dateString: string | null) => {
    if (!dateString) return 'Not started';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    return `${Math.floor(diff / 7)} weeks ago`;
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                {myLearning.slice(0, 4).map((enrollment) => (
                  <Grid2 key={enrollment.id} xs={12} sm={6} md={3}>
                    <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 }, cursor: 'pointer' }}>
                      <Box
                        sx={{
                          height: 120,
                          backgroundImage: enrollment.course.thumbnail ? `url(${enrollment.course.thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                          <PlayCircleOutlineIcon sx={{ fontSize: 50, color: 'white', opacity: 0.9 }} />
                        </Box>
                        {enrollment.completed && (
                          <Chip
                            label="Completed"
                            size="small"
                            color="success"
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }} noWrap>
                          {enrollment.course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '12px' }}>
                          Last watched {formatLastWatched(enrollment.lastWatched)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={enrollment.progress}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2" sx={{ fontSize: '12px' }}>
                            {enrollment.progress}%
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
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>

        {/* Courses */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {activeCategory === 'All' ? 'Recommended Courses' : `${activeCategory} Courses`}
            </Typography>
            <Grid2 container spacing={3}>
              {filteredCourses.map((course) => (
                <Grid2 key={course.id} xs={12} sm={6} md={4}>
                  <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 3 }, cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        height: 160,
                        backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      {course.level && (
                        <Chip
                          label={course.level}
                          size="small"
                          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                        />
                      )}
                      {course.isFree && (
                        <Chip
                          label="FREE"
                          size="small"
                          color="success"
                          sx={{ position: 'absolute', top: 8, left: 8 }}
                        />
                      )}
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
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {course.category && (
                        <Chip label={course.category} size="small" sx={{ mb: 1, alignSelf: 'flex-start' }} />
                      )}
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 1 }}>
                        {course.instructor}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <StarIcon sx={{ fontSize: 16, color: '#f4b400' }} />
                        <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600 }}>
                          {course.rating.toFixed(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                          <PeopleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                            {course.students.toLocaleString()} students
                          </Typography>
                        </Box>
                      </Box>
                      {course.duration && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                            {course.duration}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {!course.isFree && course.price > 0 && (
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            ${course.price.toFixed(2)}
                          </Typography>
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleEnroll(course.id)}
                          sx={{ borderRadius: 2, ml: 'auto' }}
                        >
                          {course.isFree ? 'Start Free' : 'Enroll'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid2>
              ))}
            </Grid2>

            {filteredCourses.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No courses found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try a different category or search term
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
