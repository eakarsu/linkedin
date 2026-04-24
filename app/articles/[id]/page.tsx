'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ArticleData {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  views: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
    title: string | null;
  };
  likes: any[];
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (params.id) fetchArticle();
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
        setEditData({
          title: data.title,
          content: data.content,
        });
      } else if (response.status === 404) {
        router.push('/articles');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          excerpt: editData.content.substring(0, 200),
        }),
      });
      if (response.ok) {
        setEditOpen(false);
        fetchArticle();
      }
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const response = await fetch(`/api/articles/${params.id}`, { method: 'DELETE' });
      if (response.ok) router.push('/articles');
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  if (!article) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="text.secondary">Article not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/articles')}
          sx={{ mb: 2, textTransform: 'none' }}
        >
          Back to Articles
        </Button>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 2 }}>
              {article.image && (
                <Box
                  sx={{
                    height: 400,
                    backgroundImage: `url(${article.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px 8px 0 0',
                  }}
                />
              )}
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
                  {article.title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar src={article.author.avatar || undefined} sx={{ width: 56, height: 56 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{article.author.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{article.author.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(article.createdAt)} · {Math.ceil(article.content.length / 1000)} min read
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VisibilityIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {article.views.toLocaleString()} views
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUpOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {article.likes.length} likes
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.1rem' }}>
                  {article.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 2, position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>About the Author</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar src={article.author.avatar || undefined} sx={{ width: 64, height: 64 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{article.author.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{article.author.title}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    fullWidth
                    onClick={() => setEditOpen(true)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    fullWidth
                    onClick={handleDelete}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>Edit Article</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={15}
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" onClick={handleEdit} disabled={!editData.title || !editData.content} sx={{ textTransform: 'none', borderRadius: 3 }}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
