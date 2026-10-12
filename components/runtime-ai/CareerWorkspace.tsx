'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { renderAnswer, readableAnswer } from './readable-report.mjs';
import styles from './AdvisoryWorkspace.module.css';
import careerStyles from './CareerWorkspace.module.css';

export type CareerMode = 'resume-build' | 'job-match' | 'moderation';
type Input = { mode?: string; jobDescription?: string; action?: string; text?: string; postId?: string };
type Report = { id: string; input: Input; prompt: string; content: string; model: string; createdAt: string; mode: CareerMode; appeal?: { text: string; status: string; version: number } };
type Post = { id: string; content: string };
const examples = [
  { label: 'Product team', jobDescription: 'The role involves product planning, customer research, cross-functional delivery and clear written communication. Assess only the skills and achievements documented in my saved profile; identify missing evidence.', text: 'We are inviting colleagues to a product planning workshop. Participation is optional; please contact the organizer if you need accessibility support.' },
  { label: 'Engineering team', jobDescription: 'The role involves software delivery, technical documentation, testing and collaboration with stakeholders. Use my actual saved profile, distinguish evidence from assumptions, and identify any skill gaps.', text: 'Our engineering team is sharing a public technical retrospective. We welcome constructive feedback about the design and lessons learned.' },
  { label: 'Operations team', jobDescription: 'The role involves operational planning, process improvement, reporting and responsible handling of customer information. Use only my genuine saved experience; flag undocumented qualifications and suggested next steps.', text: 'This is a professional invitation to an operations roundtable. There is no purchase requirement, and recipients may decline future invitations.' },
];
const titles: Record<CareerMode, string> = { 'resume-build': 'Résumé builder', 'job-match': 'Job match', moderation: 'Content moderation' };

