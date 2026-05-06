'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Camera, History, Utensils, MessageSquare, Newspaper } from 'lucide-react';
import { useUser } from '@/lib/user-context';

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn } = useUser();

  if (!isLoggedIn) return null;

  const items = [
    { name: 'Home', icon: LayoutDashboard, path: '/' },
    { name: 'Scanner', icon: Camera, path: '/scan' },
    { name: 'News', icon: Newspaper, path: '/news' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Diet', icon: Utensils, path: '/diet-plan' },
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
  ];

  return (
    <nav className="nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        return (
          <Link key={item.name} href={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={24} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
