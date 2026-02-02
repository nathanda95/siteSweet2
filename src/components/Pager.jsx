import { Link } from 'react-router-dom'

const Pager = ({ previous, next }) => (
  <div className="pager">
    <Link
      className={`pager-btn ${previous ? '' : 'disabled'}`}
      to={previous ? `/formation/${previous.id}` : '#'}
      aria-disabled={!previous}
      onClick={(e) => {
        if (!previous) e.preventDefault()
      }}
    >
      ← Formation précédente
    </Link>

    <Link className="pager-btn secondary" to="/">
      Retour au sommaire
    </Link>

    <Link
      className={`pager-btn ${next ? '' : 'disabled'}`}
      to={next ? `/formation/${next.id}` : '#'}
      aria-disabled={!next}
      onClick={(e) => {
        if (!next) e.preventDefault()
      }}
    >
      Formation suivante →
    </Link>
  </div>
)

export default Pager
