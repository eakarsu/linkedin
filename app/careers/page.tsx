import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';

const openPositions = [
  {
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'Full-time',
  },
  {
    title: 'UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'Data Scientist',
    department: 'Data & Analytics',
    location: 'Seattle, WA',
    type: 'Full-time',
  },
  {
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Austin, TX',
    type: 'Full-time',
  },
  {
    title: 'Sales Representative',
    department: 'Sales',
    location: 'Chicago, IL',
    type: 'Full-time',
  },
];

const benefits = [
  'Competitive salary and equity',
  'Comprehensive health insurance',
  'Flexible work arrangements',
  'Professional development budget',
  'Generous PTO and parental leave',
  '401(k) matching',
];

export default function CareersPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Card sx={{ borderRadius: 2, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Join Our Team
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Build the future of professional networking
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
              View Open Positions
            </Button>
          </CardContent>
        </Card>

        {/* Mission Section */}
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              We're on a mission to connect the world's professionals to make them more
              productive and successful. Every day, our members use our products to make
              connections, discover opportunities, build skills, and gain insights.
            </Typography>
            <Typography variant="body1">
              Join us in creating economic opportunity for every member of the global workforce.
            </Typography>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Why Work With Us
            </Typography>
            <Grid container spacing={2}>
              {benefits.map((benefit, index) => (
                <Grid xs={12} md={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mr: 2,
                      }}
                    />
                    <Typography variant="body1">{benefit}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Open Positions
            </Typography>
            <Grid container spacing={2}>
              {openPositions.map((position, index) => (
                <Grid xs={12} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 1,
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {position.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={position.department} size="small" />
                            <Chip label={position.location} size="small" variant="outlined" />
                            <Chip label={position.type} size="small" variant="outlined" />
                          </Box>
                        </Box>
                        <Button variant="contained">Apply Now</Button>
                      </Box>
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
