import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { loadVoices } from './lib/tts'
import HomeScreen from './features/home/HomeScreen'
import KanaMatchGame from './features/kana/KanaMatchGame'
import FlashCardDeck from './features/flashcard/FlashCardDeck'
import ListenQuiz from './features/quiz/ListenQuiz'
import ParentDashboard from './features/parent/ParentDashboard'

export default function App() {
  useEffect(() => { void loadVoices() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/kid" replace />} />
        <Route path="/kid" element={<HomeScreen />} />
        <Route path="/kid/kana" element={<KanaMatchGame />} />
        <Route path="/kid/flashcard" element={<FlashCardDeck />} />
        <Route path="/kid/quiz" element={<ListenQuiz />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="*" element={<Navigate to="/kid" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
