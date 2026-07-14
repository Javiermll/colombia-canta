import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (username.trim() === 'admin' && password === 'admin123') {
      localStorage.setItem('token', 'token_falso_colombiacanta_2026');
      localStorage.setItem('user', JSON.stringify({ name: 'Administrador', role: 'admin' }));
      navigate('/admin');
    } else {
      setErrorMsg('Usuario o contraseña incorrectos. Intenta con admin / admin123');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.loginCard}>
        
        {/* Cabecera con Branding */}
        <div style={styles.headerArea}>
          <div style={styles.logoBadge}>CC</div>
          <h2 style={styles.title}>Colombia Canta</h2>
          <p style={styles.subtitle}>Panel de Administración</p>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div style={styles.errorAlert}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          {/* Input de Usuario */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Usuario</label>
            <div style={styles.inputWrapper}>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* Input de Contraseña */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                style={styles.input}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {/* Botón de Envío */}
          <button type="submit" style={styles.submitBtn}>
            Ingresar al Panel
          </button>
        </form>

        {/* Footer de la tarjeta */}
        <div style={styles.cardFooter}>
          <p style={styles.footerText}>Acceso restringido solo para personal autorizado.</p>
        </div>
      </div>
    </div>
  );
}

// Estilos limpios y profesionales
const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f5f7fb',
    padding: '2rem',
    boxSizing: 'border-box',
    fontFamily: '"Poppins", system-ui, sans-serif',
  },
  loginCard: {
    backgroundColor: '#fff',
    padding: '3rem 2.5rem',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    width: '100%',
    maxWidth: '420px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  headerArea: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#fff0f5',
    color: '#ff2a74',
    fontSize: '1.2rem',
    fontWeight: '800',
    marginBottom: '1rem',
    border: '2px solid #ff2a74',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
    margin: 0,
    color: '#1a202c',
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#718096',
    fontWeight: '500',
    margin: '0.3rem 0 0 0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  errorAlert: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    padding: '0.8rem 1rem',
    borderRadius: '10px',
    border: '1px solid #fed7d7',
    fontSize: '0.85rem',
    fontWeight: '500',
    marginBottom: '1.5rem',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4a5568',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '1px solid #cbd5e0',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '10px',
    border: 'none',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Poppins", system-ui, sans-serif',
    backgroundColor: 'transparent',
  },
  eyeButton: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#718096',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0.2rem 0.5rem',
    textTransform: 'uppercase',
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#ff2a74',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(255, 42, 116, 0.25)',
    marginTop: '0.5rem',
    fontFamily: '"Poppins", system-ui, sans-serif',
  },
  cardFooter: {
    marginTop: '2rem',
    borderTop: '1px solid #edf2f7',
    paddingTop: '1rem',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#a0aec0',
    lineHeight: '1.4',
  }
};