function Answer({ report }: { report: Report }) {
  const output = useRef<HTMLDivElement>(null), [notice, setNotice] = useState('');
  useEffect(() => { output.current?.replaceChildren(renderAnswer(report.content)); }, [report.content]);
  async function copy() { try { await navigator.clipboard.writeText(readableAnswer(report.content)); setNotice('Report copied.'); } catch { setNotice('Copy is unavailable. Download the report to save its text.'); } }
  function download() { const url = URL.createObjectURL(new Blob([readableAnswer(report.content)], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = `${report.mode}-report.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  return <article className={styles.report} aria-label="AI report"><p className={styles.eyebrow}>OpenRouter response · {titles[report.mode]}</p><div ref={output}/><footer><p className={styles.meta}>Model: {report.model} · Saved report: {report.id} · {new Date(report.createdAt).toLocaleString()}</p><div className={styles.actions}><button type="button" onClick={copy}>Copy report</button><button type="button" onClick={download}>Download report</button></div>{notice && <p role="status">{notice}</p>}</footer></article>;
}

export default function CareerWorkspace({ mode }: { mode: CareerMode }) {
  const moderation = mode === 'moderation', endpoint = moderation ? '/api/ai/moderation' : '/api/ai/resume-builder';
  const [jobDescription, setJobDescription] = useState(''), [text, setText] = useState(''), [postId, setPostId] = useState(''), [posts, setPosts] = useState<Post[]>([]), [reports, setReports] = useState<Report[]>([]), [report, setReport] = useState<Report | null>(null), [detail, setDetail] = useState<Report | null>(null), [profile, setProfile] = useState<{ id: string; name: string; title?: string; hasExperience: boolean; hasSkills: boolean } | null>(null), [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [historyError, setHistoryError] = useState(''), [appealText, setAppealText] = useState('');
  const request = useRef<AbortController | null>(null), historyRequest = useRef<AbortController | null>(null), version = useRef(0), dialog = useRef<HTMLDialogElement>(null);
  function cancel(message = 'Request cancelled. Your input is preserved. Any already saved report remains in history.') { version.current++; request.current?.abort(); request.current = null; setBusy(false); setNotice(message); }
  async function history() {
    historyRequest.current?.abort(); const controller = new AbortController(); historyRequest.current = controller;
    try {
      const response = await fetch(moderation ? endpoint : `${endpoint}?mode=${mode === 'resume-build' ? 'build' : 'job-match'}`, { signal: controller.signal });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Saved reports could not be loaded.');
      if (controller.signal.aborted || historyRequest.current !== controller) return;
      setReports(body.reports || []); setPosts((body.posts || []).filter((post: Post) => post.content.trim().length > 0 && post.content.trim().length <= 4000)); setProfile(body.profile || null); setHistoryError('');
    } catch (error) { if (!controller.signal.aborted) { setReports([]); setPosts([]); setProfile(null); setHistoryError(error instanceof Error ? error.message : 'Saved reports could not be loaded.'); } }
  }
  useEffect(() => { void history(); return () => { version.current++; request.current?.abort(); historyRequest.current?.abort(); }; }, [mode]);
  useEffect(() => { if (detail && !dialog.current?.open) dialog.current?.showModal(); if (!detail && dialog.current?.open) dialog.current.close(); }, [detail]);
  function preset(index: number) {
    const example = examples[index];
    const linkedPost = moderation ? posts.find(row => row.id === postId) : undefined;
    if (moderation) { setText(linkedPost ? linkedPost.content.trim() : example.text); if (!linkedPost) setPostId(''); }
    else setJobDescription(example.jobDescription);
    setNotice(moderation && !linkedPost ? 'Complete draft example loaded. No saved post is linked. Review it, then generate.' : 'All eligible inputs filled. Saved profile and post references stay genuine. Review, then generate.');
  }
  async function generate(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    const input: Input = moderation ? { action: 'classify', text: text.trim(), postId } : { mode: mode === 'resume-build' ? 'build' : 'job-match', jobDescription: jobDescription.trim() };
    if ((moderation && (!input.text || input.text.length > 4000)) || (!moderation && ((mode === 'job-match' && !input.jobDescription) || (input.jobDescription?.length || 0) > 12_000))) { setNotice('Review the required inputs and their length limits.'); return; }
    const controller = new AbortController(), current = ++version.current; request.current = controller; setBusy(true); setReport(null); setNotice('Generating your report…');
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: controller.signal });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || 'AI request failed.');
      if (current !== version.current || controller.signal.aborted) return;
      if (!body.id || typeof body.content !== 'string' || !body.content.trim() || body.mode !== mode) throw new Error('The provider returned an incomplete report.');
      setReport(body); setNotice('Report received and saved. Review it before acting.'); await history();
    } catch (error) { if (current === version.current && !controller.signal.aborted) setNotice(error instanceof Error ? error.message : 'AI request failed.'); }
    finally { if (current === version.current) { request.current = null; setBusy(false); } }
  }
  async function submitAppeal(event: FormEvent) {
    event.preventDefault(); if (!detail || busy || !appealText.trim()) return;
    const controller = new AbortController(), current = ++version.current; request.current = controller; setBusy(true);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'appeal', eventId: detail.id, appealText: appealText.trim() }), signal: controller.signal });
      const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Appeal could not be saved.');
      if (current !== version.current || controller.signal.aborted) return;
      setDetail(body.event); setNotice('Appeal saved as pending human review. No content decision was executed.'); await history();
    } catch (error) { if (current === version.current && !controller.signal.aborted) setNotice(error instanceof Error ? error.message : 'Appeal could not be saved.'); }
    finally { if (current === version.current) { request.current = null; setBusy(false); } }
  }
  function open(row: Report) { cancel('Saved report opened.'); setAppealText(row.appeal?.text || ''); setDetail(row); }
  function edit(row: Report) {
    cancel('Saved input loaded. Review it and generate a new report.');
    if (moderation) { setText(row.input.text || ''); const exists = posts.some(post => post.id === row.input.postId && post.content.trim() === row.input.text); setPostId(exists ? row.input.postId || '' : ''); if (row.input.postId && !exists) setNotice('The original saved post is no longer available unchanged. Its submitted text is loaded as an unlinked draft.'); }
    else setJobDescription(row.input.jobDescription || '');
    setDetail(null);
  }
  return <section className={styles.root} aria-label={titles[mode]}>
    <header><p className={styles.eyebrow}>AI operations</p><h1>{titles[mode]}</h1><p>{moderation ? 'Assess a draft or one of your saved posts. The report provides guidance; it does not publish, remove or restrict content.' : 'Use your actual saved profile to prepare a résumé or assess a job description. Missing experience stays visible as a gap.'}</p></header>
    <div className={styles.columns}><form className={styles.card} onSubmit={generate}><h2>Prepare the request</h2><div className={styles.actions}>{examples.map((example, index) => <button type="button" key={example.label} disabled={busy} onClick={() => preset(index)}>{example.label}</button>)}</div>
      {moderation ? <><label>Linked saved post (optional)<select className={careerStyles.select} value={postId} disabled={busy} onChange={event => { setPostId(event.target.value); const post = posts.find(row => row.id === event.target.value); if (post) setText(post.content.trim()); }}><option value="">Draft content · no linked post</option>{posts.map(post => <option key={post.id} value={post.id}>{post.content.slice(0, 100)}</option>)}</select></label><label>Content<textarea required maxLength={4000} value={text} disabled={busy} onChange={event => { setText(event.target.value); if (postId) { setPostId(''); setNotice('Edited text is now an unlinked draft. The saved post remains unchanged.'); } }}/></label></> : <><div className={careerStyles.source}><strong>Saved profile</strong><p>{profile ? `${profile.name}${profile.title ? ` · ${profile.title}` : ''}` : 'Your profile is loaded from your signed-in account.'}</p>{profile && (!profile.hasExperience || !profile.hasSkills) && <p className={styles.meta}>Some profile evidence is missing. Add genuine facts in your profile or review the gaps in your report.</p>}<Link href="/profile">Review my profile</Link></div><label>Job description{mode === 'resume-build' ? ' (optional)' : ''}<textarea required={mode === 'job-match'} maxLength={12000} value={jobDescription} disabled={busy} onChange={event => setJobDescription(event.target.value)}/></label></>}
      <p className={styles.meta}>Each example fills every eligible field, including optional inputs. Actual profiles and saved post IDs come from your account.</p><div className={styles.actions}><button type="submit" className={styles.primary} disabled={busy || Boolean(historyError)}>Generate with OpenRouter</button>{busy && <button type="button" onClick={() => cancel()}>Cancel</button>}</div>
    </form><section className={styles.card}><h2>Your report</h2>{report ? <Answer report={report}/> : <p className={styles.meta}>Prepare and review your inputs, then generate a professional report.</p>}</section></div>
    <p role="status" aria-live="polite">{notice}</p><section className={styles.card}><h2>Saved reports</h2><p className={styles.meta}>Reports belong to your account. Open one to review its answer or reuse its submitted input.</p>{historyError ? <p role="alert">{historyError}</p> : reports.length ? <div className={styles.history}>{reports.map(row => <button type="button" key={row.id} onClick={() => open(row)}>{row.prompt}<span>{new Date(row.createdAt).toLocaleString()}</span></button>)}</div> : <p className={styles.meta}>No saved reports yet.</p>}</section>
    <dialog className={styles.dialog} ref={dialog} aria-labelledby="career-report-title" onCancel={event => { event.preventDefault(); cancel(); setDetail(null); }} onClose={() => setDetail(null)}>{detail && <><h2 id="career-report-title">Saved {titles[mode].toLowerCase()} report</h2><p>{detail.prompt}</p><Answer report={detail}/><div className={styles.actions}><button type="button" onClick={() => edit(detail)}>Edit</button><button type="button" disabled title="Provider evidence is retained; deleting a saved report is unavailable">Delete</button><button type="button" onClick={() => { cancel(); setDetail(null); }}>Cancel</button></div>{moderation && <form onSubmit={submitAppeal}><h2>Request human review</h2><p className={styles.meta}>{detail.appeal?.status === 'pending' ? 'Your appeal is pending human review. The original assessment remains retained.' : 'Save an appeal against this assessment. Independent moderator review is not configured in this workspace; it remains pending.'}</p><label>Appeal details<textarea required maxLength={4000} value={appealText} disabled={busy} onChange={event => setAppealText(event.target.value)}/></label><div className={styles.actions}><button type="submit" disabled={busy}>Save appeal</button>{busy && <button type="button" onClick={() => cancel()}>Cancel request</button>}</div></form>}<p className={styles.meta}>Edit prepares a new request. The original saved report remains retained.</p></>}</dialog>
  </section>;
}
