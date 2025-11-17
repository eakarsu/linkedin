'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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
import TagIcon from '@mui/icons-material/Tag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';

const hashtagData = {
  artificialintelligence: {
    name: 'Artificial Intelligence',
    followers: '5.2M',
    description: 'The latest news, trends, and discussions about Artificial Intelligence and Machine Learning',
    relatedTags: ['machinelearning', 'deeplearning', 'AI', 'technology', 'innovation'],
  },
  webdevelopment: {
    name: 'Web Development',
    followers: '3.8M',
    description: 'Everything about modern web development, frameworks, and best practices',
    relatedTags: ['javascript', 'react', 'nodejs', 'frontend', 'backend'],
  },
};

const posts = [
  {
    author: 'Sarah Johnson',
    title: 'Senior AI Researcher at OpenAI',
    avatar: 'https://i.pravatar.cc/150?img=1',
    timestamp: '2h',
    content: 'Excited to share our latest breakthrough in natural language processing! Our new model achieves state-of-the-art results while using 40% less computational resources. #ArtificialIntelligence #MachineLearning',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    likes: 1840,
    comments: 126,
  },
  {
    author: 'Michael Chen',
    title: 'ML Engineer at Google',
    avatar: 'https://i.pravatar.cc/150?img=2',
    timestamp: '5h',
    content: 'Just published a comprehensive guide on implementing transformers from scratch. Check it out if you\'re interested in understanding how modern AI models work! #ArtificialIntelligence #DeepLearning',
    likes: 2456,
    comments: 187,
  },
  {
    author: 'Emily Rodriguez',
    title: 'Data Scientist at Meta',
    avatar: 'https://i.pravatar.cc/150?img=3',
    timestamp: '1d',
    content: 'The future of AI is not just about bigger models, it\'s about smarter, more efficient ones. Here\'s what I learned from optimizing our production ML pipeline... #ArtificialIntelligence #AI',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop',
    likes: 3120,
    comments: 234,
  },
];

const topContributors = [
  {
    name: 'Dr. Andrew Ng',
    title: 'Founder of DeepLearning.AI',
    avatar: 'https://i.pravatar.cc/150?img=11',
    followers: '3.5M',
  },
  {
    name: 'Yann LeCun',
    title: 'Chief AI Scientist at Meta',
    avatar: 'https://i.pravatar.cc/150?img=12',
    followers: '2.8M',
  },
  {
    name: 'Fei-Fei Li',
    title: 'Professor at Stanford',
    avatar: 'https://i.pravatar.cc/150?img=13',
    followers: '1.9M',
  },
];

export default function HashtagPage() {
  const params = useParams();
  const tag = params.tag as string;
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const data = hashtagData[tag as keyof typeof hashtagData] || hashtagData.artificialintelligence;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        <Grid2 container spacing={3}>
          <Grid2 xs={12} md={8}>
            {/* Header */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TagIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                      #{data.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {data.followers} followers
                    </Typography>
                  </Box>
                  <Button
                    variant={isFollowing ? 'outlined' : 'contained'}
                    onClick={() => setIsFollowing(!isFollowing)}
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                  >
                    {isFollowing ? 'Following' : '+ Follow'}
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {data.description}
                </Typography>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tab label="Top" sx={{ textTransform: 'none' }} />
                <Tab label="Recent" sx={{ textTransform: 'none' }} />
                <Tab label="People" sx={{ textTransform: 'none' }} />
              </Tabs>
            </Card>

            {/* Posts */}
            {(activeTab === 0 || activeTab === 1) && (
              <Box>
                {posts.map((post, index) => (
                  <Card key={index} sx={{ mb: 2, borderRadius: 2, '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Avatar src={post.avatar} sx={{ width: 48, height: 48 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {post.author}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                            {post.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                            {post.timestamp}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {post.content}
                      </Typography>
                      {post.image && (
                        <Box
                          sx={{
                            width: '100%',
                            height: 300,
                            backgroundImage: `url(${post.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 1,
                            mb: 2,
                          }}
                        />
                      )}
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                          {post.likes.toLocaleString()} likes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
                          {post.comments} comments
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* People Tab */}
            {activeTab === 2 && (
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Top Contributors
                  </Typography>
                  <Grid2 container spacing={2}>
                    {topContributors.map((person, index) => (
                      <Grid2 key={index} xs={12} sm={6}>
                        <Card sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', '&:hover': { boxShadow: 2 } }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Avatar src={person.avatar} sx={{ width: 56, height: 56 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {person.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px', mb: 0.5 }}>
                                  {person.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px', mb: 1 }}>
                                  {person.followers} followers
                                </Typography>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  sx={{ textTransform: 'none', borderRadius: 3 }}
                                >
                                  Follow
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
                  Related Hashtags
                </Typography>
                {data.relatedTags.map((relatedTag, index) => (
                  <Box key={index} sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer' }}>
                      #{relatedTag}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                      {Math.floor(Math.random() * 2000000 + 500000).toLocaleString()} followers
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Trending Now
                </Typography>
                {['AI Ethics', 'ChatGPT', 'Neural Networks', 'Computer Vision'].map((topic, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <TrendingUpIcon sx={{ fontSize: 20, color: 'success.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{topic}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                        {Math.floor(Math.random() * 10000 + 1000).toLocaleString()} posts today
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}
