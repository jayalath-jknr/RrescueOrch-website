
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Simulation from './components/Simulation';
import { Bot, ArrowUpRight } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/simulation" element={<Simulation />} />
      </Routes>
      {/* Subtle noise texture overlay */}
      <div className="noise-overlay" />
    </BrowserRouter>
  );
}

function HomeWrapper() {
  return (
    <>
      <Navbar />
      <Home />
      <Footer />
    </>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-nav py-3 shadow-lg shadow-black/20'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-lg bg-rescue-orange/10 group-hover:bg-rescue-orange/20 transition-colors">
            <Bot className="w-5 h-5 text-rescue-orange" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            RESCU<span className="text-rescue-orange">ORCH</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          <NavLink to="/" label="Product" />
          <NavLink to="/simulation" label="Simulation" />
          <a
            href="https://github.com/RescuOrch-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
          >
            GitHub
            <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
          </a>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        isActive
          ? 'text-rescue-orange bg-rescue-orange/[0.08]'
          : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
      }`}
    >
      {label}
    </Link>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.04] bg-rescue-dark">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <Bot className="w-4 h-4 text-rescue-orange" />
          <span className="font-bold text-sm tracking-tight text-gray-400">
            RESCU<span className="text-rescue-orange">ORCH</span>
          </span>
        </div>
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} RescuOrch. Autonomous rescue orchestration.
        </p>
        <div className="flex gap-6 text-xs text-gray-500">
          <a href="https://github.com/RescuOrch-v2" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <span className="text-gray-700">|</span>
          <Link to="/simulation" className="hover:text-white transition-colors">Simulation</Link>
        </div>
      </div>
    </footer>
  );
}

export default App;
