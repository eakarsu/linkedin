import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';

const safetyGuidelines = [
  {
    title: 'Professional Conduct',
    description: 'Maintain a professional and respectful demeanor in all interactions on the platform.',
  },
  {
    title: 'Protect Your Privacy',
    description: 'Control what you share and who can see your information with privacy settings.',
  },
  {
    title: 'Report Inappropriate Content',
    description: 'Help keep LinkedIn safe by reporting spam, harassment, or inappropriate content.',
  },
  {
    title: 'Verify Connections',
    description: 'Only connect with people you know and trust to maintain network quality.',
  },
  {
    title: 'Secure Your Account',
    description: 'Use strong passwords and enable two-factor authentication for added security.',
  },
  {
    title: 'Avoid Scams',
    description: 'Be cautious of suspicious messages, fake job offers, and phishing attempts.',
  },
];

export default function SafetyPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
              Safety Center
            </Typography>
            <Typography variant="body1" paragraph sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
              Your safety is our priority. Learn how to stay safe and maintain a professional environment on LinkedIn.
            </Typography>

            <Grid container spacing={3}>
              {safetyGuidelines.map((guideline, index) => (
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

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Community Guidelines
            </Typography>
            <Typography variant="body1" paragraph>
              LinkedIn is a professional community built on trust. We expect all members to:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Typography component="li" variant="body1" paragraph>
                Be safe, civil, and professional
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                Be trustworthy and authentic
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                Respect intellectual property and privacy
              </Typography>
              <Typography component="li" variant="body1" paragraph>
                Follow our Professional Community Policies
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
