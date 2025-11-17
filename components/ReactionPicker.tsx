'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const reactions = [
  { type: 'like', emoji: '👍', label: 'Like', color: '#0a66c2' },
  { type: 'celebrate', emoji: '🎉', label: 'Celebrate', color: '#6dae4f' },
  { type: 'support', emoji: '💡', label: 'Support', color: '#df704d' },
  { type: 'love', emoji: '❤️', label: 'Love', color: '#df704d' },
  { type: 'insightful', emoji: '💭', label: 'Insightful', color: '#8f5849' },
  { type: 'curious', emoji: '🤔', label: 'Curious', color: '#f5c86a' },
];

const ReactionButton = styled(Box)(({ theme }) => ({
  cursor: 'pointer',
  padding: '8px 12px',
  borderRadius: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s, background-color 0.2s',
  '&:hover': {
    transform: 'scale(1.3)',
    backgroundColor: theme.palette.action.hover,
  },
}));

interface ReactionPickerProps {
  onReactionSelect: (reactionType: string) => void;
  currentReaction?: string | null;
}

export default function ReactionPicker({ onReactionSelect, currentReaction }: ReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        gap: 0.5,
        p: 0.5,
        borderRadius: 6,
        backgroundColor: 'background.paper',
      }}
    >
      {reactions.map((reaction) => (
        <Tooltip key={reaction.type} title={reaction.label} arrow placement="top">
          <ReactionButton
            onClick={() => onReactionSelect(reaction.type)}
            onMouseEnter={() => setHoveredReaction(reaction.type)}
            onMouseLeave={() => setHoveredReaction(null)}
            sx={{
              backgroundColor: currentReaction === reaction.type ? 'action.selected' : 'transparent',
            }}
          >
            <Box
              sx={{
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              {reaction.emoji}
            </Box>
          </ReactionButton>
        </Tooltip>
      ))}
    </Paper>
  );
}
