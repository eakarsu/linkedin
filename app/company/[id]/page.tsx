'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Company {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  headquarters: string | null;
  founded: string | null;
  specialties: string | null;
  website: string | null;
  logo: string | null;
  coverImage: string | null;
  followers: number;
  employees: Array<{
    id: string;
    title: string | null;
    user: {
      id: string;
      name: string;
      title: string | null;
      avatar: string | null;
    };
  }>;
  jobs: Array<{
    id: string;
    title: string;
    location: string;
    type: string;
    createdAt: string;
  }>;
  _count: {
    employees: number;
    jobs: number;
  };
}

export default function CompanyPage() {
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatFollowers = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="text.secondary">
          Company not found
        </Typography>
      </Box>
    );
  }

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
                  backgroundImage: company.coverImage ? `url(${company.coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '8px 8px 0 0',
                }}
              />
              <CardContent sx={{ position: 'relative', pt: 0 }}>
                <Avatar
                  src={company.logo || undefined}
                  variant="rounded"
                  sx={{
                    width: 120,
                    height: 120,
                    marginTop: '-60px',
                    border: '4px solid white',
                    mb: 2,
                    bgcolor: 'primary.main',
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {company.name}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {company.tagline}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatFollowers(company.followers)} followers
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {company._count.employees} employees on LinkedIn
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant={isFollowing ? 'outlined' : 'contained'}
                    onClick={() => setIsFollowing(!isFollowing)}
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                  >
                    {isFollowing ? 'Following' : '+ Follow'}
                  </Button>
                  {company.website && (
                    <Button
                      variant="outlined"
                      startIcon={<LanguageIcon />}
                      href={company.website}
                      target="_blank"
                      sx={{ textTransform: 'none', borderRadius: 3 }}
                    >
                      Visit website
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tab label="About" sx={{ textTransform: 'none' }} />
                <Tab label={`Jobs (${company._count.jobs})`} sx={{ textTransform: 'none' }} />
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
                    {company.description}
                  </Typography>

                  {company.website && (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
                        Website
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          {company.website}
                        </a>
                      </Typography>
                    </>
                  )}

                  {company.industry && (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Industry
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {company.industry}
                      </Typography>
                    </>
                  )}

                  {company.companySize && (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Company size
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {company.companySize}
                      </Typography>
                    </>
                  )}

                  {company.headquarters && (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Headquarters
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {company.headquarters}
                      </Typography>
                    </>
                  )}

                  {company.founded && (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Founded
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {company.founded}
                      </Typography>
                    </>
                  )}

                  {company.specialties && (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Specialties
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {company.specialties.split(',').map((specialty, index) => (
                          <Chip key={index} label={specialty.trim()} size="small" />
                        ))}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Jobs Tab */}
            {activeTab === 1 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {company._count.jobs} jobs available
                  </Typography>
                  {company.jobs.length > 0 ? (
                    company.jobs.map((job) => (
                      <Card key={job.id} sx={{ mb: 2, border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
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
                            Posted {formatDate(job.createdAt)}
                          </Typography>
                          <Button variant="contained" sx={{ textTransform: 'none', borderRadius: 3 }}>
                            Apply
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No job openings at this time.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {/* People Tab */}
            {activeTab === 2 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Employees at {company.name}
                  </Typography>
                  {company.employees.length > 0 ? (
                    <Grid2 container spacing={2}>
                      {company.employees.map((employee) => (
                        <Grid2 key={employee.id} xs={12} sm={6}>
                          <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar src={employee.user.avatar || undefined} sx={{ width: 56, height: 56 }} />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {employee.user.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 1 }}>
                                    {employee.title || employee.user.title}
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
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No employees found.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid2>

          {/* Right Sidebar */}
          <Grid2 xs={12} md={4}>
            <Card sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Company Stats
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PeopleIcon color="primary" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatFollowers(company.followers)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Followers
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <WorkIcon color="primary" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {company._count.jobs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Open positions
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BusinessIcon color="primary" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {company._count.employees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Employees on LinkedIn
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {company.founded && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Quick Facts
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Founded
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {company.founded}
                      </Typography>
                    </Box>
                  </Box>
                  {company.headquarters && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocationOnIcon sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Headquarters
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {company.headquarters}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}
