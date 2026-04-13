import type { Handler } from "@netlify/functions";
export const handler: Handler = async (event) => {
  const { prompt } = JSON.parse(event.body || "{}");
  const res = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer " + process.env.OPENAI_API_KEY
    },
    body:JSON.stringify({
      model:"gpt-4o-mini",
      temperature: 0.2,
      messages:[
        {
          role:"system",
          content:"You are an expert liver pathologist writing safe, professional medical reports. Do not fabricate findings or advice beyond provided facts."
        },
        {role:"user",content:prompt}
      ]
    })
  })
  const data = await res.json()
  if (!res.ok) {
    return { statusCode: res.status, body: JSON.stringify({ error: data?.error?.message || "LLM request failed." }) }
  }
  return { statusCode:200, body: JSON.stringify({ report: data.choices?.[0]?.message?.content || "No report generated." }) }
};
