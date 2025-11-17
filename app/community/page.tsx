'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';

const guidelines = [
  { title: 'Be Respectful', description: 'Treat others with respect and professionalism in all interactions.' },
  { title: 'Share Knowledge', description: 'Contribute valuable insights and help others learn and grow.' },
  { title: 'Network Authentically', description: 'Build genuine connections based on mutual professional interests.' },
  { title: 'Give Credit', description: 'Acknowledge the work and ideas of others appropriately.' },
];

export default function CommunityPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
              Community Guidelines
            </Typography>
            <Typography variant="body1" paragraph sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
              Building a professional community based on trust and mutual respect
            </Typography>
            <Grid container spacing={3}>
              {guidelines.map((guideline, index) => (
                <Grid xs={12} md={6} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        {guideline.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {guideline.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
