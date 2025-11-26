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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const demoUsers = [
  { email: 'sarah.johnson@example.com', name: 'Sarah Johnson', title: 'Senior Software Engineer' },
  { email: 'michael.chen@example.com', name: 'Michael Chen', title: 'Product Manager' },
  { email: 'emily.rodriguez@example.com', name: 'Emily Rodriguez', title: 'UX/UI Designer' },
  { email: 'david.kim@example.com', name: 'David Kim', title: 'Data Scientist' },
  { email: 'jessica.williams@example.com', name: 'Jessica Williams', title: 'Full Stack Developer' },
  { email: 'james.anderson@example.com', name: 'James Anderson', title: 'Marketing Manager' },
  { email: 'maria.garcia@example.com', name: 'Maria Garcia', title: 'Business Analyst' },
  { email: 'robert.taylor@example.com', name: 'Robert Taylor', title: 'Sales Director' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
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

          {/* Demo User Selector */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: 2, border: '1px solid #0a66c2' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#0a66c2' }}>
              Demo Account - Quick Login
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Select a demo user</InputLabel>
              <Select
                value={email}
                label="Select a demo user"
                onChange={(e) => setEmail(e.target.value)}
                sx={{ bgcolor: 'white' }}
              >
                {demoUsers.map((user) => (
                  <MenuItem key={user.email} value={user.email}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.title}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Password: password123 (pre-filled)
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              or enter manually
            </Typography>
          </Divider>

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
              placeholder="e.g. sarah.johnson@example.com"
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
              helperText="Demo password: password123"
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
