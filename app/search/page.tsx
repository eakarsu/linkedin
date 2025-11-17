'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid2 from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';

const searchResults = {
  people: [
    {
      name: 'Sarah Johnson',
      title: 'Senior Product Manager at Google',
      location: 'San Francisco, CA',
      mutualConnections: 12,
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      name: 'Michael Chen',
      title: 'Founder & CEO at TechStart',
      location: 'New York, NY',
      mutualConnections: 8,
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      name: 'Emily Rodriguez',
      title: 'Software Engineer at Meta',
      location: 'Seattle, WA',
      mutualConnections: 15,
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
  ],
  jobs: [
    {
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      type: 'Full-time',
      posted: '2 days ago',
    },
    {
      title: 'Product Manager',
      company: 'Meta',
      location: 'Menlo Park, CA',
      type: 'Full-time',
      posted: '1 week ago',
    },
  ],
  companies: [
    {
      name: 'Google',
      industry: 'Technology, Information and Internet',
      followers: '25M followers',
      avatar: 'https://i.pravatar.cc/150?img=51',
    },
    {
      name: 'Meta',
      industry: 'Technology, Information and Internet',
      followers: '18M followers',
      avatar: 'https://i.pravatar.cc/150?img=52',
    },
  ],
  posts: [
    {
      author: 'Sarah Johnson',
      title: 'Senior Product Manager at Google',
      content: 'Excited to announce that our team just launched a new feature...',
      timestamp: '2h',
      likes: 234,
    },
    {
      author: 'Michael Chen',
      title: 'Founder & CEO at TechStart',
      content: 'After 3 years of hard work, thrilled to share we\'ve raised our Series B...',
      timestamp: '5h',
      likes: 892,
    },
  ],
};

export default function SearchPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState<any>({ users: [], posts: [], jobs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query && session) {
      performSearch();
    }
  }, [query, session]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConnect = async (userId: string) => {
    try {
      const response = await fetch('/api/connections/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (response.ok) {
        alert('Connection request sent!');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Card sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Search results for "{query}"
            </Typography>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="All" />
              <Tab label={`People (${results.users?.length || 0})`} />
              <Tab label={`Jobs (${results.jobs?.length || 0})`} />
              <Tab label={`Posts (${results.posts?.length || 0})`} />
            </Tabs>
          </CardContent>
        </Card>

        {/* People Results */}
        {(activeTab === 0 || activeTab === 1) && results.users && results.users.length > 0 && (
          <Card sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                People
              </Typography>
              {loading ? (
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              ) : (
                <Grid2 container spacing={2}>
                  {results.users.map((person: any) => (
                    <Grid2 key={person.id} xs={12} sm={6}>
                      <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar src={person.avatar || '/profile.jpg'} sx={{ width: 56, height: 56 }}>
                              {person.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {person.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 0.5 }}>
                                {person.title || 'LinkedIn Member'}
                              </Typography>
                              {person.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                    {person.location}
                                  </Typography>
                                </Box>
                              )}
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleConnect(person.id)}
                                sx={{ textTransform: 'none', borderRadius: 3 }}
                              >
                                Connect
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid2>
                  ))}
                </Grid2>
              )}
            </CardContent>
          </Card>
        )}

        {/* Jobs Results */}
        {(activeTab === 0 || activeTab === 2) && results.jobs && results.jobs.length > 0 && (
          <Card sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Jobs
              </Typography>
              {loading ? (
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              ) : (
                results.jobs.map((job: any) => (
                  <Card key={job.id} sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {job.title}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {job.company}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • {job.type}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Posts Results */}
        {(activeTab === 0 || activeTab === 3) && results.posts && results.posts.length > 0 && (
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Posts
              </Typography>
              {loading ? (
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              ) : (
                results.posts.map((post: any, index: number) => (
                  <Box key={post.id} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Avatar src={post.author?.avatar || '/profile.jpg'} sx={{ width: 40, height: 40 }}>
                        {post.author?.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {post.author?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                          {post.author?.title || 'LinkedIn Member'}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {post.content}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      {post.likes?.length || 0} likes • {post.comments?.length || 0} comments
                    </Typography>
                    {index < results.posts.length - 1 && <Box sx={{ borderBottom: '1px solid #e0e0e0', mt: 2 }} />}
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {!loading && (!results.users?.length && !results.jobs?.length && !results.posts?.length) && (
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No results found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try searching for different keywords
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
