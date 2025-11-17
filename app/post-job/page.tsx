'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Unstable_Grid2';
import Alert from '@mui/material/Alert';
import WorkIcon from '@mui/icons-material/Work';

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.jobTitle,
          company: formData.company,
          location: formData.location,
          type: formData.jobType,
          experienceLevel: formData.experienceLevel,
          salary: formData.salary,
          description: formData.description,
          requirements: formData.requirements,
          benefits: formData.benefits,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            jobTitle: '',
            company: '',
            location: '',
            jobType: '',
            experienceLevel: '',
            salary: '',
            description: '',
            requirements: '',
            benefits: '',
          });
        }, 3000);
      } else {
        const error = await response.json();
        alert('Failed to post job: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Post a Job
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Fill out the form below to post your job opening
                </Typography>
              </Box>
            </Box>

            {submitted && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Job posted successfully! Your job will be reviewed and published shortly.
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    required
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="Your company name"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    required
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g. San Francisco, CA or Remote"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={formData.jobType}
                      onChange={(e) => handleChange('jobType', e.target.value)}
                      label="Job Type"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="Full-time">Full-time</MenuItem>
                      <MenuItem value="Part-time">Part-time</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Internship">Internship</MenuItem>
                      <MenuItem value="Temporary">Temporary</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Experience Level</InputLabel>
                    <Select
                      value={formData.experienceLevel}
                      onChange={(e) => handleChange('experienceLevel', e.target.value)}
                      label="Experience Level"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="Entry level">Entry level</MenuItem>
                      <MenuItem value="Mid-level">Mid-level</MenuItem>
                      <MenuItem value="Senior">Senior</MenuItem>
                      <MenuItem value="Lead">Lead</MenuItem>
                      <MenuItem value="Executive">Executive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Salary Range"
                    value={formData.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    placeholder="e.g. $120,000 - $160,000"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Job Description"
                    required
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what the ideal candidate will do..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Requirements"
                    required
                    multiline
                    rows={4}
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    placeholder="List the required skills, qualifications, and experience..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Benefits"
                    multiline
                    rows={3}
                    value={formData.benefits}
                    onChange={(e) => handleChange('benefits', e.target.value)}
                    placeholder="Health insurance, 401(k), flexible hours, remote work, etc."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>

                <Grid xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{ textTransform: 'none', borderRadius: 3 }}
                      onClick={() => {
                        setFormData({
                          jobTitle: '',
                          company: '',
                          location: '',
                          jobType: '',
                          experienceLevel: '',
                          salary: '',
                          description: '',
                          requirements: '',
                          benefits: '',
                        });
                      }}
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{ textTransform: 'none', borderRadius: 3 }}
                    >
                      Post Job
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, bgcolor: '#f3f6f8' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Why Post on LinkedIn?
            </Typography>
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              <Typography component="li" variant="body2" paragraph>
                Reach millions of qualified professionals
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                Target candidates by skills, experience, and location
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                Easy application management and candidate screening
              </Typography>
              <Typography component="li" variant="body2">
                Employer branding and company visibility
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
