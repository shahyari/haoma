/** Saves text as a file through a temporary link. Nothing leaves the device. */
export function downloadFile(filename: string, text: string, type = 'application/json') {
  if (typeof URL.createObjectURL !== 'function') return
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** e.g. "haoma-pain-report-2026-11-14-1720.json" (local time). */
export function reportFilename(createdAt: string): string {
  const d = new Date(createdAt)
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `haoma-pain-report-${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}.json`
}
