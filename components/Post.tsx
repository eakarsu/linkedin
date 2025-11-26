'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import SendIcon from '@mui/icons-material/Send';
import PublicIcon from '@mui/icons-material/Public';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionIcon from '@mui/icons-material/Description';
import ReactionPicker from './ReactionPicker';

interface PostProps {
  postId: string;
  author: string;
  authorAvatar?: string;
  title: string;
  timestamp: string;
  content: string;
  image?: string;
  document?: {
    name: string;
    size: string;
  };
  initialLikes?: any[];
  initialComments?: any[];
}

interface Comment {
  id?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

const formatTimestamp = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}w`;
};

const reactionEmojis: { [key: string]: string } = {
  like: '👍',
  celebrate: '🎉',
  support: '💡',
  love: '❤️',
  insightful: '💭',
  curious: '🤔',
};

export default function Post({ postId, author, authorAvatar, title, timestamp, content, image, document, initialLikes = [], initialComments = [] }: PostProps) {
  const { data: session } = useSession();
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<{ [key: string]: number }>({});
  const [totalReactions, setTotalReactions] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const likeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Calculate reaction counts and check user's reaction
    const counts: { [key: string]: number } = {};
    let total = 0;

    initialLikes.forEach((like: any) => {
      const type = like.type || 'like';
      counts[type] = (counts[type] || 0) + 1;
      total++;

      // Check if current user has reacted
      if (session?.user?.id && like.userId === session.user.id) {
        setCurrentReaction(type);
      }
    });

    setReactionCounts(counts);
    setTotalReactions(total);

    // Format comments
    const formattedComments = initialComments.map((comment: any) => ({
      id: comment.id,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        avatar: comment.author.avatar,
      },
      content: comment.text || comment.content,
      createdAt: formatTimestamp(comment.createdAt),
    }));
    setCommentList(formattedComments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, initialLikes.length, initialComments.length]);

  const handleReactionSelect = async (reactionType: string) => {
    if (!session?.user?.id) {
      alert('Please login to react to posts');
      setAnchorEl(null);
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: reactionType }),
      });

      if (response.ok) {
        const result = await response.json();

        // Update reaction counts
        const newCounts = { ...reactionCounts };

        // Remove old reaction count
        if (currentReaction) {
          newCounts[currentReaction] = Math.max((newCounts[currentReaction] || 0) - 1, 0);
          if (newCounts[currentReaction] === 0) {
            delete newCounts[currentReaction];
          }
        }

        // Update new reaction
        if (result.liked) {
          newCounts[reactionType] = (newCounts[reactionType] || 0) + 1;
          setCurrentReaction(reactionType);
        } else {
          setCurrentReaction(null);
        }

        setReactionCounts(newCounts);
        setTotalReactions(Object.values(newCounts).reduce((a, b) => a + b, 0));
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
    }

    setAnchorEl(null);
  };

  const handleLikeButtonClick = () => {
    if (!session?.user?.id) {
      alert('Please login to react to posts');
      return;
    }

    // If already reacted with 'like', remove it
    if (currentReaction === 'like') {
      handleReactionSelect('like');
    } else {
      // Otherwise toggle like
      handleReactionSelect('like');
    }
  };

  const handleLikeButtonHover = (event: React.MouseEvent<HTMLElement>) => {
    if (session?.user?.id) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    if (!session?.user?.id) {
      alert('Please login to comment');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: commentText,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setCommentList([
          ...commentList,
          {
            id: newComment.id,
            author: {
              id: session.user.id,
              name: session.user.name || 'You',
              avatar: session.user.image || undefined,
            },
            content: commentText,
            createdAt: 'Just now',
          },
        ]);
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Avatar src={authorAvatar || '/profile.jpg'}>
              {author?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {author}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {timestamp} · <PublicIcon sx={{ fontSize: 14 }} />
              </Typography>
            </Box>
          </Box>
          <IconButton size="small">
            <MoreHorizIcon />
          </IconButton>
        </Box>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {content}
        </Typography>
        {image && (
          <Box
            component="img"
            src={image}
            alt="Post image"
            sx={{ width: '100%', borderRadius: 1, mb: 2 }}
          />
        )}
        {document && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            bgcolor: '#f3f6f8',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            mb: 2,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: '#e8eef3'
            }
          }}>
            <DescriptionIcon sx={{ fontSize: 40, color: '#0a66c2' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {document.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {document.size}
              </Typography>
            </Box>
            <AttachFileIcon color="action" />
          </Box>
        )}
        {totalReactions > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {Object.keys(reactionCounts).slice(0, 3).map((type) => (
                  <Box key={type} sx={{ fontSize: '14px', ml: -0.5, '&:first-of-type': { ml: 0 } }}>
                    {reactionEmojis[type]}
                  </Box>
                ))}
              </Box>
              <Typography variant="body2" sx={{ fontSize: '12px', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                {totalReactions} {totalReactions === 1 ? 'person' : 'people'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontSize: '12px', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={handleComment}>
              {commentList.length} {commentList.length === 1 ? 'comment' : 'comments'}
            </Typography>
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-around', borderTop: '1px solid #e0e0e0', pt: 1, pb: 1 }}>
        <Button
          ref={likeButtonRef}
          startIcon={currentReaction ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
          onClick={handleLikeButtonClick}
          onMouseEnter={handleLikeButtonHover}
          onMouseLeave={() => {
            // Keep popover open while hovering over it
            setTimeout(() => {
              if (!anchorEl || window.document.activeElement?.closest('.MuiPopover-root') === null) {
                // Popover will handle its own mouse leave
              }
            }, 100);
          }}
          sx={{
            color: currentReaction ? '#0a66c2' : '#666',
            textTransform: 'none',
            fontWeight: 600,
            flex: 1,
            '&:hover': { bgcolor: '#f3f6f8' }
          }}
        >
          {currentReaction && reactionEmojis[currentReaction] ? (
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>{reactionEmojis[currentReaction]}</span>
              {currentReaction.charAt(0).toUpperCase() + currentReaction.slice(1)}
            </Box>
          ) : (
            'Like'
          )}
        </Button>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          sx={{
            '& .MuiPopover-paper': {
              marginBottom: 1,
            },
          }}
          disableRestoreFocus
        >
          <ReactionPicker
            onReactionSelect={handleReactionSelect}
            currentReaction={currentReaction}
          />
        </Popover>
        <Button
          startIcon={<ChatBubbleOutlineIcon />}
          onClick={handleComment}
          sx={{ color: '#666', textTransform: 'none', fontWeight: 600, flex: 1, '&:hover': { bgcolor: '#f3f6f8' } }}
        >
          Comment
        </Button>
        <Button
          startIcon={<RepeatIcon />}
          sx={{ color: '#666', textTransform: 'none', fontWeight: 600, flex: 1, '&:hover': { bgcolor: '#f3f6f8' } }}
        >
          Repost
        </Button>
        <Button
          startIcon={<SendIcon />}
          sx={{ color: '#666', textTransform: 'none', fontWeight: 600, flex: 1, '&:hover': { bgcolor: '#f3f6f8' } }}
        >
          Send
        </Button>
      </CardActions>

      {showComments && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Avatar src={session?.user?.image || '/profile.jpg'} sx={{ width: 32, height: 32 }}>
              {session?.user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {commentList.map((comment, index) => (
              <Box key={comment.id || index} sx={{ display: 'flex', gap: 1 }}>
                <Avatar src={comment.author.avatar || '/profile.jpg'} sx={{ width: 32, height: 32 }}>
                  {comment.author.name?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ flex: 1, bgcolor: '#f3f6f8', borderRadius: 2, px: 2, py: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {comment.author.name}
                  </Typography>
                  <Typography variant="body2">
                    {comment.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {comment.createdAt}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}
