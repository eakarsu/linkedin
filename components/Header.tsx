'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Divider from '@mui/material/Divider';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ArticleIcon from '@mui/icons-material/Article';
import AppsIcon from '@mui/icons-material/Apps';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha('#edf3f8', 0.95),
  '&:hover': {
    backgroundColor: alpha('#e0e8f0', 1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: '280px',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#666',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
  },
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 0,
  padding: theme.spacing(1, 2),
  color: '#666',
  fontSize: '12px',
  '&:hover': {
    backgroundColor: alpha('#000', 0.04),
    color: '#000',
  },
}));

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [userData, setUserData] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

    const fetchUnreadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?unreadOnly=true');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (session) {
      fetchUserData();
      fetchUnreadNotifications();
    }
  }, [session]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleMenuNavigate = (path: string) => {
    router.push(path);
    handleMenuClose();
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
      <Toolbar sx={{ justifyContent: 'space-between', maxWidth: '1200px', width: '100%', mx: 'auto' }}>
        {/* Logo and Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <IconButton sx={{ p: 0.5 }}>
              <Box
                component="div"
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: '#0a66c2',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '20px',
                }}
              >
                in
              </Box>
            </IconButton>
          </Link>
          <Search as="form" onSubmit={handleSearch}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Search>
        </Box>

        {/* Navigation Icons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <NavButton>
              <HomeIcon />
              <Box component="span" sx={{ fontSize: '12px', mt: 0.5 }}>
                Home
              </Box>
            </NavButton>
          </Link>
          <Link href="/network" style={{ textDecoration: 'none' }}>
            <NavButton>
              <PeopleIcon />
              <Box component="span" sx={{ fontSize: '12px', mt: 0.5 }}>
                My Network
              </Box>
            </NavButton>
          </Link>
          <Link href="/jobs" style={{ textDecoration: 'none' }}>
            <NavButton>
              <WorkIcon />
              <Box component="span" sx={{ fontSize: '12px', mt: 0.5 }}>
                Jobs
              </Box>
            </NavButton>
          </Link>
          <Link href="/messaging" style={{ textDecoration: 'none' }}>
            <NavButton>
              <MessageIcon />
              <Box component="span" sx={{ fontSize: '12px', mt: 0.5 }}>
                Messaging
              </Box>
            </NavButton>
          </Link>
          <Link href="/notifications" style={{ textDecoration: 'none' }}>
            <NavButton>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
              <Box component="span" sx={{ fontSize: '12px', mt: 0.5 }}>
                Notifications
              </Box>
            </NavButton>
          </Link>
          <Link href="/post-job" style={{ textDecoration: 'none' }}>
            <NavButton>
              <PostAddIcon />
              <Box component="span" sx={{ fontSize: '12px', mt: 0.5 }}>
                Post a Job
              </Box>
            </NavButton>
          </Link>
          <NavButton onClick={handleProfileMenuClick}>
            <Avatar
              sx={{ width: 24, height: 24 }}
              src={userData?.avatar || '/profile.jpg'}
            >
              {userData?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box component="span" sx={{ fontSize: '12px', mt: 0.5 }}>
              Me
            </Box>
          </NavButton>
          <Box sx={{ borderLeft: '1px solid #ddd', mx: 1, height: '48px', alignSelf: 'center' }} />
          <NavButton onClick={handleMenuClick}>
            <AppsIcon />
            <Box component="span" sx={{ fontSize: '12px', mt: 0.5 }}>
              More
            </Box>
          </NavButton>
        </Box>

        {/* More Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { width: 200, mt: 1 },
          }}
        >
          <MenuItem onClick={() => handleMenuNavigate('/learning')}>
            <ListItemIcon>
              <SchoolIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Learning</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuNavigate('/events')}>
            <ListItemIcon>
              <EventIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Events</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuNavigate('/groups')}>
            <ListItemIcon>
              <GroupIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Groups</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuNavigate('/companies')}>
            <ListItemIcon>
              <BusinessIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Companies</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuNavigate('/premium')}>
            <ListItemIcon>
              <WorkspacePremiumIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Premium</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuNavigate('/articles')}>
            <ListItemIcon>
              <ArticleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Articles</ListItemText>
          </MenuItem>
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: { width: 280, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{ width: 48, height: 48 }}
                src={userData?.avatar || '/profile.jpg'}
              >
                {userData?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Box sx={{ fontWeight: 600, fontSize: '14px' }}>
                  {userData?.name || session?.user?.name || 'User'}
                </Box>
                <Box sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  {userData?.title || 'LinkedIn Member'}
                </Box>
              </Box>
            </Box>
          </Box>
          <Divider />
          <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/profile'); }}>
            <ListItemText>View Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/settings'); }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings & Privacy</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sign Out</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
