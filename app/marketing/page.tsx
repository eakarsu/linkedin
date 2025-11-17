import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';

const solutions = [
  { title: 'Content Marketing', description: 'Share engaging content to build thought leadership and drive engagement.' },
  { title: 'Lead Generation', description: 'Capture high-quality leads with targeted campaigns and forms.' },
  { title: 'Brand Awareness', description: 'Increase visibility and reach your target audience effectively.' },
  { title: 'Analytics & Reporting', description: 'Measure campaign performance with detailed analytics and insights.' },
];

export default function MarketingPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 2, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              LinkedIn Marketing Solutions
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Reach decision-makers and build your brand with powerful marketing tools
            </Typography>
            <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}>
              Get Started
            </Button>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
              Marketing Solutions
            </Typography>
            <Grid container spacing={3}>
              {solutions.map((solution, index) => (
                <Grid xs={12} md={6} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, '&:hover': { borderColor: 'primary.main', boxShadow: 2 }, transition: 'all 0.2s' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>{solution.title}</Typography>
                      <Typography variant="body1" color="text.secondary">{solution.description}</Typography>
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
