import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const CreateGoalDialog = ({ open, onClose, onCreateGoal }) => {
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    category: 'general',
    icon: 'mountain'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.target_amount) return;

    onCreateGoal({
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      target_date: formData.target_date || null
    });

    // Reset form
    setFormData({
      name: '',
      target_amount: '',
      target_date: '',
      category: 'general',
      icon: 'mountain'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Crear nueva meta
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la meta</Label>
            <Input
              id="name"
              placeholder="Ej: Vacaciones, Auto nuevo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">Monto objetivo ($)</Label>
            <Input
              id="target_amount"
              type="number"
              placeholder="1000.00"
              min="0"
              step="0.01"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Fecha objetivo (opcional)</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#E91E63] hover:bg-[#C2185B]"
              disabled={!formData.name || !formData.target_amount}
            >
              Crear Meta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGoalDialog;