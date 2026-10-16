import RecoveryBoundary from './components/RecoveryBoundary'
import PracticeSession from './components/PracticeSession'
import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProfileGate from './components/ProfileGate'
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
import ProfileSelector from './features/profiles/ProfileSelector'
import ProfileCreate from './features/profiles/ProfileCreate'
const UiReview=lazy(()=>import('./features/journey/UiReview'))
const JourneyScreen=lazy(()=>import('./features/journey/JourneyScreen'))

export default function App() {
  useEffect(() => { void loadVoices() }, [])

  return (
    <RecoveryBoundary><ProfileGate><HashRouter>
      <Routes>
        {(import.meta.env.DEV || import.meta.env.VITE_P2_REVIEW_PREVIEW === '1') && <Route path="/__review/ui" element={<Suspense fallback={<p role="status">準備畫面中…</p>}><UiReview/></Suspense>}/>}
        {(import.meta.env.DEV || import.meta.env.VITE_P2_REVIEW_PREVIEW === '1') && <Route path="/preview/adventure" element={<Suspense fallback={<p role="status">準備旅程中…</p>}><JourneyScreen/></Suspense>}/>}
        {/* Profiles */}
        <Route path="/profiles" element={<ProfileSelector />} />
        <Route path="/profiles/new" element={<ProfileCreate />} />
        {/* Home + Adventure */}
        <Route path="/" element={<HomeScreen />} />
        <Route path="/adventure" element={<AdventureMap />} />
        <Route path="/adventure/level/:levelId" element={<LevelEntry />} />
        <Route path="/adventure/level/:levelId/complete" element={<LevelComplete />} />
        {/* Free play routes */}
        <Route path="/play" element={<PlayScreen />} />
        <Route path="/play/kana" element={<PracticeSession feature="kana"><KanaMatchGame /></PracticeSession>} />
        <Route path="/play/flashcard" element={<PracticeSession feature="flashcard"><FlashCardDeck /></PracticeSession>} />
        <Route path="/play/quiz" element={<PracticeSession feature="quiz"><ListenQuiz /></PracticeSession>} />
        <Route path="/play/gallery" element={<KanaGallery />} />
        <Route path="/play/kana-catch" element={<PracticeSession feature="kana_catch"><KanaCatchGame /></PracticeSession>} />
        <Route path="/play/dakuten-drag" element={<PracticeSession feature="dakuten_drag"><DakutenDragGame /></PracticeSession>} />
        <Route path="/play/kana-write" element={<PracticeSession feature="kana_write"><KanaWriteGame /></PracticeSession>} />
        <Route path="/play/kotodama" element={<PracticeSession feature="kotodama"><KotodamaGame /></PracticeSession>} />
        <Route path="/parent" element={<ParentDashboard />} />
        {/* Legacy redirects */}
        <Route path="/kid" element={<Navigate to="/" replace />} />
        <Route path="/kid/kana" element={<Navigate to="/play/kana" replace />} />
        <Route path="/kid/flashcard" element={<Navigate to="/play/flashcard" replace />} />
        <Route path="/kid/quiz" element={<Navigate to="/play/quiz" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter></ProfileGate></RecoveryBoundary>
  )
}
