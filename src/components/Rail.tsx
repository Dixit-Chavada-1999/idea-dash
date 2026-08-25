import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { NAV, PAGES } from '../data/console'
import { formatDay, useRun } from '../run/context'

type Props = {
  /** id of the section currently in view — only used on the dashboard route */
  active: string
  /** section anchors are hidden off the dashboard, where they would be dead links */
  showSections?: boolean
}

export function Rail({ active, showSections = true }: Props) {
  const { user } = useAuth()
  const run = useRun()
  const { pathname } = useLocation()

  return (
    <aside className="rail">
      <div className="brand">
        <div className="mark">
          <i />
          IDEA
        </div>
        <div className="who">Operations Console</div>
      </div>

      <nav className="nav">
        <div className="grp">Console</div>
        {PAGES.map((p) => (
          <Link key={p.to} to={p.to} className={pathname === p.to ? 'on' : undefined}>
            {p.label}
            {p.clause && <span className="cl">{p.clause}</span>}
          </Link>
        ))}

        {showSections &&
          NAV.map((g) => (
            <div key={g.group}>
              <div className="grp">{g.group}</div>
              {g.items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={item.href === `#${active}` ? 'on' : undefined}
                >
                  {item.label}
                  {item.clause && <span className="cl">{item.clause}</span>}
                </a>
              ))}
            </div>
          ))}
      </nav>

      <div className="rail-foot">
        {user && <span className="rail-user">{user.email}</span>}
        <b>
          <span className="pulse" />
          {run.status === 'ready' && run.data.latestData
            ? `Data to ${formatDay(run.data.latestData)}`
            : run.status === 'error'
              ? 'Data date unavailable'
              : 'Reading…'}
        </b>
        {/* no run history is stored, so the header reports this read, not a previous one */}
        {run.status === 'ready' && `Read ${new Date(run.data.generatedAt).toLocaleString('en-GB')}`}
        <br />
        {run.status === 'ready' && (
          <>
            <span className="num">{run.data.cleanRows.toLocaleString('en-GB')}</span> clean rows of{' '}
            {run.data.totalRows.toLocaleString('en-GB')}
          </>
        )}
      </div>
    </aside>
  )
}
