'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Unstable_Grid2';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import ArticleIcon from '@mui/icons-material/Article';

interface Group {
  id: string;
  name: string;
  description: string | null;
  rules: string | null;
  image: string | null;
  coverImage: string | null;
  isPublic: boolean;
  industry: string | null;
  owner: {
    id: string;
    name: string;
    avatar: string | null;
  };
  _count: {
    members: number;
    posts: number;
  };
  isMember?: boolean;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    industry: '',
    isPublic: true,
    rules: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });

      if (response.ok) {
        setCreateDialogOpen(false);
        setNewGroup({
          name: '',
          description: '',
          industry: '',
          isPublic: true,
          rules: '',
        });
        fetchGroups();
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      });
      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const industries = [
    'Technology',
    'Business',
    'Design',
    'Marketing',
    'Finance',
    'Healthcare',
    'Education',
    'Other',
  ];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 0) return matchesSearch; // All
    if (activeTab === 1) return matchesSearch && group.isPublic;
    if (activeTab === 2) return matchesSearch && !group.isPublic;
    if (activeTab === 3) return matchesSearch && group.industry === 'Technology';
    if (activeTab === 4) return matchesSearch && group.industry === 'Business';
    return matchesSearch;
  });

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GroupIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Groups
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Join communities and connect with professionals
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ borderRadius: 3 }}
              >
                Create Group
              </Button>
            </Box>
            <TextField
              fullWidth
              placeholder="Search groups..."
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

        {/* Tabs */}
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ px: 2 }}
          >
            <Tab label="All Groups" sx={{ textTransform: 'none' }} />
            <Tab label="Public" sx={{ textTransform: 'none' }} />
            <Tab label="Private" sx={{ textTransform: 'none' }} />
            <Tab label="Technology" sx={{ textTransform: 'none' }} />
            <Tab label="Business" sx={{ textTransform: 'none' }} />
          </Tabs>
        </Card>

        {/* Groups Grid */}
        <Grid2 container spacing={3}>
          {filteredGroups.map((group) => (
            <Grid2 key={group.id} xs={12} md={6} lg={4}>
              <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 4 } }}>
                {/* Cover Image */}
                <Box
                  sx={{
                    height: 100,
                    backgroundImage: group.coverImage ? `url(${group.coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  <Avatar
                    src={group.image || undefined}
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
                    <GroupIcon sx={{ fontSize: 36 }} />
                  </Avatar>
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    {group.isPublic ? (
                      <Chip
                        icon={<PublicIcon sx={{ fontSize: 14 }} />}
                        label="Public"
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                      />
                    ) : (
                      <Chip
                        icon={<LockIcon sx={{ fontSize: 14 }} />}
                        label="Private"
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                      />
                    )}
                  </Box>
                </Box>

                <CardContent sx={{ pt: 5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {group.name}
                  </Typography>

                  {group.industry && (
                    <Chip
                      label={group.industry}
                      size="small"
                      sx={{ alignSelf: 'flex-start', mb: 1 }}
                    />
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {group._count.members.toLocaleString()} members
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ArticleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {group._count.posts} posts
                      </Typography>
                    </Box>
                  </Box>

                  {group.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {group.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar src={group.owner.avatar || undefined} sx={{ width: 24, height: 24 }} />
                    <Typography variant="body2" color="text.secondary">
                      Created by {group.owner.name}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleJoinGroup(group.id)}
                    sx={{ borderRadius: 2, mt: 'auto' }}
                  >
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>

        {filteredGroups.length === 0 && (
          <Card sx={{ borderRadius: 2, p: 6, textAlign: 'center' }}>
            <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No groups found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or create a new group
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
              Create Group
            </Button>
          </Card>
        )}

        {/* Create Group Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Create Group</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Group Name"
                fullWidth
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              />
              <TextField
                select
                label="Industry"
                fullWidth
                value={newGroup.industry}
                onChange={(e) => setNewGroup({ ...newGroup, industry: e.target.value })}
              >
                {industries.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Group Rules (Optional)"
                fullWidth
                multiline
                rows={2}
                value={newGroup.rules}
                onChange={(e) => setNewGroup({ ...newGroup, rules: e.target.value })}
                placeholder="1. Be respectful&#10;2. No spam"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newGroup.isPublic}
                    onChange={(e) => setNewGroup({ ...newGroup, isPublic: e.target.checked })}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {newGroup.isPublic ? <PublicIcon /> : <LockIcon />}
                    <Typography>
                      {newGroup.isPublic ? 'Public - Anyone can find and join' : 'Private - Only invited members can join'}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateGroup}
              disabled={!newGroup.name}
            >
              Create Group
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
