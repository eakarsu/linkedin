import { createNetworkingAdvice } from '@/lib/networking-advice';
export const runtime = 'nodejs';
export const { GET, POST } = createNetworkingAdvice();
