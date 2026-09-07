// Sin dominio propio verificado en Resend, el remitente sandbox
// "onboarding@resend.dev" solo entrega a la casilla dueña de la cuenta de
// Resend, no a destinatarios reales (mismo límite ya documentado en
// backend/.env.example para Fase 6) — se deja como valor por defecto para que
// el formulario de contacto funcione en desarrollo sin configuración extra,
// y basta con fijar RESEND_FROM a un remitente del dominio verificado cuando
// esté listo.
const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_DEFECTO = 'Colombia Canta y Encanta <onboarding@resend.dev>';

// No lanza: un correo de aviso que falla no debe tumbar la operación principal
// (ej. guardar el mensaje de contacto), que ya quedó a salvo en la base de
// datos. El error se deja en el log del servidor para poder diagnosticarlo.
export async function enviarCorreo({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('enviarCorreo: RESEND_API_KEY no está configurada — correo omitido:', subject);
    return { ok: false, omitido: true };
  }

  try {
    const respuesta = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || FROM_DEFECTO,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!respuesta.ok) {
      const cuerpo = await respuesta.text();
      console.error('enviarCorreo: Resend respondió con error -', respuesta.status, cuerpo);
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    console.error('enviarCorreo: fallo de red al llamar a Resend -', error.message);
    return { ok: false };
  }
}
