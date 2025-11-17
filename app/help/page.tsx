import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'How do I create an account?',
    answer: 'Click the "Join now" button on the homepage and follow the registration process.'
  },
  {
    question: 'How do I connect with other professionals?',
    answer: 'Navigate to the Network page and send connection requests to professionals you know.'
  },
  {
    question: 'How do I apply for jobs?',
    answer: 'Visit the Jobs page, find a position that interests you, and click the "Apply" button.'
  },
  {
    question: 'How do I update my profile?',
    answer: 'Go to your profile page and click on the edit buttons to update your information.'
  },
  {
    question: 'How do I send messages?',
    answer: 'Go to the Messaging page and select a connection to start a conversation.'
  },
];

export default function HelpPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 200px)', py: 4 }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
              Help Center
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Find answers to common questions
            </Typography>
            <TextField
              fullWidth
              placeholder="Search for help..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Frequently Asked Questions
            </Typography>
            {faqs.map((faq, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
