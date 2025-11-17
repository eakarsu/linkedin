import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';

const adSolutions = [
  {
    title: 'Sponsored Content',
    description: 'Reach professionals with native ads in their feed that drive engagement and awareness.',
    features: ['Brand awareness', 'Lead generation', 'Engagement'],
  },
  {
    title: 'Sponsored Messaging',
    description: 'Send personalized messages directly to your target audience\'s LinkedIn inbox.',
    features: ['Direct reach', 'High conversion', 'Personalized'],
  },
  {
    title: 'Text Ads',
    description: 'Cost-effective self-service ads that appear at the top of LinkedIn pages.',
    features: ['Budget-friendly', 'Self-service', 'Quick setup'],
  },
  {
    title: 'Dynamic Ads',
    description: 'Personalized ads that use LinkedIn profile data to create custom creative.',
    features: ['Personalization', 'Follower ads', 'Spotlight ads'],
  },
];

const benefits = [
  {
    title: '900M+ Members',
    description: 'Access the world\'s largest professional network',
  },
  {
    title: 'Precise Targeting',
    description: 'Reach your audience by job title, company, industry, and more',
  },
  {
    title: 'Trusted Platform',
    description: 'Professionals come to LinkedIn to learn and make decisions',
  },
  {
    title: 'Measurable Results',
    description: 'Track ROI with detailed campaign analytics and insights',
  },
];

export default function AdvertisingPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Card sx={{ borderRadius: 2, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              LinkedIn Advertising
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Reach the world's professionals where they make decisions
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              Get Started
            </Button>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
              Why Advertise on LinkedIn?
            </Typography>
            <Grid container spacing={3}>
              {benefits.map((benefit, index) => (
                <Grid xs={12} md={6} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {benefit.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Ad Solutions */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
              Advertising Solutions
            </Typography>
            <Grid container spacing={3}>
              {adSolutions.map((solution, index) => (
                <Grid xs={12} md={6} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2,
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        {solution.title}
                      </Typography>
                      <Typography variant="body1" paragraph color="text.secondary">
                        {solution.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {solution.features.map((feature, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              px: 2,
                              py: 0.5,
                              bgcolor: '#f3f6f8',
                              borderRadius: 2,
                              fontSize: '0.875rem',
                            }}
                          >
                            {feature}
                          </Box>
                        ))}
                      </Box>
                      <Button variant="outlined" fullWidth>
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card sx={{ borderRadius: 2, mt: 4, bgcolor: '#f3f6f8' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Launch your first campaign today and reach professionals where they make decisions.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" size="large">
                Create Campaign
              </Button>
              <Button variant="outlined" size="large">
                Contact Sales
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
