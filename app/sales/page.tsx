import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';

const features = [
  {
    title: 'Sales Navigator',
    description: 'Find and connect with the right prospects using advanced search and lead recommendations.',
    link: '/premium'
  },
  {
    title: 'CRM Integration',
    description: 'Sync your LinkedIn connections with your CRM for seamless workflow.',
    link: '/business'
  },
  {
    title: 'InMail Messaging',
    description: 'Reach decision-makers directly with personalized InMail messages.',
    link: '/premium'
  },
  {
    title: 'Sales Insights',
    description: 'Get real-time insights on accounts and leads to close deals faster.',
    link: '/business'
  },
];

export default function SalesPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 2, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              LinkedIn Sales Solutions
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Close more deals with the world's best social selling platform
            </Typography>
            <Link href="/premium" style={{ textDecoration: 'none' }}>
              <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}>
                Try Sales Navigator
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
              Sales Features
            </Typography>
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid xs={12} md={6} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, '&:hover': { borderColor: 'primary.main', boxShadow: 2 }, transition: 'all 0.2s' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>{feature.title}</Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{feature.description}</Typography>
                      <Link href={feature.link} style={{ textDecoration: 'none' }}>
                        <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                          Learn More
                        </Button>
                      </Link>
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
