import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Gift } from 'lucide-react';
import axios from '@/lib/localApi';

const API = '/api';

const RedeemDialog = ({ open, onClose, redemption, balance, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRedeem = async () => {
    if (!redemption) return;

    try {
      setLoading(true);
      setError('');
      
      await axios.post(`${API}/missions/redeem`, {
        redeem_type: redemption.redeem_type,
        points_cost: redemption.points_cost,
        reward_amount: redemption.reward_amount
      });
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al canjear puntos');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!redemption) return null;

  const newBalance = balance?.total_points - redemption.points_cost;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <Gift size={24} className="text-[#00CED1]" />
            Canjear Recompensa
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ¡Canje Exitoso!
            </h3>
            <p className="text-muted-foreground">
              Has canjeado {redemption.points_cost} puntos por {redemption.name}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Redemption Details */}
            <Card className="p-4 bg-[#F7F8FA]">
              <div className="text-center space-y-2">
                <h3 className="font-bold text-lg">{redemption.name}</h3>
                <p className="text-sm text-muted-foreground">{redemption.description}</p>
                <div className="pt-2">
                  <Badge className="bg-[#FFD700] text-black text-base px-4 py-2">
                    {redemption.points_cost} puntos
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Balance Info */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance actual:</span>
                <span className="font-semibold">{balance?.total_points} puntos</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Costo de canje:</span>
                <span className="font-semibold">-{redemption.points_cost} puntos</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="font-medium">Nuevo balance:</span>
                <span className="font-bold text-[#00CED1]">
                  {newBalance} puntos
                </span>
              </div>
            </div>

            {/* Reward Info */}
            {redemption.reward_amount > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  {redemption.redeem_type === 'cash' 
                    ? `Recibirás $${redemption.reward_amount.toFixed(2)} en tu Bóveda Segura`
                    : `Recibirás un descuento de ${redemption.reward_amount}% en tu próximo préstamo`
                  }
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={loading}
              className="bg-[#00CED1] hover:bg-[#00B3B5]"
            >
              {loading ? 'Canjeando...' : 'Confirmar Canje'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Card = ({ className, children }) => (
  <div className={className}>{children}</div>
);

export default RedeemDialog;