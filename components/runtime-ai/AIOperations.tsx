'use client';

import { useState, type ReactNode } from 'react';
import CareerWorkspace, { type CareerMode } from './CareerWorkspace';
import styles from './CareerWorkspace.module.css';

const tools = [{ id: 'networking', label: 'Networking review' }, { id: 'resume-build', label: 'Résumé builder' }, { id: 'job-match', label: 'Job match' }, { id: 'moderation', label: 'Content moderation' }] as const;
export default function AIOperations({ networking }: { networking: ReactNode }) {
  const [tool, setTool] = useState<string>('networking');
  return <><nav className={styles.tabs} role="tablist" aria-label="AI tools">{tools.map(row => <button key={row.id} type="button" role="tab" aria-selected={tool === row.id} aria-controls="native-ai-tool" onClick={() => setTool(row.id)}>{row.label}</button>)}</nav><div id="native-ai-tool" role="tabpanel">{tool === 'networking' ? networking : <CareerWorkspace key={tool} mode={tool as CareerMode}/>}</div></>;
}
