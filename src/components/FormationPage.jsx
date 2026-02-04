import { useEffect, useId, useState } from 'react'

const Placeholder = () => (
  <div className="placeholder">
    <div className="placeholder-icon">✕</div>
    <p>Image non fournie</p>
  </div>
)

const TabsBlock = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeTab = tabs[activeIndex]

  return (
    <div className="tabbed-table">
      <div className="tab-headers">
        {tabs.map((tab, index) => (
          <button
            key={tab.title}
            type="button"
            className={`tab-btn ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="tab-panel">
        {activeTab.text && <p>{activeTab.text}</p>}
        {activeTab.list && (
          <ul className="tab-list">
            {activeTab.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const ParagraphBlock = ({ paragraph, onUpdate, onDelete, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draftText, setDraftText] = useState(paragraph.text ?? '')
  const [draftImage, setDraftImage] = useState(
    Object.prototype.hasOwnProperty.call(paragraph, 'image') ? paragraph.image : null
  )
  const [draftListRows, setDraftListRows] = useState([])
  const [draftTable, setDraftTable] = useState({ headers: [], rows: [] })
  const [showListEditor, setShowListEditor] = useState(Boolean(paragraph.list))
  const [showTableEditor, setShowTableEditor] = useState(Boolean(paragraph.table))
  const [listDeleted, setListDeleted] = useState(false)
  const [tableDeleted, setTableDeleted] = useState(false)
  const fileInputId = useId()

  const normalizeList = (list = []) =>
    list.map((item) => {
      if (typeof item === 'string') {
        const splitIndex = item.indexOf(':')
        if (splitIndex !== -1) {
          return {
            key: item.slice(0, splitIndex).trim(),
            value: item.slice(splitIndex + 1).trim(),
          }
        }
        return { key: '', value: item }
      }
      if (item && typeof item === 'object') {
        if (item.code && item.label) {
          return { key: item.code, value: item.label }
        }
      }
      return { key: '', value: String(item) }
    })

  useEffect(() => {
    if (!isEditing) {
      setDraftText(paragraph.text ?? '')
      setDraftImage(
        Object.prototype.hasOwnProperty.call(paragraph, 'image')
          ? paragraph.image
          : null
      )
      setDraftListRows(paragraph.list ? normalizeList(paragraph.list) : [])
      setDraftTable(() => {
        if (!paragraph.table) {
          return { headers: [], rows: [] }
        }
        const headers = Array.isArray(paragraph.table.headers)
          ? paragraph.table.headers
          : []
        const rows = Array.isArray(paragraph.table.rows) ? paragraph.table.rows : []
        return {
          headers,
          rows: rows.map((row) =>
            Array.from({ length: headers.length }, (_, idx) =>
              Array.isArray(row) ? row[idx] ?? '' : ''
            )
          ),
        }
      })
      setShowListEditor(Boolean(paragraph.list))
      setShowTableEditor(Boolean(paragraph.table))
      setListDeleted(false)
      setTableDeleted(false)
    }
  }, [paragraph, isEditing])

  useEffect(() => {
    if (!canEdit && isEditing) {
      setIsEditing(false)
    }
  }, [canEdit, isEditing])

  const handleImageChange = (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraftImage(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!onUpdate || !canEdit) {
      setIsEditing(false)
      return
    }

    const nextParagraph = { ...paragraph }
    const trimmedText = draftText.trim()
    if (trimmedText) {
      nextParagraph.text = trimmedText
    } else {
      delete nextParagraph.text
    }
    if (draftImage !== null) {
      nextParagraph.image = draftImage
    } else if (Object.prototype.hasOwnProperty.call(nextParagraph, 'image')) {
      nextParagraph.image = null
    }
    if (showListEditor) {
      const cleanedRows = draftListRows
        .map((row) => ({
          key: (row.key ?? '').trim(),
          value: (row.value ?? '').trim(),
        }))
        .filter((row) => row.key || row.value)
      if (cleanedRows.length === 0) {
        delete nextParagraph.list
      } else {
        nextParagraph.list = cleanedRows.map((row) =>
          row.key ? { code: row.key, label: row.value } : row.value
        )
      }
    } else if (listDeleted) {
      delete nextParagraph.list
    }
    if (showTableEditor) {
      const headers = (draftTable.headers ?? []).map((header) =>
        typeof header === 'string' ? header.trim() : String(header ?? '').trim()
      )
      const columnCount = headers.length
      const rows = (draftTable.rows ?? []).map((row) => {
        const nextRow = Array.isArray(row) ? row : []
        return Array.from({ length: columnCount }, (_, idx) =>
          typeof nextRow[idx] === 'string'
            ? nextRow[idx].trim()
            : String(nextRow[idx] ?? '').trim()
        )
      })
      if (columnCount === 0 && rows.length === 0) {
        delete nextParagraph.table
      } else {
        nextParagraph.table = { headers, rows }
      }
    } else if (tableDeleted) {
      delete nextParagraph.table
    }
    onUpdate(nextParagraph)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraftText(paragraph.text ?? '')
    setDraftImage(
      Object.prototype.hasOwnProperty.call(paragraph, 'image') ? paragraph.image : null
    )
    setDraftListRows(paragraph.list ? normalizeList(paragraph.list) : [])
    setDraftTable(() => {
      if (!paragraph.table) {
        return { headers: [], rows: [] }
      }
      const headers = Array.isArray(paragraph.table.headers)
        ? paragraph.table.headers
        : []
      const rows = Array.isArray(paragraph.table.rows) ? paragraph.table.rows : []
      return {
        headers,
        rows: rows.map((row) =>
          Array.from({ length: headers.length }, (_, idx) =>
            Array.isArray(row) ? row[idx] ?? '' : ''
          )
        ),
      }
    })
    setShowListEditor(Boolean(paragraph.list))
    setShowTableEditor(Boolean(paragraph.table))
    setListDeleted(false)
    setTableDeleted(false)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!onDelete || !canEdit) {
      return
    }
    onDelete()
    setIsEditing(false)
  }

  const hasMedia =
    Object.prototype.hasOwnProperty.call(paragraph, 'image') || Boolean(draftImage)
  const effectiveImage = isEditing ? draftImage : paragraph.image
  const listRows = paragraph.list ? normalizeList(paragraph.list) : []
  const hasListHeader = listRows.some((row) => row.key)
  return (
    <div className={`paragraph-block ${hasMedia ? '' : 'full'}`}>
      <div className="paragraph-text">
        {canEdit && (
          <div className="paragraph-header">
            <button
              type="button"
              className="action-btn icon edit-btn"
              onClick={() => setIsEditing(true)}
              aria-label="Modifier ce paragraphe"
            >
              ✎
            </button>
          </div>
        )}
        {isEditing ? (
          <div className="paragraph-editor">
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              placeholder="Saisir le contenu du paragraphe..."
            />
            <div className="visual-editor">
              <div className="visual-header">
                <span>Données visuelles</span>
                <div className="visual-actions">
                  {!showListEditor && (
                    <button
                      type="button"
                      className="action-btn ghost"
                      onClick={() => {
                        setShowListEditor(true)
                        setDraftListRows([{ key: '', value: '' }])
                        setListDeleted(false)
                      }}
                    >
                      + Liste
                    </button>
                  )}
                  {!showTableEditor && (
                    <button
                      type="button"
                      className="action-btn ghost"
                      onClick={() => {
                        setShowTableEditor(true)
                        setDraftTable({ headers: [''], rows: [['']] })
                        setTableDeleted(false)
                      }}
                    >
                      + Tableau
                    </button>
                  )}
                </div>
              </div>
              {showListEditor && (
                <div className="visual-block">
                  <div className="visual-title">
                    <span>Liste</span>
                    <div className="visual-inline-actions">
                      <button
                        type="button"
                        className="action-btn ghost"
                        onClick={() =>
                          setDraftListRows((current) => [
                            ...current,
                            { key: '', value: '' },
                          ])
                        }
                      >
                        + Ajouter une ligne
                      </button>
                      <button
                        type="button"
                        className="action-btn danger ghost"
                        onClick={() => {
                          setDraftListRows([])
                          setShowListEditor(false)
                          setListDeleted(true)
                        }}
                      >
                        Supprimer la liste
                      </button>
                    </div>
                  </div>
                  <div className="list-editor">
                    <div className="list-editor-header">
                      <span>Clé</span>
                      <span>Valeur</span>
                      <span aria-hidden="true" />
                    </div>
                    {draftListRows.map((row, idx) => (
                      <div className="list-row" key={`${row.key}-${idx}`}>
                        <input
                          type="text"
                          value={row.key}
                          onChange={(event) => {
                            const value = event.target.value
                            setDraftListRows((current) =>
                              current.map((item, index) =>
                                index === idx ? { ...item, key: value } : item
                              )
                            )
                          }}
                          placeholder="Code / clé (optionnel)"
                        />
                        <input
                          type="text"
                          value={row.value}
                          onChange={(event) => {
                            const value = event.target.value
                            setDraftListRows((current) =>
                              current.map((item, index) =>
                                index === idx ? { ...item, value } : item
                              )
                            )
                          }}
                          placeholder="Texte"
                        />
                        <button
                          type="button"
                          className="action-btn icon danger"
                          onClick={() =>
                            setDraftListRows((current) =>
                              current.filter((_, index) => index !== idx)
                            )
                          }
                          aria-label="Supprimer la ligne"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {draftListRows.length === 0 && (
                      <button
                        type="button"
                        className="action-btn ghost"
                        onClick={() => setDraftListRows([{ key: '', value: '' }])}
                      >
                        + Ajouter une ligne
                      </button>
                    )}
                  </div>
                </div>
              )}
              {showTableEditor && (
                <div className="visual-block">
                  <div className="visual-title">
                    <span>Tableau</span>
                    <div className="visual-inline-actions">
                      <button
                        type="button"
                        className="action-btn ghost"
                        onClick={() =>
                          setDraftTable((current) => {
                            const headers = [...current.headers, '']
                            const rows = current.rows.map((row) => [...row, ''])
                            return { headers, rows }
                          })
                        }
                      >
                        + Colonne
                      </button>
                      <button
                        type="button"
                        className="action-btn ghost"
                        onClick={() =>
                          setDraftTable((current) => ({
                            headers: current.headers,
                            rows: [...current.rows, current.headers.map(() => '')],
                          }))
                        }
                      >
                        + Ligne
                      </button>
                      <button
                        type="button"
                        className="action-btn ghost"
                        onClick={() =>
                          setDraftTable((current) => {
                            if (current.headers.length === 0) {
                              return current
                            }
                            const headers = current.headers.slice(0, -1)
                            const rows = current.rows.map((row) => row.slice(0, -1))
                            return { headers, rows }
                          })
                        }
                      >
                        − Colonne
                      </button>
                      <button
                        type="button"
                        className="action-btn ghost"
                        onClick={() =>
                          setDraftTable((current) => ({
                            headers: current.headers,
                            rows: current.rows.slice(0, -1),
                          }))
                        }
                      >
                        − Ligne
                      </button>
                      <button
                        type="button"
                        className="action-btn danger ghost"
                        onClick={() => {
                          setDraftTable({ headers: [], rows: [] })
                          setShowTableEditor(false)
                          setTableDeleted(true)
                        }}
                      >
                        Supprimer le tableau
                      </button>
                    </div>
                  </div>
                  <div className="table-editor">
                    <div className="table-grid header">
                      {draftTable.headers.map((header, idx) => (
                        <input
                          key={`header-${idx}`}
                          type="text"
                          value={header}
                          onChange={(event) => {
                            const value = event.target.value
                            setDraftTable((current) => ({
                              headers: current.headers.map((item, index) =>
                                index === idx ? value : item
                              ),
                              rows: current.rows,
                            }))
                          }}
                          placeholder={`Colonne ${idx + 1}`}
                        />
                      ))}
                      {draftTable.headers.length === 0 && (
                        <span className="table-empty">Ajoutez une colonne.</span>
                      )}
                    </div>
                    {draftTable.rows.map((row, rowIdx) => (
                      <div className="table-grid" key={`row-${rowIdx}`}>
                        {draftTable.headers.map((_, colIdx) => (
                          <input
                            key={`cell-${rowIdx}-${colIdx}`}
                            type="text"
                            value={row[colIdx] ?? ''}
                            onChange={(event) => {
                              const value = event.target.value
                            setDraftTable((current) => ({
                              headers: current.headers,
                              rows: current.rows.map((r, rIdx) => {
                                if (rIdx !== rowIdx) {
                                  return r
                                }
                                const baseRow = Array.from(
                                  { length: current.headers.length },
                                  (_, idx) => (Array.isArray(r) ? r[idx] ?? '' : '')
                                )
                                baseRow[colIdx] = value
                                return baseRow
                              }),
                            }))
                          }}
                          placeholder={`L${rowIdx + 1}C${colIdx + 1}`}
                        />
                      ))}
                      </div>
                    ))}
                    {draftTable.headers.length > 0 && draftTable.rows.length === 0 && (
                      <button
                        type="button"
                        className="action-btn ghost"
                        onClick={() =>
                          setDraftTable((current) => ({
                            headers: current.headers,
                            rows: [current.headers.map(() => '')],
                          }))
                        }
                      >
                        + Ajouter une ligne
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="editor-actions">
              <label className="action-btn file-btn" htmlFor={fileInputId}>
                + Ajouter une image
              </label>
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <div className="editor-buttons">
                <button
                  type="button"
                  className="action-btn danger"
                  onClick={handleDelete}
                >
                  Supprimer
                </button>
                <button type="button" className="action-btn ghost" onClick={handleCancel}>
                  Annuler
                </button>
                <button type="button" className="action-btn primary" onClick={handleSave}>
                  Enregistrer
                </button>
              </div>
            </div>
            {draftImage && (
              <div className="image-preview">
                <img src={draftImage} alt="Aperçu de l'image sélectionnée" />
              </div>
            )}
          </div>
        ) : (
          paragraph.text && <p>{paragraph.text}</p>
        )}
        {paragraph.tabs && <TabsBlock tabs={paragraph.tabs} />}
        {paragraph.list && (
          <div className="table-wrap">
            <table className="info-table list-table">
              {hasListHeader && (
                <thead>
                  <tr>
                    <th>Élément</th>
                    <th>Détail</th>
                  </tr>
                </thead>
              )}
              <tbody>
                {listRows.map((row, idx) => (
                  <tr key={`${row.key}-${idx}`}>
                    {hasListHeader ? (
                      <>
                        <td className="table-key">
                          {row.key ? <span className="table-pill">{row.key}</span> : '—'}
                        </td>
                        <td>{row.value}</td>
                      </>
                    ) : (
                      <td colSpan={2}>{row.value}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {paragraph.table && (
          <div className="table-wrap">
            <table className="info-table">
              <thead>
                <tr>
                  {paragraph.table.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paragraph.table.rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {hasMedia && (
        <div className="paragraph-media">
          {effectiveImage ? (
            <img src={effectiveImage} alt="Illustration de la section" />
          ) : (
            <Placeholder />
          )}
        </div>
      )}
    </div>
  )
}

const FormationPage = ({ formation, onUpdateFormation, onDeleteFormation, canEdit }) => {
  const hasBanner = Object.prototype.hasOwnProperty.call(formation, 'banner')
  const [isEditingMeta, setIsEditingMeta] = useState(false)
  const [draftTitle, setDraftTitle] = useState(formation.title ?? '')
  const [draftSubtitle, setDraftSubtitle] = useState(formation.subtitle ?? '')

  useEffect(() => {
    if (!isEditingMeta) {
      setDraftTitle(formation.title ?? '')
      setDraftSubtitle(formation.subtitle ?? '')
    }
  }, [formation, isEditingMeta])

  useEffect(() => {
    if (!canEdit && isEditingMeta) {
      setIsEditingMeta(false)
    }
  }, [canEdit, isEditingMeta])

  const handleAddParagraph = (sectionIndex) => {
    if (!onUpdateFormation || !canEdit) {
      return
    }
    onUpdateFormation((current) => ({
      ...current,
      sections: current.sections.map((section, idx) => {
        if (idx !== sectionIndex) {
          return section
        }
        return {
          ...section,
          paragraphs: [...section.paragraphs, { text: 'Nouveau paragraphe.' }],
        }
      }),
    }))
  }

  const handleParagraphUpdate = (sectionIndex, paragraphIndex, nextParagraph) => {
    if (!onUpdateFormation || !canEdit) {
      return
    }
    onUpdateFormation((current) => ({
      ...current,
      sections: current.sections.map((section, idx) => {
        if (idx !== sectionIndex) {
          return section
        }
        return {
          ...section,
          paragraphs: section.paragraphs.map((paragraph, pIdx) =>
            pIdx === paragraphIndex ? nextParagraph : paragraph
          ),
        }
      }),
    }))
  }

  const handleParagraphDelete = (sectionIndex, paragraphIndex) => {
    if (!onUpdateFormation || !canEdit) {
      return
    }
    onUpdateFormation((current) => ({
      ...current,
      sections: current.sections.map((section, idx) => {
        if (idx !== sectionIndex) {
          return section
        }
        return {
          ...section,
          paragraphs: section.paragraphs.filter((_, pIdx) => pIdx !== paragraphIndex),
        }
      }),
    }))
  }

  const handleSaveMeta = () => {
    if (!onUpdateFormation || !canEdit) {
      setIsEditingMeta(false)
      return
    }
    const nextTitle = draftTitle.trim() || formation.title
    const nextSubtitle = draftSubtitle.trim() || ''
    onUpdateFormation((current) => ({
      ...current,
      title: nextTitle,
      subtitle: nextSubtitle,
    }))
    setIsEditingMeta(false)
  }

  const handleCancelMeta = () => {
    setDraftTitle(formation.title ?? '')
    setDraftSubtitle(formation.subtitle ?? '')
    setIsEditingMeta(false)
  }

  return (
    <article className="formation-page">
      <div className={`banner ${hasBanner ? (formation.banner ? '' : 'empty') : 'plain'}`}>
        {hasBanner &&
          (formation.banner ? (
            <img src={formation.banner} alt={formation.title} />
          ) : (
            <div className="banner-placeholder">Visuel indisponible</div>
          ))}
        <div className={`banner-overlay ${hasBanner ? '' : 'plain'}`}>
          {canEdit && (
            <div className="banner-actions">
              <button
                type="button"
                className="action-btn icon edit-btn"
                onClick={() => setIsEditingMeta(true)}
                aria-label="Modifier la formation"
              >
                ✎
              </button>
              <button
                type="button"
                className="action-btn danger"
                onClick={onDeleteFormation}
              >
                Supprimer la formation
              </button>
            </div>
          )}
          <span className="eyebrow">Programme BCSO</span>
          {isEditingMeta ? (
            <div className="meta-editor">
              <input
                type="text"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder="Titre de la formation"
              />
              <textarea
                value={draftSubtitle}
                onChange={(event) => setDraftSubtitle(event.target.value)}
                placeholder="Sous-titre de la formation"
              />
              <div className="meta-actions">
                <button type="button" className="action-btn ghost" onClick={handleCancelMeta}>
                  Annuler
                </button>
                <button type="button" className="action-btn primary" onClick={handleSaveMeta}>
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1>{formation.title}</h1>
              <p>{formation.subtitle}</p>
            </>
          )}
        </div>
      </div>

      <div className="formation-content">
        {formation.sections.map((section, idx) => (
          <section key={section.title} className="section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-index">Section {idx + 1}</span>
                <h2>{section.title}</h2>
              </div>
              <div className="section-actions">
                {canEdit && (
                  <button
                    type="button"
                    className="action-btn add-btn"
                    onClick={() => handleAddParagraph(idx)}
                  >
                    + Ajouter un paragraphe
                  </button>
                )}
              </div>
            </div>
            <div className="section-body">
              {section.paragraphs.map((paragraph, pIdx) => (
                <ParagraphBlock
                  key={pIdx}
                  paragraph={paragraph}
                  onUpdate={(nextParagraph) =>
                    handleParagraphUpdate(idx, pIdx, nextParagraph)
                  }
                  onDelete={() => handleParagraphDelete(idx, pIdx)}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

export default FormationPage
