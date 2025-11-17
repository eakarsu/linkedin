'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import PhotoIcon from '@mui/icons-material/Photo';
import EventIcon from '@mui/icons-material/Event';
import ArticleIcon from '@mui/icons-material/Article';
import CloseIcon from '@mui/icons-material/Close';
import VideocamIcon from '@mui/icons-material/Videocam';
import PollIcon from '@mui/icons-material/Poll';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import dynamic from 'next/dynamic';

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

export default function CreatePost() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'photo' | 'video' | 'poll' | 'article'>('text');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<{name: string, size: string} | null>(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLElement | null>(null);
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const handleOpen = (type: 'text' | 'photo' | 'video' | 'poll' | 'article' = 'text') => {
    setPostType(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPostContent('');
    setSelectedImage(null);
    setSelectedDocument(null);
    setPollQuestion('');
    setPollOptions(['', '']);
    setPostType('text');
    setEmojiAnchorEl(null);
  };

  const handleEmojiClick = (emojiData: any) => {
    const emoji = emojiData.emoji;
    const cursorPosition = textFieldRef.current?.selectionStart || postContent.length;
    const textBeforeCursor = postContent.substring(0, cursorPosition);
    const textAfterCursor = postContent.substring(cursorPosition);

    setPostContent(textBeforeCursor + emoji + textAfterCursor);
    setEmojiAnchorEl(null);

    // Set focus back to text field
    setTimeout(() => {
      if (textFieldRef.current) {
        textFieldRef.current.focus();
        const newPosition = cursorPosition + emoji.length;
        textFieldRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setSelectedDocument({
        name: file.name,
        size: `${sizeInMB} MB`
      });
    }
  };

  const handlePost = async () => {
    if (!session?.user?.id) {
      alert('You must be logged in to create a post');
      return;
    }

    try {
      const authorId = session.user.id;

      // Store document info in localStorage for demo (since database doesn't support it yet)
      if (selectedDocument) {
        const posts = JSON.parse(localStorage.getItem('postsWithDocuments') || '[]');
        posts.unshift({
          content: postContent,
          document: selectedDocument,
          authorId,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('postsWithDocuments', JSON.stringify(posts));
      }

      if (postType === 'article') {
        // Create article
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: postContent.split('\n')[0] || 'Untitled Article',
            content: postContent,
            excerpt: postContent.substring(0, 200),
            image: selectedImage,
            authorId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create article');
        }

        const article = await response.json();
        console.log('Article created:', article);
      } else if (!selectedDocument) {
        // Only create post in database if no document (since DB doesn't support documents yet)
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: postType === 'poll' ? pollQuestion : postContent,
            image: postType === 'photo' ? selectedImage : undefined,
            video: postType === 'video' ? selectedImage : undefined,
            authorId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create post');
        }

        const post = await response.json();
        console.log('Post created:', post);
      }

      // Refresh the page to show new content
      window.location.reload();
      handleClose();
    } catch (error) {
      console.error('Error creating post/article:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <>
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Avatar src={userData?.avatar || '/profile.jpg'}>
              {userData?.name?.charAt(0) || 'U'}
            </Avatar>
            <TextField
              fullWidth
              placeholder="Start a post"
              variant="outlined"
              onClick={() => handleOpen('text')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                  cursor: 'pointer',
                  '&:hover fieldset': {
                    borderColor: '#666',
                  },
                },
              }}
            />
          </Box>
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-around', pt: 1 }}>
            <Button
              startIcon={<PhotoIcon />}
              onClick={() => handleOpen('photo')}
              sx={{ color: '#70b5f9', textTransform: 'none', fontWeight: 600 }}
            >
              Photo
            </Button>
            <Button
              startIcon={<VideocamIcon />}
              onClick={() => handleOpen('video')}
              sx={{ color: '#7fc15e', textTransform: 'none', fontWeight: 600 }}
            >
              Video
            </Button>
            <Button
              startIcon={<PollIcon />}
              onClick={() => handleOpen('poll')}
              sx={{ color: '#c37d16', textTransform: 'none', fontWeight: 600 }}
            >
              Poll
            </Button>
            <Button
              startIcon={<ArticleIcon />}
              onClick={() => handleOpen('article')}
              sx={{ color: '#e16745', textTransform: 'none', fontWeight: 600 }}
            >
              Write article
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Create Post Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={userData?.avatar || '/profile.jpg'} sx={{ width: 48, height: 48 }}>
                {userData?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {userData?.name || session?.user?.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                  Post to Anyone
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {postType === 'poll' ? (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Ask a question..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Poll Options
              </Typography>
              {pollOptions.map((option, index) => (
                <TextField
                  key={index}
                  fullWidth
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updatePollOption(index, e.target.value)}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
              {pollOptions.length < 4 && (
                <Button onClick={addPollOption} sx={{ textTransform: 'none', mb: 2 }}>
                  + Add option
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="What do you want to talk about?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                variant="standard"
                inputRef={textFieldRef}
                sx={{ mb: 2 }}
              />
              {(postType === 'photo' || postType === 'video') && (
                <Box>
                  {selectedImage ? (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <img
                        src={selectedImage}
                        alt="Preview"
                        style={{ width: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'cover' }}
                      />
                      <IconButton
                        onClick={() => setSelectedImage(null)}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      fullWidth
                      sx={{ py: 3, borderStyle: 'dashed' }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        {postType === 'photo' ? <PhotoIcon sx={{ fontSize: 48, mb: 1 }} /> : <VideocamIcon sx={{ fontSize: 48, mb: 1 }} />}
                        <Typography>Click to upload {postType === 'photo' ? 'photo' : 'video'}</Typography>
                      </Box>
                      <input type="file" hidden accept={postType === 'photo' ? 'image/*' : 'video/*'} onChange={handleImageUpload} />
                    </Button>
                  )}
                </Box>
              )}
              {selectedDocument && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 2
                }}>
                  <AttachFileIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedDocument.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedDocument.size}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setSelectedDocument(null)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            <IconButton size="small" component="label" title="Add photo">
              <PhotoIcon />
              <input type="file" hidden accept="image/*" onChange={(e) => {
                handleImageUpload(e);
                if (postType !== 'photo') setPostType('photo');
              }} />
            </IconButton>
            <IconButton size="small" component="label" title="Add video">
              <VideocamIcon />
              <input type="file" hidden accept="video/*" onChange={(e) => {
                handleImageUpload(e);
                if (postType !== 'video') setPostType('video');
              }} />
            </IconButton>
            <IconButton size="small" component="label" title="Attach document (PDF, DOC, etc.)">
              <AttachFileIcon />
              <input type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={handleDocumentUpload} />
            </IconButton>
            <IconButton
              size="small"
              title="Add emoji"
              onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
            >
              <EmojiEmotionsIcon />
            </IconButton>
          </Box>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            variant="contained"
            disabled={postType === 'poll' ? !pollQuestion || pollOptions.filter(o => o).length < 2 : !postContent}
            sx={{ textTransform: 'none', borderRadius: 3 }}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiAnchorEl)}
        anchorEl={emojiAnchorEl}
        onClose={() => setEmojiAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>
    </>
  );
}
