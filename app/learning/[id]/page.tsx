'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

interface CourseData {
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
  _count: {
    enrollments: number;
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: '',
    category: '',
    price: '',
    isFree: false,
  });

  const categories = ['Web Development', 'Programming', 'Design', 'Cloud Computing', 'Data Science', 'Marketing', 'Business', 'DevOps'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    if (params.id) fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        setEditData({
          title: data.title,
          description: data.description || '',
          instructor: data.instructor,
          duration: data.duration || '',
          level: data.level || '',
          category: data.category || '',
          price: data.price?.toString() || '0',
          isFree: data.isFree,
        });
      } else if (response.status === 404) {
        router.push('/learning');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          price: parseFloat(editData.price) || 0,
        }),
      });
      if (response.ok) {
        setEditOpen(false);
        fetchCourse();
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const response = await fetch(`/api/courses/${params.id}`, { method: 'DELETE' });
      if (response.ok) router.push('/learning');
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="text.secondary">Course not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/learning')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Learning
        </Button>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              {course.thumbnail && (
                <Box
                  sx={{
                    height: 350,
                    backgroundImage: `url(${course.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px 8px 0 0',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlayCircleOutlineIcon sx={{ fontSize: 80, color: 'white', opacity: 0.9 }} />
                  {course.level && (
                    <Chip label={course.level} sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'white' }} />
                  )}
                  {course.isFree && (
                    <Chip label="FREE" color="success" sx={{ position: 'absolute', top: 16, left: 16 }} />
                  )}
                </Box>
              )}
              <CardContent sx={{ p: 4 }}>
                {course.category && (
                  <Chip label={course.category} size="small" sx={{ mb: 2 }} />
                )}
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {course.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  by {course.instructor}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ fontSize: 20, color: '#f4b400' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{course.rating.toFixed(1)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1">{course.students.toLocaleString()} students</Typography>
                  </Box>
                  {course.duration && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body1">{course.duration}</Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>About this course</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {course.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 2, position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 3 }}>
                {!course.isFree && course.price > 0 ? (
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                    ${course.price.toFixed(2)}
                  </Typography>
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
                    Free
                  </Typography>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ textTransform: 'none', borderRadius: 3, mb: 2 }}
                >
                  {course.isFree ? 'Start Learning' : 'Enroll Now'}
                </Button>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Course Details</Typography>
                {course.level && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Level</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{course.level}</Typography>
                  </Box>
                )}
                {course.duration && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{course.duration}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Enrolled</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{course._count.enrollments}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    fullWidth
                    onClick={() => setEditOpen(true)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    fullWidth
                    onClick={handleDelete}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Edit Course</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
              <TextField
                label="Instructor"
                fullWidth
                value={editData.instructor}
                onChange={(e) => setEditData({ ...editData, instructor: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
              <TextField
                label="Duration"
                fullWidth
                value={editData.duration}
                onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                placeholder="e.g., 8h 30m"
              />
              <TextField
                select
                label="Level"
                fullWidth
                value={editData.level}
                onChange={(e) => setEditData({ ...editData, level: e.target.value })}
              >
                {levels.map((l) => (
                  <MenuItem key={l} value={l}>{l}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Category"
                fullWidth
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Price"
                fullWidth
                type="number"
                value={editData.price}
                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" onClick={handleEdit} disabled={!editData.title} sx={{ textTransform: 'none', borderRadius: 3 }}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
