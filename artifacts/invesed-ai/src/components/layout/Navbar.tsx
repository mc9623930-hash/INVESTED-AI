import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, BarChart2, TrendingUp, Search, Trophy, User, Menu, X, Zap, LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';

const navLinks = [
  { href: '/academy', label: 'Academy', icon: BookOpen },
  { href: '/rounds', label: 'Rounds', icon: Zap },
  { href: '/portfolio', label: 'Simulator', icon: BarChart2 },
  { href: '/research', label: 'Research', icon: Search },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { userProfile } = useUser();

  const isLanding = location === '/';
  const isAuth = location.startsWith('/login') || location.startsWith('/signup');

  if (isLanding || isAuth) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block">InvesEd AI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <button className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.startsWith(href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                }`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {userProfile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-primary">{userProfile.xp} XP</span>
                <span className="text-xs text-muted-foreground">Lv{userProfile.level}</span>
              </div>
            )}
            <Link href="/profile">
              <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity">
                {userProfile?.displayName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
              </button>
            </Link>
            <button
              onClick={() => logout()}
              className="hidden sm:flex items-center gap-1 px-2 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 glass border-b border-border/50 md:hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                  <button className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.startsWith(href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:bg-muted'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                </Link>
              ))}
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
