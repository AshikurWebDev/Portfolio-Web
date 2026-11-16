import './figures.css'

/** Fig: the tenant comes from the token and filters every query. Rows are sample data. */
const rows = [
  { id: 'S-1047', name: 'Class 9 · Roll 1047', tenant: 'A' },
  { id: 'S-2210', name: 'Class 7 · Roll 2210', tenant: 'B' },
  { id: 'S-1052', name: 'Class 9 · Roll 1052', tenant: 'A' },
  { id: 'S-3301', name: 'HSC 1 · Roll 3301', tenant: 'C' },
]

export default function TenantRequest() {
  return (
    <div className="tr">
      <div className="fig-flow fig-flow--h tr__flow">
        <div className="fig-node">
          <span className="fig-node__code">REQUEST</span>
          <span className="fig-node__name">GET /api/students</span>
          <span className="fig-node__note">
            Token claim <code>tenant_id = A</code>
          </span>
        </div>
        <span className="fig-link" aria-hidden="true" />
        <div className="fig-node">
          <span className="fig-node__code">API</span>
          <span className="fig-node__name">ITenantContext</span>
          <span className="fig-node__note">Reads the claim once per request</span>
        </div>
        <span className="fig-link" aria-hidden="true" />
        <div className="fig-node fig-node--accent">
          <span className="fig-node__code">DATA</span>
          <span className="fig-node__name">ErpDbContext</span>
          <span className="fig-node__note">
            Adds <code>WHERE tenant_id = A</code>
          </span>
        </div>
        <span className="fig-link" aria-hidden="true" />
        <div className="fig-node">
          <span className="fig-node__code">RESULT</span>
          <span className="fig-node__name">Tenant A rows only</span>
          <span className="fig-node__note">B and C never leave the database</span>
        </div>
      </div>

      <table className="fig-table tr__table">
        <caption className="sr-only">Sample students table: only tenant A rows are returned</caption>
        <thead>
          <tr>
            <th scope="col">Row</th>
            <th scope="col">Student</th>
            <th scope="col">Tenant</th>
            <th scope="col">Returned</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={r.tenant === 'A' ? 'is-in' : 'is-out'}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.tenant}</td>
              <td>{r.tenant === 'A' ? 'Yes' : 'Filtered out'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .tr { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; width: 100%; }
        .tr__table tr.is-out td { color: rgba(244,245,242,0.55); }
        .tr__table tr.is-in td:last-child { color: var(--mint); }
      `}</style>
    </div>
  )
}
