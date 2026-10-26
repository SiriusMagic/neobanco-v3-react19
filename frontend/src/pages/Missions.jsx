import React, { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Trophy, Star, Gift, DollarSign, Percent, CheckCircle, ShoppingCart, FileText, Crown, Sparkles } from 'lucide-react';
import RedeemDialog from '../components/RedeemDialog';

const API = '/api';

const Missions = () => {
  const [balance, setBalance] = useState(null);
  const [missions, setMissions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, missionsRes, redemptionsRes, historyRes] = await Promise.all([
        axios.get(`${API}/missions/balance`),
        axios.get(`${API}/missions`),
        axios.get(`${API}/missions/redemptions`),
        axios.get(`${API}/missions/history?limit=10`)
      ]);
      setBalance(balanceRes.data);
      setMissions(missionsRes.data);
      setRedemptions(redemptionsRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (redemption) => {
    setSelectedRedemption(redemption);
    setRedeemDialogOpen(true);
  };

  const handleRedeemSuccess = async () => {
    await fetchData();
    setRedeemDialogOpen(false);
  };

  const getIconComponent = (iconName) => {
    const icons = {
      'crown': Crown,
      'check-circle': CheckCircle,
      'shopping-cart': ShoppingCart,
      'file-text': FileText,
      'dollar-sign': DollarSign,
      'percent': Percent,
      'gift': Gift
    };
    return icons[iconName] || Star;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const activeMissions = missions.filter(m => m.mission_type === 'active');
  const passiveMissions = missions.filter(m => m.mission_type === 'passive');

  return (
    <div className="p-4 md:p-6 space-y-6" data-testid="missions-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <Trophy size={32} className="text-[#FFD700]" />
          Misiones
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gana puntos y canjea recompensas
        </p>
      </div>

      {/* Points Balance */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <Sparkles className="absolute top-4 right-4 w-16 h-16" />
          <Star className="absolute bottom-4 left-4 w-12 h-12" />
          <Trophy className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm opacity-90 mb-1">Tu Balance de Puntos</p>
              <div className="text-5xl md:text-6xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {balance?.total_points || 0}
              </div>
              <p className="text-sm opacity-90 mt-2">Puntos acumulados de por vida: {balance?.lifetime_points || 0}</p>
            </div>
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 text-base px-4 py-2">
              <Star size={18} className="mr-1" />
              Nivel VIP
            </Badge>
          </div>
        </div>
      </Card>

      {/* Active Missions */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <CheckCircle size={24} className="text-[#00CED1]" />
          Misiones Activas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeMissions.map((mission) => {
            const IconComponent = getIconComponent(mission.icon);
            return (
              <Card key={mission.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00CED1]/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent size={24} className="text-[#00CED1]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{mission.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                    <Badge className="bg-[#FFD700] text-black hover:bg-[#FFA500]">
                      +{mission.points} puntos
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Passive Missions */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <Star size={24} className="text-[#E91E63]" />
          Misiones Pasivas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passiveMissions.map((mission) => {
            const IconComponent = getIconComponent(mission.icon);
            return (
              <Card key={mission.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E91E63]/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent size={24} className="text-[#E91E63]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{mission.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                    <Badge className="bg-[#E91E63]/20 text-[#E91E63] hover:bg-[#E91E63]/30">
                      +{mission.points} puntos por acción
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Redemption Store */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <Gift size={24} className="text-[#0284C7]" />
          Tienda de Canje
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {redemptions.map((redemption) => {
            const IconComponent = getIconComponent(redemption.icon);
            const canAfford = balance?.total_points >= redemption.points_cost;
            const comingSoon = redemption.coming_soon;
            
            return (
              <Card 
                key={redemption.id} 
                className={`p-4 ${
                  comingSoon ? 'opacity-60' : canAfford ? 'hover:shadow-lg hover:border-[#00CED1] transition-all cursor-pointer' : 'opacity-50'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    comingSoon ? 'bg-gray-200' : 'bg-[#0284C7]/10'
                  }`}>
                    <IconComponent size={32} className={comingSoon ? 'text-gray-400' : 'text-[#0284C7]'} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{redemption.name}</h3>
                    <p className="text-xs text-muted-foreground">{redemption.description}</p>
                  </div>
                  <div className="w-full">
                    {comingSoon ? (
                      <Badge className="w-full bg-gray-400 text-white">Próximamente</Badge>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-[#FFD700] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {redemption.points_cost} pts
                        </div>
                        <Button
                          onClick={() => handleRedeemClick(redemption)}
                          disabled={!canAfford}
                          className="w-full bg-[#00CED1] hover:bg-[#00B3B5] disabled:bg-gray-300"
                          size="sm"
                        >
                          {canAfford ? 'Canjear' : 'Puntos insuficientes'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Historial de Puntos
          </h2>
          <Card className="p-4 md:p-6">
            <div className="space-y-3">
              {history.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      transaction.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'earn' ? '+' : ''}{transaction.points} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Redeem Dialog */}
      <RedeemDialog
        open={redeemDialogOpen}
        onClose={() => setRedeemDialogOpen(false)}
        redemption={selectedRedemption}
        balance={balance}
        onSuccess={handleRedeemSuccess}
      />
    </div>
  );
};

export default Missions;