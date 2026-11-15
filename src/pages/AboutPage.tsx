import { DISCLAIMER } from '@/app/disclaimer'
import { PageLayout } from '@/components/PageLayout'
import { HAZARDS, HAZARD_IDS, HAZARDS_SOURCE_URL, indicatorsFor } from '@/domain/hazards'
import { INDICATOR_IDS, INDICATORS } from '@/domain/indicators'

/** Placeholder. Final content follows docs/data-and-limitations.md once it is written. */
export function AboutPage() {
  return (
    <PageLayout title="About">
      <div className="space-y-4 rounded-lg border bg-card p-4">
        <p>
          haoma is a prototype for the NASA Space Apps Challenge 2026 challenge “Create Health
          Monitoring Software for Astronauts on Space Missions”.
        </p>
        <p>{DISCLAIMER}</p>
        <p>
          Entries are stored only in this browser. Nothing is sent to a server. This project is not
          endorsed by NASA.
        </p>
      </div>

      {/* Owner decision 2026-11-15: RIDGE hazards, docs/scientific-foundations.md. */}
      <section aria-labelledby="ridge-heading" className="space-y-3">
        <h2 id="ridge-heading" className="text-lg font-medium">
          Spaceflight hazards (RIDGE)
        </h2>
        <p className="text-sm">
          NASA’s Human Research Program groups the stressors of spaceflight into five hazards (
          <a
            href={HAZARDS_SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            NASA: The Human Body in Space
          </a>
          ). haoma’s six indicators are linked to them as background; hazards do not change any rule
          or status.
        </p>
        <ul className="divide-y rounded-lg border bg-card text-sm">
          {HAZARD_IDS.map((id) => {
            const linked = indicatorsFor(id, INDICATOR_IDS)
            return (
              <li key={id} className="space-y-1 p-3">
                <p className="font-medium">{HAZARDS[id].label}</p>
                <p>{HAZARDS[id].summary}</p>
                <p className="text-muted-foreground">
                  {id === 'radiation'
                    ? 'haoma does not measure radiation exposure. Body temperature is linked only indirectly, through the immune response.'
                    : `Indicators in haoma: ${linked.map((i) => INDICATORS[i].label).join(', ')}.`}
                </p>
              </li>
            )
          })}
        </ul>
      </section>
    </PageLayout>
  )
}
