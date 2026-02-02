import { useEffect } from 'react'
import {
  Routes,
  Route,
  Outlet,
  useLocation,
  useParams,
  Navigate,
} from 'react-router-dom'
import './App.css'
import { formations, totalFormations } from './content/formations'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import FormationCard from './components/FormationCard'
import FormationPage from './components/FormationPage'
import Pager from './components/Pager'

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

const Layout = () => {
  const { pathname } = useLocation()
  const currentId = pathname.startsWith('/formation/')
    ? pathname.split('/')[2]
    : null
  const currentIndex = formations.findIndex((f) => f.id === currentId)

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header currentIndex={currentIndex} total={totalFormations} />
      <div className="app-body">
        <Sidebar formations={formations} currentId={currentId} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const Home = () => (
  <div className="home">
    <section className="hero">
      <div className="hero-topline">BCSO Training Division</div>
      <h1>Academy Manual</h1>
      <p className="hero-lead">
        Programmes immersifs pour forces de l’ordre : procédures, tactiques et
        excellence opérationnelle.
      </p>
    </section>
    <section className="grid-header">
      <div>
        <p className="eyebrow">Sommaire</p>
        <h2>Formations disponibles</h2>
      </div>
      <div className="stat">
        <span className="stat-number">{totalFormations}</span>
        <span className="stat-label">modules</span>
      </div>
    </section>
    <section className="card-grid">
      {formations.map((formation) => (
        <FormationCard key={formation.id} formation={formation} />
      ))}
    </section>
  </div>
)

const FormationDetail = () => {
  const { id } = useParams()
  const index = formations.findIndex((f) => f.id === id)
  const formation = formations[index]

  if (!formation) {
    return <Navigate to="/" replace />
  }

  const previous = index > 0 ? formations[index - 1] : null
  const next = index < formations.length - 1 ? formations[index + 1] : null

  return (
    <div className="formation-wrapper">
      <FormationPage formation={formation} />
      <Pager previous={previous} next={next} />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="formation/:id" element={<FormationDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
