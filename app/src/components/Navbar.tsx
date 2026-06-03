import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Code2, LogOut, UserCircle } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import type { User } from '@/types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/keys') || 
                      location.pathname.startsWith('/usage') || 
                      location.pathname.startsWith('/settings');

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-yemen-600 to-yemen-800 shadow-lg shadow-yemen-600/20">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">Yemen API</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:block">Gateway</span>
          </div>
        </Link>

        <div className="hidden md:flex md:items-center md:gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/dashboard"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isDashboard ? 'bg-yemen-50 text-yemen-700' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="sm" className="bg-yemen-600 hover:bg-yemen-700 text-white" onClick={() => navigate('/login?tab=register')}>
                Get Started
              </Button>
            </>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col gap-6 pt-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yemen-600 to-yemen-800">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">Yemen API Gateway</span>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-yemen-700 bg-yemen-50"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
              <div className="border-t pt-4">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-3">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { onLogout(); setMobileOpen(false); }} className="justify-start text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                      Sign In
                    </Button>
                    <Button className="bg-yemen-600 hover:bg-yemen-700 text-white" onClick={() => { navigate('/login?tab=register'); setMobileOpen(false); }}>
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
