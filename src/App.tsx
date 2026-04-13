    import React, { useState } from 'react'
    import './styles.css'

    export default function App() {
      const [cores, setCores] = useState("2")
      const [portals, setPortals] = useState("12")
      const [clinical, setClinical] = useState("")
      const [report, setReport] = useState("")
      const [busy, setBusy] = useState(false)

      function buildDraft() {
        return `Formalin-fixed liver core biopsy comprising ${cores} cores with ${portals} portal tracts identified.

Architecture and Fibrosis:
Preserved hepatic architecture. No significant fibrosis identified.

Portal and Lobular Features:
No significant inflammation or steatosis identified.

Conclusion:
In the stated clinical context (${clinical}), no significant pathological abnormality identified.

Single-line summary:
Unremarkable liver biopsy.`
      }

      async function generate() {
        setBusy(true)
        const draft = buildDraft()
        const prompt = "Reformat this into a clean pathology report with paragraphs, no markdown:\n\n" + draft
        try {
          const res = await fetch("/api/report", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({prompt})
          })
          const data = await res.json()
          setReport(data.report)
        } catch(e){
          setReport("Error: " + e.message)
        }
        setBusy(false)
      }

      function copy() {
        navigator.clipboard.writeText(report)
      }

      return (
        <div>
          <h1>Liver Report Builder</h1>
          <input value={cores} onChange={e=>setCores(e.target.value)} placeholder="cores"/>
          <input value={portals} onChange={e=>setPortals(e.target.value)} placeholder="portal tracts"/>
          <textarea value={clinical} onChange={e=>setClinical(e.target.value)} placeholder="clinical"/>
          <br/>
          <button onClick={generate}>{busy?"Generating...":"Generate report"}</button>
          <button onClick={copy}>Copy</button>
          <textarea rows={15} value={report} readOnly style={{width:"100%"}}/>
        </div>
      )
    }
