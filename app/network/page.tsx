'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Unstable_Grid2';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';

const connectionSuggestions = [
  {
    name: 'Sarah Williams',
    title: 'Product Manager at Microsoft',
    mutualConnections: 12,
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'James Martinez',
    title: 'Senior Developer at Amazon',
    mutualConnections: 8,
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Emma Thompson',
    title: 'UX Designer at Adobe',
    mutualConnections: 15,
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    name: 'Michael Brown',
    title: 'Engineering Manager at Tesla',
    mutualConnections: 5,
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    name: 'Lisa Anderson',
    title: 'Data Scientist at Google',
    mutualConnections: 20,
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    name: 'David Lee',
    title: 'Full Stack Developer at Netflix',
    mutualConnections: 10,
    avatar: 'https://i.pravatar.cc/150?img=6',
  },
];

const myConnections = [
  {
    name: 'Alex Johnson',
    title: 'Software Engineer at Meta',
    location: 'San Francisco, CA',
    avatar: 'https://i.pravatar.cc/150?img=11',
    connectedDate: 'Connected 2 years ago',
  },
  {
    name: 'Maria Garcia',
    title: 'Product Designer at Airbnb',
    location: 'New York, NY',
    avatar: 'https://i.pravatar.cc/150?img=12',
    connectedDate: 'Connected 1 year ago',
  },
  {
    name: 'Kevin Wong',
    title: 'Engineering Manager at Uber',
    location: 'Seattle, WA',
    avatar: 'https://i.pravatar.cc/150?img=13',
    connectedDate: 'Connected 6 months ago',
  },
  {
    name: 'Sophia Chen',
    title: 'Data Analyst at LinkedIn',
    location: 'Austin, TX',
    avatar: 'https://i.pravatar.cc/150?img=14',
    connectedDate: 'Connected 3 months ago',
  },
  {
    name: 'Daniel Smith',
    title: 'DevOps Engineer at Salesforce',
    location: 'Chicago, IL',
    avatar: 'https://i.pravatar.cc/150?img=15',
    connectedDate: 'Connected 1 month ago',
  },
  {
    name: 'Rachel Kim',
    title: 'Marketing Manager at Adobe',
    location: 'Los Angeles, CA',
    avatar: 'https://i.pravatar.cc/150?img=16',
    connectedDate: 'Connected 2 weeks ago',
  },
];

const followingData = [
  {
    name: 'Microsoft',
    type: 'Company',
    followers: '15M followers',
    avatar: 'https://i.pravatar.cc/150?img=21',
  },
  {
    name: 'TechCrunch',
    type: 'Media Company',
    followers: '10M followers',
    avatar: 'https://i.pravatar.cc/150?img=22',
  },
  {
    name: 'Gary Vaynerchuk',
    type: 'Influencer',
    followers: '8M followers',
    avatar: 'https://i.pravatar.cc/150?img=23',
  },
  {
    name: 'Y Combinator',
    type: 'Organization',
    followers: '5M followers',
    avatar: 'https://i.pravatar.cc/150?img=24',
  },
];

