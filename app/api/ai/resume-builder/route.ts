import { createCareerAI } from '@/lib/career-ai';
export const runtime = 'nodejs';
export const { GET, POST } = createCareerAI().resume;
