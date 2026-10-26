import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Minus } from 'lucide-react';
import axios from '@/lib/localApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = '/api';

const GoalDetailPanel = ({ goal, onGoalUpdate }) => {
  const [historyData, setHistoryData] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [activeRange, setActiveRange] = useState('30');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (goal) {
      fetchGoalData();
    }
  }, [goal, activeRange]);

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      const days = parseInt(activeRange);
      const [historyRes, contribRes] = await Promise.all([
        axios.get(`${API}/goals/${goal.id}/history?days=${days}`),
        axios.get(`${API}/goals/${goal.id}/contributions?days=${days}`)
      ]);
      setHistoryData(historyRes.data);
      setContributions(contribRes.data);
    } catch (error) {
      console.error('Error fetching goal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContribution = async (type) => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      await axios.post(`${API}/goals/${goal.id}/contributions`, {
        amount: parseFloat(amount),
        type: type,
        description: `${type === 'deposit' ? 'Aporte' : 'Retiro'} manual`
      });

      // Refresh goal data
      const goalRes = await axios.get(`${API}/goals/${goal.id}`);
      onGoalUpdate(goalRes.data);
      await fetchGoalData();
      setAmount('');
    } catch (error) {
      console.error('Error adding contribution:', error);
    }
  };

  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;

  // Format data for chart
  const chartData = historyData.map((item) => ({
    date: new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    amount: item.amount
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Progress Summary */}
      <Card className="p-4 md:p-6 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {goal.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {progress.toFixed(1)}% completado
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold text-[#00CED1]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ${goal.current_amount.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              Meta: ${goal.target_amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Add/Withdraw Funds */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Administrar fondos</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Monto"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
              min="0"
              step="0.01"
            />
            <Button
              onClick={() => handleContribution('deposit')}
              className="bg-[#0E9F6E] hover:bg-[#0D8A5E]"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <Plus size={18} className="mr-1" />
              Añadir
            </Button>
            <Button
              onClick={() => handleContribution('withdraw')}
              variant="destructive"
              disabled={!amount || parseFloat(amount) <= 0 || goal.current_amount === 0}
            >
              <Minus size={18} className="mr-1" />
              Retirar
            </Button>
          </div>
        </div>
      </Card>

      {/* History Chart */}
      <Card className="p-4 md:p-6 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-base md:text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Historial de progreso
          </h3>
          <Tabs value={activeRange} onValueChange={setActiveRange} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto grid grid-cols-3">
              <TabsTrigger value="7" className="text-xs md:text-sm">7 días</TabsTrigger>
              <TabsTrigger value="30" className="text-xs md:text-sm">30 días</TabsTrigger>
              <TabsTrigger value="90" className="text-xs md:text-sm">90 días</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No hay datos disponibles</p>
          </div>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="goalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00CED1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00CED1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Ahorrado']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#00CED1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#goalGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Recent Contributions */}
      <Card className="p-4 md:p-6 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Movimientos recientes
        </h3>
        <div className="space-y-2 md:space-y-3">
          {contributions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay movimientos todavía</p>
          ) : (
            contributions.slice(0, 5).map((contribution, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs md:text-sm truncate">
                    {contribution.description || 'Aporte'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(contribution.date).toLocaleDateString('es-ES', { 
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-semibold text-xs md:text-sm ${
                    contribution.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {contribution.type === 'deposit' ? '+' : '-'}${contribution.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default GoalDetailPanel;