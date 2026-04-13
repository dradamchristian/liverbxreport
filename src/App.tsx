import React, { useMemo, useState } from 'react'
import './styles.css'

type FibrosisStage = 'F0' | 'F1' | 'F2' | 'F3' | 'F4'
type SteatosisGrade = 'None (<5%)' | 'Mild (5-33%)' | 'Moderate (34-66%)' | 'Severe (>66%)'
type Inflammation = 'None' | 'Mild' | 'Moderate' | 'Marked'
type InjuryPattern = 'None identified' | 'Hepatitis pattern' | 'Steatohepatitis pattern' | 'Cholestatic pattern' | 'Biliary injury pattern'

const fibrosisDescriptions: Record<FibrosisStage, string> = {
  F0: 'No fibrosis (F0).',
  F1: 'Portal fibrosis without septa (F1).',
  F2: 'Portal fibrosis with few septa (F2).',
  F3: 'Numerous septa without established cirrhosis (F3).',
  F4: 'Established cirrhosis (F4).'
}

export default function App() {
  const [cores, setCores] = useState('2')
  const [portalTracts, setPortalTracts] = useState('12')
  const [clinicalDetails, setClinicalDetails] = useState('')
  const [stainSet, setStainSet] = useState('H&E, reticulin, trichrome, PASD, Perls')

  const [fibrosis, setFibrosis] = useState<FibrosisStage>('F0')
  const [steatosis, setSteatosis] = useState<SteatosisGrade>('None (<5%)')
  const [portalInflammation, setPortalInflammation] = useState<Inflammation>('None')
  const [lobularInflammation, setLobularInflammation] = useState<Inflammation>('None')
  const [ballooning, setBallooning] = useState<Inflammation>('None')
  const [injuryPattern, setInjuryPattern] = useState<InjuryPattern>('None identified')
  const [cholestasis, setCholestasis] = useState('No')
  const [iron, setIron] = useState('No significant iron deposition')

  const [report, setReport] = useState('')
  const [busy, setBusy] = useState(false)

  const adequacy = useMemo(() => {
    const portalCount = Number(portalTracts)
    if (Number.isNaN(portalCount)) return 'Portal tract count not provided.'
    if (portalCount >= 11) return 'Adequate sample for assessment.'
    if (portalCount >= 6) return 'Borderline adequacy; interpret with clinical-radiological correlation.'
    return 'Suboptimal sample; staging/grading may be underestimated.'
  }, [portalTracts])

  function buildDraft() {
    return `SPECIMEN\nLiver core biopsy (${cores} cores; approximately ${portalTracts} portal tracts).\n\nCLINICAL DETAILS\n${clinicalDetails || 'Not provided.'}\n\nMICROSCOPY\n- Sample adequacy: ${adequacy}\n- Architecture/fibrosis: ${fibrosisDescriptions[fibrosis]}\n- Steatosis: ${steatosis}.\n- Portal inflammation: ${portalInflammation}.\n- Lobular inflammation: ${lobularInflammation}.\n- Hepatocyte ballooning/injury: ${ballooning}.\n- Pattern of injury: ${injuryPattern}.\n- Cholestasis: ${cholestasis}.\n- Iron stain: ${iron}.\n- Ancillary stains performed: ${stainSet}.\n\nCONCLUSION\nPlease generate a structured RCPath-style liver biopsy report with clear headings for: Specimen, Microscopy, and Conclusion. Include a concise diagnostic summary suitable for MDT communication.`
  }

  async function generateReport() {
    setBusy(true)
    const prompt = `You are a consultant hepatic pathologist in the UK. Rewrite the following draft into a professional RCPath-aligned report in plain text (no markdown), preserving factual content and uncertainty where relevant:\n\n${buildDraft()}`

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      setReport(data?.report ?? 'No response from report service.')
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
        <h1>RCPath Liver Biopsy Report Builder</h1>
        <p className="subtle">Structured inputs restored with dropdowns and staged histology fields.</p>
      </header>

      <section className="card grid two-col">
        <label>
          Number of cores
          <input value={cores} onChange={(e) => setCores(e.target.value)} />
        </label>
        <label>
          Portal tracts
          <input value={portalTracts} onChange={(e) => setPortalTracts(e.target.value)} />
        </label>
        <label className="span-2">
          Clinical details
          <textarea value={clinicalDetails} onChange={(e) => setClinicalDetails(e.target.value)} rows={3} />
        </label>
        <label className="span-2">
          Ancillary stains
          <input value={stainSet} onChange={(e) => setStainSet(e.target.value)} />
        </label>
      </section>

      <section className="card grid two-col">
        <label>
          Fibrosis stage
          <select value={fibrosis} onChange={(e) => setFibrosis(e.target.value as FibrosisStage)}>
            {(['F0', 'F1', 'F2', 'F3', 'F4'] as FibrosisStage[]).map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>
          Steatosis
          <select value={steatosis} onChange={(e) => setSteatosis(e.target.value as SteatosisGrade)}>
            {(['None (<5%)', 'Mild (5-33%)', 'Moderate (34-66%)', 'Severe (>66%)'] as SteatosisGrade[]).map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>
          Portal inflammation
          <select value={portalInflammation} onChange={(e) => setPortalInflammation(e.target.value as Inflammation)}>
            {(['None', 'Mild', 'Moderate', 'Marked'] as Inflammation[]).map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>
          Lobular inflammation
          <select value={lobularInflammation} onChange={(e) => setLobularInflammation(e.target.value as Inflammation)}>
            {(['None', 'Mild', 'Moderate', 'Marked'] as Inflammation[]).map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>
          Ballooning / injury
          <select value={ballooning} onChange={(e) => setBallooning(e.target.value as Inflammation)}>
            {(['None', 'Mild', 'Moderate', 'Marked'] as Inflammation[]).map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>
          Cholestasis
          <select value={cholestasis} onChange={(e) => setCholestasis(e.target.value)}>
            <option>No</option>
            <option>Focal/canalicular</option>
            <option>Prominent</option>
          </select>
        </label>
        <label>
          Pattern of injury
          <select value={injuryPattern} onChange={(e) => setInjuryPattern(e.target.value as InjuryPattern)}>
            {(['None identified', 'Hepatitis pattern', 'Steatohepatitis pattern', 'Cholestatic pattern', 'Biliary injury pattern'] as InjuryPattern[]).map((v) => <option key={v}>{v}</option>)}
          </select>
        </label>
        <label>
          Iron stain
          <select value={iron} onChange={(e) => setIron(e.target.value)}>
            <option>No significant iron deposition</option>
            <option>Mild hepatocellular iron</option>
            <option>Moderate hepatocellular iron</option>
            <option>Marked hepatocellular iron</option>
            <option>Kupffer-predominant iron</option>
          </select>
        </label>
      </section>

      <section className="card actions">
        <button onClick={generateReport} disabled={busy}>{busy ? 'Generating...' : 'Generate RCPath report'}</button>
        <button onClick={copyReport} disabled={!report}>Copy report</button>
      </section>

      <section className="card">
        <label>
          Generated report
          <textarea className="report" rows={18} value={report} readOnly />
        </label>
      </section>
    </main>
  )
}
