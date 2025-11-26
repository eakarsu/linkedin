'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Badge from '@mui/material/Badge';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkIcon from '@mui/icons-material/Work';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import CakeIcon from '@mui/icons-material/Cake';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReplyIcon from '@mui/icons-material/Reply';
import CheckIcon from '@mui/icons-material/Check';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SendIcon from '@mui/icons-material/Send';

interface Notification {
  id: string;
  type: string;
  content: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  postId?: string | null;
  actor?: {
    id: string;
    name: string;
    avatar: string | null;
    title: string | null;
  };
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      console.log('Notifications API response:', response.status, data);
      if (response.ok) {
        setNotificationsList(data);
      } else {
        console.error('Notifications API error:', data);
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

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      setNotificationsList(notificationsList.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Open detail dialog
    setSelectedNotification(notification);
    setDialogOpen(true);
    setReplyText('');
  };

  const handleGoToLink = () => {
    if (selectedNotification?.link) {
      setDialogOpen(false);
      router.push(selectedNotification.link);
    }
  };

  const handleReplyToComment = async (notification?: Notification) => {
    const targetNotification = notification || selectedNotification;
    if (!replyText.trim() || !targetNotification?.postId) return;

    setReplying(true);
    try {
      const response = await fetch(`/api/posts/${targetNotification.postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText }),
      });

      if (response.ok) {
        setReplyText('');
        setDialogOpen(false);
        setSnackbar({ open: true, message: 'Reply sent successfully!', severity: 'success' });
        // Navigate to the post
        router.push(`/post/${targetNotification.postId}`);
      } else {
        setSnackbar({ open: true, message: 'Failed to send reply', severity: 'error' });
      }
    } catch (error) {
      console.error('Error replying to comment:', error);
      setSnackbar({ open: true, message: 'Failed to send reply', severity: 'error' });
    } finally {
      setReplying(false);
    }
  };

  const handleAcceptConnection = async (actorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoading(`accept-${actorId}`);
    try {
      const response = await fetch('/api/connections/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: actorId }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setSnackbar({ open: true, message: 'Connection accepted!', severity: 'success' });
        // Update the notification to show it's been handled
        fetchNotifications();
      } else {
        setSnackbar({ open: true, message: 'Failed to accept connection', severity: 'error' });
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      setSnackbar({ open: true, message: 'Failed to accept connection', severity: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLikeBack = async (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!postId) return;

    setActionLoading(`like-${postId}`);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like' }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setSnackbar({ open: true, message: 'Post liked!', severity: 'success' });
        router.push(`/post/${postId}`);
      } else {
        setSnackbar({ open: true, message: 'Failed to like post', severity: 'error' });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setSnackbar({ open: true, message: 'Failed to like post', severity: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProfile = (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDialogOpen(false);
    router.push(`/profile/${userId}`);
  };

  const handleSendMessage = (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDialogOpen(false);
    router.push(`/messaging?userId=${userId}`);
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'like':
        return <ThumbUpIcon sx={{ color: '#0a66c2' }} />;
      case 'comment':
        return <CommentIcon sx={{ color: '#057642' }} />;
      case 'connection':
        return <PersonAddIcon sx={{ color: '#7fc15e' }} />;
      case 'job':
        return <WorkIcon sx={{ color: '#915907' }} />;
      case 'profile_view':
      case 'view':
        return <VisibilityIcon sx={{ color: '#666' }} />;
      case 'share':
        return <ShareIcon sx={{ color: '#0a66c2' }} />;
      case 'birthday':
        return <CakeIcon sx={{ color: '#e91e63' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#666' }} />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'like': return 'Like';
      case 'comment': return 'Comment';
      case 'connection': return 'Connection';
      case 'job': return 'Job Alert';
      case 'profile_view':
      case 'view': return 'Profile View';
      case 'share': return 'Share';
      case 'birthday': return 'Birthday';
      case 'mention': return 'Mention';
      default: return 'Notification';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'like': return 'primary';
      case 'comment': return 'success';
      case 'connection': return 'info';
      case 'job': return 'warning';
      default: return 'default';
    }
  };

  // Get quick action button for notification list
  const getQuickActionButton = (notification: Notification) => {
    const type = notification.type.toLowerCase();

    switch (type) {
      case 'connection':
        if (notification.actor) {
          return (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              onClick={(e) => handleAcceptConnection(notification.actor!.id, e)}
              disabled={actionLoading === `accept-${notification.actor.id}`}
              sx={{ ml: 1, textTransform: 'none', borderRadius: 2 }}
            >
              {actionLoading === `accept-${notification.actor.id}` ? 'Accepting...' : 'Accept'}
            </Button>
          );
        }
        break;

      case 'like':
        if (notification.postId) {
          return (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ThumbUpIcon />}
              onClick={(e) => handleLikeBack(notification.postId!, e)}
              disabled={actionLoading === `like-${notification.postId}`}
              sx={{ ml: 1, textTransform: 'none', borderRadius: 2 }}
            >
              Like Back
            </Button>
          );
        }
        break;

      case 'comment':
        return (
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<ReplyIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleNotificationClick(notification);
            }}
            sx={{ ml: 1, textTransform: 'none', borderRadius: 2 }}
          >
            Reply
          </Button>
        );

      case 'profile_view':
      case 'view':
        if (notification.actor) {
          return (
            <Button
              size="small"
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              onClick={(e) => handleViewProfile(notification.actor!.id, e)}
              sx={{ ml: 1, textTransform: 'none', borderRadius: 2 }}
            >
              View Profile
            </Button>
          );
        }
        break;

      case 'birthday':
        if (notification.actor) {
          return (
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<CakeIcon />}
              onClick={(e) => handleSendMessage(notification.actor!.id, e)}
              sx={{ ml: 1, textTransform: 'none', borderRadius: 2 }}
            >
              Wish
            </Button>
          );
        }
        break;

      case 'job':
        return (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<WorkIcon />}
            onClick={(e) => {
              e.stopPropagation();
              router.push('/jobs');
            }}
            sx={{ ml: 1, textTransform: 'none', borderRadius: 2 }}
          >
            View Jobs
          </Button>
        );
    }

    return null;
  };

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    if (activeTab === 0) {
      return notificationsList;
    } else if (activeTab === 1) {
      return notificationsList.filter((n) =>
        ['like', 'comment', 'share'].includes(n.type.toLowerCase())
      );
    } else if (activeTab === 2) {
      return notificationsList.filter((n) => n.type.toLowerCase() === 'mention');
    }
    return notificationsList;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notificationsList.filter(n => !n.read).length;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} unread`}
                  color="primary"
                  size="small"
                />
              )}
            </Box>

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
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
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
                      px: 2,
                      bgcolor: notification.read ? 'transparent' : '#e8f4fd',
                      borderRadius: 2,
                      mb: 1,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: notification.read ? '#e0e0e0' : '#0a66c2',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: notification.read ? '#f5f5f5' : '#dceefb',
                        transform: 'translateX(4px)',
                      },
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white',
                                boxShadow: 1,
                              }}
                            >
                              {getNotificationIcon(notification.type)}
                            </Box>
                          }
                        >
                          <Avatar
                            src={notification.actor?.avatar || undefined}
                            sx={{ width: 56, height: 56 }}
                          >
                            {notification.actor?.name?.charAt(0) || 'U'}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <Box sx={{ ml: 1, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body1" component="span">
                            {notification.content}
                          </Typography>
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#0a66c2',
                              }}
                            />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" component="span">
                            {formatTimestamp(notification.createdAt)}
                          </Typography>
                          <Chip
                            label={getNotificationTypeLabel(notification.type)}
                            size="small"
                            color={getNotificationColor(notification.type) as any}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '11px' }}
                          />
                        </Box>
                      </Box>
                      {/* Quick Action Button */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getQuickActionButton(notification)}
                      </Box>
                    </Box>
                  </ListItem>
                ))
              )}
            </List>

            {!loading && filteredNotifications.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No notifications yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  When you get notifications, they will show up here
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Notification Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedNotification && getNotificationIcon(selectedNotification.type)}
            <Typography variant="h6">
              {selectedNotification && getNotificationTypeLabel(selectedNotification.type)}
            </Typography>
          </Box>
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedNotification && (
            <Box>
              {/* Actor Info */}
              {selectedNotification.actor && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 3,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' },
                    p: 1,
                    borderRadius: 1,
                  }}
                  onClick={() => handleViewProfile(selectedNotification.actor!.id)}
                >
                  <Avatar
                    src={selectedNotification.actor.avatar || undefined}
                    sx={{ width: 64, height: 64 }}
                  >
                    {selectedNotification.actor.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#0a66c2' }}>
                      {selectedNotification.actor.name}
                    </Typography>
                    {selectedNotification.actor.title && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedNotification.actor.title}
                      </Typography>
                    )}
                    <Typography variant="caption" color="primary">
                      Click to view profile
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Notification Content */}
              <Card sx={{ bgcolor: '#f8f9fa', mb: 3 }}>
                <CardContent>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedNotification.content}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={getNotificationTypeLabel(selectedNotification.type)}
                      color={getNotificationColor(selectedNotification.type) as any}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatTimestamp(selectedNotification.createdAt)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Response Section */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Respond
                </Typography>

                {/* Comment Reply */}
                {selectedNotification.type.toLowerCase() === 'comment' && (
                  <Box sx={{ p: 2, bgcolor: '#f0f7ff', borderRadius: 2, border: '1px solid #0a66c2' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Reply to this comment
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      sx={{ mb: 2, bgcolor: 'white' }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() => handleReplyToComment()}
                      disabled={!replyText.trim() || replying}
                      fullWidth
                    >
                      {replying ? 'Sending Reply...' : 'Send Reply'}
                    </Button>
                  </Box>
                )}

                {/* Like Actions */}
                {selectedNotification.type.toLowerCase() === 'like' && selectedNotification.postId && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<ThumbUpIcon />}
                      onClick={() => handleLikeBack(selectedNotification.postId!)}
                      disabled={actionLoading === `like-${selectedNotification.postId}`}
                      fullWidth
                    >
                      {actionLoading === `like-${selectedNotification.postId}` ? 'Liking...' : 'Like Their Post Back'}
                    </Button>
                  </Box>
                )}

                {/* Connection Actions */}
                {selectedNotification.type.toLowerCase() === 'connection' && selectedNotification.actor && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CheckIcon />}
                      onClick={() => handleAcceptConnection(selectedNotification.actor!.id)}
                      disabled={actionLoading === `accept-${selectedNotification.actor.id}`}
                      fullWidth
                    >
                      {actionLoading === `accept-${selectedNotification.actor.id}` ? 'Accepting...' : 'Accept Connection'}
                    </Button>
                  </Box>
                )}

                {/* Profile View Actions */}
                {(selectedNotification.type.toLowerCase() === 'profile_view' || selectedNotification.type.toLowerCase() === 'view') && selectedNotification.actor && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PersonAddAlt1Icon />}
                      onClick={() => handleViewProfile(selectedNotification.actor!.id)}
                      fullWidth
                    >
                      View Their Profile
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={() => router.push(`/network`)}
                      fullWidth
                    >
                      Connect
                    </Button>
                  </Box>
                )}

                {/* Birthday Actions */}
                {selectedNotification.type.toLowerCase() === 'birthday' && selectedNotification.actor && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<CakeIcon />}
                      onClick={() => handleSendMessage(selectedNotification.actor!.id)}
                      fullWidth
                    >
                      Send Birthday Wishes
                    </Button>
                  </Box>
                )}

                {/* Job Actions */}
                {selectedNotification.type.toLowerCase() === 'job' && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<WorkIcon />}
                      onClick={() => router.push('/jobs')}
                      fullWidth
                    >
                      View Job Listings
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Link Info */}
              {selectedNotification.link && (
                <Box sx={{ p: 2, bgcolor: '#e8f4fd', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <OpenInNewIcon sx={{ color: '#0a66c2' }} />
                  <Typography variant="body2" color="primary">
                    Click &quot;View Details&quot; to see the original content
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Close
          </Button>
          {selectedNotification?.link && (
            <Button
              onClick={handleGoToLink}
              variant="contained"
              startIcon={<OpenInNewIcon />}
            >
              View Details
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
