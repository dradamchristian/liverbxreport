import React, { useState } from 'react'
import './styles.css'

type FibrosisCategory =
  | 'No fibrosis'
  | 'Equivocal for fibrosis'
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

  const [fibrosisCategory, setFibrosisCategory] = useState<FibrosisCategory>('No fibrosis')
  const [fibrosisStage, setFibrosisStage] = useState('')
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
  const [favouredDiagnosis, setFavouredDiagnosis] = useState('')

  const [interpretation, setInterpretation] = useState('')
  const [singleLineSummary, setSingleLineSummary] = useState('')

  const [report, setReport] = useState('')
  const [busy, setBusy] = useState(false)


  const portalTractNumber = Number.parseInt(portalTracts, 10)
  const adequacyComment = Number.isFinite(portalTractNumber)
    ? portalTractNumber < 6
      ? 'Limited sample: fewer than 6 portal tracts; confident assessment of diffuse medical liver disease may be unreliable.'
      : portalTractNumber < 11
        ? 'Borderline sample: 6–10 portal tracts; RCPath-associated literature notes this may compromise assessment, although at least 6 portal tracts is often considered sufficient.'
        : 'Adequate portal tract sampling for diffuse medical liver disease assessment.'
    : 'Enter a portal tract count to generate an adequacy prompt.'

  const contextPrompts = [
    portalInflammation === 'Marked' || interfaceHepatitis === 'Present' ? 'Marked portal/interface activity: consider autoimmune hepatitis, drug-induced liver injury, viral hepatitis, and immune-mediated injury; check plasma cells, rosettes/emperipolesis, eosinophils, viral inclusions, and serology/IgG.' : '',
    lobularInjury === 'Marked' ? 'Marked lobular injury: look for confluent/bridging necrosis, acidophil bodies, Kupffer cell activation, endothelialitis, and features supporting acute viral, drug/toxin, or autoimmune hepatitis.' : '',
    cholestasis === 'Present' || /duct|ck7|bile|cholang/i.test(biliaryFeatures) ? 'Biliary/cholestatic clues: assess duct injury/loss, ductular reaction, cholangitis, copper-associated protein, CK7 pattern, and correlation with AMA/MRCP/drug history.' : '',
    /central|vein|outflow|congestion/i.test(vascularFeatures) ? 'Vascular clues: review central venulitis, sinusoidal dilatation/congestion, outflow obstruction, nodular regenerative change, and relevant cardiac/vascular history.' : '',
    steatosisGrade !== 'None' || ballooning === 'Present' ? 'Fatty liver clues: quantify steatosis, ballooning, Mallory-Denk bodies, perisinusoidal fibrosis, and metabolic/alcohol risk factors.' : '',
    favouredDiagnosis ? `If morphology supports it, the conclusion will be steered toward: ${favouredDiagnosis}.` : 'Optionally enter a favoured diagnosis below to have it reflected in the conclusion.'
  ].filter(Boolean)

  function buildDraft() {
    return `Liver Core Biopsy (non-lesional assessment)

Clinical & Specimen
- Clinical history / indication: ${clinicalHistory || 'Not provided.'}
- Number of cores: ${cores || 'Not provided'}
- Number of portal tracts: ${portalTracts || 'Not provided'}
- Adequacy prompt: ${adequacyComment}
- Comparison with previous biopsy: ${comparison || 'Not provided.'}

Architecture & Fibrosis
- Category: ${fibrosisCategory}
- Stage: ${fibrosisStage || 'Not specified'}
- Reticulin architecture: ${reticulinArchitecture || 'Not provided.'}
- Van Gieson / fibrosis note: ${vanGiesonNote || 'Not provided.'}

Portal & Lobular Features
- Portal inflammation: ${portalInflammation}
- Interface hepatitis: ${interfaceHepatitis}
- Lobular injury: ${lobularInjury}
- Cholestasis: ${cholestasis}
- Steatosis grade: ${steatosisGrade}
- Steatosis %: ${steatosisPercent || 'Not specified'}
- Ballooning (NAS): ${ballooning}
- Lobular inflammation (NAS): ${lobularInflammationNas}
- Biliary features: ${biliaryFeatures || 'None stated'}
- Vascular features: ${vascularFeatures || 'None stated'}

Special stains (comments only)
- A1AT: ${a1atComment || 'Not provided.'}
- Copper (Victoria Blue): ${copperComment || 'Not provided.'}
- Iron (Perls): ${ironComment || 'Not provided.'}

Conclusion / Comment
- Favoured diagnosis to include in conclusion: ${favouredDiagnosis || 'Not selected'}
- Interpretation: ${interpretation || 'Not provided.'}
- Single-line summary: ${singleLineSummary || 'Not provided.'}`
  }

  function buildPrompt() {
    const historyInstruction = useHistoryForConclusion
      ? 'Use the provided clinical history and prior-biopsy comparison (if present) to contextualise the final conclusion and comment.'
      : 'Do not infer from clinical history or prior-biopsy comparison; base the conclusion only on current biopsy morphology and stains.'

    return `You are a consultant hepatic pathologist.

Rewrite the draft into a polished, descriptive report in full sentences (plain text, no markdown), while preserving all factual detail and uncertainty.

Output structure:
1) Specimen adequacy
2) Architecture & Fibrosis
3) Portal & Lobular Features
4) Special stains
5) Conclusion
6) Comment
7) Key points (3 concise bullets)

Rules:
- Keep the report clinically safe: do not invent findings, grades, or patient data.
- Do not include the clinical history as a standalone report section; use it only to inform the Conclusion/Comment when instructed.
- Include an adequacy statement using portal tract count: RCPath guidance requires reports to include portal tract count; fewer than 6 portal tracts should be described as limited/inadequate for confident diffuse medical liver disease assessment, and 6-10 portal tracts may compromise assessment compared with an optimal sample.
- Explicitly state when information is not provided, but avoid repetitive formulaic phrases when a finding is clearly absent.
- Keep wording professional, concise, and context-aware, with varied narrative phrasing rather than a checklist.
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

      <section className="card context-panel">
        <h2>Clinical context assistant (not copied into report)</h2>
        <p><strong>Clinical history:</strong> {clinicalHistory || 'No clinical history entered yet.'}</p>
        <p><strong>Prior biopsy comparison:</strong> {comparison || 'No comparison entered.'}</p>
        <p><strong>Adequacy:</strong> {adequacyComment}</p>
        <p className="helper">RCPath tissue pathway guidance says medical liver biopsy reports should include portal tract count; published RCPath audit discussion notes fewer than 11 portal tracts may compromise diagnosis, while at least 6 portal tracts should usually be sufficient.</p>
        <ul>
          {contextPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}
        </ul>
      </section>

      <section className="card">
        <h2>Architecture & Fibrosis</h2>
        <div className="grid two-col">
          <label>
            Category
            <select value={fibrosisCategory} onChange={(e) => setFibrosisCategory(e.target.value as FibrosisCategory)}>
              {(['No fibrosis', 'Equivocal for fibrosis', 'Portal fibrosis only', 'Portal + periportal fibrosis', 'Bridging fibrosis', 'Cirrhosis'] as FibrosisCategory[]).map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>
          <label>
            Stage (optional)
            <input placeholder="Optional, e.g. Ishak 2/6, METAVIR F2" value={fibrosisStage} onChange={(e) => setFibrosisStage(e.target.value)} />
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
          <p className="helper span-2">Reticulin architecture and Van Gieson/fibrosis comments are entered once in Architecture & Fibrosis to avoid repetition in the generated report.</p>
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
            Favoured diagnosis (optional; added to conclusion)
            <input placeholder="e.g. autoimmune hepatitis, drug-induced liver injury, acute hepatitis" value={favouredDiagnosis} onChange={(e) => setFavouredDiagnosis(e.target.value)} />
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
