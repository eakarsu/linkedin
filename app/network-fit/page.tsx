'use client';

import { useState } from 'react';
import Header from '@/components/Header';

export default function NetworkFitPage() {
  const [form, setForm] = useState({ mutualConnections: 4, sharedIndustries: 2, recentEngagements: 3, profileCompleteness: 78, spamSignals: 1 });
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    const response = await fetch('/api/network-fit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setResult(await response.json());
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: 820, margin: '32px auto', padding: 24, background: 'white', borderRadius: 12 }}>
        <h1>Network Fit Score</h1>
        {Object.entries(form).map(([key, value]) => (
          <label key={key} style={{ display: 'block', margin: '12px 0' }}>
            {key.replace(/([A-Z])/g, ' $1')}
            <input style={{ width: '100%', padding: 8 }} type="number" value={value} onChange={(event) => setForm({ ...form, [key]: Number(event.target.value) })} />
          </label>
        ))}
        <button onClick={submit}>Score connection</button>
        {result && (
          <section style={{ marginTop: 24 }}>
            <h2>{result.level.toUpperCase()} · {result.score}/100</h2>
            <ul>{result.suggestions.map((item: string) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}
      </main>
    </>
  );
}
