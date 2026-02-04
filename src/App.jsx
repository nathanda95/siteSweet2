import { useEffect, useRef, useState } from 'react'
import {
  Routes,
  Route,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  Navigate,
} from 'react-router-dom'
import './App.css'
import { formations } from './content/formations'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import FormationCard from './components/FormationCard'
import FormationPage from './components/FormationPage'
import Pager from './components/Pager'

const stripImages = (list) =>
  list.map((formation) => ({
    ...formation,
    banner: null,
    sections: Array.isArray(formation.sections)
      ? formation.sections.map((section) => ({
          ...section,
          paragraphs: Array.isArray(section.paragraphs)
            ? section.paragraphs.map((paragraph) => {
                const { image, ...rest } = paragraph ?? {}
                return rest
              })
            : [],
        }))
      : [],
  }))

const mergeParagraphs = (baseParagraphs = [], storedParagraphs = []) => {
  const merged = storedParagraphs.map((storedParagraph, idx) => {
    const baseParagraph = baseParagraphs[idx]
    if (!baseParagraph) {
      return storedParagraph
    }
    const next = { ...baseParagraph, ...storedParagraph }
    if (Object.prototype.hasOwnProperty.call(baseParagraph, 'image')) {
      next.image = baseParagraph.image
    } else {
      delete next.image
    }
    return next
  })

  if (baseParagraphs.length > merged.length) {
    merged.push(...baseParagraphs.slice(merged.length))
  }

  return merged
}

const mergeSections = (baseSections = [], storedSections = []) => {
  const merged = storedSections.map((storedSection, idx) => {
    const baseSection = baseSections[idx]
    if (!baseSection) {
      return storedSection
    }
    return {
      ...baseSection,
      ...storedSection,
      paragraphs: mergeParagraphs(baseSection.paragraphs ?? [], storedSection.paragraphs ?? []),
    }
  })

  if (baseSections.length > merged.length) {
    merged.push(...baseSections.slice(merged.length))
  }

  return merged
}

const mergeFormation = (baseFormation, storedFormation) => {
  const merged = { ...baseFormation, ...storedFormation }
  if (Object.prototype.hasOwnProperty.call(baseFormation, 'banner')) {
    merged.banner = baseFormation.banner
  } else {
    delete merged.banner
  }
  merged.sections = mergeSections(baseFormation.sections ?? [], storedFormation.sections ?? [])
  return merged
}

const mergeFormations = (base, stored) => {
  const storedClean = stripImages(Array.isArray(stored) ? stored : [])
  const storedById = new Map(storedClean.map((formation) => [formation.id, formation]))
  const baseIds = new Set(base.map((formation) => formation.id))
  const merged = base.map((baseFormation) => {
    const storedFormation = storedById.get(baseFormation.id)
    if (!storedFormation) {
      return baseFormation
    }
    return mergeFormation(baseFormation, storedFormation)
  })

  storedClean.forEach((storedFormation) => {
    if (!baseIds.has(storedFormation.id)) {
      merged.push(storedFormation)
    }
  })

  return merged
}

const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}

const Layout = ({
  formations,
  onAddFormation,
  canEdit,
  isAuthed,
  onLogin,
  onLogout,
}) => {
  const { pathname } = useLocation()
  const currentId = pathname.startsWith('/formation/')
    ? pathname.split('/')[2]
    : null
  const currentIndex = formations.findIndex((f) => f.id === currentId)

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header
        currentIndex={currentIndex}
        total={formations.length}
        isAuthed={isAuthed}
        onLogin={onLogin}
        onLogout={onLogout}
      />
      <div className="app-body">
        <Sidebar
          formations={formations}
          currentId={currentId}
          onAddFormation={onAddFormation}
          canEdit={canEdit}
        />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const Home = ({ formations, onAddFormation, canEdit }) => {
  const navigate = useNavigate()
  const handleAddFormation = () => {
    if (!onAddFormation) {
      return
    }
    const newId = onAddFormation()
    if (newId) {
      navigate(`/formation/${newId}`)
    }
  }

  return (
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
        <div className="grid-actions">
          {canEdit && (
            <button type="button" className="action-btn add-btn" onClick={handleAddFormation}>
              + Ajouter une formation
            </button>
          )}
          <div className="stat">
            <span className="stat-number">{formations.length}</span>
            <span className="stat-label">modules</span>
          </div>
        </div>
      </section>
      <section className="card-grid">
        {formations.map((formation) => (
          <FormationCard key={formation.id} formation={formation} />
        ))}
      </section>
    </div>
  )
}

const FormationDetail = ({
  formations,
  onUpdateFormation,
  onDeleteFormation,
  canEdit,
}) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const index = formations.findIndex((f) => f.id === id)
  const formation = formations[index]

  if (!formation) {
    return <Navigate to="/" replace />
  }

  const previous = index > 0 ? formations[index - 1] : null
  const next = index < formations.length - 1 ? formations[index + 1] : null
  const handleUpdate = (updater) => onUpdateFormation(formation.id, updater)
  const handleDelete = () => {
    if (!onDeleteFormation) {
      return
    }
    onDeleteFormation(formation.id)
    navigate('/')
  }

  return (
    <div className="formation-wrapper">
      <FormationPage
        formation={formation}
        onUpdateFormation={handleUpdate}
        onDeleteFormation={handleDelete}
        canEdit={canEdit}
      />
      <Pager previous={previous} next={next} />
    </div>
  )
}

