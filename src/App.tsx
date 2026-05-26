import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { AppShell } from './components/AppShell'
import { SkeletonCard, SkeletonMetricCard, SkeletonTable } from './components/Skeleton'
import { ClawMonitorPage } from './pages/ClawMonitorPage'
import { MaterialityBenchmarkPage } from './pages/MaterialityBenchmarkPage'
import { OverviewPage } from './pages/OverviewPage'
import { PolicyDisclosurePage } from './pages/PolicyDisclosurePage'
import { useDemoStore } from './store/useDemoStore'

function App() {
  const { dataset, isLoading, error, loadDataset } = useDemoStore()

  useEffect(() => {
    void loadDataset()
  }, [loadDataset])

  if (isLoading || !dataset) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6">
        {error ? (
          <div className="panel max-w-md text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
            <h1 className="mt-4 text-xl font-semibold text-slate-950">演示数据加载失败</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{error}</p>
          </div>
        ) : (
          <div className="w-full max-w-6xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-center py-8">
              <LoaderCircle className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
            </div>
            <div className="grid gap-4 xl:grid-cols-[1fr,0.42fr]">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <HashRouter>
      <AppShell dataset={dataset}>
        <Routes>
          <Route path="/" element={<OverviewPage dataset={dataset} />} />
          <Route path="/policy" element={<PolicyDisclosurePage dataset={dataset} />} />
          <Route path="/benchmark" element={<MaterialityBenchmarkPage dataset={dataset} />} />
          <Route path="/claw" element={<ClawMonitorPage dataset={dataset} />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}

export default App
