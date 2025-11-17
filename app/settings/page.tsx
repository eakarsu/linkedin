'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import { useState } from 'react';

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 3 }}>
              Settings
            </Typography>
            
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
              Privacy Settings
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Public Profile" secondary="Allow others to see your full profile" />
                <Switch checked={profilePublic} onChange={(e) => setProfilePublic(e.target.checked)} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Email Notifications" secondary="Receive updates via email" />
                <Switch checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
              </ListItem>
            </List>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
              Security
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Two-Factor Authentication" secondary="Add an extra layer of security" />
                <Switch checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
