import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { MoreVertical, Trash2 } from 'lucide-react';

const GoalCard = ({ goal, selected, onClick, onDelete }) => {
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`goal-item-${goal.id}`}
      className={`w-full text-left transition-all ${
        selected ? 'ring-2 ring-[#E91E63] ring-offset-2' : 'hover:bg-[#F7F8FA]'
      }`}
    >
      <Card className="p-4 bg-[#2D2D2D] text-white rounded-xl relative">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 w-12 h-12 bg-linear-to-br from-[#FFD700] via-[#FFA500] to-[#8B4513] rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1">{goal.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">${goal.current_amount.toFixed(2)}</span>
                  <span className="text-sm text-gray-400">de ${goal.target_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}>
                    <Trash2 size={16} className="mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <Progress value={progress} className="h-2 bg-white/20" indicatorClassName="bg-white" />
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
};

export default GoalCard;