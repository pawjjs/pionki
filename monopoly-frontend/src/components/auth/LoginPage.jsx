import React, { useState } from 'react';
import './LoginPage.css';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      alert(`Zalogowano pomyślnie jako: ${email}`);
    } else {
      if (password.length < 8) {
        alert('Hasło musi mieć co najmniej 8 znaków!');
        return;
      }

      if (password !== confirmPassword) {
        alert('Hasła nie są takie same!');
        return;
      }

      alert(`Utworzono konto dla gracza: ${username}`);
    }
  };

  return (
    <>
      <div className="bg-glow green"></div>
      <div className="bg-glow red"></div>
      <div className="bg-glow gold"></div>

      <div className="login-card">

        <div className="logo-area">
          <div className="logo-badge">
            <h1>PoliPoly</h1>
          </div>
          <span className="logo-subtitle">Online Edition</span>
        </div>

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
                {showPassword ? 'Ukryj' : 'Pokaż'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>Powtórz hasło</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {isLogin && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                Zapamiętaj mnie
              </label>

              <a
                href="#forgot"
                className="forgot-link"
                onClick={(e) => e.preventDefault()}
              >
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
