import React, { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Check } from 'lucide-react';

const API = '/api';

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        axios.get(`${API}/subscription-plans`),
        axios.get(`${API}/subscription`)
      ]);
      setPlans(plansRes.data);
      setCurrentSubscription(subRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planLevel) => {
    try {
      await axios.post(`${API}/subscription?plan_level=${planLevel}`);
      await fetchData();
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const getIconEmoji = (level) => {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎'
    };
    return icons[level] || '⭐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6" data-testid="subscriptions-page">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Subscripciones
        </h1>
        
        {/* Info Banner */}
        <Card className="p-4 md:p-6 bg-linear-to-r from-[#00CED1] to-[#0284C7] text-white border-0">
          <p className="text-sm md:text-base leading-relaxed">
            Cuando pagas subscripciones, tienes acceso a <strong>microcréditos</strong>, sin revisar buró, 
            sin trámites ni rellenar encuestas, ni justificar en qué lo utilizarás.
          </p>
        </Card>
      </div>

      {/* Current Plan */}
      {currentSubscription && (
        <Card className="p-4 md:p-6 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plan Actual</p>
              <p className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {getIconEmoji(currentSubscription.plan)} Nivel {plans.find(p => p.level === currentSubscription.plan)?.name}
              </p>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600 text-white">Activo</Badge>
          </div>
        </Card>
      )}

      {/* Subscription Plans */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          ✨ Niveles de Suscripción de Crédito y Beneficios
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.level}
              className={`p-4 md:p-6 relative ${
                currentSubscription?.plan === plan.level 
                  ? 'ring-2 ring-[#00CED1] bg-[#E5FCFD]' 
                  : 'bg-white hover:shadow-lg transition-shadow'
              }`}
            >
              {/* Plan Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getIconEmoji(plan.level)}</div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Nivel {plan.name}
                    </h3>
                    <p className="text-2xl md:text-3xl font-bold text-[#00CED1]">
                      ${plan.monthly_fee}
                      <span className="text-sm text-muted-foreground">/mes</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tasa de Interés Mensual</p>
                    <p className="text-lg font-bold text-[#E91E63]">{plan.interest_rate}%</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Check size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Límite de Préstamo</p>
                    <p className="text-base font-semibold">${plan.loan_limit.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Check size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Acceso a Créditos Mayores</p>
                    <p className="text-base">
                      {plan.microcredit_only 
                        ? 'Microcréditos Solamente' 
                        : plan.major_loans_limit === -1 
                          ? 'Microcréditos + Préstamos Mayores Ilimitados'
                          : `Microcréditos + ${plan.major_loans_limit} Préstamo Mayor`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleSubscribe(plan.level)}
                disabled={currentSubscription?.plan === plan.level}
                className={`w-full ${
                  currentSubscription?.plan === plan.level
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#00CED1] hover:bg-[#00B3B5]'
                }`}
              >
                {currentSubscription?.plan === plan.level ? 'Plan Actual' : 'Seleccionar Plan'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;