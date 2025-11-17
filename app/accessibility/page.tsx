import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';

const features = [
  { title: 'Screen Reader Support', description: 'Full compatibility with popular screen readers for visually impaired users.' },
  { title: 'Keyboard Navigation', description: 'Navigate the entire platform using only your keyboard.' },
  { title: 'High Contrast Mode', description: 'Improved visibility with high contrast color schemes.' },
  { title: 'Text Scaling', description: 'Adjust text size for better readability.' },
  { title: 'Alt Text for Images', description: 'All images include descriptive alternative text.' },
  { title: 'Captions & Transcripts', description: 'Video content includes captions and transcripts.' },
];

export default function AccessibilityPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
              Accessibility
            </Typography>
            <Typography variant="body1" paragraph sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
              We are committed to making LinkedIn accessible to everyone
            </Typography>
            
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid xs={12} md={6} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Our Commitment
            </Typography>
            <Typography variant="body1" paragraph>
              LinkedIn is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.
            </Typography>
            <Typography variant="body1">
              If you encounter any accessibility barriers, please contact our accessibility team for assistance.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
