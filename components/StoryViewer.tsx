'use client';

import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface Story {
  id: string;
  userId: string;
  image?: string;
  video?: string;
  text?: string;
  views: number;
  expiresAt: string;
  createdAt: string;
}

interface StoryGroup {
  user: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
  };
  stories: Story[];
}

interface StoryViewerProps {
  storyGroup: StoryGroup;
  onClose: () => void;
  allStoryGroups: StoryGroup[];
  onNavigate: (storyGroup: StoryGroup) => void;
}

export default function StoryViewer({ storyGroup, onClose, allStoryGroups, onNavigate }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = storyGroup.stories[currentStoryIndex];
  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < storyGroup.stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
          } else {
            // Move to next story group or close
            const currentGroupIndex = allStoryGroups.findIndex(
              (g) => g.user.id === storyGroup.user.id
            );
            if (currentGroupIndex < allStoryGroups.length - 1) {
              onNavigate(allStoryGroups[currentGroupIndex + 1]);
              setCurrentStoryIndex(0);
            } else {
              onClose();
            }
          }
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStoryIndex, storyGroup, allStoryGroups, onNavigate, onClose]);

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Go to previous story group
      const currentGroupIndex = allStoryGroups.findIndex((g) => g.user.id === storyGroup.user.id);
      if (currentGroupIndex > 0) {
        const prevGroup = allStoryGroups[currentGroupIndex - 1];
        onNavigate(prevGroup);
        setCurrentStoryIndex(prevGroup.stories.length - 1);
      }
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < storyGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Go to next story group
      const currentGroupIndex = allStoryGroups.findIndex((g) => g.user.id === storyGroup.user.id);
      if (currentGroupIndex < allStoryGroups.length - 1) {
        onNavigate(allStoryGroups[currentGroupIndex + 1]);
        setCurrentStoryIndex(0);
      } else {
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          backgroundColor: 'black',
          height: '90vh',
          width: '450px',
          maxHeight: '90vh',
          margin: 0,
        },
      }}
    >
      <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Progress bars */}
        <Box sx={{ display: 'flex', gap: 0.5, p: 1, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
          {storyGroup.stories.map((_, index) => (
            <Box key={index} sx={{ flex: 1, height: 3, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1 }}>
              <LinearProgress
                variant="determinate"
                value={
                  index < currentStoryIndex
                    ? 100
                    : index === currentStoryIndex
                    ? progress
                    : 0
                }
                sx={{
                  height: 3,
                  borderRadius: 1,
                  bgcolor: 'transparent',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white',
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            pt: 5,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
          }}
        >
          <Avatar src={storyGroup.user.avatar || '/profile.jpg'} sx={{ width: 40, height: 40 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {storyGroup.user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {new Date(currentStory.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Story content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {currentStory.image && (
            <Box
              component="img"
              src={currentStory.image}
              alt="Story"
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          )}
          {currentStory.video && (
            <Box
              component="video"
              src={currentStory.video}
              autoPlay
              muted
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          )}
          {currentStory.text && !currentStory.image && !currentStory.video && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                {currentStory.text}
              </Typography>
            </Box>
          )}

          {/* Navigation buttons */}
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.3)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.3)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Box>
    </Dialog>
  );
}
