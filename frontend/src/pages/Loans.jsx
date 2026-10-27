import { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import { toast } from '../components/ui/sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, DollarSign, Briefcase, Building2, AlertCircle } from 'lucide-react';

const API = '/api';

const Loans = () => {
  const [view, setView] = useState('menu'); // menu, microcredit, personal, business
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, plansRes, loansRes] = await Promise.all([
        axios.get(`${API}/subscription`),
        axios.get(`${API}/subscription-plans`),
        axios.get(`${API}/loans`)
      ]);
      setSubscription(subRes.data);
      setPlans(plansRes.data);
      setLoans(loansRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanRequest = async (loanType, amount) => {
    try {
      setError('');
      await axios.post(`${API}/loans`, {
        loan_type: loanType,
        amount: amount,
        cedula: loanType === 'personal' ? cedula : null
      });
      
      toast.success(
        loanType === 'microcredit' 
          ? `¡Microcrédito aprobado! $${amount} estará disponible en tu cuenta.`
          : 'Solicitud enviada. Te contactaremos pronto.'
      );
      await fetchData();
      setView('menu');
      setSelectedAmount(null);
      setCustomAmount('');
      setCedula('');
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al procesar la solicitud');
    }
  };

  const currentPlan = plans.find(p => p.level === subscription?.plan);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Card className="p-6 md:p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Sin Suscripción Activa
          </h2>
          <p className="text-muted-foreground mb-4">
            Necesitas una suscripción activa para acceder a préstamos.
          </p>
          <Button 
            onClick={() => window.location.href = '/subscripcion'}
            className="bg-[#00CED1] hover:bg-[#00B3B5]"
          >
            Ver Planes de Suscripción
          </Button>
        </Card>
      </div>
    );
  }

  // Menu Principal
  if (view === 'menu') {
    return (
      <div className="p-4 md:p-6 space-y-6" data-testid="loans-page">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Préstamos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Accede a diferentes opciones de financiamiento
          </p>
        </div>

        {/* Current Plan Display */}
        <Card className="p-4 bg-linear-to-r from-[#FFD700] to-[#FFA500] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Plan Activo</p>
              <p className="text-xl font-bold">Nivel {currentPlan?.name}</p>
              <p className="text-sm">Tasa: {currentPlan?.interest_rate}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Límite Disponible</p>
              <p className="text-2xl font-bold">${currentPlan?.loan_limit.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Loan Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Microcredits */}
          <Card 
            className="p-6 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setView('microcredit')}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#00CED1]/10 flex items-center justify-center group-hover:bg-[#00CED1] transition-colors">
                <DollarSign size={32} className="text-[#00CED1] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Microcréditos
              </h3>
              <p className="text-sm text-muted-foreground">
                Acceso instantáneo por suscripción
              </p>
              <Badge className="bg-green-500 text-white">Disponible</Badge>
            </div>
          </Card>

          {/* Personal Loans */}
          <Card 
            className="p-6 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setView('personal')}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#E91E63]/10 flex items-center justify-center group-hover:bg-[#E91E63] transition-colors">
                <Briefcase size={32} className="text-[#E91E63] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Préstamos Personales
              </h3>
              <p className="text-sm text-muted-foreground">
                Montos mayores
              </p>
              {currentPlan?.microcredit_only ? (
                <Badge className="bg-gray-400 text-white">Requiere Oro/Platino</Badge>
              ) : (
                <Badge className="bg-green-500 text-white">Disponible</Badge>
              )}
            </div>
          </Card>

          {/* Business Loans */}
          <Card className="p-6 opacity-60">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <Building2 size={32} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Préstamos para Negocios
              </h3>
              <p className="text-sm text-muted-foreground">
                Próximamente
              </p>
              <Badge className="bg-gray-400 text-white">Próximamente</Badge>
            </div>
          </Card>
        </div>

        {/* Active Loans */}
        {loans.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Préstamos Activos
            </h2>
            <div className="space-y-3">
              {loans.map((loan) => (
                <Card key={loan.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {loan.loan_type === 'microcredit' ? 'Microcrédito' : 'Préstamo Personal'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(loan.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${loan.amount.toFixed(2)}</p>
                      <Badge className={loan.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {loan.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Microcredit View
  if (view === 'microcredit') {
    const predefinedAmounts = [25, 50, 75, 100];
    
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Button variant="ghost" onClick={() => setView('menu')} className="mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </Button>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Microcréditos
          </h1>
        </div>

        {/* Plan Info */}
        <Card className="p-4 bg-[#E5FCFD]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plan {currentPlan?.name} Activo</p>
              <p className="text-lg font-bold">Tasa del {currentPlan?.interest_rate}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Límite</p>
              <p className="text-lg font-bold">${currentPlan?.loan_limit}</p>
            </div>
          </div>
        </Card>

        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        {/* Amount Selection */}
        <div>
          <Label className="text-base mb-3 block">Selecciona el monto</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? 'default' : 'outline-solid'}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
                className={`h-16 text-lg ${
                  selectedAmount === amount ? 'bg-[#00CED1] hover:bg-[#00B3B5]' : ''
                }`}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div>
          <Label htmlFor="custom-amount">Monto personalizado</Label>
          <Input
            id="custom-amount"
            type="number"
            placeholder={`Máximo $${currentPlan?.loan_limit}`}
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            min="1"
            max={currentPlan?.loan_limit}
            step="0.01"
          />
        </div>

        {/* Submit */}
        <Button
          onClick={() => {
            const amount = selectedAmount || parseFloat(customAmount);
            if (amount > 0) {
              handleLoanRequest('microcredit', amount);
            }
          }}
          disabled={!selectedAmount && !customAmount}
          className="w-full bg-[#00CED1] hover:bg-[#00B3B5] h-12"
        >
          Solicitar Microcrédito
        </Button>
      </div>
    );
  }

  // Personal Loan View
  if (view === 'personal') {
    if (currentPlan?.microcredit_only) {
      return (
        <div className="p-4 md:p-6 space-y-6">
          <Button variant="ghost" onClick={() => setView('menu')} className="mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Volver
          </Button>

          <Card className="p-6 md:p-8 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Actualiza tu Plan
            </h2>
            <p className="text-muted-foreground mb-4">
              Los préstamos personales solo están disponibles en planes Oro y Platino.
            </p>
            <Button 
              onClick={() => window.location.href = '/subscripcion'}
              className="bg-[#00CED1] hover:bg-[#00B3B5]"
            >
              Ver Planes
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-6 space-y-6">
        <Button variant="ghost" onClick={() => setView('menu')} className="mb-4">
          <ArrowLeft size={20} className="mr-2" />
          Volver
        </Button>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Préstamos Personales
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Completa el formulario para solicitar un préstamo
          </p>
        </div>

        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cedula">Número de Cédula</Label>
              <Input
                id="cedula"
                placeholder="123456789"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="loan-amount">Monto solicitado</Label>
              <Input
                id="loan-amount"
                type="number"
                placeholder="5000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="bg-[#F7F8FA] p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Tu solicitud será revisada por nuestro equipo. 
                Te contactaremos en las próximas 24-48 horas.
              </p>
            </div>

            <Button
              onClick={() => {
                const amount = parseFloat(customAmount);
                if (amount > 0 && cedula) {
                  handleLoanRequest('personal', amount);
                }
              }}
              disabled={!cedula || !customAmount}
              className="w-full bg-[#E91E63] hover:bg-[#C2185B] h-12"
            >
              Enviar Solicitud
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default Loans;