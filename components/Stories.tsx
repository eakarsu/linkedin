'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import StoryViewer from './StoryViewer';
import CreateStoryDialog from './CreateStoryDialog';

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

export default function Stories() {
  const { data: session } = useSession();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<StoryGroup | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      if (response.ok) {
        const data = await response.json();
        setStoryGroups(data);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (storyGroup: StoryGroup) => {
    setSelectedStoryGroup(storyGroup);
  };

  const handleCreateStory = async (storyData: { image?: string; video?: string; text?: string }) => {
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        fetchStories(); // Refresh stories
      }
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  if (loading || storyGroups.length === 0) {
    return null;
  }

  return (
    <>
      <Card sx={{ borderRadius: 2, mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
          {/* Create story button */}
          {session?.user && (
            <Box
              onClick={() => setShowCreateDialog(true)}
              sx={{
                minWidth: 100,
                cursor: 'pointer',
                textAlign: 'center',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 1,
                  position: 'relative',
                }}
              >
                <Avatar
                  src={session.user.image || '/profile.jpg'}
                  sx={{
                    width: 60,
                    height: 60,
                    border: '2px solid white',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: '#0a66c2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                  }}
                >
                  <AddIcon sx={{ fontSize: 16, color: 'white' }} />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Create story
              </Typography>
            </Box>
          )}

          {/* Story circles */}
          {storyGroups.map((group) => (
            <Box
              key={group.user.id}
              onClick={() => handleStoryClick(group)}
              sx={{
                minWidth: 100,
                cursor: 'pointer',
                textAlign: 'center',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0a66c2 0%, #7c3aed 50%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 1,
                  padding: '2px',
                }}
              >
                <Avatar
                  src={group.user.avatar || '/profile.jpg'}
                  sx={{
                    width: 60,
                    height: 60,
                    border: '2px solid white',
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {group.user.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Story Viewer Dialog */}
      {selectedStoryGroup && (
        <StoryViewer
          storyGroup={selectedStoryGroup}
          onClose={() => setSelectedStoryGroup(null)}
          allStoryGroups={storyGroups}
          onNavigate={setSelectedStoryGroup}
        />
      )}

      {/* Create Story Dialog */}
      <CreateStoryDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateStory}
      />
    </>
  );
}
