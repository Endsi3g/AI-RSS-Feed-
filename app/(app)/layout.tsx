import BottomTabBar from '@/components/layout/BottomTabBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="min-h-dvh">
        {children}
      </main>
      <BottomTabBar />
    </>
  )
}
