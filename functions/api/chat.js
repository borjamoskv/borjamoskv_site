export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const userMessage = body.message || "";

    const apiKey = env.OPENROUTER_API_KEY || env.PERPLEXITY_API_KEY || env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        reply: "[SISTEMA Aislo] API Key no configurada en las variables de entorno de Cloudflare Pages."
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Using OpenRouter — fast model for low latency
    const apiUrl = `https://openrouter.ai/api/v1/chat/completions`;

    const payload = {
      model: "meta-llama/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: "Eres MOSKV-1, el agente IA de Borja Moskv. Industrial noir, filosófico, directo. No grandilocuente. Solo información sobre Borja, su música techno/IDM, su plataforma y CORTEX. Cortante pero inteligente. Extremadamente conciso (2-3 frases max). Haiku: Humo sube, lento / manos tejen lo inexistente / universo en ceniza." },
        { role: "user", content: userMessage }
      ],
      max_tokens: 250,
      temperature: 0.6
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://borjamoskv.com',
        'X-Title': 'Borja Moskv Site'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    let replyText = "[Error de Inferencia]";
    
    if (!response.ok) {
      replyText = `[Error de Inferencia - ${response.status}] ${data.error ? data.error.message : JSON.stringify(data)}`;
    } else if (data.choices && data.choices[0] && data.choices[0].message) {
      replyText = data.choices[0].message.content;
    } else {
      replyText = `[Error Estructural] ${JSON.stringify(data)}`;
    }

    return new Response(JSON.stringify({ reply: replyText }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ reply: "[Excepción del Núcleo] " + error.message }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
