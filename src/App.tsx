import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { loadVoices } from './lib/tts'
import PlayScreen from './features/play/PlayScreen'
import KanaMatchGame from './features/kana/KanaMatchGame'
import FlashCardDeck from './features/flashcard/FlashCardDeck'
import ListenQuiz from './features/quiz/ListenQuiz'
import ParentDashboard from './features/parent/ParentDashboard'
import KanaGallery from './features/play/KanaGallery'
import KanaCatchGame from './features/kana-catch/KanaCatchGame'
import DakutenDragGame from './features/dakuten-drag/DakutenDragGame'

export default function App() {
  useEffect(() => { void loadVoices() }, [])

  return (
    <HashRouter>
      <Routes>
        {/* Pet app routes */}
        <Route path="/" element={<Navigate to="/play" replace />} />
        <Route path="/play" element={<PlayScreen />} />
        <Route path="/play/kana" element={<KanaMatchGame />} />
        <Route path="/play/flashcard" element={<FlashCardDeck />} />
        <Route path="/play/quiz" element={<ListenQuiz />} />
        <Route path="/play/gallery" element={<KanaGallery />} />
        <Route path="/play/kana-catch" element={<KanaCatchGame />} />
        <Route path="/play/dakuten-drag" element={<DakutenDragGame />} />
        <Route path="/parent" element={<ParentDashboard />} />
        {/* Legacy redirects */}
        <Route path="/kid" element={<Navigate to="/play" replace />} />
        <Route path="/kid/kana" element={<Navigate to="/play/kana" replace />} />
        <Route path="/kid/flashcard" element={<Navigate to="/play/flashcard" replace />} />
        <Route path="/kid/quiz" element={<Navigate to="/play/quiz" replace />} />
        <Route path="*" element={<Navigate to="/play" replace />} />
      </Routes>
    </HashRouter>
  )
}
