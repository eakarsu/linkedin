'use client';

import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface CompletenessData {
  completeness: number;
  missingSections: string[];
  isComplete: boolean;
}

export default function ProfileCompleteness() {
  const [data, setData] = useState<CompletenessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchCompleteness();
  }, []);

  const fetchCompleteness = async () => {
    try {
      const response = await fetch('/api/profile/completeness');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching profile completeness:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return null;
  }

  // Don't show if profile is 100% complete
  if (data.isComplete) {
    return (
      <Card sx={{ borderRadius: 2, mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
              Profile Complete!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ borderRadius: 2, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Profile Strength
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {data.completeness}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={data.completeness}
          color={getColorByPercentage(data.completeness)}
          sx={{ height: 8, borderRadius: 1, mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {data.completeness < 50 && 'Complete your profile to increase visibility'}
          {data.completeness >= 50 && data.completeness < 80 && 'You\'re making great progress!'}
          {data.completeness >= 80 && 'Almost there! Just a few more steps'}
        </Typography>

        {data.missingSections.length > 0 && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                py: 1,
              }}
              onClick={() => setExpanded(!expanded)}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {data.missingSections.length} items to complete
              </Typography>
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={expanded}>
              <List dense>
                {data.missingSections.map((section, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={section}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
}
