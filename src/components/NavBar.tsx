import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Base', icon: '🏰' },
  { to: '/week', label: 'Week', icon: '🗺️' },
  { to: '/achievements', label: 'Trophies', icon: '🏆' },
  { to: '/profile', label: 'Hero', icon: '🧙' },
];

export default function NavBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `flex flex-1 flex-col items-center py-2 text-xs font-bold transition ${isActive ? 'text-fuchsia-300' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="text-xl">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
