'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid2 from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PostAddIcon from '@mui/icons-material/PostAdd';

const jobListings = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    type: 'Full-time',
    level: 'Senior',
    posted: '2 days ago',
    applicants: 87,
    description: 'We are looking for a Senior Software Engineer to join our team...',
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'Meta',
    location: 'Menlo Park, CA',
    type: 'Full-time',
    level: 'Mid-Senior',
    posted: '1 week ago',
    applicants: 156,
    description: 'Join our product team to build the future of social networking...',
  },
  {
    id: 3,
    title: 'UX Designer',
    company: 'Apple',
    location: 'Cupertino, CA',
    type: 'Full-time',
    level: 'Mid-level',
    posted: '3 days ago',
    applicants: 234,
    description: 'Design beautiful and intuitive user experiences for millions...',
  },
  {
    id: 4,
    title: 'Frontend Developer',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    type: 'Full-time',
    level: 'Junior',
    posted: '5 days ago',
    applicants: 312,
    description: 'Build engaging web experiences for our streaming platform...',
  },
  {
    id: 5,
    title: 'Data Scientist',
    company: 'Amazon',
    location: 'Seattle, WA',
    type: 'Full-time',
    level: 'Senior',
    posted: '1 day ago',
    applicants: 45,
    description: 'Apply machine learning and analytics to solve complex problems...',
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    company: 'Microsoft',
    location: 'Redmond, WA',
    type: 'Full-time',
    level: 'Mid-Senior',
    posted: '4 days ago',
    applicants: 98,
    description: 'Build and maintain cloud infrastructure at scale...',
  },
];

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    if (session) {
      fetchJobs();
      fetchApplications();
    }
  }, [session]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/jobs/applications');
      if (response.ok) {
        const data = await response.json();
        const appliedJobIds = data.map((app: any) => app.jobId);
        setAppliedJobs(appliedJobIds);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!session?.user?.id) {
      alert('Please login to apply for jobs');
      return;
    }

    try {
      const response = await fetch('/api/jobs/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          coverLetter: '',
          resume: '',
        }),
      });

      if (response.ok) {
        setAppliedJobs([...appliedJobs, jobId]);
        alert('Application submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (locationQuery) params.append('location', locationQuery);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return `${Math.floor(diff / 30)} months ago`;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={3}>
          {/* Search and Filters */}
          <Grid2 xs={12}>
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Grid2 container spacing={2}>
                  <Grid2 xs={12} md={5}>
                    <TextField
                      fullWidth
                      placeholder="Search jobs"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid2>
                  <Grid2 xs={12} md={5}>
                    <TextField
                      fullWidth
                      placeholder="Location"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid2>
                  <Grid2 xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSearch}
                      sx={{ height: '56px', textTransform: 'none' }}
                    >
                      Search
                    </Button>
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>
          </Grid2>

          {/* Left Sidebar - Filters */}
          <Grid2 xs={12} md={3}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Filters
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                  Job Type
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                    <Box key={type} sx={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" id={type} />
                      <label htmlFor={type} style={{ marginLeft: '8px', fontSize: '14px' }}>
                        {type}
                      </label>
                    </Box>
                  ))}
                </Box>

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                  Experience Level
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Entry level', 'Mid-level', 'Senior', 'Executive'].map((level) => (
                    <Box key={level} sx={{ display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" id={level} />
                      <label htmlFor={level} style={{ marginLeft: '8px', fontSize: '14px' }}>
                        {level}
                      </label>
                    </Box>
                  ))}
                </Box>

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
                  Date Posted
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Past 24 hours', 'Past Week', 'Past Month', 'Any time'].map((date) => (
                    <Box key={date} sx={{ display: 'flex', alignItems: 'center' }}>
                      <input type="radio" name="date" id={date} />
                      <label htmlFor={date} style={{ marginLeft: '8px', fontSize: '14px' }}>
                        {date}
                      </label>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid2>

          {/* Main Content - Job Listings */}
          <Grid2 xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {jobs.length} jobs found
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Link href="/jobs/my-applications" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    startIcon={<WorkIcon />}
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                  >
                    My Applications ({appliedJobs.length})
                  </Button>
                </Link>
                <Link href="/post-job" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    startIcon={<PostAddIcon />}
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                  >
                    Post a Job
                  </Button>
                </Link>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Loading jobs...
                </Typography>
              </Box>
            ) : jobs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No jobs found. Try adjusting your search criteria.
                </Typography>
              </Box>
            ) : (
              jobs.map((job) => (
                <Card key={job.id} sx={{ mb: 2, borderRadius: 2, '&:hover': { boxShadow: 3 }, cursor: 'pointer' }} onClick={() => window.location.href = `/jobs/${job.id}`}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                          {job.title}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {job.company}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • {job.type}
                          </Typography>
                          {job.experienceLevel && (
                            <Typography variant="body2" color="text.secondary">
                              • {job.experienceLevel}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {job.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip label={formatDate(job.createdAt)} size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {job._count?.applications || 0} applicants
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                        {appliedJobs.includes(job.id) ? (
                          <Button
                            variant="contained"
                            disabled
                            sx={{ textTransform: 'none', borderRadius: 3 }}
                          >
                            Applied
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => handleApply(job.id)}
                            sx={{ textTransform: 'none', borderRadius: 3 }}
                          >
                            Apply
                          </Button>
                        )}
                        <IconButton
                          onClick={() => handleSaveJob(job.id)}
                          sx={{
                            border: '1px solid',
                            borderColor: savedJobs.includes(job.id) ? 'primary.main' : '#e0e0e0',
                            borderRadius: 2,
                            color: savedJobs.includes(job.id) ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          {savedJobs.includes(job.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}
