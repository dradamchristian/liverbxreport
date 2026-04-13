import React, { useState } from 'react'
import './styles.css'

type FibrosisCategory =
  | 'No fibrosis / equivocal'
  | 'Portal fibrosis only'
  | 'Portal + periportal fibrosis'
  | 'Bridging fibrosis'
  | 'Cirrhosis'

type Severity = 'None' | 'Mild' | 'Moderate' | 'Marked'
type Presence = 'Absent' | 'Present'

export default function App() {
  const [clinicalHistory, setClinicalHistory] = useState('')
  const [cores, setCores] = useState('')
  const [portalTracts, setPortalTracts] = useState('')
  const [comparison, setComparison] = useState('')
  const [useHistoryForConclusion, setUseHistoryForConclusion] = useState(true)

  const [fibrosisCategory, setFibrosisCategory] = useState<FibrosisCategory>('No fibrosis / equivocal')
  const [fibrosisStage, setFibrosisStage] = useState('Ishak 2/6, METAVIR F2')
  const [reticulinArchitecture, setReticulinArchitecture] = useState('Preserved hepatic plates and central-portal relationships.')
  const [vanGiesonNote, setVanGiesonNote] = useState('Van Gieson highlights portal/septal fibrosis consistent with category above.')

  const [portalInflammation, setPortalInflammation] = useState<Severity>('Mild')
  const [interfaceHepatitis, setInterfaceHepatitis] = useState<Presence>('Absent')
  const [lobularInjury, setLobularInjury] = useState('None')
  const [cholestasis, setCholestasis] = useState<Presence>('Absent')
  const [steatosisGrade, setSteatosisGrade] = useState('None')
  const [steatosisPercent, setSteatosisPercent] = useState('')
  const [ballooning, setBallooning] = useState<Presence>('Absent')
  const [lobularInflammationNas, setLobularInflammationNas] = useState('None')
  const [biliaryFeatures, setBiliaryFeatures] = useState('')
  const [vascularFeatures, setVascularFeatures] = useState('')

  const [a1atComment, setA1atComment] = useState('No cytoplasmic globules suggestive of A1AT accumulation.')
  const [copperComment, setCopperComment] = useState('No convincing copper-binding protein accumulation.')
  const [ironComment, setIronComment] = useState('Perls: no significant iron deposition.')
  const [reticulinComment, setReticulinComment] = useState('Reticulin delineates hepatic plates; architecture as above.')
  const [fibrosisComment, setFibrosisComment] = useState('Van Gieson highlights portal/septal fibrosis consistent with category above.')

  const [interpretation, setInterpretation] = useState('')
  const [singleLineSummary, setSingleLineSummary] = useState('')

  const [report, setReport] = useState('')
  const [busy, setBusy] = useState(false)

  function buildDraft() {
    return `Liver Core Biopsy (non-lesional assessment)\n\nClinical & Specimen\n- Clinical history / indication: ${clinicalHistory || 'Not provided.'}\n- Number of cores: ${cores || 'Not provided'}\n- Number of portal tracts: ${portalTracts || 'Not provided'}\n- Comparison with previous biopsy: ${comparison || 'Not provided.'}\n\nArchitecture & Fibrosis\n- Category: ${fibrosisCategory}\n- Stage: ${fibrosisStage || 'Not specified'}\n- Reticulin architecture: ${reticulinArchitecture || 'Not provided.'}\n- Van Gieson / fibrosis note: ${vanGiesonNote || 'Not provided.'}\n\nPortal & Lobular Features\n- Portal inflammation: ${portalInflammation}\n- Interface hepatitis: ${interfaceHepatitis}\n- Lobular injury: ${lobularInjury}\n- Cholestasis: ${cholestasis}\n- Steatosis grade: ${steatosisGrade}\n- Steatosis %: ${steatosisPercent || 'Not specified'}\n- Ballooning (NAS): ${ballooning}\n- Lobular inflammation (NAS): ${lobularInflammationNas}\n- Biliary features: ${biliaryFeatures || 'None stated'}\n- Vascular features: ${vascularFeatures || 'None stated'}\n\nSpecial stains (comments only)\n- A1AT: ${a1atComment || 'Not provided.'}\n- Copper (Victoria Blue): ${copperComment || 'Not provided.'}\n- Iron (Perls): ${ironComment || 'Not provided.'}\n- Reticulin: ${reticulinComment || 'Not provided.'}\n- Van Gieson / fibrosis: ${fibrosisComment || 'Not provided.'}\n\nConclusion / Comment\n- Interpretation: ${interpretation || 'Not provided.'}\n- Single-line summary: ${singleLineSummary || 'Not provided.'}`
  }

  function buildPrompt() {
    const historyInstruction = useHistoryForConclusion
      ? 'Use the provided clinical history and prior-biopsy comparison (if present) to contextualise the final conclusion and comment.'
      : 'Do not infer from clinical history or prior-biopsy comparison; base the conclusion only on current biopsy morphology and stains.'

    return `You are a consultant hepatic pathologist.

Rewrite the draft into a polished, descriptive report in full sentences (plain text, no markdown), while preserving all factual detail and uncertainty.

Output structure:
1) Clinical & Specimen
2) Architecture & Fibrosis
3) Portal & Lobular Features
4) Special stains
5) Conclusion
6) Comment
7) Key points (3 concise bullets)

Rules:
- Keep the report clinically safe: do not invent findings, grades, or patient data.
- Explicitly state when information is not provided.
- Keep wording professional and concise, but more narrative than a checklist.
- In "Conclusion", provide an integrated diagnostic-style summary.
- In "Comment", provide short correlation advice and, if appropriate, progression/stability context.
- ${historyInstruction}

Draft source data:
${buildDraft()}`
  }

  async function generateReport() {
    setBusy(true)
    const prompt = buildPrompt()

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (!res.ok) {
        setReport(`Report service error: ${data?.error ?? 'Unknown error'}`)
      } else {
        setReport(data?.report ?? 'No response from report service.')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setReport(`Error generating report: ${message}`)
    } finally {
      setBusy(false)
    }
  }

  function copyReport() {
    navigator.clipboard.writeText(report)
  }

  return (
    <main className="page">
      <header className="card">
        <h1>Liver Biopsy Report Builder — non-lesional (hybrid)</h1>
      </header>

      <section className="card">
        <h2>Clinical & Specimen</h2>
        <div className="grid three-col">
          <label>
            Clinical history / indication
            <textarea rows={4} placeholder="Raised ALP, AMA+/-; query PBC; NAFLD risk factors; abnormal LFTs;" value={clinicalHistory} onChange={(e) => setClinicalHistory(e.target.value)} />
          </label>
          <label>
            Number of cores
            <input placeholder="2" value={cores} onChange={(e) => setCores(e.target.value)} />
          </label>
          <label>
            Number of portal tracts
            <input placeholder="12" value={portalTracts} onChange={(e) => setPortalTracts(e.target.value)} />
          </label>
          <label className="span-3">
            Comparison with previous biopsy (optional)
            <textarea rows={2} placeholder="Compared with 2022 biopsy: stable activity; fibrosis progressed by one stage." value={comparison} onChange={(e) => setComparison(e.target.value)} />
          </label>
          <label className="span-3 checkbox-row">
            <input
              type="checkbox"
              checked={useHistoryForConclusion}
              onChange={(e) => setUseHistoryForConclusion(e.target.checked)}
            />
            Use clinical history and comparison details to help shape Conclusion/Comment
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Architecture & Fibrosis</h2>
        <div className="grid two-col">
          <label>
            Category
            <select value={fibrosisCategory} onChange={(e) => setFibrosisCategory(e.target.value as FibrosisCategory)}>
              {(['No fibrosis / equivocal', 'Portal fibrosis only', 'Portal + periportal fibrosis', 'Bridging fibrosis', 'Cirrhosis'] as FibrosisCategory[]).map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label>
            Stage (optional)
            <input placeholder="Ishak 2/6, METAVIR F2" value={fibrosisStage} onChange={(e) => setFibrosisStage(e.target.value)} />
          </label>
          <label>
            Reticulin architecture
            <textarea rows={3} value={reticulinArchitecture} onChange={(e) => setReticulinArchitecture(e.target.value)} />
          </label>
          <label>
            Van Gieson / fibrosis note
            <textarea rows={3} value={vanGiesonNote} onChange={(e) => setVanGiesonNote(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Portal & Lobular Features</h2>
        <div className="grid three-col">
          <label>
            Portal inflammation
            <select value={portalInflammation} onChange={(e) => setPortalInflammation(e.target.value as Severity)}>
              {(['None', 'Mild', 'Moderate', 'Marked'] as Severity[]).map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label>
            Interface hepatitis
            <select value={interfaceHepatitis} onChange={(e) => setInterfaceHepatitis(e.target.value as Presence)}>
              {(['Absent', 'Present'] as Presence[]).map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label>
            Lobular injury
            <select value={lobularInjury} onChange={(e) => setLobularInjury(e.target.value)}>
              <option>None</option>
              <option>Mild</option>
              <option>Moderate</option>
              <option>Marked</option>
            </select>
          </label>
          <label>
            Cholestasis
            <select value={cholestasis} onChange={(e) => setCholestasis(e.target.value as Presence)}>
              {(['Absent', 'Present'] as Presence[]).map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label>
            Steatosis grade
            <select value={steatosisGrade} onChange={(e) => setSteatosisGrade(e.target.value)}>
              <option>None</option>
              <option>Mild</option>
              <option>Moderate</option>
              <option>Severe</option>
            </select>
          </label>
          <label>
            Steatosis % (optional)
            <input placeholder="5–10%" value={steatosisPercent} onChange={(e) => setSteatosisPercent(e.target.value)} />
          </label>
          <label>
            Ballooning (NAS)
            <select value={ballooning} onChange={(e) => setBallooning(e.target.value as Presence)}>
              {(['Absent', 'Present'] as Presence[]).map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label>
            Lobular inflammation (NAS)
            <select value={lobularInflammationNas} onChange={(e) => setLobularInflammationNas(e.target.value)}>
              <option>None</option>
              <option>&lt;2 foci per 20x field</option>
              <option>2-4 foci per 20x field</option>
              <option>&gt;4 foci per 20x field</option>
            </select>
          </label>
          <div></div>
          <label className="span-2">
            Biliary features (free text)
            <textarea rows={2} placeholder="Ductular reaction, bile plugs, cholangitis-like changes" value={biliaryFeatures} onChange={(e) => setBiliaryFeatures(e.target.value)} />
          </label>
          <label>
            Vascular features (free text)
            <textarea rows={2} placeholder="Central vein congestion/outflow, NRH-like change" value={vascularFeatures} onChange={(e) => setVascularFeatures(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Special stains (comments only)</h2>
        <div className="grid two-col">
          <label>
            A1AT
            <textarea rows={3} value={a1atComment} onChange={(e) => setA1atComment(e.target.value)} />
          </label>
          <label>
            Copper (Victoria Blue)
            <textarea rows={3} value={copperComment} onChange={(e) => setCopperComment(e.target.value)} />
          </label>
          <label>
            Iron (Perls)
            <textarea rows={3} value={ironComment} onChange={(e) => setIronComment(e.target.value)} />
          </label>
          <label>
            Reticulin
            <textarea rows={3} value={reticulinComment} onChange={(e) => setReticulinComment(e.target.value)} />
          </label>
          <label className="span-2">
            Van Gieson / fibrosis
            <textarea rows={3} value={fibrosisComment} onChange={(e) => setFibrosisComment(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Conclusion / Comment</h2>
        <div className="grid two-col">
          <label>
            Interpretation (free text)
            <textarea rows={3} placeholder="In the stated clinical context, the appearances favour …; correlate with …" value={interpretation} onChange={(e) => setInterpretation(e.target.value)} />
          </label>
          <label>
            Single-line summary
            <textarea rows={3} placeholder="Chronic hepatitis pattern with mild activity and no advanced fibrosis." value={singleLineSummary} onChange={(e) => setSingleLineSummary(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="card actions">
        <button onClick={generateReport} disabled={busy}>{busy ? 'Generating...' : 'Generate LLM report'}</button>
        <button className="ghost" onClick={copyReport} disabled={!report}>Copy report</button>
      </section>

      <section className="card">
        <h2>Report</h2>
        <textarea className="report" rows={16} value={report} readOnly />
      </section>
    </main>
  )
}
