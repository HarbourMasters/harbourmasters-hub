import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import PageTransition from './components/common/PageTransition'
import ScrollProgress from './components/common/ScrollProgress'
import { ScrollToTop } from './components/common/ScrollToTop'

const Home = lazy(() => import('./pages/Home'))
const Downloads = lazy(() => import('./pages/Downloads'))
const FAQ = lazy(() => import('./pages/FAQ'))
const About = lazy(() => import('./pages/About'))
const RomChecker = lazy(() => import('./pages/RomChecker'))
const ModLibrary = lazy(() => import('./pages/ModLibrary'))
const GameDetail = lazy(() => import('./pages/GameDetail'))
const MessageEditor = lazy(() => import('./pages/MessageEditor'))
const AudioTool = lazy(() => import('./pages/AudioTool'))
const RadioEditor = lazy(() => import('./pages/RadioEditor'))

function App() {
  return (
    <ThemeProvider defaultTheme="common">
      <ScrollToTop />
      <ScrollProgress />
      <div className="min-h-screen flex flex-col theme-transition overflow-x-hidden">
        <Header />
        <main className="flex-1">
          <PageTransition>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/tools/rom-checker" element={<RomChecker />} />
                <Route path="/tools/mods" element={<ModLibrary />} />
                <Route path="/tools/message-editor" element={<MessageEditor />} />
                <Route path="/tools/audio" element={<AudioTool />} />
                <Route path="/tools/radio-editor" element={<RadioEditor />} />
                <Route path="/game/:gameId" element={<GameDetail />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Suspense>
          </PageTransition>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
