import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';

export function Header() {
  const location = useLocation();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/characters', label: '角色广场' },
    { to: '/chat', label: '对话' },
    { to: '/memories', label: '记忆' },
    { to: '/settings', label: '设置' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-tan/50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-golden transition-colors cursor-pointer"
            onClick={toggleSidebar}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <Link to="/" className="text-lg font-bold text-espresso tracking-tight no-underline">
            <span className="text-amber">✦</span> 角色聊天室
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to ||
              (link.to !== '/' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline
                  ${isActive
                    ? 'bg-amber/15 text-amber'
                    : 'text-mocha hover:text-espresso hover:bg-golden'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
