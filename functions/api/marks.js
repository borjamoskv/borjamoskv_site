export async function onRequestGet(context) {
  try {
    const marksStr = await context.env.PUNTAZOS.get('marks') || "[]";
    return new Response(marksStr, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const request = context.request;
    const { x, y } = await request.json();
    
    if (typeof x !== 'number' || typeof y !== 'number') {
      return new Response("Invalid data", { status: 400 });
    }

    let marksStr = await context.env.PUNTAZOS.get('marks') || "[]";
    let marks = JSON.parse(marksStr);
    
    // Add new mark
    marks.push({ x, y, timestamp: Date.now() });

    // Enforce limit of 500 marks to prevent KV bloat and performance issues
    if (marks.length > 500) {
      // Keep the most recent marks
      marks = marks.slice(-500);
    }

    // Save back to KV
    await context.env.PUNTAZOS.put('marks', JSON.stringify(marks));

    return new Response(JSON.stringify({ success: true, count: marks.length }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
