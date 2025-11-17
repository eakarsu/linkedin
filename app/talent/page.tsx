'use client';

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
    title: 'Recruiter',
    description: 'Find and connect with the right candidates faster with LinkedIn Recruiter.',
    benefits: ['Advanced search filters', 'InMail credits', 'Candidate insights'],
    link: '/premium',
  },
  {
    title: 'Job Posting',
    description: 'Post jobs and reach qualified candidates actively looking for opportunities.',
    benefits: ['Targeted reach', 'Applicant tracking', 'Easy screening'],
    link: '/post-job',
  },
  {
    title: 'Employer Branding',
    description: 'Showcase your company culture and attract top talent to your organization.',
    benefits: ['Career pages', 'Employee stories', 'Company updates'],
    link: '/business',
  },
  {
    title: 'Talent Insights',
    description: 'Make data-driven decisions with workforce analytics and talent pool insights.',
    benefits: ['Market intelligence', 'Talent pool data', 'Competitive analysis'],
    link: '/business',
  },
];

export default function TalentPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 2, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
              LinkedIn Talent Solutions
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Find, attract, and hire the best talent for your organization
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
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
              Talent Solutions
            </Typography>
            <Grid container spacing={3}>
              {features.map((feature, index) => (
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
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" paragraph color="text.secondary">
                        {feature.description}
                      </Typography>
                      <Box>
                        {feature.benefits.map((benefit, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                mr: 1.5,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
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

        <Card sx={{ borderRadius: 2, bgcolor: '#f3f6f8' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Start Hiring Today
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Join thousands of companies using LinkedIn to build world-class teams.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/post-job" style={{ textDecoration: 'none' }}>
                <Button variant="contained" size="large">
                  Post a Job
                </Button>
              </Link>
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
