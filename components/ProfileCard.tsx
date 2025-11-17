'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

export default function ProfileCard() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [connectionsCount, setConnectionsCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchConnections = async () => {
      try {
        const response = await fetch('/api/connections');
        if (response.ok) {
          const data = await response.json();
          setConnectionsCount(data.length);
        }
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };

    if (session) {
      fetchUserData();
      fetchConnections();
    }
  }, [session]);

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <Box
        sx={{
          height: 60,
          background: 'linear-gradient(to right, #4e54c8, #8f94fb)',
          borderRadius: '8px 8px 0 0',
        }}
      />
      <CardContent sx={{ textAlign: 'center', pt: 0 }}>
        <Avatar
          sx={{
            width: 70,
            height: 70,
            margin: '-35px auto 10px',
            border: '2px solid white',
          }}
          src={userData?.avatar || '/profile.jpg'}
        >
          {userData?.name?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {userData?.name || session?.user?.name || 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {userData?.title || 'LinkedIn Member'}
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Connections
          </Typography>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
            {connectionsCount}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Profile viewers
          </Typography>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
            {userData?.profileViews || 0}
          </Typography>
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ textAlign: 'left', px: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Access exclusive tools & insights
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box component="span" sx={{ color: '#d4a017' }}>
              ★
            </Box>
            Try Premium for free
          </Typography>
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ textAlign: 'left', px: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            📑 My items
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
