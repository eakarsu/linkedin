'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid2 from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  title: string | null;
  location: string | null;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  experience: any[] | null;
  education: any[] | null;
  skills: any[] | null;
  _count?: {
    posts: number;
    connections: number;
  };
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    // If viewing own profile, redirect to /profile
    if (session?.user?.id === id) {
      router.push('/profile');
      return;
    }
    fetchProfile();
    if (session) {
      checkConnectionStatus();
    }
  }, [id, session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch(`/api/connections/status?userId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  const handleConnect = async () => {
    if (!session?.user?.id) {
      setSnackbar({ open: true, message: 'Please login to connect', severity: 'error' });
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/connections/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: id }),
      });

      if (response.ok) {
        setConnectionStatus('pending');
        setSnackbar({ open: true, message: 'Connection request sent!', severity: 'success' });
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.error || 'Failed to send request', severity: 'error' });
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      setSnackbar({ open: true, message: 'Failed to send connection request', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    router.push(`/messaging?userId=${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
        <Container maxWidth="md">
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                User not found
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/')}
                sx={{ mt: 2 }}
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const experience = profile.experience || [];
  const education = profile.education || [];
  const skills = profile.skills || [];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back
        </Button>

        <Grid2 container spacing={3}>
          <Grid2 xs={12} md={8}>
            {/* Profile Header */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  height: 200,
                  background: profile.coverImage
                    ? `url(${profile.coverImage}) center/cover`
                    : 'linear-gradient(to right, #4e54c8, #8f94fb)',
                  borderRadius: '8px 8px 0 0',
                }}
              />
              <CardContent sx={{ position: 'relative', pt: 0 }}>
                <Avatar
                  sx={{
                    width: 150,
                    height: 150,
                    marginTop: '-75px',
                    border: '4px solid white',
                    mb: 2,
                  }}
                  src={profile.avatar || undefined}
                >
                  {profile.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {profile.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {profile.title || 'LinkedIn Member'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', mb: 2, flexWrap: 'wrap' }}>
                  {profile.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon fontSize="small" />
                      <Typography variant="body2">{profile.location}</Typography>
                    </Box>
                  )}
                  <Typography variant="body2">
                    {profile._count?.connections || 0} connections
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {connectionStatus === 'connected' ? (
                    <Button
                      variant="outlined"
                      startIcon={<CheckIcon />}
                      disabled
                      sx={{ textTransform: 'none', borderRadius: 3 }}
                    >
                      Connected
                    </Button>
                  ) : connectionStatus === 'pending' ? (
                    <Button
                      variant="outlined"
                      disabled
                      sx={{ textTransform: 'none', borderRadius: 3 }}
                    >
                      Pending
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={handleConnect}
                      disabled={actionLoading}
                      sx={{ textTransform: 'none', borderRadius: 3 }}
                    >
                      {actionLoading ? 'Sending...' : 'Connect'}
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<MessageIcon />}
                    onClick={handleMessage}
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                  >
                    Message
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* About Section */}
            {profile.bio && (
              <Card sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    About
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {profile.bio}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Experience Section */}
            {experience.length > 0 && (
              <Card sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Experience
                  </Typography>
                  {experience.map((exp: any, index: number) => (
                    <Box key={exp.id || index}>
                      {index > 0 && <Divider sx={{ my: 2 }} />}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <WorkIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {exp.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exp.company}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {exp.startDate && `${exp.startDate} - `}
                            {exp.current ? 'Present' : exp.endDate || ''}
                          </Typography>
                          {exp.location && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {exp.location}
                            </Typography>
                          )}
                          {exp.description && (
                            <Typography variant="body2" color="text.secondary">
                              {exp.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education Section */}
            {education.length > 0 && (
              <Card sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Education
                  </Typography>
                  {education.map((edu: any, index: number) => (
                    <Box key={edu.id || index}>
                      {index > 0 && <Divider sx={{ my: 2 }} />}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <SchoolIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {edu.school}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {edu.degree}{edu.field && `, ${edu.field}`}
                          </Typography>
                          {(edu.startDate || edu.endDate) && (
                            <Typography variant="body2" color="text.secondary">
                              {edu.startDate && edu.endDate
                                ? `${edu.startDate} - ${edu.endDate}`
                                : edu.startDate || edu.endDate
                              }
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Skills Section */}
            {skills.length > 0 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skills.map((skill: any, index: number) => (
                      <Chip
                        key={index}
                        label={typeof skill === 'string' ? skill : skill.name}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid2>

          {/* Right Sidebar */}
          <Grid2 xs={12} md={4}>
            <Card sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile._count?.posts || 0} posts
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  People also viewed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Similar profiles will appear here
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
