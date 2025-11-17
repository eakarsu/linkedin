'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';

interface Application {
  id: string;
  jobId: string;
  status: string;
  coverLetter: string | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    experienceLevel: string | null;
    salary: string | null;
  };
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/jobs/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'interview':
        return 'info';
      case 'reviewed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!session) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
        <Container maxWidth="lg">
          <Card sx={{ borderRadius: 2, textAlign: 'center', p: 4 }}>
            <Typography variant="h5">Please login to view your applications</Typography>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/jobs')}
            sx={{ textTransform: 'none', mb: 2 }}
          >
            Back to Jobs
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            My Applications
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Track the status of your job applications
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Loading applications...
            </Typography>
          </Box>
        ) : applications.length === 0 ? (
          <Card sx={{ borderRadius: 2, textAlign: 'center', p: 4 }}>
            <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No applications yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start applying to jobs to see your applications here
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/jobs')}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Browse Jobs
            </Button>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {applications.map((application) => (
              <Card
                key={application.id}
                sx={{
                  borderRadius: 2,
                  '&:hover': { boxShadow: 3 },
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/jobs/${application.jobId}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'primary.main' }}>
                        {application.job.title}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body1" color="text.secondary">
                            {application.job.company}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {application.job.location}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={application.job.type} size="small" variant="outlined" />
                        {application.job.experienceLevel && (
                          <Chip label={application.job.experienceLevel} size="small" variant="outlined" />
                        )}
                        {application.job.salary && (
                          <Chip label={application.job.salary} size="small" variant="outlined" />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        Applied on {formatDate(application.createdAt)}
                      </Typography>
                    </Box>

                    <Box sx={{ ml: 2 }}>
                      <Chip
                        label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        color={getStatusColor(application.status)}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Box>

                  {application.coverLetter && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Cover Letter:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                        {application.coverLetter}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
