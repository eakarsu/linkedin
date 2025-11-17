'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import TextFieldsIcon from '@mui/icons-material/TextFields';

interface CreateStoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { image?: string; video?: string; text?: string }) => void;
}

export default function CreateStoryDialog({ open, onClose, onSubmit }: CreateStoryDialogProps) {
  const [tab, setTab] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (tab === 0 && imageUrl) {
      onSubmit({ image: imageUrl });
    } else if (tab === 1 && videoUrl) {
      onSubmit({ video: videoUrl });
    } else if (tab === 2 && text) {
      onSubmit({ text });
    }

    // Reset form
    setImageUrl('');
    setVideoUrl('');
    setText('');
    setTab(0);
  };

  const handleClose = () => {
    setImageUrl('');
    setVideoUrl('');
    setText('');
    setTab(0);
    onClose();
  };

  const isValid = () => {
    if (tab === 0) return imageUrl.trim() !== '';
    if (tab === 1) return videoUrl.trim() !== '';
    if (tab === 2) return text.trim() !== '';
    return false;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create a Story</DialogTitle>
      <DialogContent>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<ImageIcon />} label="Image" />
          <Tab icon={<VideoLibraryIcon />} label="Video" />
          <Tab icon={<TextFieldsIcon />} label="Text" />
        </Tabs>

        {tab === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add an image URL for your story
            </Typography>
            <TextField
              fullWidth
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              helperText="Story will be visible for 24 hours"
            />
            {imageUrl && (
              <Box
                component="img"
                src={imageUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'contain',
                  mt: 2,
                  borderRadius: 1,
                }}
                onError={() => setImageUrl('')}
              />
            )}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add a video URL for your story
            </Typography>
            <TextField
              fullWidth
              label="Video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              helperText="Story will be visible for 24 hours"
            />
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Share your thoughts with your network
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              helperText="Story will be visible for 24 hours"
              inputProps={{ maxLength: 300 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
              {text.length}/300
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid()}>
          Share Story
        </Button>
      </DialogActions>
    </Dialog>
  );
}
