import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.webp'

const Header = ({ currentIndex, total, isAuthed, onLogin, onLogout }) => {
  const navigate = useNavigate()
  const inFormation = currentIndex >= 0
  const progress = inFormation ? Math.round(((currentIndex + 1) / total) * 100) : 0
  const [showLogin, setShowLogin] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!onLogin) {
      return
    }
    setError('')
    const success = await onLogin(password)
    if (!success) {
      setError('Mot de passe incorrect')
      return
    }
    setPassword('')
    setShowLogin(false)
  }

  const handleLogout = async () => {
    if (!onLogout) {
      return
    }
    await onLogout()
    setPassword('')
    setError('')
    setShowLogin(false)
  }

  return (
    <header className="header">
      <div className="logo-block" onClick={() => navigate('/')}>
        <img className="logo-img" src={logo} alt="Logo BCSO" />
        <div>
          <p className="logo-kicker">Academy</p>
          <p className="logo-title">Training Manual</p>
        </div>
      </div>

      <div className="search-block">
        <div className="search-input">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Rechercher une procédure (non actif)"
            disabled
          />
        </div>
        <Link className="summary-btn" to="/">
          Sommaire
        </Link>
        <div className="auth-block">
          {isAuthed ? (
            <>
              <span className="auth-badge">Édition active</span>
              <button type="button" className="action-btn ghost" onClick={handleLogout}>
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              {showLogin ? (
                <form className="auth-form" onSubmit={handleSubmit}>
                  <input
                    type="password"
                    className="auth-input"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mot de passe"
                  />
                  <button type="submit" className="action-btn primary">
                    Valider
                  </button>
                  <button
                    type="button"
                    className="action-btn ghost"
                    onClick={() => {
                      setShowLogin(false)
                      setPassword('')
                      setError('')
                    }}
                  >
                    Annuler
                  </button>
                  {error && <span className="auth-error">{error}</span>}
                </form>
              ) : (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Se connecter
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="progress-block">
        <div className="progress-label">
          {inFormation ? (
            <>
              Formation {currentIndex + 1} / {total}
            </>
          ) : (
            'Sélectionnez une formation'
          )}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${inFormation ? progress : 0}%` }}
          />
        </div>
      </div>
    </header>
  )
}

export default Header
