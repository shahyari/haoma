import { DISCLAIMER } from '@/app/disclaimer'

/** Placeholder. Final content follows docs/data-and-limitations.md once it is written. */
export function AboutPage() {
  return (
    <div className="max-w-prose space-y-4">
      <h1 className="text-2xl font-semibold">About</h1>
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
  )
}
