import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CelebrationOverlay from './components/Celebration';
import NavBar from './components/NavBar';
import Achievements from './pages/Achievements';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import WeekPlan from './pages/WeekPlan';
import Workout from './pages/Workout';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const hasProfile = useAppStore((s) => !!s.profile && !!s.plan);
  const ensureCurrentWeek = useAppStore((s) => s.ensureCurrentWeek);

  useEffect(() => {
    ensureCurrentWeek();
    const onFocus = () => ensureCurrentWeek();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [ensureCurrentWeek]);

  if (!hasProfile) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-5">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/week" element={<WeekPlan />} />
          <Route path="/workout/:day" element={<Workout />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <NavBar />
      <CelebrationOverlay />
    </>
  );
}
