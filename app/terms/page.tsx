import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function TermsPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 3 }}>
              Terms of Service
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Effective date: {new Date().toLocaleDateString()}
            </Typography>
            
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body1" paragraph>
              By accessing and using this service, you accept and agree to be bound by the terms
              and provision of this agreement.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              2. Use License
            </Typography>
            <Typography variant="body1" paragraph>
              Permission is granted to temporarily access the materials on this website for personal,
              non-commercial transitory viewing only.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              3. User Responsibilities
            </Typography>
            <Typography variant="body1" paragraph>
              You are responsible for maintaining the confidentiality of your account and password
              and for restricting access to your computer.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              4. Prohibited Activities
            </Typography>
            <Typography variant="body1" paragraph>
              You may not use the service for any illegal purpose or to violate any laws in your jurisdiction.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
