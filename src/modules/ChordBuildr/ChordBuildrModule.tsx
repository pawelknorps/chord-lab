import { AppProvider } from './components/context/AppContext'
import { PianoBoardComponent } from './components/PianoBoardComponent'
import { ThemeProvider } from './components/theme-provider'
import './index.css' // Assuming styles are local to the module now
import './App.css'
import './styles/Layout.css'
import './styles/Piano.css'

export default function ChordBuildrModule() {
  return (
    <div className="chord-buildr-module min-h-screen">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppProvider>
          <PianoBoardComponent />
        </AppProvider>
      </ThemeProvider>
    </div>
  )
}