import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function PrivacyPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 3 }}>
              Privacy Policy
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
            
            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              1. Information We Collect
            </Typography>
            <Typography variant="body1" paragraph>
              We collect information you provide directly to us, such as when you create an account,
              fill out a form, or communicate with us.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              2. How We Use Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use the information we collect to provide, maintain, and improve our services,
              to develop new services, and to protect our users.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              3. Information Sharing
            </Typography>
            <Typography variant="body1" paragraph>
              We do not share your personal information with third parties except as described in this policy.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              4. Data Security
            </Typography>
            <Typography variant="body1" paragraph>
              We take reasonable measures to help protect your personal information from loss, theft,
              misuse, and unauthorized access.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
