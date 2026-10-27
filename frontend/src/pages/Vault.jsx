import { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Shield, ArrowDownToLine, Lock, Plus, Eye } from 'lucide-react';
import CardItem from '../components/CardItem';
import TransferToCardDialog from '../components/TransferToCardDialog';

const API = '/api';

const Vault = () => {
  const [vault, setVault] = useState(null);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vaultRes, cardsRes, transRes] = await Promise.all([
        axios.get(`${API}/vault`),
        axios.get(`${API}/cards`),
        axios.get(`${API}/vault/transactions?limit=5`)
      ]);
      setVault(vaultRes.data);
      setCards(cardsRes.data);
      setTransactions(transRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSuccess = async () => {
    await fetchData();
    setTransferDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6" data-testid="vault-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Mis Fondos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu dinero de forma segura
        </p>
      </div>

      {/* Vault Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <Shield size={24} className="text-[#0284C7]" />
          Bóveda Segura
        </h2>
        
        <Card className="p-6 md:p-8 bg-linear-to-br from-[#0284C7] to-[#0369A1] text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full transform -translate-x-24 translate-y-24"></div>
          </div>

          <div className="relative space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Cuenta Principal</p>
                <h3 className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {vault?.name || 'Mi Bóveda Segura'}
                </h3>
              </div>
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                <Lock size={14} className="mr-1" />
                Protegida
              </Badge>
            </div>

            <div>
              <p className="text-sm opacity-90 mb-2">Balance Total</p>
              <div className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                ${vault?.balance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <Button
              onClick={() => setTransferDialogOpen(true)}
              className="w-full md:w-auto bg-white text-[#0284C7] hover:bg-gray-100 font-semibold h-12 px-8"
            >
              <ArrowDownToLine size={20} className="mr-2" />
              Recargar Tarjeta
            </Button>
          </div>
        </Card>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <Card className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Movimientos Recientes
            </h3>
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
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
                      transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Billeteras Operativas
          </h2>
          <Button variant="outline" size="sm">
            <Plus size={16} className="mr-1" />
            Nueva Tarjeta
          </Button>
        </div>

        <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
          {cards.map((card) => (
            <div key={card.id} className="snap-start min-w-[280px] sm:min-w-[300px]">
              <Card className="p-4 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
                <CardItem card={card} selected={false} onClick={() => {}} />
                
                {/* Quick Actions */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Lock size={14} className="mr-1" />
                    Bloquear
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Eye size={14} className="mr-1" />
                    Detalles
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {cards.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No tienes tarjetas disponibles</p>
          </Card>
        )}
      </div>

      {/* Transfer Dialog */}
      <TransferToCardDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        vault={vault}
        cards={cards}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
};

export default Vault;