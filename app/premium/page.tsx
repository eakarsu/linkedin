'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid2 from '@mui/material/Unstable_Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MessageIcon from '@mui/icons-material/Message';
import SchoolIcon from '@mui/icons-material/School';
import InsightsIcon from '@mui/icons-material/Insights';

const premiumPlans = [
  {
    name: 'Career',
    price: '$29.99',
    period: '/month',
    description: 'Stand out and get hired faster',
    features: [
      'See who viewed your profile',
      'Unlimited people browsing',
      'InMail messages to reach anyone',
      'See how you compare to other applicants',
      'LinkedIn Learning courses',
      'Interview preparation tools',
    ],
    badge: 'Most Popular',
    color: '#0a66c2',
  },
  {
    name: 'Business',
    price: '$59.99',
    period: '/month',
    description: 'Find and reach the right people',
    features: [
      'Everything in Career',
      'Unlimited people search',
      'Advanced search filters',
      '15 InMail messages per month',
      'See everyone who viewed your profile',
      'Business insights',
      'CRM integrations',
    ],
    color: '#7fc15e',
  },
  {
    name: 'Sales Navigator',
    price: '$99.99',
    period: '/month',
    description: 'Build relationships and close deals',
    features: [
      'Everything in Business',
      'Lead recommendations',
      'Advanced lead and company search',
      '50 InMail messages per month',
      'Real-time sales updates',
      'CRM sync and integrations',
      'Team collaboration tools',
    ],
    color: '#f5a623',
  },
  {
    name: 'Recruiter Lite',
    price: '$119.99',
    period: '/month',
    description: 'Find and contact top talent',
    features: [
      'Everything in Business',
      'Advanced candidate search',
      '30 InMail messages per month',
      'Applicant tracking',
      'Hiring insights',
      'Candidate recommendations',
      'Team collaboration',
    ],
    color: '#9b59b6',
  },
];

export default function PremiumPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <WorkspacePremiumIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Unlock Your Full Potential with Premium
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Choose the plan that's right for you
          </Typography>
        </Box>

        {/* Benefits Overview */}
        <Card sx={{ mb: 4, borderRadius: 2, bgcolor: '#f3f6f8' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Why Go Premium?
            </Typography>
            <Grid2 container spacing={3}>
              <Grid2 xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <VisibilityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    See Who's Viewed Your Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Discover who's interested in your profile
                  </Typography>
                </Box>
              </Grid2>
              <Grid2 xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <MessageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    InMail Messages
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reach anyone on LinkedIn directly
                  </Typography>
                </Box>
              </Grid2>
              <Grid2 xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Learning Courses
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access expert-led courses
                  </Typography>
                </Box>
              </Grid2>
              <Grid2 xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <InsightsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Business Insights
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Make informed decisions with data
                  </Typography>
                </Box>
              </Grid2>
            </Grid2>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <Grid2 container spacing={3} sx={{ mb: 4 }}>
          {premiumPlans.map((plan, index) => (
            <Grid2 key={index} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  position: 'relative',
                  border: plan.badge ? `2px solid ${plan.color}` : '1px solid #e0e0e0',
                  '&:hover': { boxShadow: 6 },
                }}
              >
                {plan.badge && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: plan.color,
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {plan.badge}
                  </Box>
                )}
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: plan.color }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {plan.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {plan.period}
                    </Typography>
                  </Box>
                  <Button
                    variant={plan.badge ? 'contained' : 'outlined'}
                    fullWidth
                    sx={{
                      mb: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '16px',
                      fontWeight: 600,
                      borderRadius: 3,
                      bgcolor: plan.badge ? plan.color : 'transparent',
                      '&:hover': {
                        bgcolor: plan.badge ? plan.color : 'transparent',
                      },
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <List dense sx={{ p: 0 }}>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon sx={{ fontSize: 20, color: plan.color }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{ variant: 'body2', fontSize: '13px' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>

        {/* FAQ */}
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Frequently Asked Questions
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Can I try Premium for free?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yes! All Premium plans come with a 30-day free trial. Cancel anytime during the trial period and you won't be charged.
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Can I switch plans?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                What payment methods do you accept?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We accept all major credit cards, debit cards, and PayPal.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
