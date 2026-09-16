import { useBasis } from '../basis/context'
import { AlertBar, CommandBar } from '../components/CommandBar'
import { Rail } from '../components/Rail'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { Headline } from '../sections/Headline'
import { Integrity } from '../sections/Integrity'
import { Movements } from '../sections/Movements'
import { OpenDecisions } from '../sections/OpenDecisions'
import { PortfolioShape } from '../sections/PortfolioShape'
import { StandingChecks } from '../sections/StandingChecks'

const SECTION_IDS = ['integrity', 'headline', 'shape', 'checks', 'movements', 'open']

export default function Dashboard() {
  const active = useScrollSpy(SECTION_IDS)
  const { basis } = useBasis()

  return (
    <div className="app">
      <Rail active={active} />

      <div className="main">
        <CommandBar />
        <AlertBar />

        <div className="wrap">
          <Integrity />
          {/*
           * `useApi` freezes its loader on mount and only reruns on an explicit
           * `refetch()` (see hooks/useApi.ts) — a `basis` state change alone
           * would not requery. Keying on `basis` remounts these sections
           * instead, the simplest correct way to make the toggle requery
           * without changing that hook's frozen-loader contract for every
           * other caller.
           *
           * The key only has to be unique among *these* siblings, not
           * globally — three children keyed identically `SO`/`SP` is what
           * produced React's "two children with the same key" warning (and
           * the duplicate DOM it warns about), so each gets its own prefix.
           */}
          <Headline key={`headline-${basis}`} />
          <PortfolioShape key={`shape-${basis}`} />
          <StandingChecks />
          <Movements />
          <OpenDecisions key={`decisions-${basis}`} />
        </div>
      </div>
    </div>
  )
}
