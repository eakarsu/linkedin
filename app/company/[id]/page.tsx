'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid2 from '@mui/material/Unstable_Grid2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';

const companyData = {
  name: 'Google',
  tagline: 'Technology, Information and Internet',
  description: 'A problem isn\'t truly solved until it\'s solved for all. Googlers build products that help create opportunities for everyone, whether down the street or across the globe. Bring your insight, imagination and a healthy disregard for the impossible. Bring everything that makes you unique. Together, we can build for everyone.',
  industry: 'Technology, Information and Internet',
  companySize: '100,000+ employees',
  headquarters: 'Mountain View, California',
  founded: '1998',
  specialties: 'Search, Ads, Mobile, Android, Online Video, Apps, Machine Learning, Virtual Reality, Cloud, Hardware, Artificial Intelligence, YouTube, and Software',
  website: 'https://www.google.com',
  followers: '25M followers',
  logo: 'https://i.pravatar.cc/150?img=51',
  coverImage: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=300&fit=crop',
};

const jobs = [
  {
    title: 'Senior Software Engineer',
    location: 'Mountain View, CA',
    type: 'Full-time',
    posted: '2 days ago',
    applicants: 87,
  },
  {
    title: 'Product Manager',
    location: 'San Francisco, CA',
    type: 'Full-time',
    posted: '5 days ago',
    applicants: 156,
  },
  {
    title: 'UX Designer',
    location: 'New York, NY',
    type: 'Full-time',
    posted: '1 week ago',
    applicants: 234,
  },
];

const employees = [
  {
    name: 'Sarah Johnson',
    title: 'Senior Product Manager',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Michael Chen',
    title: 'Software Engineer',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    name: 'Emily Rodriguez',
    title: 'UX Designer',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    name: 'David Kim',
    title: 'Engineering Manager',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
];

export default function CompanyPage() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Grid2 container spacing={3}>
          <Grid2 xs={12} md={8}>
            {/* Company Header */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `url(${companyData.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '8px 8px 0 0',
                }}
              />
              <CardContent sx={{ position: 'relative', pt: 0 }}>
                <Avatar
                  src={companyData.logo}
                  variant="rounded"
                  sx={{
                    width: 120,
                    height: 120,
                    marginTop: '-60px',
                    border: '4px solid white',
                    mb: 2,
                  }}
                />
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {companyData.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {companyData.tagline}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {companyData.followers}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant={isFollowing ? 'outlined' : 'contained'}
                    onClick={() => setIsFollowing(!isFollowing)}
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                  >
                    {isFollowing ? 'Following' : '+ Follow'}
                  </Button>
                  <Button variant="outlined" sx={{ textTransform: 'none', borderRadius: 3 }}>
                    Visit website
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tab label="About" sx={{ textTransform: 'none' }} />
                <Tab label={`Jobs (${jobs.length})`} sx={{ textTransform: 'none' }} />
                <Tab label="People" sx={{ textTransform: 'none' }} />
              </Tabs>
            </Card>

            {/* About Tab */}
            {activeTab === 0 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    About
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {companyData.description}
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                    Website
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                    {companyData.website}
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Industry
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {companyData.industry}
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Company size
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {companyData.companySize}
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Headquarters
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {companyData.headquarters}
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Founded
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {companyData.founded}
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Specialties
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {companyData.specialties}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Jobs Tab */}
            {activeTab === 1 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {jobs.length} jobs available
                  </Typography>
                  {jobs.map((job, index) => (
                    <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {job.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.location} • {job.type}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {job.applicants} applicants • {job.posted}
                        </Typography>
                        <Button variant="contained" sx={{ textTransform: 'none', borderRadius: 3 }}>
                          Apply
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* People Tab */}
            {activeTab === 2 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Employees at {companyData.name}
                  </Typography>
                  <Grid2 container spacing={2}>
                    {employees.map((employee, index) => (
                      <Grid2 key={index} xs={12} sm={6}>
                        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Avatar src={employee.avatar} sx={{ width: 56, height: 56 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {employee.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 1 }}>
                                  {employee.title}
                                </Typography>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{ textTransform: 'none', borderRadius: 3 }}
                                >
                                  Connect
                                </Button>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid2>
                    ))}
                  </Grid2>
                </CardContent>
              </Card>
            )}
          </Grid2>

          {/* Right Sidebar */}
          <Grid2 xs={12} md={4}>
            <Card sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Similar companies
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Avatar src="https://i.pravatar.cc/150?img=52" variant="rounded" sx={{ width: 48, height: 48 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Meta
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      18M followers
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>
                    Follow
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar src="https://i.pravatar.cc/150?img=53" variant="rounded" sx={{ width: 48, height: 48 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Microsoft
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      15M followers
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>
                    Follow
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}
