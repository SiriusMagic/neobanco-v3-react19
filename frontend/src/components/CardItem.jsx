import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CreditCard } from 'lucide-react';

const CardItem = ({ card, selected, onClick }) => {
  const getCardTypeLabel = (type) => {
    switch (type) {
      case 'debit':
        return 'Tarjeta débito';
      case 'credit':
        return 'Tarjeta de crédito';
      case 'virtual':
        return 'Tarjeta desechable';
      default:
        return type;
    }
  };

  const getGradientClass = (theme) => {
    switch (theme) {
      case 'turquoise':
        return 'bg-[linear-gradient(135deg,#00CED1_0%,#8EEAD5_60%,#E5FCFD_100%)]';
      case 'blue':
        return 'bg-[linear-gradient(135deg,#0284C7_0%,#7DD3FC_60%,#E0F2FE_100%)]';
      case 'green':
        return 'bg-[linear-gradient(135deg,#0E9F6E_0%,#6EE7B7_60%,#D1FAE5_100%)]';
      default:
        return 'bg-[linear-gradient(135deg,#00CED1_0%,#8EEAD5_60%,#E5FCFD_100%)]';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`card-item-${card.id}`}
      className={`snap-start min-w-[280px] sm:min-w-[300px] text-left transition-all ${
        selected ? 'ring-2 ring-[#00CED1] ring-offset-2 ring-offset-white scale-105' : 'ring-0 hover:scale-102'
      }`}
    >
      <Card className="relative overflow-hidden p-4 sm:p-5 rounded-xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] h-[160px] sm:h-[180px]">
        <div className={`absolute inset-0 pointer-events-none ${getGradientClass(card.color_theme)} opacity-90`} />
        <div className="relative flex flex-col gap-3 sm:gap-4 text-white h-full justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide uppercase">aira</span>
            <CreditCard size={24} aria-hidden="true" className="text-white sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ${card.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs sm:text-sm font-medium mt-1">{card.holder_name}</div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 text-xs">
              {getCardTypeLabel(card.type)}
            </Badge>
            {card.frozen && (
              <Badge className="bg-black/20 text-white border-0 text-xs">Congelada</Badge>
            )}
            <span className="text-xs font-semibold">{card.brand}</span>
          </div>
        </div>
      </Card>
    </button>
  );
};

export default CardItem;