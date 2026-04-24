'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';

interface GroupData {
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
    title: string | null;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      avatar: string | null;
      title: string | null;
    };
  }>;
  posts: Array<{
    id: string;
    content: string;
    image: string | null;
    createdAt: string;
    author: {
      id: string;
      name: string;
      avatar: string | null;
      title: string | null;
    };
  }>;
  _count: {
    members: number;
    posts: number;
  };
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    industry: '',
    rules: '',
    isPublic: true,
  });

  const industries = ['Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Other'];

  useEffect(() => {
    if (params.id) fetchGroup();
  }, [params.id]);

  const fetchGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setGroup(data);
        setEditData({
          name: data.name,
          description: data.description || '',
          industry: data.industry || '',
          rules: data.rules || '',
          isPublic: data.isPublic,
        });
      } else if (response.status === 404) {
        router.push('/groups');
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/groups/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setEditOpen(false);
        fetchGroup();
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      const response = await fetch(`/api/groups/${params.id}`, { method: 'DELETE' });
      if (response.ok) router.push('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!group) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="text.secondary">Group not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/groups')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Groups
        </Button>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Header */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  height: 200,
                  backgroundImage: group.coverImage ? `url(${group.coverImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '8px 8px 0 0',
                }}
              />
              <CardContent sx={{ position: 'relative', pt: 0 }}>
                <Avatar
                  src={group.image || undefined}
                  sx={{
                    width: 100,
                    height: 100,
                    marginTop: '-50px',
                    border: '4px solid white',
                    mb: 2,
                    bgcolor: 'primary.main',
                  }}
                >
                  <GroupIcon sx={{ fontSize: 50 }} />
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>{group.name}</Typography>
                  {group.isPublic ? (
                    <Chip icon={<PublicIcon sx={{ fontSize: 14 }} />} label="Public" size="small" />
                  ) : (
                    <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Private" size="small" />
                  )}
                </Box>
                {group.industry && (
                  <Chip label={group.industry} size="small" sx={{ mb: 1 }} />
                )}
                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {group._count.members.toLocaleString()} members
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ArticleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {group._count.posts} posts
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditOpen(true)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ px: 2 }}>
                <Tab label="About" sx={{ textTransform: 'none' }} />
                <Tab label="Posts" sx={{ textTransform: 'none' }} />
                <Tab label="Members" sx={{ textTransform: 'none' }} />
              </Tabs>
            </Card>

            {/* About Tab */}
            {activeTab === 0 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>About</Typography>
                  <Typography variant="body1" paragraph>{group.description}</Typography>
                  {group.rules && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Group Rules</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{group.rules}</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Posts Tab */}
            {activeTab === 1 && (
              <Box>
                {group.posts.length > 0 ? group.posts.map((post) => (
                  <Card key={post.id} sx={{ mb: 2, borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar src={post.author.avatar || undefined} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>{post.author.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{formatDate(post.createdAt)}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1">{post.content}</Typography>
                      {post.image && (
                        <Box
                          component="img"
                          src={post.image}
                          sx={{ width: '100%', borderRadius: 2, mt: 2, maxHeight: 400, objectFit: 'cover' }}
                        />
                      )}
                    </CardContent>
                  </Card>
                )) : (
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="body1" color="text.secondary">No posts yet</Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {/* Members Tab */}
            {activeTab === 2 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Members ({group._count.members})
                  </Typography>
                  <Grid container spacing={2}>
                    {group.members.map((member) => (
                      <Grid key={member.id} size={{ xs: 12, sm: 6 }}>
                        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Avatar src={member.user.avatar || undefined} sx={{ width: 48, height: 48 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>{member.user.name}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                                  {member.user.title}
                                </Typography>
                              </Box>
                              {member.role !== 'member' && (
                                <Chip label={member.role} size="small" color="primary" variant="outlined" />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 2, position: 'sticky', top: 80 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Admin</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={group.owner.avatar || undefined} sx={{ width: 48, height: 48 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{group.owner.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{group.owner.title}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Edit Group</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Group Name"
                fullWidth
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
              <TextField
                select
                label="Industry"
                fullWidth
                value={editData.industry}
                onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
              >
                {industries.map((ind) => (
                  <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Rules"
                fullWidth
                multiline
                rows={2}
                value={editData.rules}
                onChange={(e) => setEditData({ ...editData, rules: e.target.value })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.isPublic}
                    onChange={(e) => setEditData({ ...editData, isPublic: e.target.checked })}
                  />
                }
                label={editData.isPublic ? 'Public' : 'Private'}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" onClick={handleEdit} disabled={!editData.name} sx={{ textTransform: 'none', borderRadius: 3 }}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
