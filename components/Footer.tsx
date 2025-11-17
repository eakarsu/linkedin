import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Grid2 from '@mui/material/Unstable_Grid2';

const footerLinks = {
  'Navigation': [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Advertising', href: '/advertising' },
    { label: 'Small Business', href: '/business' },
  ],
  'Solutions': [
    { label: 'Talent Solutions', href: '/talent' },
    { label: 'Marketing Solutions', href: '/marketing' },
    { label: 'Sales Solutions', href: '/sales' },
    { label: 'Safety Center', href: '/safety' },
  ],
  'Resources': [
    { label: 'Community Guidelines', href: '/community' },
    { label: 'Privacy & Terms', href: '/privacy' },
    { label: 'Mobile App', href: '/mobile' },
    { label: 'Help Center', href: '/help' },
  ],
  'Fast Access': [
    { label: 'Questions?', href: '/help' },
    { label: 'Settings', href: '/settings' },
    { label: 'Language', href: '/language' },
  ],
};

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'white',
        borderTop: '1px solid #e0e0e0',
        mt: 'auto',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid2 container spacing={4}>
          {Object.entries(footerLinks).map(([category, links]) => (
            <Grid2 key={category} xs={6} sm={3}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      color: '#666',
                      fontSize: '14px',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        '&:hover': {
                          textDecoration: 'underline',
                          color: '#0a66c2',
                        },
                      }}
                    >
                      {link.label}
                    </Box>
                  </Link>
                ))}
              </Box>
            </Grid2>
          ))}
        </Grid2>

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                bgcolor: '#0a66c2',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              in
            </Box>
            <Typography variant="body2" color="text.secondary">
              LinkedIn Clone © {new Date().getFullYear()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Link href="/about" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                About
              </Typography>
            </Link>
            <Link href="/accessibility" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                Accessibility
              </Typography>
            </Link>
            <Link href="/privacy" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                Privacy Policy
              </Typography>
            </Link>
            <Link href="/terms" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                Terms of Service
              </Typography>
            </Link>
            <Link href="/help" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
                Help Center
              </Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
