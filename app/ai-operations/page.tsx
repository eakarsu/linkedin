import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdvisoryWorkspace from '@/components/runtime-ai/AdvisoryWorkspace';
import AIOperations from '@/components/runtime-ai/AIOperations';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as typeof session.user & { invalid?: boolean }).invalid) redirect('/login');
  return <AIOperations networking={<AdvisoryWorkspace title="Networking review" description="Prepare a professional-networking review from the facts you supply. Review consent, evidence and proposed actions before contacting anyone." endpoint="/api/runtime-ai/linkedin-advice" field="prompt" fieldLabel="Review request" minLength={1} maxLength={8000} examples={[
    { label: 'Profile review', value: 'Review a professional profile before publication. Identify the evidence needed to verify role, skills and experience, suggest a clear summary structure, and provide next steps for human review. No profile facts have been supplied, so do not invent them.' },
    { label: 'Connection request', value: 'Prepare a review checklist for a proposed professional connection request. Check mutual context, recipient relevance, consent and suppression evidence, uncertainty, and a respectful draft structure. Do not invent names or imply that a request has been sent.' },
    { label: 'Outreach plan', value: 'Review a professional outreach workflow before use. Cover genuine source records, ownership, recipient consent, opt-out handling, independent approval and follow-up timing. Return risks, evidence gaps and next actions. Do not send messages or claim execution.' }
  ]}/>}/>;
}
