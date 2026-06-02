import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { loadVoices } from './lib/tts'
import HomeScreen from './features/home/HomeScreen'
import PlayScreen from './features/play/PlayScreen'
import KanaMatchGame from './features/kana/KanaMatchGame'
import FlashCardDeck from './features/flashcard/FlashCardDeck'
import ListenQuiz from './features/quiz/ListenQuiz'
import ParentDashboard from './features/parent/ParentDashboard'
import KanaGallery from './features/play/KanaGallery'
import KanaCatchGame from './features/kana-catch/KanaCatchGame'
import DakutenDragGame from './features/dakuten-drag/DakutenDragGame'
import KanaWriteGame from './features/kana-write/KanaWriteGame'
import KotodamaGame from './features/kotodama/KotodamaGame'
import AdventureMap from './features/adventure/AdventureMap'
import LevelEntry from './features/adventure/LevelEntry'
import LevelComplete from './features/adventure/LevelComplete'

export default function App() {
  useEffect(() => { void loadVoices() }, [])

  return (
    <HashRouter>
      <Routes>
        {/* Home + Adventure */}
        <Route path="/" element={<HomeScreen />} />
        <Route path="/adventure" element={<AdventureMap />} />
        <Route path="/adventure/level/:levelId" element={<LevelEntry />} />
        <Route path="/adventure/level/:levelId/complete" element={<LevelComplete />} />
        {/* Free play routes */}
        <Route path="/play" element={<PlayScreen />} />
        <Route path="/play/kana" element={<KanaMatchGame />} />
        <Route path="/play/flashcard" element={<FlashCardDeck />} />
        <Route path="/play/quiz" element={<ListenQuiz />} />
        <Route path="/play/gallery" element={<KanaGallery />} />
        <Route path="/play/kana-catch" element={<KanaCatchGame />} />
        <Route path="/play/dakuten-drag" element={<DakutenDragGame />} />
        <Route path="/play/kana-write" element={<KanaWriteGame />} />
        <Route path="/play/kotodama" element={<KotodamaGame />} />
        <Route path="/parent" element={<ParentDashboard />} />
        {/* Legacy redirects */}
        <Route path="/kid" element={<Navigate to="/" replace />} />
        <Route path="/kid/kana" element={<Navigate to="/play/kana" replace />} />
        <Route path="/kid/flashcard" element={<Navigate to="/play/flashcard" replace />} />
        <Route path="/kid/quiz" element={<Navigate to="/play/quiz" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
