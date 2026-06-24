import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { demoDatasetSchema, type DemoDataset } from '../src/types/dataset.ts'

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const defaultPaths = {
  basePath: resolve(rootDirectory, 'data/demo-dataset.base.json'),
  disclosurePath: resolve(rootDirectory, 'data/full-standard-disclosure.fragment.json'),
  outputPath: resolve(rootDirectory, 'public/generated/full-standard-disclosure.json'),
}

type BuildOptions = Partial<typeof defaultPaths>

const formatZodError = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('issues' in error)) {
    return '数据格式不符合前端契约'
  }

  const issues = (error as { issues: Array<{ path: Array<string | number>; message: string }> }).issues

  return issues
    .slice(0, 6)
    .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('；')
}

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} 必须是 JSON 对象`)
  }

  return value as Record<string, unknown>
}

export const composeDemoDataset = (baseInput: unknown, disclosureInput: unknown): DemoDataset => {
  const base = asRecord(baseInput, '基础演示数据')
  const disclosure = asRecord(disclosureInput, '全量披露数据')
  const baseAuditTrail = Array.isArray(base.auditTrail) ? base.auditTrail : []
  const disclosureAuditTrail = Array.isArray(disclosure.auditTrail) ? disclosure.auditTrail : []

  const candidate = {
    meta: base.meta,
    companies: base.companies,
    reports: base.reports,
    standards: disclosure.standards,
    policyDisclosureAnalysis: disclosure.policyDisclosureAnalysis,
    materialityBenchmark: base.materialityBenchmark,
    publicOpinion: base.publicOpinion,
    auditTrail: [...baseAuditTrail, ...disclosureAuditTrail],
  }
  const parsed = demoDatasetSchema.safeParse(candidate)

  if (!parsed.success) {
    throw new Error(`生成的 DemoDataset 不符合契约：${formatZodError(parsed.error)}`)
  }

  return parsed.data
}

const readJson = async (path: string): Promise<unknown> => JSON.parse(await readFile(path, 'utf8'))

export const buildFullDemoDataset = async (options: BuildOptions = {}): Promise<DemoDataset> => {
  const paths = { ...defaultPaths, ...options }
  const [base, disclosure] = await Promise.all([readJson(paths.basePath), readJson(paths.disclosurePath)])
  const dataset = composeDemoDataset(base, disclosure)
  const temporaryOutputPath = `${paths.outputPath}.${process.pid}.${Date.now()}.tmp`

  try {
    await writeFile(temporaryOutputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')
    await rename(temporaryOutputPath, paths.outputPath)
  } finally {
    await rm(temporaryOutputPath, { force: true })
  }

  return dataset
}

const scriptPath = process.argv[1] ? resolve(process.argv[1]) : ''

if (scriptPath === fileURLToPath(import.meta.url)) {
  buildFullDemoDataset()
    .then((dataset) => {
      console.log(
        `generated ${defaultPaths.outputPath} (${dataset.standards.esrs.length} ESRS, ${dataset.standards.gri.length} GRI, ${dataset.policyDisclosureAnalysis.length} disclosures)`,
      )
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error)
      process.exitCode = 1
    })
}
