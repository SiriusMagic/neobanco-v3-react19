import React, { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import CardItem from '../components/CardItem';
import CardDetailPanel from '../components/CardDetailPanel';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, CreditCard, History } from 'lucide-react';
import { toast } from '../components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';

const API = '/api';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [destroyedHistory, setDestroyedHistory] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    brand: 'VISA',
    holder_name: '',
    exp_month: '',
    exp_year: ''
  });

  useEffect(() => {
    fetchCards();
    fetchDestroyedHistory();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await axios.get(`${API}/cards`);
      if (response.data && response.data.length > 0) {
        setCards(response.data);
        if (!selectedCardId) {
          setSelectedCardId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestroyedHistory = async () => {
    try {
      const response = await axios.get(`${API}/cards/destroyed-history`);
      setDestroyedHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleCardSelect = (cardId) => {
    setSelectedCardId(cardId);
  };

  const handleCardUpdate = (updatedCard) => {
    setCards(cards.map(card => card.id === updatedCard.id ? updatedCard : card));
  };

  const handleCreateCard = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Debe ingresar un monto válido');
      return;
    }
    if (!formData.exp_month || !formData.exp_year) {
      toast.error('Debe seleccionar una fecha de vencimiento');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(`${API}/cards/create-disposable`, {
        brand: formData.brand,
        amount: parseFloat(formData.amount),
        holder_name: formData.holder_name || 'USUARIO AIRA',
        exp_month: formData.exp_month,
        exp_year: formData.exp_year
      });
      toast.success('Tarjeta desechable creada exitosamente');
      await fetchCards();
      setShowCreateDialog(false);
      setFormData({
        amount: '',
        brand: 'VISA',
        holder_name: '',
        exp_month: '',
        exp_year: ''
      });
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error(error.response?.data?.detail || 'Error al crear la tarjeta');
    } finally {
      setCreating(false);
    }
  };

  const handleReturnFunds = async (cardId) => {
    try {
      const response = await axios.post(`${API}/cards/${cardId}/return-funds`);
      toast.success(`$${response.data.amount_returned.toFixed(2)} devueltos a tu Bóveda Segura`);
      await fetchCards();
    } catch (error) {
      console.error('Error returning funds:', error);
      toast.error('Error al devolver fondos');
    }
  };

  const handleDestroyCard = async (cardId) => {
    try {
      const response = await axios.delete(`${API}/cards/${cardId}/destroy`);
      toast.success(`Tarjeta destruida. $${response.data.amount_returned.toFixed(2)} devueltos a tu Bóveda Segura`);
      await fetchCards();
      await fetchDestroyedHistory();
      if (selectedCardId === cardId) {
        const remainingCards = cards.filter(c => c.id !== cardId);
        setSelectedCardId(remainingCards.length > 0 ? remainingCards[0].id : null);
      }
    } catch (error) {
      console.error('Error destroying card:', error);
      toast.error('Error al destruir la tarjeta');
    }
  };

  const selectedCard = cards.find(card => card.id === selectedCardId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando tarjetas...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6" data-testid="cards-page">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="active">Tarjetas Activas</TabsTrigger>
          <TabsTrigger value="history" data-testid="history-tab">
            <History className="w-4 h-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {/* Cards Carousel */}
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Billeteras Operativas</h2>
            <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide" data-testid="cards-list">
              {cards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  selected={card.id === selectedCardId}
                  onClick={() => handleCardSelect(card.id)}
                />
              ))}
              
              {/* Create Card Module - Only for disposable */}
              <button
                onClick={() => setShowCreateDialog(true)}
                className="shrink-0 w-[280px] sm:w-[320px] h-[180px] snap-center rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 group"
                data-testid="create-card-btn"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">Crear Tarjeta Desechable</p>
              </button>
            </div>
          </div>

          {/* Card Detail Panel */}
          {selectedCard && (
            <CardDetailPanel 
              card={selectedCard} 
              onCardUpdate={handleCardUpdate}
              onReturnFunds={handleReturnFunds}
              onDestroyCard={handleDestroyCard}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Historial de Tarjetas Desechables Destruidas
            </h3>
            {destroyedHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay tarjetas destruidas en el historial</p>
            ) : (
              <div className="space-y-3">
                {destroyedHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.holder_name}</p>
                        <p className="text-sm text-muted-foreground">{item.brand} •••• {item.last4}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">Destruida</p>
                        <p className="text-xs text-muted-foreground">{new Date(item.destroyed_at).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Monto Inicial</p>
                        <p className="font-medium">${item.initial_amount?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Devuelto</p>
                        <p className="font-medium text-green-600">${item.returned_amount?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Causa</p>
                        <p className="font-medium text-xs">{item.destruction_reason || 'Manual'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Card Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md" data-testid="create-card-dialog">
          <DialogHeader>
            <DialogTitle>Crear Tarjeta Desechable</DialogTitle>
            <DialogDescription>
              Los fondos se transferirán desde tu Bóveda Segura
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a Cargar *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                data-testid="amount-input"
              />
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label>Red Emisora *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({...formData, brand: 'VISA'})}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    formData.brand === 'VISA' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid="brand-visa"
                >
                  <CreditCard className="w-8 h-8" />
                  <span className="font-medium">VISA</span>
                </button>
                <button
                  onClick={() => setFormData({...formData, brand: 'Mastercard'})}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    formData.brand === 'Mastercard' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid="brand-mastercard"
                >
                  <CreditCard className="w-8 h-8" />
                  <span className="font-medium">Mastercard</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground italic">Próximamente: Otras redes</p>
            </div>

            {/* Holder Name */}
            <div className="space-y-2">
              <Label htmlFor="holder">Nombre del Titular (Alias)</Label>
              <Input
                id="holder"
                placeholder="Opcional - Usa un alias para privacidad"
                value={formData.holder_name}
                onChange={(e) => setFormData({...formData, holder_name: e.target.value})}
                data-testid="holder-input"
              />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label>Fecha de Vencimiento *</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    type="text"
                    placeholder="MM"
                    maxLength={2}
                    value={formData.exp_month}
                    onChange={(e) => setFormData({...formData, exp_month: e.target.value})}
                    data-testid="exp-month-input"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="YYYY"
                    maxLength={4}
                    value={formData.exp_year}
                    onChange={(e) => setFormData({...formData, exp_year: e.target.value})}
                    data-testid="exp-year-input"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCreateCard} 
              disabled={creating}
              className="w-full"
              data-testid="confirm-create-card"
            >
              {creating ? 'Creando...' : 'Crear Tarjeta'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cards;