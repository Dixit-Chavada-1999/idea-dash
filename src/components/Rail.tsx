import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { NAV, PAGES, RUN } from '../data/console'

type Props = {
  /** id of the section currently in view — only used on the dashboard route */
  active: string
  /** section anchors are hidden off the dashboard, where they would be dead links */
  showSections?: boolean
}

export function Rail({ active, showSections = true }: Props) {
  const { session } = useAuth()
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
        {session && <span className="rail-user">{session.email}</span>}
        <b>
          <span className="pulse" />
          Run {RUN.current}
        </b>
        Previous {RUN.previous}
        <br />
        <span className="num">{RUN.cleanRows}</span> clean rows
      </div>
    </aside>
  )
}
