import { Link, useNavigate } from 'react-router-dom'

const Header = ({ currentIndex, total }) => {
  const navigate = useNavigate()
  const inFormation = currentIndex >= 0
  const progress = inFormation ? Math.round(((currentIndex + 1) / total) * 100) : 0

  return (
    <header className="header">
      <div className="logo-block" onClick={() => navigate('/')}>
        <div className="shield">BCSO</div>
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
