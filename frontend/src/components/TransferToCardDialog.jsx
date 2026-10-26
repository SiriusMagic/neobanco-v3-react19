import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, CheckCircle } from 'lucide-react';
import axios from '@/lib/localApi';

const API = '/api';

const TransferToCardDialog = ({ open, onClose, vault, cards, onSuccess }) => {
  const [selectedCardId, setSelectedCardId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleTransfer = async () => {
    if (!selectedCardId || !amount || parseFloat(amount) <= 0) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (parseFloat(amount) > vault?.balance) {
      setError('Saldo insuficiente en la bóveda');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await axios.post(`${API}/vault/transfer-to-card`, {
        card_id: selectedCardId,
        amount: parseFloat(amount)
      });
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al realizar la transferencia');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCardId('');
    setAmount('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const selectedCard = cards.find(c => c.id === selectedCardId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Recargar Tarjeta
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ¡Transferencia Exitosa!
            </h3>
            <p className="text-muted-foreground">
              ${parseFloat(amount).toFixed(2)} transferidos a tu tarjeta
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Vault Balance */}
            <div className="p-4 bg-[#E0F2FE] rounded-lg">
              <p className="text-sm text-muted-foreground">Balance disponible en bóveda</p>
              <p className="text-2xl font-bold text-[#0284C7]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                ${vault?.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Card Selection */}
            <div className="space-y-2">
              <Label>Selecciona la tarjeta de destino</Label>
              <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.type === 'debit' ? 'Débito' : card.type === 'credit' ? 'Crédito' : 'Desechable'} 
                      •••• {card.last4} - ${card.balance.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="transfer-amount">Monto a transferir</Label>
              <Input
                id="transfer-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                max={vault?.balance}
                step="0.01"
              />
            </div>

            {/* Preview */}
            {selectedCard && amount && parseFloat(amount) > 0 && (
              <div className="p-4 bg-[#F7F8FA] rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance actual de tarjeta:</span>
                  <span className="font-semibold">${selectedCard.balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monto a transferir:</span>
                  <span className="font-semibold">+${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-medium">Nuevo balance de tarjeta:</span>
                  <span className="font-bold text-[#00CED1]">
                    ${(selectedCard.balance + parseFloat(amount)).toFixed(2)}
                  </span>
                </div>
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
              onClick={handleTransfer}
              disabled={!selectedCardId || !amount || parseFloat(amount) <= 0 || loading}
              className="bg-[#0284C7] hover:bg-[#0369A1]"
            >
              {loading ? 'Transfiriendo...' : 'Confirmar Transferencia'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransferToCardDialog;