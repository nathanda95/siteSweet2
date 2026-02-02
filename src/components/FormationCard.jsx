import { Link } from 'react-router-dom'

const FormationCard = ({ formation }) => {
  return (
    <Link to={`/formation/${formation.id}`} className="formation-card">
      <div className={`card-media ${formation.banner ? '' : 'empty'}`}>
        {formation.banner ? (
          <img src={formation.banner} alt={formation.title} />
        ) : (
          <div className="media-placeholder">
            <span>Aperçu indisponible</span>
          </div>
        )}
        <span className="card-badge">Formation {formation.id.padStart(2, '0')}</span>
      </div>
      <div className="card-body">
        <h3>{formation.title}</h3>
        <p>{formation.subtitle}</p>
        <span className="card-link">Consulter →</span>
      </div>
    </Link>
  )
}

export default FormationCard
