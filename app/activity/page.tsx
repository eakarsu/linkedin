'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '@/components/Header';

export default function ActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.id) {
      fetchUserActivity();
    }
  }, [session, status]);

  const fetchUserActivity = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/posts?authorId=${session.user.id}`);
      if (response.ok) {
        const posts = await response.json();
        setUserPosts(posts);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                All Activity
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : userPosts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No posts yet
                </Typography>
              </Box>
            ) : (
              <List>
                {userPosts.map((post) => (
                  <ListItem
                    key={post.id}
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      borderBottom: '1px solid #e0e0e0',
                      py: 2,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {post.content}
                    </Typography>
                    {post.image && (
                      <Box
                        component="img"
                        src={post.image}
                        alt="Post image"
                        sx={{ maxWidth: '100%', borderRadius: 1, mt: 1 }}
                      />
                    )}
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {post.likes?.length || 0} likes
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {post.comments?.length || 0} comments
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
