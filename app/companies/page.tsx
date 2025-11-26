'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Unstable_Grid2';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface Company {
  id: string;
  name: string;
  tagline: string | null;
  industry: string | null;
  headquarters: string | null;
  logo: string | null;
  coverImage: string | null;
  followers: number;
  _count: {
    employees: number;
    jobs: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFollowers = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <BusinessIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  Companies
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Discover companies and follow to get updates
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth
              placeholder="Search companies by name, industry, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: '#f3f6f8', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </CardContent>
        </Card>

        {/* Companies Grid */}
        <Grid2 container spacing={3}>
          {filteredCompanies.map((company) => (
            <Grid2 key={company.id} xs={12} sm={6} md={4}>
              <Link href={`/company/${company.id}`} style={{ textDecoration: 'none' }}>
                <Card sx={{ borderRadius: 2, height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                  {/* Cover Image */}
                  <Box
                    sx={{
                      height: 80,
                      backgroundImage: company.coverImage ? `url(${company.coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}
                  >
                    <Avatar
                      src={company.logo || undefined}
                      variant="rounded"
                      sx={{
                        width: 72,
                        height: 72,
                        position: 'absolute',
                        bottom: -36,
                        left: 16,
                        border: '4px solid white',
                        bgcolor: 'primary.main',
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 36 }} />
                    </Avatar>
                  </Box>

                  <CardContent sx={{ pt: 5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {company.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
                      {company.tagline}
                    </Typography>

                    {company.industry && (
                      <Chip label={company.industry} size="small" sx={{ mb: 2 }} />
                    )}

                    {company.headquarters && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {company.headquarters}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatFollowers(company.followers)} followers
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {company._count.employees} employees
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WorkIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {company._count.jobs} jobs
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid2>
          ))}
        </Grid2>

        {filteredCompanies.length === 0 && (
          <Card sx={{ borderRadius: 2, p: 6, textAlign: 'center' }}>
            <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No companies found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search query
            </Typography>
          </Card>
        )}
      </Container>
    </Box>
  );
}
