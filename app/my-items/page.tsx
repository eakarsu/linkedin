'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid2 from '@mui/material/Unstable_Grid2';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import WorkIcon from '@mui/icons-material/Work';
import Post from '@/components/Post';

interface PostData {
  id: string;
  content: string;
  image: string | null;
  video: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    title: string | null;
    avatar: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MyItemsPage() {
  const { data: session } = useSession();
  const [tabValue, setTabValue] = useState(0);
  const [savedPosts, setSavedPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchSavedPosts();
    }
  }, [session]);

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch('/api/posts/saved');
      if (response.ok) {
        const data = await response.json();
        setSavedPosts(data);
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return postDate.toLocaleDateString();
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={3}>
          <Grid2 xs={12} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  My Items
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: tabValue === 0 ? '#f3f6f8' : 'transparent',
                      '&:hover': {
                        bgcolor: '#f3f6f8',
                      },
                    }}
                    onClick={() => setTabValue(0)}
                  >
                    <BookmarkIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2">Saved posts</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: tabValue === 1 ? '#f3f6f8' : 'transparent',
                      '&:hover': {
                        bgcolor: '#f3f6f8',
                      },
                    }}
                    onClick={() => setTabValue(1)}
                  >
                    <WorkIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body2">Saved jobs</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 xs={12} md={9}>
            <Card sx={{ borderRadius: 2, minHeight: '400px' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="my items tabs">
                  <Tab label="Saved posts" />
                  <Tab label="Saved jobs" />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Loading saved posts...
                    </Typography>
                  </Box>
                ) : savedPosts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <BookmarkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      No saved posts yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Save posts to read later or share with your network
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {savedPosts.map((post) => (
                      <Box key={post.id} sx={{ mb: 2 }}>
                        <Post
                          postId={post.id}
                          author={post.author.name}
                          title={post.author.title || ''}
                          timestamp={getRelativeTime(post.createdAt)}
                          content={post.content}
                          image={post.image}
                          video={post.video}
                          authorAvatar={post.author.avatar}
                          initialLikes={[]}
                          initialComments={[]}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    No saved jobs yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Save jobs to apply later or track your applications
                  </Typography>
                </Box>
              </TabPanel>
            </Card>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}
