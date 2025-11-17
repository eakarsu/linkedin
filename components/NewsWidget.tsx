'use client';

import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const newsItems = [
  {
    title: 'Tech layoffs continue in 2024',
    time: '2 hours ago',
    readers: '1,234',
    content: 'Major tech companies continue to announce layoffs as they restructure operations and focus on AI initiatives. Industry analysts suggest this trend may continue throughout Q1 2024 as companies prioritize profitability and efficiency.'
  },
  {
    title: 'AI reshaping job market',
    time: '5 hours ago',
    readers: '987',
    content: 'Artificial Intelligence is transforming the job market, creating new opportunities while automating traditional roles. Experts recommend upskilling in AI-related fields to stay competitive in the evolving workforce landscape.'
  },
  {
    title: 'Remote work trends evolving',
    time: '1 day ago',
    readers: '2,456',
    content: 'Companies are adopting hybrid work models as the future of work continues to evolve. Recent surveys show that 65% of employees prefer flexible work arrangements, leading organizations to reconsider their office policies.'
  },
  {
    title: 'Startup funding rebounds',
    time: '2 days ago',
    readers: '3,421',
    content: 'Venture capital funding for startups shows signs of recovery after a challenging 2023. Early-stage companies focused on AI, climate tech, and healthcare are attracting significant investor interest in the new year.'
  },
  {
    title: 'New privacy regulations',
    time: '3 days ago',
    readers: '1,876',
    content: 'New data privacy regulations are being introduced globally, requiring companies to enhance their data protection measures. Businesses must adapt to stricter compliance requirements to avoid penalties and maintain customer trust.'
  },
];

export default function NewsWidget() {
  const [selectedNews, setSelectedNews] = useState<typeof newsItems[0] | null>(null);

  const handleNewsClick = (item: typeof newsItems[0]) => {
    setSelectedNews(item);
  };

  const handleClose = () => {
    setSelectedNews(null);
  };

  return (
    <>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            LinkedIn News
          </Typography>
          <List dense>
            {newsItems.map((item, index) => (
              <ListItem
                key={index}
                sx={{ px: 0, py: 1, cursor: 'pointer', '&:hover': { bgcolor: '#f8f8f8' } }}
                onClick={() => handleNewsClick(item)}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <FiberManualRecordIcon sx={{ fontSize: 8, mt: 1, color: '#666' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.time} • {item.readers} readers
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog open={!!selectedNews} onClose={handleClose} maxWidth="sm" fullWidth>
        {selectedNews && (
          <>
            <DialogTitle>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedNews.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedNews.time} • {selectedNews.readers} readers
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedNews.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
