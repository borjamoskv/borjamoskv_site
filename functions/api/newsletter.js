/**
 * Newsletter subscription endpoint.
 * Stores subscriber info in Cloudflare KV (if bound) and
 * sends a notification email to the site owner.
 * 
 * POST /api/newsletter
 * Body: { name: string, email: string }
 */
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { name, email } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ 
        ok: false, 
        message: 'Email no válido.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const timestamp = new Date().toISOString();
    const subscriber = { name: name || 'Anónimo', email, timestamp };

    // Store in KV if available
    if (env.NEWSLETTER_KV) {
      const key = `sub_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await env.NEWSLETTER_KV.put(key, JSON.stringify(subscriber));
    }

    // Also log to console (visible in Cloudflare dashboard logs)
    console.log(`[NEWSLETTER] New subscriber: ${subscriber.name} <${subscriber.email}> at ${timestamp}`);

    // Send notification email via MailChannels (free on Cloudflare Workers)
    try {
      await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: 'borjamoskv@icloud.com', name: 'Borja Moskv' }]
          }],
          from: { email: 'newsletter@borjamoskv.com', name: 'MOSKV Newsletter' },
          subject: `[NEWSLETTER] ${subscriber.name} se ha suscrito`,
          content: [{
            type: 'text/plain',
            value: `Nuevo suscriptor:\n\nNombre: ${subscriber.name}\nEmail: ${subscriber.email}\nFecha: ${timestamp}\n\n— MOSKV-1 Automated`
          }]
        })
      });
    } catch (mailErr) {
      console.log('[NEWSLETTER] Mail notification failed:', mailErr.message);
      // Non-blocking — subscription still counts
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      message: `${subscriber.name}, estás sintonizado. Frecuencia confirmada.` 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      ok: false, 
      message: '[ERROR] ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
