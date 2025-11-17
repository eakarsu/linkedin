'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid2 from '@mui/material/Unstable_Grid2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experienceLevel: string | null;
  salary: string | null;
  description: string;
  requirements: string | null;
  benefits: string | null;
  createdAt: string;
  _count: {
    applications: number;
  };
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchJob();
      checkApplication();
    }
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else if (response.status === 404) {
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const response = await fetch('/api/jobs/applications');
      if (response.ok) {
        const applications = await response.json();
        const applied = applications.some((app: any) => app.jobId === params.id);
        setHasApplied(applied);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleApply = async () => {
    if (!session?.user?.id) {
      alert('Please login to apply for jobs');
      return;
    }

    setApplying(true);
    try {
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: params.id,
          coverLetter,
          resume,
        }),
      });

      if (response.ok) {
        setHasApplied(true);
        setApplyDialogOpen(false);
        setCoverLetter('');
        setResume('');
        alert('Application submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Posted today';
    if (diff === 1) return 'Posted 1 day ago';
    if (diff < 7) return `Posted ${diff} days ago`;
    if (diff < 30) return `Posted ${Math.floor(diff / 7)} weeks ago`;
    return `Posted ${Math.floor(diff / 30)} months ago`;
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
            Loading job details...
          </Typography>
        </Container>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 8 }}>
            Job not found
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/jobs')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Jobs
        </Button>

        <Grid2 container spacing={3}>
          {/* Main Content */}
          <Grid2 xs={12} md={8}>
            <Card sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                  {job.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <BusinessIcon sx={{ color: 'text.secondary' }} />
                  <Typography variant="h6">{job.company}</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Chip
                    icon={<LocationOnIcon />}
                    label={job.location}
                    variant="outlined"
                  />
                  <Chip
                    icon={<WorkIcon />}
                    label={job.type}
                    variant="outlined"
                  />
                  {job.experienceLevel && (
                    <Chip
                      label={job.experienceLevel}
                      variant="outlined"
                    />
                  )}
                  {job.salary && (
                    <Chip
                      icon={<AttachMoneyIcon />}
                      label={job.salary}
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(job.createdAt)} " {job._count.applications} applicants
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  About the job
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                  {job.description}
                </Typography>

                {job.requirements && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Requirements
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                      {job.requirements}
                    </Typography>
                  </>
                )}

                {job.benefits && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Benefits
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                      {job.benefits}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid2>

          {/* Sidebar */}
          <Grid2 xs={12} md={4}>
            <Card sx={{ borderRadius: 2, position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 3 }}>
                {hasApplied ? (
                  <Button
                    variant="contained"
                    fullWidth
                    disabled
                    sx={{ textTransform: 'none', borderRadius: 3, mb: 2 }}
                  >
                    Applied
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setApplyDialogOpen(true)}
                    sx={{ textTransform: 'none', borderRadius: 3, mb: 2 }}
                  >
                    Apply now
                  </Button>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Job details
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Company
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {job.company}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {job.location}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Job type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {job.type}
                  </Typography>
                </Box>

                {job.experienceLevel && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Experience level
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {job.experienceLevel}
                    </Typography>
                  </Box>
                )}

                {job.salary && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Salary
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {job.salary}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        {/* Application Dialog */}
        <Dialog
          open={applyDialogOpen}
          onClose={() => !applying && setApplyDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Apply for {job.title}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Cover Letter"
                multiline
                rows={6}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're a great fit for this role..."
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Resume/CV Link (optional)"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="https://..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setApplyDialogOpen(false)}
              disabled={applying}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={applying || !coverLetter.trim()}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
