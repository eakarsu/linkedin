import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function AboutPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 3 }}>
              About LinkedIn Clone
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome to LinkedIn Clone, a professional networking platform built with modern web technologies.
              This is a demonstration project showcasing a full-featured LinkedIn-like experience.
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              To connect professionals worldwide and help them be more productive and successful.
              We believe in creating economic opportunities for every member of the global workforce.
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              Technology Stack
            </Typography>
            <Typography variant="body1" component="div">
              <ul>
                <li>Next.js 16 - React Framework</li>
                <li>Material-UI - UI Component Library</li>
                <li>TypeScript - Type Safety</li>
                <li>Modern Web Standards</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
