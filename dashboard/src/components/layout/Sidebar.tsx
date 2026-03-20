'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Brain,
  FileText,
  Terminal,
  HardDrive,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

const navItems = [
  { href: '/kanban', label: 'Tablero', icon: LayoutDashboard },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
  { href: '/proyectos', label: 'Proyectos', icon: FolderKanban },
  { href: '/memorias', label: 'Memorias', icon: Brain },
  { href: '/documentos', label: 'Documentos', icon: FileText },
  { href: '/cronjobs', label: 'Cron Jobs', icon: Terminal },
  { href: '/backups', label: 'Backups', icon: HardDrive },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <aside className="w-56 bg-sidebar-bg border-r border-card-border flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-card-border">
        <h1 className="text-lg font-bold text-accent">Panel de Control</h1>
        <p className="text-xs text-muted mt-1">Centro de Agentes</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-muted hover:text-foreground hover:bg-card-bg'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-card-border">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-card-bg transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
      </div>
    </aside>
  );
}
