import React, { useState } from 'react';
import './LoginPage.css';

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      alert(`Zalogowano pomyślnie jako: ${email}`);
    } else {
      alert(`Utworzono konto dla gracza: ${username}`);
    }
  };

  return (
    <>
      {/* Kolorowe plamy  */}
      <div className="bg-glow green"></div>
      <div className="bg-glow red"></div>
      <div className="bg-glow gold"></div>

      <div className="login-card">
        {/* Logo */}
        <div className="logo-area">
          <div className="logo-badge">
            <h1>Monopoly</h1>
          </div>
          <span className="logo-subtitle">Online Edition</span>
        </div>

        {/* Zakładki */}
        <div className="tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Logowanie
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Rejestracja
          </button>
        </div>

        {/* Formularz */}
        <form className="form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Nazwa gracza (Nick)</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  placeholder="PanMonopolista" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Adres E-mail</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                placeholder="gracz@domena.pl" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Hasło</label>
            <div className="input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  /* Ikona przekreślonego oka */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  /* Ikona otwartego oka */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> Zapamiętaj mnie
              </label>
              <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
                Zapomniałeś hasła?
              </a>
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Zaloguj się do gry' : 'Utwórz konto'}
          </button>
        </form>
      </div>
    </>
  );
}