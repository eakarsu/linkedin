import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';

const solutions = [
  {
    title: 'LinkedIn Pages',
    description: 'Build your brand and establish credibility with a professional company page.',
    features: ['Company updates', 'Product pages', 'Analytics'],
  },
  {
    title: 'LinkedIn Groups',
    description: 'Create communities around your industry or interests to drive engagement.',
    features: ['Community building', 'Thought leadership', 'Networking'],
  },
  {
    title: 'LinkedIn Events',
    description: 'Host virtual or in-person events to connect with your audience.',
    features: ['Event management', 'Attendee tracking', 'Promotion tools'],
  },
  {
    title: 'Content Marketing',
    description: 'Share valuable content to engage your audience and build trust.',
    features: ['Articles', 'Posts', 'Documents'],
  },
];

export default function BusinessPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 2, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              LinkedIn for Business
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Grow your business with powerful marketing and engagement tools
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

        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Business Solutions
            </Typography>
            <Grid container spacing={3}>
              {solutions.map((solution, index) => (
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

        <Card sx={{ borderRadius: 2, bgcolor: '#f3f6f8' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Ready to Grow Your Business?
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Join millions of businesses using LinkedIn to reach and engage their audience.
            </Typography>
            <Button variant="contained" size="large">
              Create Company Page
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
