export interface CsvColumn<T> {
  header: string
  value: (row: T) => string | number | null | undefined
}

const escapeCell = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return ""
  }
  const text = `${value}`
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export const toCsv = <T>(columns: CsvColumn<T>[], rows: T[]): string => {
  const header = columns.map((column) => escapeCell(column.header)).join(";")
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(column.value(row))).join(";")
  )
  return [header, ...body].join("\n")
}

export const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

const UTF8_BOM = "\uFEFF"

export const downloadCsv = (filename: string, csv: string) => {
  downloadBlob(
    filename,
    new Blob([`${UTF8_BOM}${csv}`], { type: "text/csv;charset=utf-8;" })
  )
}
