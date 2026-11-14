import { Download, ExternalLink, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { painReportJson, type PainReport } from '@/domain/pain'

import { downloadFile, openFile, reportFilename } from './download'

/** Open JSON, Download JSON, and Delete (with a confirmation click) for one report. */
export function ReportActions({ report, onDelete }: { report: PainReport; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => openFile(painReportJson(report))}>
        <ExternalLink aria-hidden="true" />
        Open JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadFile(reportFilename(report.createdAt), painReportJson(report))}
      >
        <Download aria-hidden="true" />
        Download JSON
      </Button>
      <Button
        variant={confirm ? 'destructive' : 'ghost'}
        size="sm"
        onClick={() => {
          if (!confirm) {
            setConfirm(true)
            window.setTimeout(() => setConfirm(false), 3000)
            return
          }
          setConfirm(false)
          onDelete()
        }}
      >
        <Trash2 aria-hidden="true" />
        {confirm ? 'Confirm delete' : 'Delete'}
      </Button>
    </div>
  )
}
