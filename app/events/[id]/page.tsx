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
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';

interface EventData {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  type: string;
  location: string | null;
  eventUrl: string | null;
  startDate: string;
  endDate: string | null;
  timezone: string | null;
  organizer: {
    id: string;
    name: string;
    avatar: string | null;
    title: string | null;
  };
  company: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  _count: {
    attendees: number;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    type: '',
    location: '',
    eventUrl: '',
  });

  useEffect(() => {
    if (params.id) fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        setEditData({
          title: data.title,
          description: data.description || '',
          type: data.type,
          location: data.location || '',
          eventUrl: data.eventUrl || '',
        });
      } else if (response.status === 404) {
        router.push('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setEditOpen(false);
        fetchEvent();
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await fetch(`/api/events/${params.id}`, { method: 'DELETE' });
      if (response.ok) router.push('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="text.secondary">Event not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/events')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Events
        </Button>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              {event.image && (
                <Box
                  sx={{
                    height: 300,
                    backgroundImage: `url(${event.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px 8px 0 0',
                    position: 'relative',
                  }}
                >
                  <Chip
                    label={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    color={event.type === 'online' ? 'primary' : event.type === 'in-person' ? 'success' : 'secondary'}
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  />
                </Box>
              )}
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                  {event.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body1">{formatDate(event.startDate)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccessTimeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {formatTime(event.startDate)}
                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                    {event.timezone && ` (${event.timezone})`}
                  </Typography>
                </Box>

                {event.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationOnIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1">{event.location}</Typography>
                  </Box>
                )}

                {event.eventUrl && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <VideocamIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1" color="primary">
                      <a href={event.eventUrl} target="_blank" rel="noopener noreferrer">
                        Join Online
                      </a>
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <PeopleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body1">{event._count.attendees} attendees</Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>About this event</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {event.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 2, position: 'sticky', top: 80, mb: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Organizer</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar src={event.organizer.avatar || undefined} sx={{ width: 48, height: 48 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{event.organizer.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{event.organizer.title}</Typography>
                  </Box>
                </Box>
                {event.company && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar src={event.company.logo || undefined} variant="rounded" sx={{ width: 40, height: 40 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.company.name}</Typography>
                  </Box>
                )}

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
          <DialogTitle sx={{ fontWeight: 600 }}>Edit Event</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
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
                select
                label="Type"
                fullWidth
                value={editData.type}
                onChange={(e) => setEditData({ ...editData, type: e.target.value })}
              >
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="in-person">In-Person</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </TextField>
              {editData.type !== 'online' && (
                <TextField
                  label="Location"
                  fullWidth
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                />
              )}
              {editData.type !== 'in-person' && (
                <TextField
                  label="Event URL"
                  fullWidth
                  value={editData.eventUrl}
                  onChange={(e) => setEditData({ ...editData, eventUrl: e.target.value })}
                />
              )}
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
