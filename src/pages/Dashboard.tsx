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

  return (
    <div className="app">
      <Rail active={active} />

      <div className="main">
        <CommandBar />
        <AlertBar />

        <div className="wrap">
          <Integrity />
          <Headline />
          <PortfolioShape />
          <StandingChecks />
          <Movements />
          <OpenDecisions />
        </div>
      </div>
    </div>
  )
}
