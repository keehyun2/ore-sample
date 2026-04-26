import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import ExampleSelector from './components/ExampleSelector'
import IRSwapApp from './components/Examples/IRSwapApp'
import FREDRateApp from './components/Examples/FREDRateApp'
import OISConsistencyApp from './components/Examples/OISConsistencyApp'
import { api } from './services/api'

// Map URL paths to example IDs
const pathToExample = {
  '/': 'IRSwap',
  '/IRSwap': 'IRSwap',
  '/FRED': 'FRED Rate',
  '/OIS': 'OIS-consistency',
}

const exampleToPath = {
  IRSwap: '/IRSwap',
  'FRED Rate': '/FRED',
  'OIS-consistency': '/OIS',
}

function getExampleFromPath() {
  const path = window.location.pathname
  return pathToExample[path] || 'IRSwap'
}

function AppContent() {
  const [activeExample, setActiveExample] = useState(() => getExampleFromPath())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const checkBackendReady = async () => {
      try {
        // Poll backend until it's ready
        let ready = false
        let attempts = 0
        const maxAttempts = 30

        while (!ready && attempts < maxAttempts) {
          try {
            await api.getConfig()
            ready = true
          } catch {
            attempts++
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        }

        if (ready) {
          // Switch to the example from URL after backend is ready
          const exampleFromUrl = getExampleFromPath()
          if (exampleFromUrl !== 'IRSwap') {
            await api.switchExample(exampleFromUrl)
          }
          setIsReady(true)
        } else {
          console.error('Backend failed to initialize')
        }
      } catch (error) {
        console.error('Failed to check backend readiness:', error)
      }
    }
    checkBackendReady()
  }, [])

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const example = getExampleFromPath()
      setActiveExample(example)
      api.switchExample(example)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleExampleChange = async (example) => {
    try {
      await api.switchExample(example)
      setActiveExample(example)
      // Update URL without full page reload
      const path = exampleToPath[example] || '/'
      window.history.pushState({ example }, '', path)
    } catch (error) {
      console.error('Failed to switch example:', error)
    }
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl">ORE 서버 시작 중...</div>
          <div className="text-text-secondary">파일 복사 및 초기화 중</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ExampleSelector activeExample={activeExample} onSelect={handleExampleChange} />

      {activeExample === 'IRSwap' && <IRSwapApp />}
      {activeExample === 'FRED Rate' && <FREDRateApp />}
      {activeExample === 'OIS-consistency' && <OISConsistencyApp />}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
