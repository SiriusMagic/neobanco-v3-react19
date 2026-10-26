import React, { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import GoalCard from '../components/GoalCard';
import GoalDetailPanel from '../components/GoalDetailPanel';
import CreateGoalDialog from '../components/CreateGoalDialog';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

const API = '/api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals`);
      if (response.data && response.data.length > 0) {
        setGoals(response.data);
        if (!selectedGoalId) {
          setSelectedGoalId(response.data[0].id);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setLoading(false);
    }
  };

  const handleGoalSelect = (goalId) => {
    setSelectedGoalId(goalId);
  };

  const handleGoalUpdate = (updatedGoal) => {
    setGoals(goals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
  };

  const handleGoalCreate = async (newGoalData) => {
    try {
      await axios.post(`${API}/goals`, newGoalData);
      await fetchGoals();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleGoalDelete = async (goalId) => {
    try {
      await axios.delete(`${API}/goals/${goalId}`);
      await fetchGoals();
      if (selectedGoalId === goalId && goals.length > 1) {
        setSelectedGoalId(goals.find(g => g.id !== goalId)?.id || null);
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const selectedGoal = goals.find(goal => goal.id === selectedGoalId);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando metas...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6" data-testid="goals-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Metas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra tus objetivos financieros
          </p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tienes metas creadas</p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-[#E91E63] hover:bg-[#C2185B]"
            >
              <Plus size={18} className="mr-2" />
              Crear primera meta
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3" data-testid="goals-list">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  selected={goal.id === selectedGoalId}
                  onClick={() => handleGoalSelect(goal.id)}
                  onDelete={() => handleGoalDelete(goal.id)}
                />
              ))}
            </div>

            {/* Total Saved */}
            <div className="mt-6 p-4 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <span className="text-sm md:text-base font-medium text-[#4B5563]">
                  Total ahorrado
                </span>
                <span className="text-xl md:text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  ${totalSaved.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Goal Button */}
      <Button
        onClick={() => setCreateDialogOpen(true)}
        className="w-full bg-[#E91E63] hover:bg-[#C2185B] h-12 text-base"
        data-testid="crear-meta-button"
      >
        Crear Meta
      </Button>

      {/* Goal Detail Panel */}
      {selectedGoal && (
        <GoalDetailPanel
          goal={selectedGoal}
          onGoalUpdate={handleGoalUpdate}
        />
      )}

      {/* Create Goal Dialog */}
      <CreateGoalDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreateGoal={handleGoalCreate}
      />
    </div>
  );
};

export default Goals;