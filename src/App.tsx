import RecoveryBoundary from './components/RecoveryBoundary'
import PracticeSession from './components/PracticeSession'
import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProfileGate from './components/ProfileGate'
import { loadVoices } from './lib/tts'
const HomeScreen=lazy(()=>import('./features/home/HomeScreen'))
const PlayScreen=lazy(()=>import('./features/play/PlayScreen'))
const KanaMatchGame=lazy(()=>import('./features/kana/KanaMatchGame'))
const FlashCardDeck=lazy(()=>import('./features/flashcard/FlashCardDeck'))
const ListenQuiz=lazy(()=>import('./features/quiz/ListenQuiz'))
const ParentDashboard=lazy(()=>import('./features/parent/ParentDashboard'))
const KanaGallery=lazy(()=>import('./features/play/KanaGallery'))
const KanaCatchGame=lazy(()=>import('./features/kana-catch/KanaCatchGame'))
const DakutenDragGame=lazy(()=>import('./features/dakuten-drag/DakutenDragGame'))
const KanaWriteGame=lazy(()=>import('./features/kana-write/KanaWriteGame'))
const KotodamaGame=lazy(()=>import('./features/kotodama/KotodamaGame'))
const AdventureMap=lazy(()=>import('./features/adventure/AdventureMap'))
const LevelEntry=lazy(()=>import('./features/adventure/LevelEntry'))
const LevelComplete=lazy(()=>import('./features/adventure/LevelComplete'))
const ProfileSelector=lazy(()=>import('./features/profiles/ProfileSelector'))
const ProfileCreate=lazy(()=>import('./features/profiles/ProfileCreate'))
const UiReview=lazy(()=>import('./features/journey/UiReview'))
const JourneyScreen=lazy(()=>import('./features/journey/JourneyEntry'))
const ContentReview=lazy(()=>import('./features/journey/ContentReview'))

export default function App() {
  useEffect(() => { void loadVoices() }, [])

  return (
    <RecoveryBoundary><ProfileGate><HashRouter>
      <Suspense fallback={<p role="status">正在準備畫面 / がめんをじゅんびしています…</p>}><Routes>
        {(import.meta.env.DEV || import.meta.env.VITE_P2_REVIEW_PREVIEW === '1') && <Route path="/__review/ui" element={<Suspense fallback={<p role="status">準備畫面中…</p>}><UiReview/></Suspense>}/>}
        {(import.meta.env.DEV || import.meta.env.VITE_P2_REVIEW_PREVIEW === '1') && <Route path="/__review/content" element={<Suspense fallback={<p role="status">準備審閱資料中…</p>}><ContentReview/></Suspense>}/>}
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
      </Routes></Suspense>
    </HashRouter></ProfileGate></RecoveryBoundary>
  )
}
