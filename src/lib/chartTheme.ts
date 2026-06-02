/**
 * 统一图表语义色板
 *
 * 设计原则：
 * - 正/良/通过 → 品牌 emerald 绿系
 * - 负/差/缺失 → rose 系（降低饱和度避免刺眼）
 * - 中/警告 → amber 系
 * - 信息/中性 → sky/slate 系
 * - 同一图表内避免高饱和色直接相邻
 */

export const chartPalette = {
  /** 披露属性柱状图（8柱：4对 缺口/完整） */
  requirementBar: [
    '#f43f5e', // 强制缺口     rose-500
    '#10b981', // 强制完整     emerald-500
    '#fb923c', // 条件性缺口   orange-400
    '#34d399', // 条件性完整   emerald-400
    '#fbbf24', // 自愿缺口     amber-400
    '#6ee7b7', // 自愿完整     emerald-300
    '#f87171', // 待确认缺口   red-400
    '#a7f3d0', // 待确认完整   emerald-200
  ],

  /** 风险趋势折线图（高/中/低） */
  riskLine: ['#f43f5e', '#f59e0b', '#10b981'],

  /** 人工复核状态饼图（待复核/已通过/已修改/不采纳） */
  reviewPie: [
    '#f59e0b', // 待复核  amber-500
    '#10b981', // 已通过  emerald-500
    '#0ea5e9', // 已修改  sky-500
    '#f43f5e', // 不采纳  rose-500
  ],

  /** 差距等级色条（重大/轻微/待确认/无） */
  gapLevel: {
    major: '#f43f5e',
    minor: '#f59e0b',
    pending: '#0ea5e9',
    none: '#10b981',
  },

  /** 通用语义色 */
  semantic: {
    positive: '#10b981',
    positiveLight: '#34d399',
    warning: '#f59e0b',
    negative: '#f43f5e',
    info: '#0ea5e9',
    neutral: '#94a3b8',
  },
}
