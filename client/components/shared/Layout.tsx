import { Link, useLocation } from "react-router-dom";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";

export default function Layout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const NavLink = ({ to, label }: { to: string; label: string }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        location.pathname === to
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100",
      )}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="sticky top-0 z-40 backdrop-blur bg-gradient-to-r from-slate-50 to-white/90 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="https://cdn.builder.io/api/v1/image/assets%2Ffe5e25e2efb34dba8a63944468d2f93e%2F9eb8f43f8c99423bb23b25cc3d6784b6?format=webp&width=96" alt="KV Logo" className="h-8 w-8 rounded"/>
              <div className="text-base sm:text-lg font-bold text-slate-900">
                KV ITBP Class 8 Portal
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              <NavLink to="/" label="Home" />
            </nav>
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md h-10 w-10 hover:bg-slate-100"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle Menu"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 flex flex-col gap-2">
              <NavLink to="/" label="Home" />
            </div>
          </div>
        )}
        <div className="h-1 w-full flex"><div style={{backgroundColor:"hsl(var(--brand-saffron))"}} className="flex-1"/><div style={{backgroundColor:"hsl(var(--brand-white,0 0% 100%))"}} className="w-1"/><div style={{backgroundColor:"hsl(var(--brand-green))"}} className="flex-1"/></div>
      </header>
      <main className="flex-1 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">{children}</div>
      </main>
      <footer className="border-t bg-white/90">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-600">
          Created by <span className="text-brand-gradient font-semibold">Vaibhav</span>, Class 8, KV ITBP Second Shift, Dehradun
        </div>
      </footer>
    </div>
  );
}
