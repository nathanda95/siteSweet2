import { useState } from 'react'

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

const ParagraphBlock = ({ paragraph }) => {
  const hasMedia = Object.prototype.hasOwnProperty.call(paragraph, 'image')
  const listRows = paragraph.list
    ? paragraph.list.map((item) => {
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
    : []
  const hasListHeader = listRows.some((row) => row.key)
  return (
    <div className={`paragraph-block ${hasMedia ? '' : 'full'}`}>
      <div className="paragraph-text">
        {paragraph.text && <p>{paragraph.text}</p>}
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
          {paragraph.image ? (
            <img src={paragraph.image} alt="Illustration de la section" />
          ) : (
            <Placeholder />
          )}
        </div>
      )}
    </div>
  )
}

const FormationPage = ({ formation }) => {
  const hasBanner = Object.prototype.hasOwnProperty.call(formation, 'banner')
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
          <span className="eyebrow">Programme BCSO</span>
          <h1>{formation.title}</h1>
          <p>{formation.subtitle}</p>
        </div>
      </div>

      <div className="formation-content">
        {formation.sections.map((section, idx) => (
          <section key={section.title} className="section">
            <div className="section-header">
              <span className="section-index">Section {idx + 1}</span>
              <h2>{section.title}</h2>
            </div>
            <div className="section-body">
              {section.paragraphs.map((paragraph, pIdx) => (
                <ParagraphBlock key={pIdx} paragraph={paragraph} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

export default FormationPage