function App() {
  const [formationList, setFormationList] = useState(formations)
  const formationRef = useRef(formationList)
  const [authToken, setAuthToken] = useState(
    () => window.localStorage.getItem('bcsoAuthToken') || ''
  )
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    formationRef.current = formationList
  }, [formationList])

  useEffect(() => {
    let mounted = true
    const loadFormations = async () => {
      try {
        const response = await fetch('/api/formations')
        if (!response.ok) {
          return
        }
        const data = await response.json()
        if (!mounted) {
          return
        }
        if (Array.isArray(data) && data.length > 0) {
          setFormationList(mergeFormations(formations, data))
        }
      } catch (error) {
        // Ignore API errors and fallback to bundled content.
      }
    }

    loadFormations()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!authToken) {
      setIsAuthed(false)
      return
    }

    let active = true
    const verifySession = async () => {
      try {
        const response = await fetch('/api/session', {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        if (!active) {
          return
        }
        if (response.ok) {
          setIsAuthed(true)
          return
        }
      } catch (error) {
        if (!active) {
          return
        }
      }
      setIsAuthed(false)
      setAuthToken('')
      window.localStorage.removeItem('bcsoAuthToken')
    }

    verifySession()
    return () => {
      active = false
    }
  }, [authToken])

  const persistFormations = async (nextFormations) => {
    if (!authToken) {
      return
    }
    try {
      const response = await fetch('/api/formations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(stripImages(nextFormations)),
      })
      if (response.status === 401) {
        setIsAuthed(false)
        setAuthToken('')
        window.localStorage.removeItem('bcsoAuthToken')
      }
    } catch (error) {
      // Ignore network errors for now.
    }
  }

  const handleAddFormation = () => {
    if (!isAuthed) {
      return null
    }
    const currentList = formationRef.current
    const maxId = currentList.reduce((max, formation) => {
      const value = Number.parseInt(formation.id, 10)
      if (Number.isNaN(value)) {
        return max
      }
      return Math.max(max, value)
    }, 0)
    const nextId = String(maxId + 1)
    const newFormation = {
      id: nextId,
      title: `Nouvelle formation ${nextId}`,
      subtitle: 'Sous-titre à définir',
      banner: null,
      sections: [
        {
          title: 'Nouvelle section',
          paragraphs: [{ text: 'Nouveau paragraphe.' }],
        },
      ],
    }
    const nextList = [...currentList, newFormation]
    setFormationList(nextList)
    persistFormations(nextList)
    return nextId
  }

  const handleUpdateFormation = (id, updater) => {
    if (!isAuthed) {
      return
    }
    setFormationList((current) => {
      const next = current.map((formation) => {
        if (formation.id !== id) {
          return formation
        }
        return typeof updater === 'function' ? updater(formation) : updater
      })
      persistFormations(next)
      return next
    })
  }

  const handleDeleteFormation = (id) => {
    if (!isAuthed) {
      return
    }
    setFormationList((current) => {
      const next = current.filter((formation) => formation.id !== id)
      persistFormations(next)
      return next
    })
  }

  const handleLogin = async (password) => {
    if (!password) {
      return false
    }
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!response.ok) {
        return false
      }
      const data = await response.json()
      if (!data?.token) {
        return false
      }
      setAuthToken(data.token)
      setIsAuthed(true)
      window.localStorage.setItem('bcsoAuthToken', data.token)
      return true
    } catch (error) {
      return false
    }
  }

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        })
      } catch (error) {
        // Ignore logout errors.
      }
    }
    setIsAuthed(false)
    setAuthToken('')
    window.localStorage.removeItem('bcsoAuthToken')
  }

  return (
    <Routes>
      <Route
        element={
          <Layout
            formations={formationList}
            onAddFormation={handleAddFormation}
            canEdit={isAuthed}
            isAuthed={isAuthed}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        }
      >
        <Route
          index
          element={
            <Home
              formations={formationList}
              onAddFormation={handleAddFormation}
              canEdit={isAuthed}
            />
          }
        />
        <Route
          path="formation/:id"
          element={
            <FormationDetail
              formations={formationList}
              onUpdateFormation={handleUpdateFormation}
              onDeleteFormation={handleDeleteFormation}
              canEdit={isAuthed}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
