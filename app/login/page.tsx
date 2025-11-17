'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'white',
        pt: 8,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: 100,
          height: 100,
          bgcolor: '#0a66c2',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '48px',
          mb: 4,
        }}
      >
        in
      </Box>

      {/* Login Card */}
      <Card sx={{ width: '100%', maxWidth: 400, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Sign in
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Stay updated on your professional world
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <Link href="#" sx={{ mb: 3, display: 'block', textDecoration: 'none' }}>
              Forgot password?
            </Link>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2, textTransform: 'none', borderRadius: 3, py: 1.5 }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Divider>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            sx={{ mb: 1, textTransform: 'none', borderRadius: 3, py: 1.5 }}
            disabled
          >
            <Box
              component="img"
              src="https://www.google.com/favicon.ico"
              sx={{ width: 20, height: 20, mr: 1 }}
            />
            Sign in with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            sx={{ textTransform: 'none', borderRadius: 3, py: 1.5 }}
            disabled
          >
            <Box
              component="img"
              src="https://www.apple.com/favicon.ico"
              sx={{ width: 20, height: 20, mr: 1 }}
            />
            Sign in with Apple
          </Button>
        </CardContent>
      </Card>

      {/* Sign Up Link */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          New to LinkedIn?{' '}
          <Link href="/signup" sx={{ textDecoration: 'none', fontWeight: 600 }}>
            Join now
          </Link>
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">
          © 2024 LinkedIn Clone. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
