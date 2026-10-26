import React, { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import { Button } from './ui/button';
import { Lock, Unlock, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Copy, Trash2, Shield } from 'lucide-react';
import { Card } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from './ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

const API = '/api';

const CardDetailPanel = ({ card, onCardUpdate, onReturnFunds, onDestroyCard }) => {
  const [history, setHistory] = useState([]);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [freezing, setFreezing] = useState(false);
  const [destroying, setDestroying] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  const isDisposable = card?.type === 'disposable' || card?.type === 'virtual';
  const isFixed = card?.type === 'debit' || card?.type === 'credit';

  useEffect(() => {
    if (card?.id) {
      fetchHistory();
    }
  }, [card?.id]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/cards/${card.id}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleFreeze = async () => {
    setFreezing(true);
    try {
      await axios.patch(`${API}/cards/${card.id}/freeze`, {
        frozen: !card.frozen
      });
      onCardUpdate({ ...card, frozen: !card.frozen });
      toast.success(card.frozen ? 'Tarjeta desbloqueada' : 'Tarjeta congelada');
    } catch (error) {
      console.error('Error freezing card:', error);
      toast.error('Error al actualizar el estado de la tarjeta');
    } finally {
      setFreezing(false);
    }
  };

  const handleSendMoney = async () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }
    try {
      await axios.post(`${API}/cards/${card.id}/send`, { amount: parseFloat(sendAmount) });
      toast.success(`$${parseFloat(sendAmount).toFixed(2)} enviados exitosamente`);
      setShowSendDialog(false);
      setSendAmount('');
      // Refresh card data
      onCardUpdate({ ...card, balance: card.balance - parseFloat(sendAmount) });
    } catch (error) {
      toast.error('Error al enviar dinero');
    }
  };

  const handleReceiveMoney = async () => {
    if (!receiveAmount || parseFloat(receiveAmount) <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }
    try {
      await axios.post(`${API}/cards/${card.id}/receive`, { amount: parseFloat(receiveAmount) });
      toast.success(`$${parseFloat(receiveAmount).toFixed(2)} recibidos exitosamente`);
      setShowReceiveDialog(false);
      setReceiveAmount('');
      onCardUpdate({ ...card, balance: card.balance + parseFloat(receiveAmount) });
    } catch (error) {
      toast.error('Error al recibir dinero');
    }
  };

  const handleReturnFunds = async () => {
    if (card.balance <= 0) {
      toast.error('No hay fondos para devolver');
      return;
    }
    await onReturnFunds(card.id);
  };

  const handleDestroy = async () => {
    if (destroying) return;
    
    setDestroying(true);
    setTimeout(async () => {
      await onDestroyCard(card.id);
      setDestroying(false);
    }, 800);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const chartData = history.slice(0, 7).reverse().map(item => ({
    date: new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    amount: item.amount
  }));

  if (!card) {
    return null;
  }

  return (
    <div className={`space-y-4 transition-all duration-800 ${destroying ? 'animate-pulse opacity-50' : ''}`} data-testid="card-detail-panel">
      {/* Card Info Card */}
      <Card className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Detalles de Tarjeta
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFreeze}
              disabled={freezing}
              data-testid="freeze-card-btn"
            >
              {card.frozen ? <Unlock size={16} /> : <Lock size={16} />}
              <span className="ml-2">{card.frozen ? 'Desbloquear' : 'Congelar'}</span>
            </Button>
          </div>
        </div>

        {/* Card Details with Copy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Número de Tarjeta</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm">
                {showCardNumber ? `4532 ${card.last4} XXXX XXXX` : `•••• •••• •••• ${card.last4}`}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCardNumber(!showCardNumber)}
                data-testid="toggle-card-number"
              >
                {showCardNumber ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(`4532${card.last4}XXXXXXXX`, 'Número de tarjeta')}
                data-testid="copy-card-number"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">CVV</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm">{showCVV ? '123' : '•••'}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCVV(!showCVV)}
                data-testid="toggle-cvv"
              >
                {showCVV ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard('123', 'CVV')}
                data-testid="copy-cvv"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Vencimiento</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm">{card.exp_month}/{card.exp_year}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(`${card.exp_month}/${card.exp_year}`, 'Fecha de vencimiento')}
                data-testid="copy-expiry"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Titular</p>
            <div className="flex items-center gap-2">
              <p className="text-sm">{card.holder_name}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(card.holder_name, 'Titular')}
                data-testid="copy-holder"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Cashback Info */}
        {card.cashback > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Cashback Acumulado</p>
            <p className="text-lg font-semibold text-green-600">${card.cashback.toFixed(2)}</p>
            {isDisposable && (
              <p className="text-xs text-muted-foreground italic">Solo compras nacionales/internacionales y servicios (luz, agua)</p>
            )}
          </div>
        )}

        {/* Action Buttons - Different for Fixed vs Disposable */}
        <div className="pt-4 border-t space-y-2">
          {isFixed && (
            <>
              {/* Fixed Cards: Send, Receive, Insurance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  variant="default"
                  onClick={() => setShowSendDialog(true)}
                  data-testid="send-money-btn"
                >
                  <ArrowUpRight size={16} className="mr-2" />
                  Enviar Dinero
                </Button>
                <Button
                  variant="default"
                  onClick={() => setShowReceiveDialog(true)}
                  data-testid="receive-money-btn"
                >
                  <ArrowDownLeft size={16} className="mr-2" />
                  Recibir Dinero
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/seguros'}
                  data-testid="insurance-btn"
                >
                  <Shield size={16} className="mr-2" />
                  Seguros
                </Button>
              </div>
            </>
          )}

          {isDisposable && (
            <>
              {/* Disposable Cards: Return Funds, Destroy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  variant="default"
                  onClick={handleReturnFunds}
                  disabled={card.balance <= 0}
                  data-testid="return-funds-btn"
                >
                  <ArrowUpRight size={16} className="mr-2" />
                  Enviar a Bóveda
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDestroy}
                  disabled={destroying}
                  data-testid="destroy-card-btn"
                >
                  <Trash2 size={16} className="mr-2" />
                  {destroying ? 'Destruyendo...' : 'Destruir Tarjeta'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Transaction History Chart */}
      {history.length > 0 && (
        <Card className="p-4 md:p-6 space-y-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Historial de Transacciones
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Transaction List */}
      {history.length > 0 && (
        <Card className="p-4 md:p-6 space-y-4">
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Últimas Transacciones
          </h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${item.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.abs(item.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Send Money Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Dinero</DialogTitle>
            <DialogDescription>Desde tu tarjeta {card.brand} •••• {card.last4}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="send-amount">Monto</Label>
              <Input
                id="send-amount"
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Saldo disponible: ${card.balance.toFixed(2)}</p>
            </div>
            <Button onClick={handleSendMoney} className="w-full">Enviar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Money Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recibir Dinero</DialogTitle>
            <DialogDescription>A tu tarjeta {card.brand} •••• {card.last4}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="receive-amount">Monto</Label>
              <Input
                id="receive-amount"
                type="number"
                placeholder="0.00"
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleReceiveMoney} className="w-full">Recibir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardDetailPanel;
