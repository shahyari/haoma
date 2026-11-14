import { Download, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { BackLink } from '@/components/BackLink'
import { EmptyState } from '@/components/states/StatePanel'
import { Button } from '@/components/ui/button'
import { useHealthData } from '@/data/HealthDataProvider'
import { formatDateTime } from '@/domain/dates'
import { painReportJson } from '@/domain/pain'
import { downloadFile, reportFilename } from '@/features/reports/download'

const pad = (n: number) => String(n).padStart(2, '0')

/** Saved pain reports (owner decision 2026-11-14): each holds one or more pain logs. */
export function ReportsPage() {
  const { data, deletePainReport } = useHealthData()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const reports = [...data.reports].reverse()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <BackLink />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Saved pain reports, newest first. Self-reported data, not a diagnosis. Stored only in this
          browser; a download saves the report as a JSON file on this device.
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No saved reports"
          description="Use “Save report” in the pain log on Home to save one or more pain logs as a report."
        />
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => {
            const avg = (
              report.logs.reduce((s, l) => s + l.intensity, 0) / report.logs.length
            ).toFixed(1)
            const title = `Pain report, ${formatDateTime(report.createdAt)}`
            return (
              <li key={report.id}>
                <article aria-label={title} className="rounded-lg border bg-card">
                  <header className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
                    <div>
                      <h2 className="font-medium">
                        Pain report ·{' '}
                        <span className="num">{formatDateTime(report.createdAt)}</span>
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        <span className="num">{report.logs.length}</span>{' '}
                        {report.logs.length === 1 ? 'log' : 'logs'} · average intensity{' '}
                        <span className="num">{avg}/10</span>
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadFile(reportFilename(report.createdAt), painReportJson(report))
                        }
                      >
                        <Download aria-hidden="true" />
                        Download JSON
                      </Button>
                      <Button
                        variant={confirmDelete === report.id ? 'destructive' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          if (confirmDelete !== report.id) {
                            setConfirmDelete(report.id)
                            window.setTimeout(
                              () => setConfirmDelete((c) => (c === report.id ? null : c)),
                              3000,
                            )
                            return
                          }
                          setConfirmDelete(null)
                          deletePainReport(report.id)
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                        {confirmDelete === report.id ? 'Confirm delete' : 'Delete'}
                      </Button>
                    </div>
                  </header>
                  <ol className="divide-y">
                    {report.logs.map((log, i) => (
                      <li
                        key={log.id}
                        className="grid grid-cols-[2rem_1fr] gap-3 px-4 py-3 text-sm"
                      >
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
            )
          })}
        </ul>
      )}
    </div>
  )
}
