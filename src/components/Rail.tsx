import { useAuth } from '../auth/context'
import { NAV, RUN } from '../data/console'

export function Rail({ active }: { active: string }) {
  const { session } = useAuth()

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
        {NAV.map((g) => (
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
