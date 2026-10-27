import { Suspense, lazy, useState, useEffect } from 'react';
import './App.css';
import axios from '@/lib/localApi';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Button } from './components/ui/button';
import { Search, Menu } from 'lucide-react';

// Cada página se descarga solo cuando se visita (carga inicial más rápida).
const Home = lazy(() => import('./pages/Home'));
const Cards = lazy(() => import('./pages/Cards'));
const Goals = lazy(() => import('./pages/Goals'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Loans = lazy(() => import('./pages/Loans'));
const Vault = lazy(() => import('./pages/Vault'));
const Missions = lazy(() => import('./pages/Missions'));
const Insurance = lazy(() => import('./pages/Insurance'));
const Profile = lazy(() => import('./pages/Profile'));

const API = '/api';

function App() {
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('tarjetas');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Try to fetch cards first
      const response = await axios.get(`${API}/cards`);
      if (response.data && response.data.length > 0) {
        setSeeded(true);
      } else {
        setSeeded(false);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      setSeeded(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        axios.post(`${API}/dev/seed`),
        axios.post(`${API}/dev/seed-goals`)
      ]);
      await initializeApp();
    } catch (error) {
      console.error('Error seeding data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))]">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#00CED1] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>aira</div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!seeded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))] px-4">
        <div className="text-center space-y-4">
          <div className="text-3xl font-bold text-[#00CED1] mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>aira</div>
          <p className="text-muted-foreground mb-4">No hay datos disponibles</p>
          <Button onClick={handleSeedData} className="bg-[#00CED1] hover:bg-[#00B3B5]">
            Cargar datos de ejemplo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-[hsl(var(--background))]" data-testid="app-container">
        <Sidebar 
          isMobileOpen={mobileMenuOpen} 
          onMobileClose={() => setMobileMenuOpen(false)}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        
        <main className="flex-1 overflow-auto w-full">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4 flex-1">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden hover:bg-[#F7F8FA]"
                  data-testid="mobile-menu-button"
                >
                  <Menu size={24} />
                </Button>
                
                <h1 className="text-xl md:text-2xl font-bold text-[#111827]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>aira</h1>
                
                {/* Search Bar - Hidden on small mobile */}
                <div className="hidden sm:flex items-center gap-2 bg-[#F7F8FA] px-3 md:px-4 py-2 rounded-lg w-full max-w-sm">
                  <Search size={18} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Escoger diseños"
                    className="bg-transparent border-0 outline-hidden w-full text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#00CED1] flex items-center justify-center text-white font-semibold text-sm md:text-base">
                  JN
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <Suspense fallback={<p className="p-6 text-muted-foreground">Cargando…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/caja-fuerte" element={<Vault />} />
            <Route path="/tarjetas" element={<Cards />} />
            <Route path="/metas" element={<Goals />} />
            <Route path="/misiones" element={<Missions />} />
            <Route path="/subscripcion" element={<Subscriptions />} />
            <Route path="/prestamos" element={<Loans />} />
            <Route path="/seguros" element={<Insurance />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/ajustes" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;