import React, { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Lock, ArrowRight, TrendingUp, TrendingDown, Shield, Target, Building2, Users, Send } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from '../components/ui/sonner';

const API = '/api';

const Home = () => {
  const navigate = useNavigate();
  const [vault, setVault] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [missions, setMissions] = useState(null);
  const [insurance, setInsurance] = useState(null);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [vaultRes, statsRes, missionsRes, insuranceRes] = await Promise.all([
        axios.get(`${API}/vault`),
        axios.get(`${API}/vault/stats`),
        axios.get(`${API}/missions`),
        axios.get(`${API}/insurance`)
      ]);

      setVault(vaultRes.data);
      setStats(statsRes.data);
      setRecentTransactions(vaultRes.data.history?.slice(0, 5) || []);
      setMissions(missionsRes.data);
      setInsurance(insuranceRes.data);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }
    
    try {
      await axios.post(`${API}/vault/transfer-to-card`, {
        amount: parseFloat(transferAmount)
      });
      toast.success('Transferencia exitosa');
      setShowTransferDialog(false);
      setTransferAmount('');
      fetchHomeData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al transferir');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6" data-testid="home-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Bienvenido a tu Centro Financiero
        </h1>
        <p className="text-muted-foreground mt-1">Tu dinero, seguro y siempre disponible</p>
      </div>

      {/* Main Vault Module */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200" data-testid="vault-module">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bóveda Segura</p>
                <h2 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {vault?.name || 'Mi Bóveda Principal'}
                </h2>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Saldo Total Protegido</p>
            <h3 className="text-4xl md:text-5xl font-bold text-blue-900">
              ${vault?.balance?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </h3>
          </div>

          <Button 
            size="lg" 
            className="w-full md:w-auto mt-4"
            onClick={() => setShowTransferDialog(true)}
            data-testid="transfer-to-cards-btn"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Transferir a Tarjetas
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Transacciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" className="h-auto py-4 justify-start" data-testid="bank-reload-btn">
            <Building2 className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Recarga Banco del Barrio</p>
              <p className="text-xs text-muted-foreground">Depositar efectivo</p>
            </div>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 justify-start" data-testid="request-money-btn">
            <Users className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Pedir a Contactos</p>
              <p className="text-xs text-muted-foreground">Solicitar dinero</p>
            </div>
          </Button>
          
          <Button variant="outline" className="h-auto py-4 justify-start" data-testid="external-transfer-btn">
            <Send className="w-5 h-5 mr-3" />
            <div className="text-left">
              <p className="font-medium">Transferir a Cuentas Externas</p>
              <p className="text-xs text-muted-foreground">Otros bancos</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Stats & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Resumen del Mes
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${stats?.monthly_income?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Egresos Totales</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${stats?.monthly_expenses?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Flow Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Flujo de Dinero
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.flow_chart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="income" fill="#10b981" name="Ingresos" />
              <Bar dataKey="expenses" fill="#ef4444" name="Egresos" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Últimas Transacciones
        </h3>
        {recentTransactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No hay transacciones recientes</p>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString('es-ES')}</p>
                </div>
                <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Promotional Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Insurance Widget */}
        <Card 
          className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/seguros')}
          data-testid="insurance-widget"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              {insurance?.has_insurance ? (
                <>
                  <h4 className="font-semibold text-purple-900 mb-1">Estás Cubierto</h4>
                  <p className="text-sm text-purple-700">Tu Plan {insurance.plan_name} está activo.</p>
                </>
              ) : (
                <>
                  <h4 className="font-semibold text-purple-900 mb-1">Tu Bóveda necesita un Paracaídas</h4>
                  <p className="text-sm text-purple-700">¡Protégete al 100% con el Plan Único!</p>
                </>
              )}
              <ArrowRight className="w-5 h-5 text-purple-600 mt-2" />
            </div>
          </div>
        </Card>

        {/* Missions Widget */}
        <Card 
          className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/misiones')}
          data-testid="missions-widget"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">Puntos de Misión</h4>
              <p className="text-sm text-orange-700">
                Llevas <span className="font-bold">{missions?.points || 0} Puntos</span> acumulados.
              </p>
              <p className="text-xs text-orange-600 mt-1">¡Canjea por efectivo o descuentos!</p>
              <ArrowRight className="w-5 h-5 text-orange-600 mt-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir a Tarjetas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto a Transferir</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Saldo disponible: ${vault?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <Button onClick={handleTransfer} className="w-full">Transferir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;