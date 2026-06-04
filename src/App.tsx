import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { loadVoices } from './lib/tts';
import { useAppStore } from './store/useAppStore';
import HomeScreen from './features/home/HomeScreen';
import PlayScreen from './features/play/PlayScreen';
import KanaMatchGame from './features/kana/KanaMatchGame';
import FlashCardDeck from './features/flashcard/FlashCardDeck';
import ListenQuiz from './features/quiz/ListenQuiz';
import ParentDashboard from './features/parent/ParentDashboard';
import KanaGallery from './features/play/KanaGallery';
import KanaCatchGame from './features/kana-catch/KanaCatchGame';
import DakutenDragGame from './features/dakuten-drag/DakutenDragGame';
import KanaWriteGame from './features/kana-write/KanaWriteGame';
import KotodamaGame from './features/kotodama/KotodamaGame';
import AdventureMap from './features/adventure/AdventureMap';
import LevelEntry from './features/adventure/LevelEntry';
import LevelComplete from './features/adventure/LevelComplete';
import ProfileSelect from './features/profiles/ProfileSelect';

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { activeProfileId } = useAppStore();
  if (!activeProfileId) return <Navigate to="/profiles" replace />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    void loadVoices();
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Profile selection — always accessible */}
        <Route path="/profiles" element={<ProfileSelect />} />
        {/* Parent dashboard — accessible without profile */}
        <Route path="/parent" element={<ParentDashboard />} />
        {/* Home + Adventure (require profile) */}
        <Route
          path="/"
          element={
            <RequireProfile>
              <HomeScreen />
            </RequireProfile>
          }
        />
        <Route
          path="/adventure"
          element={
            <RequireProfile>
              <AdventureMap />
            </RequireProfile>
          }
        />
        <Route
          path="/adventure/level/:levelId"
          element={
            <RequireProfile>
              <LevelEntry />
            </RequireProfile>
          }
        />
        <Route
          path="/adventure/level/:levelId/complete"
          element={
            <RequireProfile>
              <LevelComplete />
            </RequireProfile>
          }
        />
        {/* Free play routes (require profile) */}
        <Route
          path="/play"
          element={
            <RequireProfile>
              <PlayScreen />
            </RequireProfile>
          }
        />
        <Route
          path="/play/kana"
          element={
            <RequireProfile>
              <KanaMatchGame />
            </RequireProfile>
          }
        />
        <Route
          path="/play/flashcard"
          element={
            <RequireProfile>
              <FlashCardDeck />
            </RequireProfile>
          }
        />
        <Route
          path="/play/quiz"
          element={
            <RequireProfile>
              <ListenQuiz />
            </RequireProfile>
          }
        />
        <Route
          path="/play/gallery"
          element={
            <RequireProfile>
              <KanaGallery />
            </RequireProfile>
          }
        />
        <Route
          path="/play/kana-catch"
          element={
            <RequireProfile>
              <KanaCatchGame />
            </RequireProfile>
          }
        />
        <Route
          path="/play/dakuten-drag"
          element={
            <RequireProfile>
              <DakutenDragGame />
            </RequireProfile>
          }
        />
        <Route
          path="/play/kana-write"
          element={
            <RequireProfile>
              <KanaWriteGame />
            </RequireProfile>
          }
        />
        <Route
          path="/play/kotodama"
          element={
            <RequireProfile>
              <KotodamaGame />
            </RequireProfile>
          }
        />
        {/* Legacy redirects */}
        <Route path="/kid" element={<Navigate to="/" replace />} />
        <Route
          path="/kid/kana"
          element={<Navigate to="/play/kana" replace />}
        />
        <Route
          path="/kid/flashcard"
          element={<Navigate to="/play/flashcard" replace />}
        />
        <Route
          path="/kid/quiz"
          element={<Navigate to="/play/quiz" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
