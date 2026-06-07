import { useMemo, type CSSProperties, type ReactNode } from 'react'
import type { EChartsOption } from 'echarts'
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Loader2,
  MessageSquareWarning,
} from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import type { DemoDataset } from '../types/dataset'
import { EChart } from '../components/EChart'
import { MetricCard } from '../components/MetricCard'
import { Panel } from '../components/Panel'
import {
  formatNumber,
  generateSparkline,
  getAiFlowNodes,
  getChineseDisclosureRecommendation,
  getChineseDisclosureTopic,
  getFullGapDistribution,
  getFullStandardProgress,
  getMetricTrends,
  getOpinionTopicHotspots,
  getRecentTasks,
  getReviewStatus,
  sortByPriority,
} from '../lib/analytics'
import {
  chartCenterTitle,
  chartPalette,
  chartPieItemStyle,
  chartTooltip,
} from '../lib/chartTheme'

export function OverviewPage({ dataset }: { dataset: DemoDataset }) {
  const metrics = useMemo(() => getMetricTrends(dataset), [dataset])
  const recentTasks = useMemo(() => getRecentTasks(dataset), [dataset])
  const recentTaskPreview = useMemo(() => recentTasks.slice(0, 3), [recentTasks])
  const reviewStatus = useMemo(() => getReviewStatus(dataset), [dataset])
  const aiFlow = useMemo(() => getAiFlowNodes(dataset), [dataset])
  const standardProgress = useMemo(() => getFullStandardProgress(), [])
  const hotspotTopics = useMemo(() => getOpinionTopicHotspots(dataset.publicOpinion).slice(0, 5), [dataset.publicOpinion])
  const keyGaps = useMemo(
    () =>
      sortByPriority(dataset.policyDisclosureAnalysis)
        .filter((item) => item.gapLevel !== 'none')
        .slice(0, 4),
    [dataset.policyDisclosureAnalysis],
  )

  const gapDistribution = useMemo(() => getFullGapDistribution(), [])

  const gapLevelBorder: Record<string, string> = {
    major: 'border-l-4 border-l-rose-500',
    minor: 'border-l-4 border-l-amber-400',
  }

  const gapLevelBg: Record<string, string> = {
    major: '',
    minor: '',
  }

  const standardSegmentMeta = [
    { key: 'disclosed', label: '已披露', bar: 'bg-emerald-500', text: 'text-emerald-700', color: '#10b981' },
    { key: 'partial', label: '部分', bar: 'bg-amber-400', text: 'text-amber-700', color: '#f59e0b' },
    { key: 'pending', label: '待确认', bar: 'bg-sky-400', text: 'text-sky-700', color: '#0ea5e9' },
    { key: 'missing', label: '缺失', bar: 'bg-rose-500', text: 'text-rose-700', color: '#f43f5e' },
  ] as const

  const gapDistributionTone: Record<string, string> = {
    重大差距: 'bg-rose-500',
    轻微差距: 'bg-amber-400',
    无差距: 'bg-emerald-500',
  }
  const gapDistributionCardTone: Record<string, string> = {
    重大差距: 'text-rose-700 border-rose-100 bg-rose-50/70 hover:border-rose-300 hover:shadow-[0_6px_18px_rgba(244,63,94,0.12)]',
    轻微差距: 'text-amber-700 border-amber-100 bg-amber-50/70 hover:border-amber-300 hover:shadow-[0_6px_18px_rgba(245,158,11,0.12)]',
    无差距: 'text-emerald-700 border-emerald-100 bg-emerald-50/70 hover:border-emerald-300 hover:shadow-[0_6px_18px_rgba(16,185,129,0.12)]',
  }

  const totalGapDistribution = gapDistribution.reduce((sum, item) => sum + item.value, 0)
  const kpiIcons = [FileText, ClipboardList, BookOpen, MessageSquareWarning]
  const kpiTones: Array<'green' | 'blue' | 'amber' | 'red'> = ['green', 'blue', 'amber', 'red']
  const reviewChartOption = useMemo<EChartsOption>(
    () => ({
      color: chartPalette.reviewPie,
      tooltip: {
        ...chartTooltip,
        trigger: 'item',
        formatter: '{b}: {c} 项 ({d}%)',
      },
      title: {
        text: `${reviewStatus.total}`,
        subtext: '合计',
        left: 'center',
        top: '38%',
        ...chartCenterTitle,
      },
      series: [
        {
          name: '人工复核状态',
          type: 'pie',
          radius: ['58%', '78%'],
          center: ['50%', '48%'],
          avoidLabelOverlap: true,
          itemStyle: chartPieItemStyle,
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          data: reviewStatus.items.map((item) => ({
            name: item.name,
            value: item.count,
          })),
        },
      ],
    }),
    [reviewStatus.items, reviewStatus.total],
  )

  return (
    <div className="space-y-5">
      {/* Row 1: KPI 卡片 */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((trend, index) => (
          <MetricCard
            key={trend.label}
            label={trend.label}
            value={`${trend.value}`}
            hint=""
            icon={kpiIcons[index]}
            tone={kpiTones[index]}
            sparkline={trend.sparkline}
            delta={{ value: trend.delta, percent: trend.percent, direction: trend.direction }}
          />
        ))}
      </div>

      {/* Row 2: 紧凑分析流程 */}
      <Panel title="AI 分析流程">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {aiFlow.map((node, index) => {
            const isLast = index === aiFlow.length - 1
            return (
              <div key={node.id} className="subpanel-muted relative flex items-center gap-2 px-3 py-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    node.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-200'
                      : 'bg-sky-100 text-sky-700 ring-2 ring-sky-200'
                  }`}
                >
                  {node.id}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-slate-950">{node.name}</h4>
                  <p className="truncate text-[11px] text-slate-500">{node.subtitle}</p>
                </div>
                {!isLast && (
                  <ChevronRight className="absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-300 xl:block" />
                )}
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Row 3: 标准、差距、任务、复核 */}
      <div className="grid items-stretch gap-4 xl:grid-cols-4">
        <Panel
          title="标准总体进度"
          className="flex h-full flex-col"
          contentClassName="flex flex-1 flex-col"
          showInfo
          infoTip="基于 ESRS 与 GRI 全量标准条款的总体完成率。"
        >
          <div className="grid min-h-[294px] flex-1 content-between gap-3">
            {standardProgress.map((item) => {
              const total = Math.max(item.total, 1)

              return (
                <div key={item.standardType} className="subpanel flex min-h-[132px] flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.standardType}</p>
                      <p className="mt-1 text-xs text-slate-500">全量 {formatNumber(item.total)} 条款</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold tracking-tight text-slate-950">{item.completion}%</p>
                      <p className="text-[11px] text-slate-500">完成率</p>
                    </div>
                  </div>
                  <div className="my-2 flex h-2.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/70">
                    {standardSegmentMeta.map((segment) => {
                      const value = item[segment.key]
                      const width = (value / total) * 100

                      return value > 0 ? (
                        <div
                          key={segment.key}
                          className={`${segment.bar} h-full transition-opacity hover:opacity-80`}
                          style={{ width: `${value > 0 && width < 1 ? 1 : width}%` }}
                          title={formatHoverDetail(segment.label, value, total)}
                        />
                      ) : null
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    {standardSegmentMeta.map((segment) => (
                      <HoverStat
                        key={segment.key}
                        label={segment.label}
                        value={item[segment.key]}
                        total={total}
                        color={segment.color}
                        textClassName={segment.text}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel
          title="披露差距分布"
          className="flex h-full flex-col"
          contentClassName="flex flex-1 flex-col"
          showInfo
          infoTip="基于 ESRS 与 GRI 全量标准库，待人工确认纳入轻微差距统计。"
        >
          <div className="flex min-h-[294px] flex-1 flex-col justify-between gap-3">
            <div className="subpanel-accent">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">ESRS / GRI</p>
                  <p className="mt-1 text-xs text-slate-500">全量披露要求</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold tracking-tight text-slate-950">{formatNumber(totalGapDistribution)}</p>
                  <p className="text-[11px] text-slate-500">条款</p>
                </div>
              </div>
              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
                {gapDistribution.map((item) => {
                  const rawPercent = (item.value / Math.max(totalGapDistribution, 1)) * 100
                  const barPercent = item.value > 0 ? Math.max(1, rawPercent) : 0

                  return item.value > 0 ? (
                    <div
                      key={item.name}
                      className={`${gapDistributionTone[item.name] ?? 'bg-slate-400'} h-full transition-opacity hover:opacity-80`}
                      style={{ width: `${barPercent}%` }}
                      title={formatHoverDetail(item.name, item.value, totalGapDistribution)}
                    />
                  ) : null
                })}
              </div>
            </div>
            <div className="grid gap-2">
              {gapDistribution.map((item) => {
                const rawPercent = (item.value / Math.max(totalGapDistribution, 1)) * 100
                const percent = Math.round(rawPercent)
                const displayPercent = item.value > 0 && rawPercent < 1 ? '<1%' : `${percent}%`

                return (
                  <HoverStatCard
                    key={item.name}
                    label={item.name}
                    value={item.value}
                    total={totalGapDistribution}
                    className={`px-3 py-1.5 ${gapDistributionCardTone[item.name] ?? 'text-slate-700 border-slate-100 bg-slate-50/70'}`}
                    valueClassName="text-base"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold">{item.name}</span>
                      <span className="text-xs font-bold">{displayPercent}</span>
                    </div>
                    <p className="text-base font-bold tracking-tight text-slate-950">
                      {formatNumber(item.value)}
                      <span className="ml-1 text-xs font-semibold text-slate-500">项</span>
                    </p>
                  </HoverStatCard>
                )
              })}
            </div>
          </div>
        </Panel>

        <Panel
          title="最新分析任务"
          className="flex h-full flex-col"
          contentClassName="flex flex-1 flex-col"
          action={
            <RouterLink to="/policy" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              更多 →
            </RouterLink>
          }
        >
          <div className="space-y-2.5">
            {recentTaskPreview.map((task) => {
              const statusConfig = {
                completed: { label: '分析完成', class: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
                analyzing: { label: '分析中', class: 'bg-sky-50 text-sky-700', icon: Loader2 },
                queued: { label: '排队中', class: 'bg-slate-100 text-slate-600', icon: Loader2 },
              }
              const cfg = statusConfig[task.status]
              const StatusIcon = cfg.icon
              const fileIcon =
                task.fileType === 'xlsx' ? (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">XLSX</span>
                ) : task.fileType === 'docx' ? (
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">DOCX</span>
                ) : (
                  <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">PDF</span>
                )

              return (
                <div
                  key={task.id}
                  className="subpanel-muted group relative p-2.5 transition hover:bg-slate-100/70 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  tabIndex={0}
                  aria-label={`${task.title}: ${cfg.label} (${task.uploadedAt})`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950">{task.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{task.fileName}</p>
                    </div>
                    {fileIcon}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ${cfg.class}`}>
                      <StatusIcon className={`h-3 w-3 ${task.status === 'analyzing' ? 'animate-spin' : ''}`} />
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-slate-400">{task.uploadedAt}</span>
                  </div>
                  {task.status === 'analyzing' && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                  <HoverTooltip detail={`${task.title}: ${cfg.label} (${task.uploadedAt})`} />
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel
          title="人工复核状态"
          className="flex h-full flex-col"
          contentClassName="flex flex-1 flex-col"
          action={
            <RouterLink to="/policy" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">
              更多 →
            </RouterLink>
          }
        >
          <div className="flex min-h-[294px] flex-col justify-between">
            <EChart option={reviewChartOption} className="h-40 w-full shrink-0" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              {reviewStatus.items.map((item) => {
                const percent = reviewStatus.total > 0 ? Math.round((item.count / reviewStatus.total) * 100) : 0

                return (
                  <HoverStatCard
                    key={item.name}
                    label={item.name}
                    value={item.count}
                    total={reviewStatus.total}
                    color={item.color}
                    className="px-2.5 py-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-base font-bold text-slate-950">{item.count}</span>
                      <span className="text-[11px] text-slate-400">{percent}%</span>
                    </div>
                  </HoverStatCard>
                )
              })}
            </div>
          </div>
        </Panel>
      </div>

      {/* Row 4: 优先披露补强项 */}
      <Panel
        title="优先披露补强项"
        action={
          <RouterLink to="/policy" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            查看全部 →
          </RouterLink>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {keyGaps.map((item) => (
            <div
              key={item.id}
              className={`subpanel p-3 ${gapLevelBorder[item.gapLevel] || ''} ${gapLevelBg[item.gapLevel] || ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">
                    {item.clauseId} · {getChineseDisclosureTopic(item)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{getChineseDisclosureRecommendation(item)}</p>
                </div>
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-base font-bold text-rose-700">
                  {item.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Row 5: Claw 议题热度 */}
      <Panel title="Claw 议题热度">
        <div className="grid gap-3 md:grid-cols-5">
          {hotspotTopics.map((item) => (
            <div
              key={item.topicName}
              className="subpanel-muted p-3 transition hover:bg-slate-100/70"
            >
              <p className="text-sm font-semibold text-slate-950">{item.topicName}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{formatNumber(item.reach)}</p>
              <p className="mt-1 text-xs text-slate-500">平均指数 · {item.count} 条</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function formatHoverDetail(label: string, value: number, total: number) {
  const percent = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00'
  return `${label}: ${formatNumber(value)}项 (${percent}%)`
}

function HoverTooltip({ detail }: { detail: string }) {
  return (
    <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 opacity-0 shadow-lg transition-opacity duration-[250ms] group-hover:opacity-100 group-focus-visible:opacity-100">
      {detail}
    </span>
  )
}

function HoverStat({
  label,
  value,
  total,
  color,
  textClassName,
}: {
  label: string
  value: number
  total: number
  color: string
  textClassName?: string
}) {
  const detail = formatHoverDetail(label, value, total)

  return (
    <span
      className="group relative inline-flex items-center gap-1 rounded px-1 py-0.5 outline-none transition-[background-color,box-shadow] duration-[250ms] hover:bg-white hover:shadow-sm focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-emerald-500/40"
      tabIndex={0}
      aria-label={detail}
    >
      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span>
        {label} <span className={`font-semibold ${textClassName ?? 'text-slate-700'}`}>{formatNumber(value)}</span>
      </span>
      <HoverTooltip detail={detail} />
    </span>
  )
}

function HoverStatCard({
  label,
  value,
  total,
  color,
  className = '',
  children,
}: {
  label: string
  value: number
  total: number
  color?: string
  className?: string
  valueClassName?: string
  children: ReactNode
}) {
  const detail = formatHoverDetail(label, value, total)
  const hoverColor = color ?? '#cbd5e1'
  const hoverStyle = {
    '--hover-color': hoverColor,
    '--hover-shadow': `${hoverColor}1f`,
  } as CSSProperties

  return (
    <div
      className={`subpanel-muted group relative border transition-[background-color,border-color,box-shadow] duration-[250ms] hover:border-[var(--hover-color)] hover:shadow-[0_6px_18px_var(--hover-shadow)] focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${className}`}
      style={hoverStyle}
      tabIndex={0}
      aria-label={detail}
    >
      {children}
      <HoverTooltip detail={detail} />
    </div>
  )
}
