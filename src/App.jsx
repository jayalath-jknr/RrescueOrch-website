
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import Simulation from './components/Simulation';
import { Bot, Youtube } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      {/* Global Navigation could be here or inside pages */}
      <Routes>
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/simulation" element={<Simulation />} />
      </Routes>
    </BrowserRouter>
  );
}

function HomeWrapper() {
  const navigate = (path) => {
    window.location.href = path; // Simple navigation or use useNavigate
  };

  // Custom navigation hook for button in Home
  // Actually, we pass a prop
  return (
    <>
      <Navbar />
      <Home />
    </>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center p-6 bg-transparent mix-blend-difference text-white">
      <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
        <Bot className="text-rescue-orange" />
        RESCU<span className="text-rescue-orange">ORCH</span>
      </div>
      <div className="flex gap-6 text-sm font-medium">
        <Link to="/" className="hover:text-rescue-orange transition-colors">PRODUCT</Link>
        <Link to="/simulation" className="hover:text-rescue-orange transition-colors">SIMULATION</Link>
        <a href="https://github.com/RescuOrch-v2" target="_blank" className="hover:text-rescue-orange transition-colors">GITHUB</a>
      </div>
    </nav>
  );
}

export default App;
