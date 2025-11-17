'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Unstable_Grid2';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ArticleIcon from '@mui/icons-material/Article';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';

interface Article {
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
    title: string | null;
    avatar: string | null;
  };
  likes: any[];
}

export default function ArticlesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = '042f6229-ab78-44c1-9404-0de3de58175e'; // Default user from seed

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePublish = async () => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: articleTitle,
          content: articleContent,
          excerpt: articleContent.substring(0, 200),
          authorId: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish article');
      }

      const newArticle = await response.json();
      console.log('Article published:', newArticle);

      // Refresh articles list
      await fetchArticles();

      // Close dialog and reset form
      setOpenDialog(false);
      setArticleTitle('');
      setArticleContent('');
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Failed to publish article. Please try again.');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={3}>
          <Grid2 xs={12} md={8}>
            {/* Header */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ArticleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Articles & Newsletters
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Share your knowledge and insights
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                  >
                    Write Article
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tab label="Discover" sx={{ textTransform: 'none' }} />
                <Tab label="My Articles" sx={{ textTransform: 'none' }} />
              </Tabs>
            </Card>

            {/* Discover Tab */}
            {activeTab === 0 && (
              <Box>
                {loading ? (
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Loading articles...
                      </Typography>
                    </CardContent>
                  </Card>
                ) : articles.length > 0 ? (
                  articles.map((article) => (
                    <Card key={article.id} sx={{ mb: 2, borderRadius: 2, '&:hover': { boxShadow: 3 }, cursor: 'pointer' }}>
                      <Grid2 container>
                        <Grid2 xs={12} md={article.image ? 8 : 12}>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              <Avatar src={article.author.avatar || '/profile.jpg'} sx={{ width: 40, height: 40 }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {article.author.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                  {article.author.title || 'LinkedIn Member'}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {article.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {article.excerpt || article.content.substring(0, 200) + '...'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                {new Date(article.createdAt).toLocaleDateString()} • {Math.ceil(article.content.length / 1000)} min read
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ThumbUpOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                    {article.likes.length}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Grid2>
                        {article.image && (
                          <Grid2 xs={12} md={4}>
                            <Box
                              sx={{
                                height: '100%',
                                minHeight: 200,
                                backgroundImage: `url(${article.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: { xs: '0 0 8px 8px', md: '0 8px 8px 0' },
                              }}
                            />
                          </Grid2>
                        )}
                      </Grid2>
                    </Card>
                  ))
                ) : (
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                      <ArticleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No articles yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Be the first to share your expertise
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ textTransform: 'none', borderRadius: 3 }}
                      >
                        Write First Article
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {/* My Articles Tab */}
            {activeTab === 1 && (
              <Box>
                {(() => {
                  const myArticles = articles.filter(article => article.author.id === currentUserId);
                  return myArticles.length > 0 ? (
                    myArticles.map((article) => (
                      <Card key={article.id} sx={{ mb: 2, borderRadius: 2, '&:hover': { boxShadow: 3 }, cursor: 'pointer' }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {article.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                              {article.views.toLocaleString()} views
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                              {article.likes.length.toLocaleString()} likes
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                            Published {new Date(article.createdAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <ArticleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          No articles yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Share your expertise and insights with your network
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setOpenDialog(true)}
                          sx={{ textTransform: 'none', borderRadius: 3 }}
                        >
                          Write Your First Article
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })()}
              </Box>
            )}
          </Grid2>

          {/* Right Sidebar */}
          <Grid2 xs={12} md={4}>
            <Card sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Trending Topics
                </Typography>
                {[
                  { topic: 'Artificial Intelligence', count: 4523 },
                  { topic: 'Remote Work', count: 3891 },
                  { topic: 'Product Management', count: 2756 },
                  { topic: 'Web Development', count: 5124 },
                  { topic: 'Leadership', count: 3467 }
                ].map((item, index) => (
                  <Box key={index} sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      #{item.topic}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      {item.count} articles
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Writing Tips
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Start with a compelling headline
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Use clear, concise language
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Include relevant images
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Engage with your readers
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        {/* Write Article Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Write an Article
              </Typography>
              <IconButton onClick={() => setOpenDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              placeholder="Article Title"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              variant="standard"
              sx={{ mb: 3, fontSize: '24px', fontWeight: 600 }}
              InputProps={{
                style: { fontSize: '24px', fontWeight: 600 },
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={15}
              placeholder="Tell your story..."
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              variant="standard"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ textTransform: 'none' }}>
              Save Draft
            </Button>
            <Button
              onClick={handlePublish}
              variant="contained"
              disabled={!articleTitle || !articleContent}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Publish
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
