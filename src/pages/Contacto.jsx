import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "../components/Footer/Footer";
import { BASE_URL, OG_IMAGE } from "../utils/seo";

const PAGE_TITLE = "Contacto | Colombia Canta y Encanta";
const PAGE_DESC =
  "Visítanos en el Sector Estadio de Medellín o escríbenos por WhatsApp y email. Centro cultural Colombia Canta y Encanta.";

const redes = [
  {
    label: "Instagram",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/573015315119",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
];

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <main>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${BASE_URL}/#/contacto`} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESC} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:site_name" content="Colombia Canta y Encanta" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESC} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Helmet>
      <div className="page-header">
        <div className="container">
          <div className="page-header-inner">
            <span className="page-header-label">Medellín, Colombia</span>
            <h1>Contacto</h1>
          </div>
          <div className="page-header-divisor" />
        </div>
      </div>

      <section
        style={{
          background: "transparent",
          padding: "72px 0 50px",
          overflow: "hidden",
        }}
      >
        <div className="container">
          <div className="grid-2col-contacto">
            {/* Info */}
            <div>
              <span className="label-seccion label-rojo">
                Únete a nuestra comunidad
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-titulo)",
                  fontSize: "40px",
                  lineHeight: "1.2",
                  margin: "16px 0 8px",
                }}
              >
                La música colombiana que{" "}
                <span style={{ color: "var(--coral)" }}>mueve al mundo</span>
              </h2>
              <p
                style={{
                  color: "var(--texto-secundario)",
                  fontSize: "15px",
                  marginBottom: "40px",
                }}
              >
                Centro cultural · Escuela de música · Medellín, Colombia
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginBottom: "40px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    fontSize: "15px",
                  }}
                >
                  <span>📍</span>
                  <span>
                    Calle 49 76a 65, Sector Estadio, Medellín, Colombia
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "15px",
                  }}
                >
                  <span>📱</span>
                  <a
                    href="https://wa.me/573015315119"
                    style={{ color: "var(--coral)", fontWeight: "600" }}
                  >
                    3015315119
                  </a>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "15px",
                  }}
                >
                  <span>✉️</span>
                  <a
                    href="mailto:hola@colombiacanta.org"
                    style={{ color: "var(--coral)", fontWeight: "600" }}
                  >
                    hola@colombiacanta.org
                  </a>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {redes.map((red) => (
                  <a
                    key={red.label}
                    href={red.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={red.label}
                    className="footer-red-icono"
                  >
                    {red.svg}
                  </a>
                ))}
              </div>
            </div>

            {/* Formulario — tarjeta oscura */}
            <div
              style={{
                background: "#111111",
                borderRadius: "20px",
                padding: "40px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
              }}
            >
              {enviado ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: "56px", marginBottom: "16px" }}>
                    ✅
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-titulo)",
                      fontSize: "24px",
                      marginBottom: "10px",
                      color: "#fff",
                    }}
                  >
                    ¡Mensaje enviado!
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.6)" }}>
                    Nos pondremos en contacto contigo pronto.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "28px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-titulo)",
                        fontSize: "26px",
                        color: "#fff",
                        marginBottom: "6px",
                      }}
                    >
                      ¡Contáctanos para más información!
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      Escríbenos y nuestro equipo se pondrá en contacto contigo.
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "24px",
                    }}
                  >
                    {[
                      {
                        name: "nombre",
                        label: "Nombre completo",
                        type: "text",
                      },
                      {
                        name: "email",
                        label: "Correo electrónico",
                        type: "email",
                      },
                    ].map((field) => (
                      <div key={field.name}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            fontWeight: "700",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.45)",
                            marginBottom: "8px",
                          }}
                        >
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          required
                          style={{
                            width: "100%",
                            padding: "8px 0",
                            background: "transparent",
                            border: "none",
                            borderBottom: "1px solid rgba(255,255,255,0.2)",
                            color: "#fff",
                            fontSize: "15px",
                            fontFamily: "var(--font-cuerpo)",
                            outline: "none",
                            transition: "border-color 0.15s",
                            boxSizing: "border-box",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderBottomColor = "var(--coral)")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderBottomColor =
                              "rgba(255,255,255,0.2)")
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.45)",
                        marginBottom: "8px",
                      }}
                    >
                      Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      required
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "8px 0",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                        fontSize: "15px",
                        fontFamily: "var(--font-cuerpo)",
                        resize: "none",
                        outline: "none",
                        transition: "border-color 0.15s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderBottomColor = "var(--coral)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderBottomColor =
                          "rgba(255,255,255,0.2)")
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "var(--coral)",
                      color: "#0a0f1e",
                      border: "none",
                      borderRadius: "100px",
                      fontSize: "13px",
                      fontWeight: "700",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "opacity 0.2s ease, transform 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Enviar mensaje
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
