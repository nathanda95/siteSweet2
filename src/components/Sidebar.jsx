import { NavLink } from 'react-router-dom'

const Sidebar = ({ formations, currentId }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p className="eyebrow">Sommaire</p>
        <h3>Formations</h3>
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
