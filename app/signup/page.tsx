'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
      } else {
        router.push('/login?registered=true');
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
        pt: 6,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: 80,
          height: 80,
          bgcolor: '#0a66c2',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '40px',
          mb: 3,
        }}
      >
        in
      </Box>

      {/* Signup Card */}
      <Card sx={{ width: '100%', maxWidth: 400, boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Make the most of your professional life
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Full name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
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
              label="Password (6+ characters)"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '12px' }}>
              By clicking Agree & Join, you agree to the LinkedIn{' '}
              <Link href="#" sx={{ textDecoration: 'none' }}>
                User Agreement
              </Link>
              ,{' '}
              <Link href="#" sx={{ textDecoration: 'none' }}>
                Privacy Policy
              </Link>
              , and{' '}
              <Link href="#" sx={{ textDecoration: 'none' }}>
                Cookie Policy
              </Link>
              .
            </Typography>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2, textTransform: 'none', borderRadius: 3, py: 1.5 }}
            >
              {loading ? 'Creating account...' : 'Agree & Join'}
            </Button>

            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled
              sx={{ mb: 1, textTransform: 'none', borderRadius: 3, py: 1.5 }}
            >
              <Box
                component="img"
                src="https://www.google.com/favicon.ico"
                sx={{ width: 20, height: 20, mr: 1 }}
              />
              Continue with Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              disabled
              sx={{ textTransform: 'none', borderRadius: 3, py: 1.5 }}
            >
              <Box
                component="img"
                src="https://www.microsoft.com/favicon.ico"
                sx={{ width: 20, height: 20, mr: 1 }}
              />
              Continue with Microsoft
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                Already on LinkedIn?{' '}
                <Link href="/login" sx={{ textDecoration: 'none', fontWeight: 600 }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">
          © 2024 LinkedIn Clone. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
