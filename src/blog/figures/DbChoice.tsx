import './figures.css'

/** Fig: the same questions answered for the two real systems. */
const rows = [
  { q: 'Where it runs', erp: 'One organization’s ERP', saas: 'Many organizations, hosted in the cloud' },
  { q: 'Shape of the data', erp: 'Relational records: students, fees, exams', saas: 'Relational records plus land parcels on a map' },
  { q: 'Deciding need', erp: 'Strict relations and reports', saas: 'Spatial queries (PostGIS), no licence per tenant' },
  { q: 'Engine', erp: 'SQL Server', saas: 'PostgreSQL + PostGIS', engine: true },
]

export default function DbChoice() {
  return (
    <div className="dbc">
      <table className="fig-table dbc__table">
        <caption className="sr-only">Database choice for two systems</caption>
        <thead>
          <tr>
            <th scope="col">Question</th>
            <th scope="col">Coaching Center ERP</th>
            <th scope="col">Land Syndicate SaaS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.q} className={r.engine ? 'is-engine' : undefined}>
              <th scope="row">{r.q}</th>
              {/* data-label shows the system name when the table stacks on phones */}
              <td data-label="Coaching Center ERP">{r.erp}</td>
              <td data-label="Land Syndicate SaaS">{r.saas}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .dbc { width: 100%; }
        .dbc__table { font-size: 0.9rem; }
        .dbc__table tbody th { font-weight: 400; color: rgba(244,245,242,0.6); width: 26%; text-transform: none; letter-spacing: 0; font-size: 0.82rem; }
        .dbc__table td { padding: 12px 10px; }
        .dbc__table tr.is-engine td { font-size: 1.15rem; font-weight: 500; color: var(--on-dark); letter-spacing: -0.01em; border-bottom: 0; }
        .dbc__table tr.is-engine th { border-bottom: 0; }
        /* Phones (kept last so it overrides the rules above): each question becomes a small block with both answers labelled, so no column is hidden */
        @media (max-width: 560px) {
          .dbc__table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
          .dbc__table, .dbc__table tbody, .dbc__table tr, .dbc__table th, .dbc__table td { display: block; width: auto; }
          .dbc__table tr { padding: 10px 0; border-bottom: 1px solid rgba(244,245,242,0.1); }
          .dbc__table tr.is-engine { border-bottom: 0; }
          .dbc__table tbody th, .dbc__table td { border-bottom: 0; padding: 4px 0; }
          .dbc__table tbody th { width: auto; }
          .dbc__table td::before { content: attr(data-label); display: block; font-size: 0.72rem; font-weight: 500; color: rgba(244,245,242,0.5); margin-bottom: 2px; }
        }
      `}</style>
    </div>
  )
}
