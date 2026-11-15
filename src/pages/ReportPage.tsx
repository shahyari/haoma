import { lazy, Suspense } from 'react'
import { useNavigate, useParams } from 'react-router'

import { PageLayout } from '@/components/PageLayout'
import { useHealthData } from '@/data/HealthDataProvider'
import { formatDateTime } from '@/domain/dates'
import { averageIntensity } from '@/domain/pain'
import { ReportActions } from '@/features/reports/ReportActions'
import { NotFoundPage } from '@/pages/NotFoundPage'

const BodyMap = lazy(() =>
  import('@/features/bodymap/BodyMap').then((m) => ({ default: m.BodyMap })),
)

/** One saved report: its pain logs shown read-only on the body map (owner decision 2026-11-14). */
export function ReportPage() {
  const { reportId } = useParams()
  const { data, deletePainReport } = useHealthData()
  const navigate = useNavigate()
  const report = data.reports.find((r) => r.id === reportId)
  if (!report) return <NotFoundPage />

  return (
    <PageLayout
      title={
        <>
          Pain report · <span className="num">{formatDateTime(report.createdAt)}</span>
        </>
      }
      description={
        <>
          {report.astronaut ? `${report.astronaut} · ` : ''}
          <span className="num">{report.logs.length}</span>{' '}
          {report.logs.length === 1 ? 'log' : 'logs'} · average intensity{' '}
          <span className="num">{averageIntensity(report)}/10</span> · self-reported, not a
          diagnosis
        </>
      }
      actions={
        <ReportActions
          report={report}
          onDelete={() => {
            deletePainReport(report.id)
            navigate('/reports')
          }}
        />
      }
    >
      <section aria-labelledby="bodymap-heading" className="h-[min(80svh,760px)] min-h-[560px]">
        <Suspense
          fallback={
            <div className="h-full animate-pulse rounded-lg border bg-muted" aria-hidden="true" />
          }
        >
          <BodyMap key={report.id} report={report} />
        </Suspense>
      </section>
    </PageLayout>
  )
}
