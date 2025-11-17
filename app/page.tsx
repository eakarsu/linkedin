'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid2 from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ProfileCard from '@/components/ProfileCard';
import CreatePost from '@/components/CreatePost';
import Post from '@/components/Post';
import NewsWidget from '@/components/NewsWidget';
import Stories from '@/components/Stories';

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
  likes: any[];
  comments: any[];
}

export default function Home() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [postsWithDocs, setPostsWithDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
    // Load posts with documents from localStorage
    const storedPosts = JSON.parse(localStorage.getItem('postsWithDocuments') || '[]');
    setPostsWithDocs(storedPosts);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
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

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true; // Show all posts if search is empty
    const query = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(query) ||
      post.author.name.toLowerCase().includes(query)
    );
  });

  const filteredPostsWithDocs = postsWithDocs.filter((post) => {
    if (!searchQuery.trim()) return true; // Show all posts if search is empty
    const query = searchQuery.toLowerCase();
    return post.content.toLowerCase().includes(query);
  });

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={3}>
          {/* Left Sidebar */}
          <Grid2 xs={12} md={3}>
            <ProfileCard />
          </Grid2>

          {/* Main Feed */}
          <Grid2 xs={12} md={6}>
            <Stories />
            <CreatePost />

            {/* Search Bar */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Search posts by content or author..."
                size="small"
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
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Loading posts...
                </Typography>
              </Box>
            ) : (
              <>
                {/* Posts with documents from localStorage */}
                {filteredPostsWithDocs.map((post, index) => (
                  <Post
                    key={`doc-${index}`}
                    postId={`doc-${index}`}
                    author="John Doe"
                    title="Senior Software Engineer | Full Stack Developer"
                    timestamp={getRelativeTime(post.createdAt)}
                    content={post.content}
                    document={post.document}
                    initialLikes={[]}
                    initialComments={[]}
                  />
                ))}
                {/* Regular posts from database */}
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <Post
                      key={post.id}
                      postId={post.id}
                      author={post.author.name}
                      authorAvatar={post.author.avatar || undefined}
                      title={post.author.title || 'LinkedIn Member'}
                      timestamp={getRelativeTime(post.createdAt)}
                      content={post.content}
                      image={post.image || undefined}
                      initialLikes={post.likes}
                      initialComments={post.comments}
                    />
                  ))
                ) : filteredPostsWithDocs.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchQuery ? 'No posts found matching your search' : 'No posts yet. Be the first to share something!'}
                    </Typography>
                  </Box>
                ) : null}
              </>
            )}
          </Grid2>

          {/* Right Sidebar */}
          <Grid2 xs={12} md={3}>
            <NewsWidget />
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}
