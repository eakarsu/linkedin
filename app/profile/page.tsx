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
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid2 from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArticleIcon from '@mui/icons-material/Article';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import ShareIcon from '@mui/icons-material/Share';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import RecommendIcon from '@mui/icons-material/ThumbUp';
import EditIcon from '@mui/icons-material/Edit';
import ProfileCompleteness from '@/components/ProfileCompleteness';

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Profile data from API
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit profile dialog
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    title: '',
    location: '',
    bio: '',
    avatar: '',
    coverImage: ''
  });

  const [skills, setSkills] = useState([
    { name: 'JavaScript', endorsements: 42 },
    { name: 'React', endorsements: 38 },
    { name: 'Node.js', endorsements: 35 },
    { name: 'TypeScript', endorsements: 31 },
    { name: 'AWS', endorsements: 28 },
    { name: 'Docker', endorsements: 24 },
    { name: 'MongoDB', endorsements: 22 },
    { name: 'PostgreSQL', endorsements: 20 },
    { name: 'GraphQL', endorsements: 18 },
    { name: 'Redux', endorsements: 15 },
  ]);

  // Dialog and menu states
  const [openToDialog, setOpenToDialog] = useState(false);
  const [addSectionDialog, setAddSectionDialog] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [shareDialog, setShareDialog] = useState(false);
  const [qrCodeDialog, setQrCodeDialog] = useState(false);
  const [recommendationDialog, setRecommendationDialog] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Section dialogs
  const [featuredDialog, setFeaturedDialog] = useState(false);
  const [licensesDialog, setLicensesDialog] = useState(false);
  const [projectsDialog, setProjectsDialog] = useState(false);
  const [honorsDialog, setHonorsDialog] = useState(false);
  const [publicationsDialog, setPublicationsDialog] = useState(false);
  const [volunteeringDialog, setVolunteeringDialog] = useState(false);
  const [coursesDialog, setCoursesDialog] = useState(false);
  const [languagesDialog, setLanguagesDialog] = useState(false);
  const [skillsDialog, setSkillsDialog] = useState(false);
  const [experienceDialog, setExperienceDialog] = useState(false);
  const [educationDialog, setEducationDialog] = useState(false);

  // Section data
  const [languages, setLanguages] = useState<Array<{ name: string; proficiency: string }>>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);

  // Form data for new entries
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  const [newEducation, setNewEducation] = useState({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  // Open to work preferences
  const [openToWork, setOpenToWork] = useState({
    findingNewJob: false,
    hiringServices: false,
    providingServices: false,
    openToCollaboration: false,
  });

  // Profile sections visibility
  const [profileSections, setProfileSections] = useState({
    featured: false,
    licenses: false,
    projects: false,
    honors: false,
    publications: false,
    volunteering: false,
    courses: false,
    languages: false,
  });

  const handleEndorse = (skillName: string) => {
    setSkills(skills.map(skill =>
      skill.name === skillName
        ? { ...skill, endorsements: skill.endorsements + 1 }
        : skill
    ));
  };

  const handleOpenToWorkToggle = (key: keyof typeof openToWork) => {
    setOpenToWork(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShowAllActivity = () => {
    router.push('/activity');
  };

  const handleMoreMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  const handleAddSection = (section: keyof typeof profileSections) => {
    setProfileSections(prev => ({ ...prev, [section]: true }));
    // Don't close the dialog so users can add multiple sections
  };

  const handleShareProfile = () => {
    handleMoreMenuClose();
    setShareDialog(true);
  };

  const handleSaveAsPDF = () => {
    handleMoreMenuClose();
    // Use browser's print dialog to save as PDF
    window.print();
  };

  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/profile`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
    handleMoreMenuClose();
  };

  const handleQRCode = () => {
    handleMoreMenuClose();
    setQrCodeDialog(true);
  };

  const handleRequestRecommendation = () => {
    handleMoreMenuClose();
    setRecommendationDialog(true);
  };

  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState('');

  const handleAddLanguage = async () => {
    if (newLanguage && newProficiency) {
      try {
        const response = await fetch('/api/profile/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section: 'languages',
            data: { name: newLanguage, proficiency: newProficiency },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setLanguages(data.languages || []);
          setNewLanguage('');
          setNewProficiency('');
          setLanguagesDialog(false);
        } else {
          console.error('Failed to add language');
        }
      } catch (error) {
        console.error('Error adding language:', error);
      }
    }
  };

  // Load profile data from database on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);

          // Update all profile sections with database data
          if (data.languages) setLanguages(data.languages);
          if (data.skills) setSkills(data.skills);
          if (data.experience) setExperience(data.experience);
          if (data.education) setEducation(data.education);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProfileData();
    }
  }, [session]);

  const handleEditProfile = () => {
    setEditedProfile({
      name: profileData?.name || session?.user?.name || '',
      title: profileData?.title || '',
      location: profileData?.location || '',
      bio: profileData?.bio || '',
      avatar: profileData?.avatar || '',
      coverImage: profileData?.coverImage || ''
    });
    setEditProfileDialog(true);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setEditProfileDialog(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to update profile:', errorData);
        alert('Failed to update profile: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const response = await fetch('/api/profile/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'skills',
          data: { name: newSkill, endorsements: 0 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills || []);
        setNewSkill('');
        setSkillsDialog(false);
      } else {
        console.error('Failed to add skill');
        alert('Failed to add skill');
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Failed to add skill');
    }
  };

  const handleAddExperience = async () => {
    if (!newExperience.title || !newExperience.company) {
      alert('Please fill in title and company');
      return;
    }

    try {
      const response = await fetch('/api/profile/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'experience',
          data: newExperience,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExperience(data.experience || []);
        setNewExperience({
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        });
        setExperienceDialog(false);
      } else {
        console.error('Failed to add experience');
        alert('Failed to add experience');
      }
    } catch (error) {
      console.error('Error adding experience:', error);
      alert('Failed to add experience');
    }
  };

  const handleAddEducation = async () => {
    if (!newEducation.school || !newEducation.degree) {
      alert('Please fill in school and degree');
      return;
    }

    try {
      const response = await fetch('/api/profile/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: 'education',
          data: newEducation,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEducation(data.education || []);
        setNewEducation({
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          description: ''
        });
        setEducationDialog(false);
      } else {
        console.error('Failed to add education');
        alert('Failed to add education');
      }
    } catch (error) {
      console.error('Error adding education:', error);
      alert('Failed to add education');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        <Grid2 container spacing={3}>
          <Grid2 xs={12} md={8}>
            {/* Profile Header */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <Box
                sx={{
                  height: 200,
                  background: 'linear-gradient(to right, #4e54c8, #8f94fb)',
                  borderRadius: '8px 8px 0 0',
                }}
              />
              <CardContent sx={{ position: 'relative', pt: 0 }}>
                <Box sx={{ position: 'absolute', right: 16, top: 16 }}>
                  <IconButton onClick={handleEditProfile}>
                    <EditIcon />
                  </IconButton>
                </Box>
                <Avatar
                  sx={{
                    width: 150,
                    height: 150,
                    marginTop: '-75px',
                    border: '4px solid white',
                    mb: 2,
                  }}
                  src={profileData?.avatar || session?.user?.image || '/profile.jpg'}
                >
                  {profileData?.name?.charAt(0) || session?.user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {loading ? 'Loading...' : (profileData?.name || session?.user?.name || 'User')}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {profileData?.title || 'LinkedIn Member'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', mb: 2 }}>
                  {profileData?.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon fontSize="small" />
                      <Typography variant="body2">{profileData.location}</Typography>
                    </Box>
                  )}
                  <Typography variant="body2">500+ connections</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="contained"
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                    onClick={() => setOpenToDialog(true)}
                  >
                    Open to
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                    onClick={() => setAddSectionDialog(true)}
                  >
                    Add profile section
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ textTransform: 'none', borderRadius: 3 }}
                    onClick={handleMoreMenuClick}
                  >
                    More
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    About
                  </Typography>
                  <IconButton size="small" onClick={handleEditProfile}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {profileData?.bio || 'No bio added yet. Click the edit button to add your bio.'}
                </Typography>
              </CardContent>
            </Card>

            {/* Experience Section */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Experience
                  </Typography>
                  <IconButton size="small" onClick={() => setExperienceDialog(true)}>
                    <AddIcon />
                  </IconButton>
                </Box>

{experience.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No experience added yet. Click the + button to add your experience.
                  </Typography>
                ) : (
                  experience.map((exp, index) => (
                    <Box key={exp.id || index}>
                      {index > 0 && <Divider sx={{ my: 2 }} />}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <WorkIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {exp.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exp.company}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {exp.startDate && `${exp.startDate} - `}
                            {exp.current ? 'Present' : exp.endDate || ''}
                          </Typography>
                          {exp.location && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {exp.location}
                            </Typography>
                          )}
                          {exp.description && (
                            <Typography variant="body2" color="text.secondary">
                              {exp.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Education
                  </Typography>
                  <IconButton size="small" onClick={() => setEducationDialog(true)}>
                    <AddIcon />
                  </IconButton>
                </Box>

{education.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No education added yet. Click the + button to add your education.
                  </Typography>
                ) : (
                  education.map((edu, index) => (
                    <Box key={edu.id || index}>
                      {index > 0 && <Divider sx={{ my: 2 }} />}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <SchoolIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {edu.school}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {edu.degree}{edu.field && `, ${edu.field}`}
                          </Typography>
                          {(edu.startDate || edu.endDate) && (
                            <Typography variant="body2" color="text.secondary">
                              {edu.startDate && edu.endDate
                                ? `${edu.startDate} - ${edu.endDate}`
                                : edu.startDate || edu.endDate
                              }
                            </Typography>
                          )}
                          {edu.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {edu.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Skills
                  </Typography>
                  <IconButton size="small" onClick={() => setSkillsDialog(true)}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {skills.map((skill) => (
                    <Box key={skill.name}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {skill.name}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEndorse(skill.name)}
                          sx={{ textTransform: 'none', borderRadius: 3 }}
                        >
                          + Endorse
                        </Button>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {skill.endorsements} endorsements
                      </Typography>
                      {skill !== skills[skills.length - 1] && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Certifications & Accomplishments */}
            <Card sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flex: 1 }}>
                    <EmojiEventsIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Accomplishments
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Showcase your certifications, projects, and achievements
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={() => setAddSectionDialog(true)}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileSections.licenses && (
                    <Chip
                      label="Licenses & Certifications"
                      onClick={() => setLicensesDialog(true)}
                      sx={{ cursor: 'pointer' }}
                    />
                  )}
                  {profileSections.projects && (
                    <Chip
                      label="Projects"
                      onClick={() => setProjectsDialog(true)}
                      sx={{ cursor: 'pointer' }}
                    />
                  )}
                  {!profileSections.licenses && !profileSections.projects && (
                    <Typography variant="body2" color="text.secondary">
                      Click + to add accomplishments sections
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Activity Section */}
            <Card sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Activity
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  348 followers
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <ArticleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      John Doe posted this · 2d
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Excited to share my latest article on React performance optimization! Check it out and let me know your thoughts.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      15 likes · 8 comments
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <ArticleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      John Doe commented on this · 1w
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Great insights on microservices architecture! This aligns with my experience perfectly.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      22 likes
                    </Typography>
                  </Box>
                </Box>

                <Button fullWidth sx={{ mt: 2, textTransform: 'none' }} onClick={handleShowAllActivity}>
                  Show all activity →
                </Button>
              </CardContent>
            </Card>

            {/* Dynamic Sections */}
            {profileSections.featured && (
              <Card sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Featured
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Featured + button clicked');
                        setFeaturedDialog(true);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Showcase your best work, posts, and content. Click + to add items.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {profileSections.licenses && (
              <Card sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Licenses & Certifications
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Licenses + button clicked');
                        setLicensesDialog(true);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Add professional licenses and certifications. Click + to add.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {profileSections.projects && (
              <Card sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Projects
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Projects + button clicked');
                        setProjectsDialog(true);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Showcase your portfolio projects. Click + to add projects.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {profileSections.honors && (
              <Card sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Honors & Awards
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Honors + button clicked');
                        setHonorsDialog(true);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Add recognition and achievements. Click + to add awards.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {profileSections.publications && (
              <Card sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Publications
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Publications + button clicked');
                        setPublicationsDialog(true);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Share articles and publications you've authored. Click + to add.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {profileSections.volunteering && (
              <Card sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Volunteering
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Volunteering + button clicked');
                        setVolunteeringDialog(true);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Share causes you care about. Click + to add volunteer work.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {profileSections.courses && (
              <Card sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Courses
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Courses + button clicked');
                        setCoursesDialog(true);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Add relevant courses you've completed. Click + to add courses.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {profileSections.languages && (
              <Card sx={{ borderRadius: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Languages
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Languages + button clicked');
                        setLanguagesDialog(true);
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  {languages.length > 0 ? (
                    <Box>
                      {languages.map((lang, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {lang.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {lang.proficiency}
                          </Typography>
                          {index < languages.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Add language proficiencies to showcase your multilingual abilities. Click + to add languages.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid2>

          {/* Right Sidebar */}
          <Grid2 xs={12} md={4}>
            <ProfileCompleteness />

            <Card sx={{ borderRadius: 2, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Profile language
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  English
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Public profile & URL
                </Typography>
                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                  linkedin.com/in/johndoe
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        {/* Open to Dialog */}
        <Dialog open={openToDialog} onClose={() => setOpenToDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Open to work opportunities
              </Typography>
              <IconButton onClick={() => setOpenToDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Let recruiters and your network know what opportunities you're open to
            </Typography>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleOpenToWorkToggle('findingNewJob')}>
                  <Checkbox
                    edge="start"
                    checked={openToWork.findingNewJob}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText
                    primary="Finding a new job"
                    secondary="Show recruiters and others that you're open to work"
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleOpenToWorkToggle('hiringServices')}>
                  <Checkbox
                    edge="start"
                    checked={openToWork.hiringServices}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText
                    primary="Hiring"
                    secondary="Looking to hire talent for your company"
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleOpenToWorkToggle('providingServices')}>
                  <Checkbox
                    edge="start"
                    checked={openToWork.providingServices}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText
                    primary="Providing services"
                    secondary="Offering freelance or consulting services"
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleOpenToWorkToggle('openToCollaboration')}>
                  <Checkbox
                    edge="start"
                    checked={openToWork.openToCollaboration}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText
                    primary="Open to collaboration"
                    secondary="Looking for project partnerships"
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenToDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setOpenToDialog(false);
                // Here you would save the preferences
              }}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Profile Dialog */}
        <Dialog
          open={editProfileDialog}
          onClose={() => setEditProfileDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Edit Profile
              </Typography>
              <IconButton onClick={() => setEditProfileDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Name"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Professional Title"
                placeholder="e.g., Senior Software Engineer"
                value={editedProfile.title}
                onChange={(e) => setEditedProfile({ ...editedProfile, title: e.target.value })}
              />
              <TextField
                fullWidth
                label="Location"
                placeholder="e.g., San Francisco, CA"
                value={editedProfile.location}
                onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
              />
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={4}
                placeholder="Tell us about yourself..."
                value={editedProfile.bio}
                onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
              />

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Profile Images
              </Typography>

              <Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Profile Photo URL"
                    placeholder="https://example.com/profile-photo.jpg"
                    value={editedProfile.avatar}
                    onChange={(e) => setEditedProfile({ ...editedProfile, avatar: e.target.value })}
                    helperText="Enter a direct image URL or upload a file below"
                  />
                  <Button
                    component="label"
                    variant="outlined"
                    sx={{ minWidth: 120, height: 56 }}
                  >
                    Upload File
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setEditedProfile({ ...editedProfile, avatar: event.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>
                </Box>
                {editedProfile.avatar && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Avatar
                      src={editedProfile.avatar}
                      sx={{ width: 120, height: 120 }}
                    >
                      Preview
                    </Avatar>
                  </Box>
                )}
              </Box>

              <Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Cover Photo URL"
                    placeholder="https://example.com/cover-photo.jpg"
                    value={editedProfile.coverImage}
                    onChange={(e) => setEditedProfile({ ...editedProfile, coverImage: e.target.value })}
                    helperText="Enter a direct image URL or upload a file below (recommended: 1584x396px)"
                  />
                  <Button
                    component="label"
                    variant="outlined"
                    sx={{ minWidth: 120, height: 56 }}
                  >
                    Upload File
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setEditedProfile({ ...editedProfile, coverImage: event.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>
                </Box>
                {editedProfile.coverImage && (
                  <Box sx={{ mt: 2 }}>
                    <Box
                      component="img"
                      src={editedProfile.coverImage}
                      alt="Cover preview"
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ bgcolor: '#f3f6f8', p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Tip:</strong> You can use free placeholder images from:
                  <br />
                  • Profile: https://i.pravatar.cc/300
                  <br />
                  • Cover: https://picsum.photos/1584/396
                  <br />
                  Or upload your images to Imgur, Cloudinary, or any image hosting service and paste the direct URL.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditProfileDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Profile Section Dialog */}
        <Dialog
          open={addSectionDialog}
          onClose={() => setAddSectionDialog(false)}
          maxWidth="sm"
          fullWidth
          scroll="paper"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add to profile
              </Typography>
              <IconButton onClick={() => setAddSectionDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent key={JSON.stringify(profileSections)} dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select sections to add to your profile
            </Typography>
            <List>
              {!profileSections.featured && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleAddSection('featured')}>
                    <AddIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Featured"
                      secondary="Showcase content at the top of your profile"
                    />
                  </ListItemButton>
                </ListItem>
              )}
              {!profileSections.licenses && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleAddSection('licenses')}>
                    <AddIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Licenses & certifications"
                      secondary="Add professional certifications"
                    />
                  </ListItemButton>
                </ListItem>
              )}
              {!profileSections.projects && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleAddSection('projects')}>
                    <AddIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Projects"
                      secondary="Showcase your work and projects"
                    />
                  </ListItemButton>
                </ListItem>
              )}
              {!profileSections.honors && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleAddSection('honors')}>
                    <AddIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Honors & awards"
                      secondary="Add recognition and achievements"
                    />
                  </ListItemButton>
                </ListItem>
              )}
              {!profileSections.publications && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleAddSection('publications')}>
                    <AddIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Publications"
                      secondary="Add articles and publications"
                    />
                  </ListItemButton>
                </ListItem>
              )}
              {!profileSections.volunteering && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleAddSection('volunteering')}>
                    <AddIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Volunteering"
                      secondary="Share causes you care about"
                    />
                  </ListItemButton>
                </ListItem>
              )}
              {!profileSections.courses && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleAddSection('courses')}>
                    <AddIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Courses"
                      secondary="Add relevant courses"
                    />
                  </ListItemButton>
                </ListItem>
              )}
              {!profileSections.languages && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleAddSection('languages')}>
                    <AddIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary="Languages"
                      secondary="Add language proficiencies"
                    />
                  </ListItemButton>
                </ListItem>
              )}
              {Object.values(profileSections).every(val => val) && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    All sections have been added to your profile
                  </Typography>
                </Box>
              )}
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="contained"
              onClick={() => setAddSectionDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
              fullWidth
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>

        {/* More Menu */}
        <Menu
          anchorEl={moreMenuAnchor}
          open={Boolean(moreMenuAnchor)}
          onClose={handleMoreMenuClose}
        >
          <MenuItem onClick={handleShareProfile}>
            <ListItemText primary="Share profile in a message" />
          </MenuItem>
          <MenuItem onClick={handleSaveAsPDF}>
            <ListItemText primary="Save your profile as PDF" />
          </MenuItem>
          <MenuItem onClick={handleCopyLink}>
            <ListItemText primary="Copy link to profile" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleQRCode}>
            <ListItemText primary="QR code" />
          </MenuItem>
          <MenuItem onClick={handleRequestRecommendation}>
            <ListItemText primary="Request a recommendation" />
          </MenuItem>
        </Menu>

        {/* Share Profile Dialog */}
        <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShareIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Share profile
                </Typography>
              </Box>
              <IconButton onClick={() => setShareDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Share John Doe's profile with your connections
            </Typography>
            <TextField
              fullWidth
              placeholder="Search for connections..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Recent connections:
            </Typography>
            <List>
              {['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'].map((name, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton>
                    <Avatar sx={{ mr: 2 }}>{name[0]}</Avatar>
                    <ListItemText primary={name} secondary="Connected" />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShareDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setShareDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Send
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={qrCodeDialog} onClose={() => setQrCodeDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCodeIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Your QR code
                </Typography>
              </Box>
              <IconButton onClick={() => setQrCodeDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Box
                sx={{
                  width: 250,
                  height: 250,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  borderRadius: 2,
                }}
              >
                <QrCodeIcon sx={{ fontSize: 200, color: 'grey.600' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Others can scan this code to view your profile
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setQrCodeDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Download QR Code
            </Button>
          </DialogActions>
        </Dialog>

        {/* Request Recommendation Dialog */}
        <Dialog open={recommendationDialog} onClose={() => setRecommendationDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RecommendIcon />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ask for a recommendation
                </Typography>
              </Box>
              <IconButton onClick={() => setRecommendationDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Who do you want to ask?
            </Typography>
            <TextField
              fullWidth
              placeholder="Search for connections..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              What was your working relationship?
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              placeholder="e.g., Colleague, Manager, Client"
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Personalized message (optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Hi [Name], I really enjoyed working with you..."
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setRecommendationDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setRecommendationDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Send
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Language Dialog */}
        <Dialog open={languagesDialog} onClose={() => setLanguagesDialog(false)} maxWidth="sm" fullWidth scroll="paper">
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Language
              </Typography>
              <IconButton onClick={() => setLanguagesDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ minHeight: '200px' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Language
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., English, Spanish, French"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Proficiency (e.g., Native, Professional, Limited, Elementary)
            </Typography>
            <TextField
              fullWidth
              value={newProficiency}
              onChange={(e) => setNewProficiency(e.target.value)}
              variant="outlined"
              placeholder="Enter proficiency level"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setLanguagesDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddLanguage}
              disabled={!newLanguage || !newProficiency}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Featured Dialog */}
        <Dialog open={featuredDialog} onClose={() => setFeaturedDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Featured Content
              </Typography>
              <IconButton onClick={() => setFeaturedDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose what type of content you want to feature
            </Typography>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="Posts" secondary="Feature your best posts" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="Articles" secondary="Feature articles you've written" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="Media" secondary="Feature photos, videos, or documents" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemText primary="Links" secondary="Feature external links" />
                </ListItemButton>
              </ListItem>
            </List>
          </DialogContent>
        </Dialog>

        {/* Licenses Dialog */}
        <Dialog open={licensesDialog} onClose={() => setLicensesDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add License or Certification
              </Typography>
              <IconButton onClick={() => setLicensesDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Name
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., AWS Certified Solutions Architect"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Issuing Organization
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Amazon Web Services"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Issue Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Credential ID
            </Typography>
            <TextField
              fullWidth
              placeholder="Optional"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setLicensesDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setLicensesDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Projects Dialog */}
        <Dialog open={projectsDialog} onClose={() => setProjectsDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Project
              </Typography>
              <IconButton onClick={() => setProjectsDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Project Name
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., E-commerce Platform"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your project"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Project URL
            </Typography>
            <TextField
              fullWidth
              placeholder="https://"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setProjectsDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setProjectsDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Honors Dialog */}
        <Dialog open={honorsDialog} onClose={() => setHonorsDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Honor or Award
              </Typography>
              <IconButton onClick={() => setHonorsDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Title
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Employee of the Year"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Issuer
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Tech Corp"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Optional"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setHonorsDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setHonorsDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Publications Dialog */}
        <Dialog open={publicationsDialog} onClose={() => setPublicationsDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Publication
              </Typography>
              <IconButton onClick={() => setPublicationsDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Title
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Introduction to React Hooks"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Publisher
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Medium, Dev.to"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Publication Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              URL
            </Typography>
            <TextField
              fullWidth
              placeholder="https://"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setPublicationsDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setPublicationsDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Volunteering Dialog */}
        <Dialog open={volunteeringDialog} onClose={() => setVolunteeringDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Volunteer Experience
              </Typography>
              <IconButton onClick={() => setVolunteeringDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Organization
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Red Cross"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Role
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Volunteer Coordinator"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Cause (e.g., Education, Environment, Health, Social Services)
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              placeholder="Enter cause"
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe your volunteer work"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setVolunteeringDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setVolunteeringDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Courses Dialog */}
        <Dialog open={coursesDialog} onClose={() => setCoursesDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Course
              </Typography>
              <IconButton onClick={() => setCoursesDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Course Name
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Machine Learning Specialization"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Institution
            </Typography>
            <TextField
              fullWidth
              placeholder="e.g., Coursera, Udemy"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Completion Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCoursesDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setCoursesDialog(false)}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Skill Dialog */}
        <Dialog open={skillsDialog} onClose={() => setSkillsDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Skill
              </Typography>
              <IconButton onClick={() => setSkillsDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Skill"
              placeholder="e.g., JavaScript, React, Node.js"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddSkill();
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSkillsDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddSkill}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Experience Dialog */}
        <Dialog open={experienceDialog} onClose={() => setExperienceDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Experience
              </Typography>
              <IconButton onClick={() => setExperienceDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Title *"
                placeholder="e.g., Software Engineer"
                value={newExperience.title}
                onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
              />
              <TextField
                fullWidth
                label="Company *"
                placeholder="e.g., Google"
                value={newExperience.company}
                onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
              />
              <TextField
                fullWidth
                label="Location"
                placeholder="e.g., San Francisco, CA"
                value={newExperience.location}
                onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="month"
                  InputLabelProps={{ shrink: true }}
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="End Date"
                  type="month"
                  InputLabelProps={{ shrink: true }}
                  value={newExperience.endDate}
                  onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                  disabled={newExperience.current}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="current-role"
                  checked={newExperience.current}
                  onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked, endDate: e.target.checked ? '' : newExperience.endDate })}
                />
                <label htmlFor="current-role" style={{ marginLeft: '8px' }}>I currently work here</label>
              </Box>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                placeholder="Describe your role and achievements..."
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setExperienceDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddExperience}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Education Dialog */}
        <Dialog open={educationDialog} onClose={() => setEducationDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add Education
              </Typography>
              <IconButton onClick={() => setEducationDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="School *"
                placeholder="e.g., Stanford University"
                value={newEducation.school}
                onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
              />
              <TextField
                fullWidth
                label="Degree *"
                placeholder="e.g., Bachelor's"
                value={newEducation.degree}
                onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
              />
              <TextField
                fullWidth
                label="Field of Study"
                placeholder="e.g., Computer Science"
                value={newEducation.field}
                onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="number"
                  placeholder="e.g., 2018"
                  InputLabelProps={{ shrink: true }}
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="End Date"
                  type="number"
                  placeholder="e.g., 2022"
                  InputLabelProps={{ shrink: true }}
                  value={newEducation.endDate}
                  onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
                />
              </Box>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                placeholder="Describe your education..."
                value={newEducation.description}
                onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEducationDialog(false)} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddEducation}
              sx={{ textTransform: 'none', borderRadius: 3 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Link Copied Snackbar */}
        <Snackbar
          open={linkCopied}
          autoHideDuration={3000}
          onClose={() => setLinkCopied(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setLinkCopied(false)} severity="success" sx={{ width: '100%' }}>
            Profile link copied to clipboard!
          </Alert>
        </Snackbar>

      </Container>
    </Box>
  );
}
