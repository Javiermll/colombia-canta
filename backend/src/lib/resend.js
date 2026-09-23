// Sin dominio propio verificado en Resend, el remitente sandbox
// "onboarding@resend.dev" solo entrega a la casilla dueña de la cuenta de
// Resend, no a destinatarios reales (mismo límite ya documentado en
// backend/.env.example para Fase 6) — se deja como valor por defecto para que
// el formulario de contacto funcione en desarrollo sin configuración extra,
// y basta con fijar RESEND_FROM a un remitente del dominio verificado cuando
// esté listo.
//
// Confirmado en la práctica (2026-09-08): antes de verificar el dominio,
// Resend no solo ignora destinatarios ajenos a la cuenta — rechaza la
// petición ENTERA (403) si CUALQUIER destinatario (to, cc o bcc) no es la
// casilla dueña de la cuenta. No existe forma de "agregar una copia interna"
// junto al destinatario real mientras tanto: hay que elegir uno de los dos.
// Por eso, mientras RESEND_DOMINIO_VERIFICADO no sea "true", este helper
// redirige el correo entero a RESEND_BCC_INTERNO (si está configurada) y dice
// en el asunto quién era el destinatario real, para que el equipo pueda
// avisarle a mano (WhatsApp) mientras se completa la verificación del
// dominio en resend.com/domains.
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

  const dominioVerificado = process.env.RESEND_DOMINIO_VERIFICADO === 'true';
  const avisoInterno = process.env.RESEND_BCC_INTERNO;
  const redirigir = !dominioVerificado && avisoInterno && to !== avisoInterno;

  const destinatarioFinal = redirigir ? avisoInterno : to;
  const asuntoFinal = redirigir ? `[Cliente: ${to}] ${subject}` : subject;

  try {
    const respuesta = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || FROM_DEFECTO,
        to: destinatarioFinal,
        subject: asuntoFinal,
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
