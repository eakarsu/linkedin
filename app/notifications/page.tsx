'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';

const notifications = [
  {
    id: 1,
    type: 'connection',
    user: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    action: 'accepted your connection request',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'like',
    user: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    action: 'liked your post about React performance',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'comment',
    user: 'Emily Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=3',
    action: 'commented on your post',
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'job',
    user: 'Google',
    avatar: 'https://i.pravatar.cc/150?img=4',
    action: 'posted a new job that matches your profile',
    time: '2 days ago',
    read: true,
  },
  {
    id: 5,
    type: 'profile',
    user: 'David Kim',
    avatar: 'https://i.pravatar.cc/150?img=5',
    action: 'viewed your profile',
    time: '3 days ago',
    read: true,
  },
  {
    id: 6,
    type: 'mention',
    user: 'Lisa Anderson',
    avatar: 'https://i.pravatar.cc/150?img=6',
    action: 'mentioned you in a comment',
    time: '4 days ago',
    read: true,
  },
  {
    id: 7,
    type: 'share',
    user: 'Robert Taylor',
    avatar: 'https://i.pravatar.cc/150?img=7',
    action: 'shared your article',
    time: '5 days ago',
    read: true,
  },
  {
    id: 8,
    type: 'birthday',
    user: 'Jessica Martinez',
    avatar: 'https://i.pravatar.cc/150?img=8',
    action: 'has a birthday today',
    time: 'Today',
    read: false,
  },
];

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotificationsList(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.read) {
      try {
        const response = await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PUT',
        });

        if (response.ok) {
          // Update local state
          setNotificationsList(notificationsList.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          ));
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to appropriate page
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  };

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === 0) {
      // All notifications
      return notificationsList;
    } else if (activeTab === 1) {
      // My posts - show likes, comments, shares on user's posts
      return notificationsList.filter((n: any) =>
        n.type === 'LIKE' || n.type === 'COMMENT' || n.type === 'SHARE'
      );
    } else if (activeTab === 2) {
      // Mentions - show mentions only
      return notificationsList.filter((n: any) => n.type === 'MENTION');
    }
    return notificationsList;
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Notifications
            </Typography>

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="All" />
              <Tab label="My posts" />
              <Tab label="Mentions" />
            </Tabs>

            <List sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading notifications...
                  </Typography>
                </Box>
              ) : (
                filteredNotifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 2,
                      px: 0,
                      bgcolor: notification.read ? 'transparent' : '#f3f6f8',
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: '#f8f9fa',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        variant="dot"
                        color="primary"
                        invisible={notification.read}
                        sx={{
                          '& .MuiBadge-dot': {
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                          },
                        }}
                      >
                        <Avatar src={notification.actor?.avatar || '/profile.jpg'}>
                          {notification.actor?.name?.charAt(0) || 'U'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            {notification.actor?.name || 'Someone'}
                          </Box>{' '}
                          {notification.content}
                        </>
                      }
                      secondary={formatTimestamp(notification.createdAt)}
                      secondaryTypographyProps={{
                        sx: { mt: 0.5 }
                      }}
                    />
                  </ListItem>
                ))
              )}
            </List>

            {!loading && filteredNotifications.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No notifications yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  When you get notifications, they'll show up here
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