const groupsData = [
  {
    name: 'React Developers Community',
    members: '125K members',
    postsPerWeek: '50+ posts a week',
    avatar: 'https://i.pravatar.cc/150?img=31',
  },
  {
    name: 'Product Management Network',
    members: '89K members',
    postsPerWeek: '30+ posts a week',
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
  {
    name: 'UX/UI Design Professionals',
    members: '201K members',
    postsPerWeek: '75+ posts a week',
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
  {
    name: 'Startup Founders & Entrepreneurs',
    members: '156K members',
    postsPerWeek: '100+ posts a week',
    avatar: 'https://i.pravatar.cc/150?img=34',
  },
];

const eventsData = [
  {
    name: 'Tech Summit 2025',
    date: 'Mar 15, 2025',
    type: 'Virtual Event',
    attendees: '2,500 attendees',
    avatar: 'https://i.pravatar.cc/150?img=41',
  },
  {
    name: 'Product Design Workshop',
    date: 'Mar 22, 2025',
    type: 'In-person - San Francisco',
    attendees: '150 attendees',
    avatar: 'https://i.pravatar.cc/150?img=42',
  },
  {
    name: 'AI & Machine Learning Conference',
    date: 'Apr 5, 2025',
    type: 'Virtual Event',
    attendees: '5,000 attendees',
    avatar: 'https://i.pravatar.cc/150?img=43',
  },
  {
    name: 'Startup Pitch Night',
    date: 'Apr 12, 2025',
    type: 'In-person - New York',
    attendees: '200 attendees',
    avatar: 'https://i.pravatar.cc/150?img=44',
  },
];

const pagesData = [
  {
    name: 'Google',
    followers: '25M followers',
    industry: 'Technology, Information and Internet',
    avatar: 'https://i.pravatar.cc/150?img=51',
  },
  {
    name: 'Tesla',
    followers: '18M followers',
    industry: 'Automotive and Energy',
    avatar: 'https://i.pravatar.cc/150?img=52',
  },
  {
    name: 'SpaceX',
    followers: '12M followers',
    industry: 'Aerospace and Defense',
    avatar: 'https://i.pravatar.cc/150?img=53',
  },
];

const invitations = [
  {
    name: 'Jessica Parker',
    title: 'HR Manager at Meta',
    mutualConnections: 3,
    avatar: 'https://i.pravatar.cc/150?img=7',
  },
  {
    name: 'Robert Davis',
    title: 'Marketing Director at Apple',
    mutualConnections: 7,
    avatar: 'https://i.pravatar.cc/150?img=8',
  },
];

export default function NetworkPage() {
  const { data: session } = useSession();
  const [invitationsList, setInvitationsList] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>(connectionSuggestions);
  const [connectedPeople, setConnectedPeople] = useState<string[]>([]);
  const [ignoredInvitations, setIgnoredInvitations] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<string>('suggestions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchConnectionRequests();
      fetchConnections();
      fetchSuggestions();
    }
  }, [session]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/connections/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchConnectionRequests = async () => {
    try {
      const response = await fetch('/api/connections/requests');
      if (response.ok) {
        const data = await response.json();
        setInvitationsList(data);
      }
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections?status=accepted');
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleAccept = async (requestId: string, senderId: string) => {
    try {
      const response = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (response.ok) {
        setInvitationsList(invitationsList.filter(inv => inv.id !== requestId));
        fetchConnections(); // Refresh connections list
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      alert('Failed to accept connection request');
    }
  };

  const handleIgnore = async (requestId: string) => {
    try {
      const response = await fetch(`/api/connections/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        setInvitationsList(invitationsList.filter(inv => inv.id !== requestId));
        setIgnoredInvitations([...ignoredInvitations, requestId]);
      }
    } catch (error) {
      console.error('Error rejecting connection:', error);
      alert('Failed to reject connection request');
    }
  };

  const handleConnect = async (userId: string, userName: string) => {
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectedId: userId }),
      });

      if (response.ok) {
        setConnectedPeople([...connectedPeople, userId]);
        alert('Connection request sent successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={3}>
          {/* Left Sidebar */}
          <Grid2 xs={12} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                  Manage my network
                </Typography>
                <Box
                  onClick={() => setActiveSection('connections')}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    px: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    bgcolor: activeSection === 'connections' ? '#e8f3f8' : 'transparent',
                    '&:hover': { bgcolor: activeSection === 'connections' ? '#e8f3f8' : '#f8f8f8' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: activeSection === 'connections' ? 600 : 400 }}>
                    Connections
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {connections.length}
                  </Typography>
                </Box>
                <Box
                  onClick={() => setActiveSection('followers')}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    px: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    bgcolor: activeSection === 'followers' ? '#e8f3f8' : 'transparent',
                    '&:hover': { bgcolor: activeSection === 'followers' ? '#e8f3f8' : '#f8f8f8' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: activeSection === 'followers' ? 600 : 400 }}>
                    Following & followers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    234
                  </Typography>
                </Box>
                <Box
                  onClick={() => setActiveSection('groups')}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    px: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    bgcolor: activeSection === 'groups' ? '#e8f3f8' : 'transparent',
                    '&:hover': { bgcolor: activeSection === 'groups' ? '#e8f3f8' : '#f8f8f8' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: activeSection === 'groups' ? 600 : 400 }}>
                    Groups
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    12
                  </Typography>
                </Box>
                <Box
                  onClick={() => setActiveSection('events')}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    px: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    bgcolor: activeSection === 'events' ? '#e8f3f8' : 'transparent',
                    '&:hover': { bgcolor: activeSection === 'events' ? '#e8f3f8' : '#f8f8f8' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: activeSection === 'events' ? 600 : 400 }}>
                    Events
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    5
                  </Typography>
                </Box>
                <Box
                  onClick={() => setActiveSection('pages')}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    px: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    bgcolor: activeSection === 'pages' ? '#e8f3f8' : 'transparent',
                    '&:hover': { bgcolor: activeSection === 'pages' ? '#e8f3f8' : '#f8f8f8' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: activeSection === 'pages' ? 600 : 400 }}>
                    Pages
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    3
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid2>

          {/* Main Content */}
          <Grid2 xs={12} md={9}>
            {/* Show different content based on active section */}
            {activeSection === 'connections' && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Your Connections ({connections.length})
                  </Typography>
                  <Grid2 container spacing={2}>
                    {connections.map((connection, index) => {
                      // Get the other person in the connection
                      const connectedUser = connection.userId === session?.user?.id
                        ? connection.connected
                        : connection.user;

                      return (
                      <Grid2 key={connection.id} xs={12} sm={6}>
                        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                              <Avatar src={connectedUser?.avatar || '/profile.jpg'} sx={{ width: 56, height: 56 }}>
                                {connectedUser?.name?.charAt(0) || 'U'}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {connectedUser?.name || 'Unknown User'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 0.5 }}>
                                  {connectedUser?.title || 'LinkedIn Member'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                  Connected {new Date(connection.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                sx={{ textTransform: 'none', borderRadius: 3 }}
                                onClick={() => window.location.href = `/messaging?userId=${connectedUser?.id}`}
                              >
                                Message
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid2>
                      );
                    })}
                    {connectedPeople.length > 0 && (
                      <Grid2 xs={12}>
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f3f6f8', borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Recently Connected:
                          </Typography>
                          {connectedPeople.map((name, index) => (
                            <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              • {name}
                            </Typography>
                          ))}
                        </Box>
                      </Grid2>
                    )}
                  </Grid2>
                </CardContent>
              </Card>
            )}

            {activeSection === 'followers' && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Following & Followers
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    You are following 142 people and companies • 92 people are following you
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    Companies and Influencers You Follow
                  </Typography>
                  <Grid2 container spacing={2}>
                    {followingData.map((item, index) => (
                      <Grid2 key={index} xs={12} sm={6}>
                        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                              <Avatar src={item.avatar} sx={{ width: 56, height: 56 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 0.5 }}>
                                  {item.type}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                  {item.followers}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                sx={{ textTransform: 'none', borderRadius: 3 }}
                              >
                                Following
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid2>
                    ))}
                  </Grid2>
                </CardContent>
              </Card>
            )}

            {activeSection === 'groups' && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Your Groups (12)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Join professional groups to connect with people who share your interests and expertise.
                  </Typography>
                  <Grid2 container spacing={2}>
                    {groupsData.map((group, index) => (
                      <Grid2 key={index} xs={12}>
                        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                              <Avatar src={group.avatar} sx={{ width: 56, height: 56 }} variant="rounded" />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {group.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <GroupIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                                    {group.members}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                  {group.postsPerWeek}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{ textTransform: 'none', borderRadius: 3 }}
                              >
                                View Group
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid2>
                    ))}
                  </Grid2>
                </CardContent>
              </Card>
            )}

            {activeSection === 'events' && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Events (5)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Discover and attend professional events in your area or online.
                  </Typography>
                  <Grid2 container spacing={2}>
                    {eventsData.map((event, index) => (
                      <Grid2 key={index} xs={12} sm={6}>
                        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                              <Avatar src={event.avatar} sx={{ width: 56, height: 56 }} variant="rounded" />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {event.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <EventIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                                    {event.date}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', mb: 0.5 }}>
                                  {event.type}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                  {event.attendees}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                sx={{ textTransform: 'none', borderRadius: 3 }}
                              >
                                View Event
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid2>
                    ))}
                  </Grid2>
                </CardContent>
              </Card>
            )}

            {activeSection === 'pages' && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Pages You Follow (3)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Follow company pages to stay updated on their latest news and opportunities.
                  </Typography>
                  <Grid2 container spacing={2}>
                    {pagesData.map((page, index) => (
                      <Grid2 key={index} xs={12}>
                        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                              <Avatar src={page.avatar} sx={{ width: 56, height: 56 }} variant="rounded" />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {page.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                                    {page.followers}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                  {page.industry}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{ textTransform: 'none', borderRadius: 3 }}
                              >
                                Following
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid2>
                    ))}
                  </Grid2>
                </CardContent>
              </Card>
            )}

            {/* Pending Invitations */}
            {activeSection === 'suggestions' && invitationsList.length > 0 && (
              <Card sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Invitations ({invitationsList.length})
                  </Typography>
                  <Grid2 container spacing={2}>
                    {invitationsList.map((request, index) => (
                      <Grid2 key={request.id || index} xs={12} sm={6}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Avatar src={request.sender?.avatar || '/profile.jpg'} sx={{ width: 56, height: 56 }}>
                            {request.sender?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {request.sender?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 0.5 }}>
                              {request.sender?.title || 'LinkedIn Member'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', mb: 1 }}>
                              Sent connection request
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleIgnore(request.id)}
                                sx={{ textTransform: 'none', borderRadius: 3 }}
                              >
                                Ignore
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleAccept(request.id, request.sender?.id)}
                                sx={{ textTransform: 'none', borderRadius: 3 }}
                              >
                                Accept
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </Grid2>
                    ))}
                  </Grid2>
                </CardContent>
              </Card>
            )}

            {/* People You May Know */}
            {activeSection === 'suggestions' && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    People you may know
                  </Typography>
                <Grid2 container spacing={2}>
                  {suggestions.map((person: any, index: number) => (
                    <Grid2 key={person.id || index} xs={12} sm={6} md={4}>
                      <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                        <CardContent>
                          <Box sx={{ textAlign: 'center' }}>
                            <Avatar
                              src={person.avatar || '/profile.jpg'}
                              sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                            >
                              {person.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {person.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 1, minHeight: 40 }}>
                              {person.title || 'LinkedIn Member'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 2 }}>
                              <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                {person._count?.connections || 0} connections
                              </Typography>
                            </Box>
                            {connectedPeople.includes(person.id) ? (
                              <Button
                                fullWidth
                                variant="contained"
                                disabled
                                startIcon={<CheckIcon />}
                                sx={{ textTransform: 'none', borderRadius: 3, fontWeight: 600 }}
                              >
                                Connected
                              </Button>
                            ) : (
                              <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => handleConnect(person.id, person.name)}
                                sx={{ textTransform: 'none', borderRadius: 3, fontWeight: 600 }}
                              >
                                Connect
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid2>
                  ))}
                </Grid2>
              </CardContent>
            </Card>
            )}
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}
