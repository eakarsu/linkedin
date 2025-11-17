'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';

export default function LanguagePage() {
  const [language, setLanguage] = useState('en');

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 3 }}>
              Language Settings
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Choose your preferred language for the LinkedIn interface
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Language</InputLabel>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)} label="Language">
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
                <MenuItem value="pt">Português</MenuItem>
                <MenuItem value="it">Italiano</MenuItem>
                <MenuItem value="ja">日本語</MenuItem>
                <MenuItem value="ko">한국어</MenuItem>
                <MenuItem value="zh">中文</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
