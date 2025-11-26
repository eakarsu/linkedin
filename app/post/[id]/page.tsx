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
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import SendIcon from '@mui/icons-material/Send';
import PublicIcon from '@mui/icons-material/Public';

interface Post {
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
  likes: Array<{
    id: string;
    userId: string;
    type: string;
  }>;
  comments: Array<{
    id: string;
    text: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }>;
  _count: {
    likes: number;
    comments: number;
  };
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (post && session?.user?.id) {
      const userLiked = post.likes.some(like => like.userId === session.user.id);
      setLiked(userLiked);
      setLikeCount(post._count.likes);
    }
  }, [post, session?.user?.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        console.error('Failed to fetch post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!session?.user?.id) {
      alert('Please login to like posts');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like' }),
      });

      if (response.ok) {
        const result = await response.json();
        setLiked(result.liked);
        setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !session?.user?.id) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setPost(prev => prev ? {
          ...prev,
          comments: [...prev.comments, {
            ...newComment,
            author: {
              id: session.user.id,
              name: session.user.name || 'You',
              avatar: session.user.image || null,
            },
          }],
          _count: {
            ...prev._count,
            comments: prev._count.comments + 1,
          },
        } : null);
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
        <Container maxWidth="md">
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Post not found
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

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back
        </Button>

        {/* Post Card */}
        <Card sx={{ borderRadius: 2, mb: 2 }}>
          <CardContent>
            {/* Author Info */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar
                src={post.author.avatar || undefined}
                sx={{ width: 56, height: 56, cursor: 'pointer' }}
                onClick={() => router.push(`/profile/${post.author.id}`)}
              >
                {post.author.name?.charAt(0) || 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => router.push(`/profile/${post.author.id}`)}
                >
                  {post.author.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {post.author.title || 'LinkedIn Member'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                    {formatTimestamp(post.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">·</Typography>
                  <PublicIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                </Box>
              </Box>
            </Box>

            {/* Post Content */}
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
              {post.content}
            </Typography>

            {/* Post Image */}
            {post.image && (
              <Box
                component="img"
                src={post.image}
                alt="Post image"
                sx={{ width: '100%', borderRadius: 1, mb: 2 }}
              />
            )}

            {/* Post Video */}
            {post.video && (
              <Box
                component="video"
                src={post.video}
                controls
                sx={{ width: '100%', borderRadius: 1, mb: 2 }}
              />
            )}

            {/* Engagement Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="text.secondary">
                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {post._count.comments} {post._count.comments === 1 ? 'comment' : 'comments'}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 1, borderBottom: '1px solid #e0e0e0' }}>
              <Button
                startIcon={liked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                onClick={handleLike}
                sx={{
                  color: liked ? '#0a66c2' : '#666',
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: 1,
                }}
              >
                {liked ? 'Liked' : 'Like'}
              </Button>
              <Button
                startIcon={<ChatBubbleOutlineIcon />}
                sx={{ color: '#666', textTransform: 'none', fontWeight: 600, flex: 1 }}
              >
                Comment
              </Button>
              <Button
                startIcon={<RepeatIcon />}
                sx={{ color: '#666', textTransform: 'none', fontWeight: 600, flex: 1 }}
              >
                Repost
              </Button>
              <Button
                startIcon={<SendIcon />}
                sx={{ color: '#666', textTransform: 'none', fontWeight: 600, flex: 1 }}
              >
                Send
              </Button>
            </Box>

            {/* Comment Input */}
            <Box sx={{ display: 'flex', gap: 1, pt: 2 }}>
              <Avatar src={session?.user?.image || undefined} sx={{ width: 40, height: 40 }}>
                {session?.user?.name?.charAt(0) || 'U'}
              </Avatar>
              <TextField
                fullWidth
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
                InputProps={{
                  endAdornment: commentText.trim() && (
                    <IconButton
                      onClick={handleComment}
                      disabled={submittingComment}
                      color="primary"
                      size="small"
                    >
                      <SendIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Comments ({post.comments.length})
            </Typography>

            {post.comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No comments yet. Be the first to comment!
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {post.comments.map((comment) => (
                  <Box key={comment.id} sx={{ display: 'flex', gap: 1 }}>
                    <Avatar
                      src={comment.author.avatar || undefined}
                      sx={{ width: 40, height: 40, cursor: 'pointer' }}
                      onClick={() => router.push(`/profile/${comment.author.id}`)}
                    >
                      {comment.author.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1, bgcolor: '#f3f6f8', borderRadius: 2, px: 2, py: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => router.push(`/profile/${comment.author.id}`)}
                      >
                        {comment.author.name}
                      </Typography>
                      <Typography variant="body2">
                        {comment.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {formatTimestamp(comment.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
