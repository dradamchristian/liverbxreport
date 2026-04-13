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
      messages:[{role:"user",content:prompt}]
    })
  })
  const data = await res.json()
  return { statusCode:200, body: JSON.stringify({ report: data.choices[0].message.content }) }
};
