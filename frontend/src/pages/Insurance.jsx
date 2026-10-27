import { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Shield, Check, Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from '../components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';

const API = '/api';

const Insurance = () => {
  const [insurance, setInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claimData, setClaimData] = useState({
    amount: '',
    description: '',
    incident_type: 'fraud'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchInsurance();
  }, []);

  const fetchInsurance = async () => {
    try {
      const response = await axios.get(`${API}/insurance`);
      setInsurance(response.data);
    } catch (error) {
      console.error('Error fetching insurance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePlan = async () => {
    try {
      await axios.post(`${API}/insurance/activate`, {
        plan_type: 'vault_protection'
      });
      toast.success('Plan Único activado exitosamente');
      fetchInsurance();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al activar el plan');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleSubmitClaim = async () => {
    if (!claimData.amount || !claimData.description) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('amount', claimData.amount);
      formData.append('description', claimData.description);
      formData.append('incident_type', claimData.incident_type);
      
      selectedFiles.forEach((file) => {
        formData.append('evidence', file);
      });

      await axios.post(`${API}/insurance/claim`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Reclamo enviado exitosamente. Feruner Seguros iniciará la investigación.');
      setShowClaimDialog(false);
      setClaimData({ amount: '', description: '', incident_type: 'fraud' });
      setSelectedFiles([]);
      fetchInsurance();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al enviar el reclamo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6" data-testid="insurance-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Seguros
        </h1>
        <p className="text-muted-foreground mt-1">Protección total para tu dinero con Feruner Seguros</p>
      </div>

      {/* Active Insurance Banner */}
      {insurance?.has_insurance && (
        <Card className="p-6 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">¡Estás Protegido!</h3>
              <p className="text-sm text-green-700">Plan: {insurance.plan_name}</p>
            </div>
            <Button 
              onClick={() => setShowClaimDialog(true)}
              variant="outline"
              data-testid="start-claim-btn"
            >
              Iniciar Reclamo
            </Button>
          </div>
        </Card>
      )}

      {/* Insurance Plans */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Planes Disponibles
        </h2>

        {/* Plan Único de Bóveda - FEATURED */}
        <Card className="p-6 border-2 border-purple-300 bg-linear-to-br from-purple-50 to-pink-50" data-testid="vault-plan">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-900">Plan Único: Protección de Bóveda</h3>
                <p className="text-purple-700 font-semibold">★ RECOMENDADO ★</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-900">$15.99</p>
              <p className="text-sm text-purple-700">/mes</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-lg font-semibold text-purple-900 mb-3">
              Protección de Capital 100% Garantizada, incluso contra Errores Propios
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Escenario No Negligente (Robo, Hackeo)</p>
                  <p className="text-sm text-muted-foreground">Cobertura del <span className="font-bold text-green-600">100%</span> del capital perdido</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Escenario Negligente (Estafa, Error Propio)</p>
                  <p className="text-sm text-muted-foreground">Cobertura del <span className="font-bold text-orange-600">75%</span> del capital perdido</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Proceso de Reclamo Simplificado</p>
                  <p className="text-sm text-muted-foreground">Sube evidencia (correos, capturas) para activar investigación de Feruner</p>
                </div>
              </div>
            </div>
          </div>

          {!insurance?.has_insurance && (
            <Button 
              size="lg" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleActivatePlan}
              data-testid="activate-plan-btn"
            >
              Activar Plan Único - $15.99/mes
            </Button>
          )}
        </Card>

        {/* Seguro Total de Tarjetas */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Seguro Total de Tarjetas</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Básico */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Plan Básico</h4>
              <p className="text-2xl font-bold mb-2">$4.99<span className="text-sm font-normal">/mes</span></p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Cobertura hasta $5,000</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Fraude en compras online</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Robo de tarjeta física</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-4" disabled>
                Próximamente
              </Button>
            </div>

            {/* Plan Premium */}
            <div className="border rounded-lg p-4 border-blue-300 bg-blue-50">
              <h4 className="font-semibold mb-2">Plan Premium</h4>
              <p className="text-2xl font-bold mb-2">$9.99<span className="text-sm font-normal">/mes</span></p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Cobertura hasta $15,000</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Todo lo del Plan Básico</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Reembolso de comisiones</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Soporte prioritario 24/7</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-4" disabled>
                Próximamente
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Claims Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Iniciar Reclamo de Seguro</DialogTitle>
            <DialogDescription>
              Completa la información y sube evidencia para activar la investigación de Feruner Seguros
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Tu reclamo será evaluado</p>
                <p className="text-blue-700">Recibirás 100% si no fuiste negligente, o 75% en caso contrario.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Monto del Incidente *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={claimData.amount}
                onChange={(e) => setClaimData({...claimData, amount: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-type">Tipo de Incidente *</Label>
              <select
                id="incident-type"
                className="w-full px-3 py-2 border rounded-md"
                value={claimData.incident_type}
                onChange={(e) => setClaimData({...claimData, incident_type: e.target.value})}
              >
                <option value="fraud">Fraude</option>
                <option value="theft">Robo</option>
                <option value="hack">Hackeo</option>
                <option value="scam">Estafa</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Incidente *</Label>
              <Textarea
                id="description"
                placeholder="Describe lo que sucedió con el mayor detalle posible..."
                value={claimData.description}
                onChange={(e) => setClaimData({...claimData, description: e.target.value})}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Evidencia (Capturas, Correos, etc.)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  Seleccionar Archivos
                </Button>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="space-y-1 mt-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={handleSubmitClaim} 
              className="w-full"
              size="lg"
              data-testid="submit-claim-btn"
            >
              Enviar Reclamo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Insurance;