import { Eye, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router'

import { BackLink } from '@/components/BackLink'
import { EmptyState } from '@/components/states/StatePanel'
import { Button } from '@/components/ui/button'
import { useHealthData } from '@/data/HealthDataProvider'
import { formatDateTime } from '@/domain/dates'
import { averageIntensity, PAIN_REPORT_MAX_BYTES, parsePainReportJson } from '@/domain/pain'
import { ReportActions } from '@/features/reports/ReportActions'

const pad = (n: number) => String(n).padStart(2, '0')

/** Saved and imported pain reports (owner decisions 2026-11-14). */
export function ReportsPage() {
  const { data, deletePainReport, importPainReport } = useHealthData()
  const fileInput = useRef<HTMLInputElement>(null)
  const [imported, setImported] = useState<{ id: string; text: string } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const reports = [...data.reports].reverse()

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImported(null)
    setImportError(null)
    if (file.size > PAIN_REPORT_MAX_BYTES) {
      setImportError('The file is too large for a pain report (over 1 MB).')
      return
    }
    const result = parsePainReportJson(
      await file.text(),
      new Set(data.reports.map((r) => r.id)),
      () => crypto.randomUUID(),
    )
    if (!result.ok) {
      setImportError(result.error)
      return
    }
    importPainReport(result.report)
    const n = result.report.logs.length
    setImported({
      id: result.report.id,
      text: `Imported a report${result.report.astronaut ? ` of ${result.report.astronaut}` : ''} with ${n} ${n === 1 ? 'pain log' : 'pain logs'}.`,
    })
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <BackLink />
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 space-y-1">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Saved and imported pain reports, newest first. Self-reported data, not a diagnosis.
            Stored only in this browser.
          </p>
        </div>
        <Button variant="outline" onClick={() => fileInput.current?.click()}>
          <Upload aria-hidden="true" />
          Import JSON
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Report file to import"
          onChange={onFile}
        />
      </div>

      {imported ? (
        <p
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm"
        >
          <span className="flex-1">{imported.text}</span>
          <Button asChild size="sm">
            <Link to={`/reports/${imported.id}`}>View report</Link>
          </Button>
        </p>
      ) : null}
      {importError ? (
        <p role="alert" className="rounded-md border border-destructive p-3 text-sm">
          Nothing was imported. {importError}
        </p>
      ) : null}

      {reports.length === 0 ? (
        <EmptyState
          title="No saved reports"
          description="Use “Save report” in the pain log on Home, or import a report file."
        />
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li key={report.id}>
              <article
                aria-label={`Pain report, ${formatDateTime(report.createdAt)}`}
                className="rounded-lg border bg-card"
              >
                <header className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
                  <div className="flex-1">
                    <h2 className="font-medium">
                      Pain report · <span className="num">{formatDateTime(report.createdAt)}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {report.astronaut ? `${report.astronaut} · ` : ''}
                      <span className="num">{report.logs.length}</span>{' '}
                      {report.logs.length === 1 ? 'log' : 'logs'} · average intensity{' '}
                      <span className="num">{averageIntensity(report)}/10</span>
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link to={`/reports/${report.id}`}>
                      <Eye aria-hidden="true" />
                      View report
                    </Link>
                  </Button>
                  <ReportActions report={report} onDelete={() => deletePainReport(report.id)} />
                </header>
                <ol className="divide-y">
                  {report.logs.map((log, i) => (
                    <li key={log.id} className="grid grid-cols-[2rem_1fr] gap-3 px-4 py-3 text-sm">
                      <span className="num text-muted-foreground">{pad(i + 1)}</span>
                      <div className="min-w-0">
                        <p>
                          <span className="font-medium">{log.region}</span> ·{' '}
                          <span className="num">{log.intensity}/10</span>
                          {log.character ? ` · ${log.character}` : ''}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="num">{formatDateTime(log.recordedAt)}</span>
                          {log.editedAt ? ' · edited' : ''}
                        </p>
                        {log.note ? <p className="mt-1 break-words">{log.note}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
