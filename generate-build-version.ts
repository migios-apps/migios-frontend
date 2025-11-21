import fs from 'fs'
import path from 'path'

interface BuildMetadata {
  [key: string]: string
}

const formatTwoDigits = (num: number): string => {
  return ('0' + num).slice(-2)
}

const generateBuildVersion = (): void => {
  const envConfig: string = process.env.ENV_CONFIG || 'development'
  console.log(`Generating build version for ${envConfig}...`)

  const cache_path = '.buildVersion.cache.json'
  const output_path = 'dist/assets/buildVersion.json'
  const output_dir = path.dirname(output_path)

  // Buat folder dist/assets jika belum ada
  if (!fs.existsSync(output_dir)) {
    fs.mkdirSync(output_dir, { recursive: true })
  }

  // Read dari cache file atau buat default
  let metadata: BuildMetadata = {
    development: '',
    staging: '',
    production: '',
  }

  if (fs.existsSync(cache_path)) {
    const cacheContent = fs.readFileSync(cache_path, 'utf8')
    metadata = JSON.parse(cacheContent)
  }

  // Generate timestamp
  const dateObj: Date = new Date()
  const year: number = dateObj.getFullYear()
  const month: string = formatTwoDigits(dateObj.getMonth() + 1)
  const date: string = formatTwoDigits(dateObj.getDate())
  const hour: string = formatTwoDigits(dateObj.getHours())
  const minute: string = formatTwoDigits(dateObj.getMinutes())
  const second: string = formatTwoDigits(dateObj.getSeconds())

  const time: string = `${year}/${month}/${date} ${hour}:${minute}:${second}`
  const buildVersion: string = `${envConfig}.${time}`

  // Update hanya environment yang sedang di-build
  metadata[envConfig] = buildVersion

  // Save ke cache dan dist
  fs.writeFileSync(cache_path, JSON.stringify(metadata, null, 2))
  fs.writeFileSync(output_path, JSON.stringify(metadata, null, 2))

  console.log(`✓ Build version generated: ${buildVersion}`)
  console.log(`✓ File saved to: ${output_path}`)
  console.log(`✓ Cache updated: ${cache_path}`)
}

generateBuildVersion()
