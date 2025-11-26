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
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Event {
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
  isAttending?: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'online',
    location: '',
    eventUrl: '',
    startDate: '',
    startTime: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description,
          type: newEvent.type,
          location: newEvent.type !== 'online' ? newEvent.location : null,
          eventUrl: newEvent.type !== 'in-person' ? newEvent.eventUrl : null,
          startDate: startDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        setCreateDialogOpen(false);
        setNewEvent({
          title: '',
          description: '',
          type: 'online',
          location: '',
          eventUrl: '',
          startDate: '',
          startTime: '',
        });
        fetchEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleAttend = async (eventId: string, status: string) => {
    try {
      await fetch(`/api/events/${eventId}/attend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchEvents();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isUpcoming = (dateString: string) => new Date(dateString) > new Date();

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 0) return matchesSearch; // All
    if (activeTab === 1) return matchesSearch && isUpcoming(event.startDate); // Upcoming
    if (activeTab === 2) return matchesSearch && !isUpcoming(event.startDate); // Past
    if (activeTab === 3) return matchesSearch && event.type === 'online';
    if (activeTab === 4) return matchesSearch && event.type === 'in-person';
    return matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    if (type === 'online') return <VideocamIcon sx={{ fontSize: 16 }} />;
    if (type === 'in-person') return <LocationOnIcon sx={{ fontSize: 16 }} />;
    return <EventIcon sx={{ fontSize: 16 }} />;
  };

  const getTypeColor = (type: string) => {
    if (type === 'online') return 'primary';
    if (type === 'in-person') return 'success';
    return 'secondary';
  };

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EventIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Events
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Discover professional events and networking opportunities
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ borderRadius: 3 }}
              >
                Create Event
              </Button>
            </Box>
            <TextField
              fullWidth
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: '#f3f6f8', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ px: 2 }}
          >
            <Tab label="All Events" sx={{ textTransform: 'none' }} />
            <Tab label="Upcoming" sx={{ textTransform: 'none' }} />
            <Tab label="Past" sx={{ textTransform: 'none' }} />
            <Tab label="Online" sx={{ textTransform: 'none' }} />
            <Tab label="In-Person" sx={{ textTransform: 'none' }} />
          </Tabs>
        </Card>

        {/* Events Grid */}
        <Grid2 container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid2 key={event.id} xs={12} md={6} lg={4}>
              <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 4 } }}>
                {event.image && (
                  <Box
                    sx={{
                      height: 160,
                      backgroundImage: `url(${event.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    <Chip
                      icon={getTypeIcon(event.type)}
                      label={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      size="small"
                      color={getTypeColor(event.type) as 'primary' | 'success' | 'secondary'}
                      sx={{ position: 'absolute', top: 12, right: 12 }}
                    />
                    {!isUpcoming(event.startDate) && (
                      <Chip
                        label="Past Event"
                        size="small"
                        sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
                      />
                    )}
                  </Box>
                )}
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {event.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(event.startDate)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(event.startDate)} {event.timezone && `(${event.timezone})`}
                    </Typography>
                  </Box>

                  {event.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {event.location}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {event._count.attendees} attendees
                    </Typography>
                  </Box>

                  {event.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }} noWrap>
                      {event.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar src={event.organizer.avatar || undefined} sx={{ width: 24, height: 24 }} />
                    <Typography variant="body2" color="text.secondary">
                      Hosted by {event.organizer.name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    {isUpcoming(event.startDate) && (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          onClick={() => handleAttend(event.id, 'going')}
                          sx={{ borderRadius: 2 }}
                        >
                          Attend
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleAttend(event.id, 'interested')}
                          sx={{ borderRadius: 2 }}
                        >
                          Interested
                        </Button>
                      </>
                    )}
                    {!isUpcoming(event.startDate) && (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        disabled
                        sx={{ borderRadius: 2 }}
                      >
                        Event Ended
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>

        {filteredEvents.length === 0 && (
          <Card sx={{ borderRadius: 2, p: 6, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No events found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or create a new event
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
              Create Event
            </Button>
          </Card>
        )}

        {/* Create Event Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Create Event</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Event Title"
                fullWidth
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <TextField
                select
                label="Event Type"
                fullWidth
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              >
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="in-person">In-Person</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </TextField>
              {newEvent.type !== 'online' && (
                <TextField
                  label="Location"
                  fullWidth
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              )}
              {newEvent.type !== 'in-person' && (
                <TextField
                  label="Event URL (Zoom, Teams, etc.)"
                  fullWidth
                  value={newEvent.eventUrl}
                  onChange={(e) => setNewEvent({ ...newEvent, eventUrl: e.target.value })}
                />
              )}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                />
                <TextField
                  label="Time"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateEvent}
              disabled={!newEvent.title || !newEvent.startDate || !newEvent.startTime}
            >
              Create Event
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
