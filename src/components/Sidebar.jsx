import { NavLink, useNavigate } from 'react-router-dom'

const Sidebar = ({ formations, currentId, onAddFormation, canEdit }) => {
  const navigate = useNavigate()
  const handleAddFormation = () => {
    if (!onAddFormation || !canEdit) {
      return
    }
    const newId = onAddFormation()
    if (newId) {
      navigate(`/formation/${newId}`)
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">Sommaire</p>
          <h3>Formations</h3>
        </div>
        {canEdit && (
          <button
            type="button"
            className="action-btn icon add-btn"
            onClick={handleAddFormation}
            aria-label="Ajouter une formation"
          >
            +
          </button>
        )}
      </div>
      <div className="sidebar-list">
        {formations.map((formation) => {
          const active = currentId === formation.id
          return (
            <NavLink
              key={formation.id}
              to={`/formation/${formation.id}`}
              className={`sidebar-item ${active ? 'active' : ''}`}
            >
              <span className="item-id">#{formation.id.padStart(2, '0')}</span>
              <div>
                <p className="item-title">{formation.title}</p>
                <p className="item-subtitle">{formation.subtitle}</p>
              </div>
            </NavLink>
          )
        })}
      </div>
    </aside>
  )
}

export default Sidebar
