import React, { useState, useEffect } from 'react';
import axios from '@/lib/localApi';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { User, Lock, Smartphone, Bell, Palette, Globe, Shield, Trash2, CheckCircle } from 'lucide-react';
import { toast } from '../components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

const API = '/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [devices, setDevices] = useState([]);
  const [settings, setSettings] = useState({
    notifications: {
      transactions: true,
      missions: true,
      subscriptions: true
    },
    notificationMethod: 'push',
    darkMode: false,
    language: 'es'
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileRes, devicesRes, settingsRes] = await Promise.all([
        axios.get(`${API}/profile`),
        axios.get(`${API}/profile/devices`),
        axios.get(`${API}/profile/settings`)
      ]);

      setProfile(profileRes.data);
      setDevices(devicesRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (field, value) => {
    try {
      await axios.patch(`${API}/profile`, { [field]: value });
      toast.success('Perfil actualizado');
      fetchProfileData();
    } catch (error) {
      toast.error('Error al actualizar perfil');
    }
  };

  const handleToggle2FA = async () => {
    try {
      await axios.post(`${API}/profile/toggle-2fa`);
      toast.success(profile.two_factor_enabled ? '2FA desactivado' : '2FA activado');
      fetchProfileData();
    } catch (error) {
      toast.error('Error al cambiar 2FA');
    }
  };

  const handleRevokeDevice = async (deviceId) => {
    try {
      await axios.delete(`${API}/profile/devices/${deviceId}`);
      toast.success('Dispositivo revocado');
      fetchProfileData();
    } catch (error) {
      toast.error('Error al revocar dispositivo');
    }
  };

  const handleUpdateSettings = async (key, value) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await axios.patch(`${API}/profile/settings`, newSettings);
      toast.success('Configuración actualizada');
    } catch (error) {
      toast.error('Error al actualizar configuración');
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
    <div className="p-4 md:p-6 space-y-6" data-testid="profile-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Perfil y Ajustes
        </h1>
        <p className="text-muted-foreground mt-1">Centro de comando personal</p>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="identity">Identidad y Seguridad</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias y Control</TabsTrigger>
        </TabsList>

        {/* Tab 1: Identity & Security */}
        <TabsContent value="identity" className="space-y-6 mt-6">
          {/* Personal Data */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Datos Personales
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input value={profile?.name || ''} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label>Cédula</Label>
                  <div className="flex items-center gap-2">
                    <Input value={profile?.id_number || ''} disabled className="bg-gray-50" />
                    {profile?.id_verified && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-green-600">✓ Verificado</p>
                </div>

                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input value={profile?.email || ''} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={profile?.phone || ''} disabled className="bg-gray-50" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Dirección</Label>
                  <Input 
                    value={profile?.address || ''} 
                    placeholder="Ingrese su dirección"
                    onChange={(e) => handleUpdateProfile('address', e.target.value)}
                    onBlur={(e) => handleUpdateProfile('address', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Account Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Seguridad de la Cuenta
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Cambiar Contraseña</p>
                  <p className="text-sm text-muted-foreground">Última actualización hace 30 días</p>
                </div>
                <Button variant="outline">Cambiar</Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Autenticación de Dos Factores (2FA)</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.two_factor_enabled ? 'Activo - Método: SMS' : 'Protege tu cuenta con 2FA'}
                  </p>
                </div>
                <Switch
                  checked={profile?.two_factor_enabled || false}
                  onCheckedChange={handleToggle2FA}
                  data-testid="2fa-switch"
                />
              </div>

              <div className="py-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">Dispositivos Autorizados</p>
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Último acceso: {new Date(device.last_access).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      {!device.is_current && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRevokeDevice(device.id)}
                        >
                          Revocar
                        </Button>
                      )}
                      {device.is_current && (
                        <span className="text-xs text-green-600 font-medium">Actual</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Transaction Limits */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Límites de Transacción
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Límite de Envío Diario (Cuentas Externas)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={profile?.daily_send_limit || 5000}
                    onChange={(e) => handleUpdateProfile('daily_send_limit', parseFloat(e.target.value))}
                  />
                  <span className="flex items-center text-sm text-muted-foreground">USD</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Límite de Gasto por Tarjeta Operativa</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={profile?.card_spend_limit || 10000}
                    onChange={(e) => handleUpdateProfile('card_spend_limit', parseFloat(e.target.value))}
                  />
                  <span className="flex items-center text-sm text-muted-foreground">USD</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Preferences */}
        <TabsContent value="preferences" className="space-y-6 mt-6">
          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Notificaciones
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Transacciones de Tarjeta</p>
                  <p className="text-sm text-muted-foreground">Alerta en cada compra o transferencia</p>
                </div>
                <Switch
                  checked={settings.notifications.transactions}
                  onCheckedChange={(checked) => handleUpdateSettings('notifications', {...settings.notifications, transactions: checked})}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Puntos de Misión</p>
                  <p className="text-sm text-muted-foreground">Notificación al ganar puntos</p>
                </div>
                <Switch
                  checked={settings.notifications.missions}
                  onCheckedChange={(checked) => handleUpdateSettings('notifications', {...settings.notifications, missions: checked})}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Pagos de Suscripción</p>
                  <p className="text-sm text-muted-foreground">Recordatorios de pagos</p>
                </div>
                <Switch
                  checked={settings.notifications.subscriptions}
                  onCheckedChange={(checked) => handleUpdateSettings('notifications', {...settings.notifications, subscriptions: checked})}
                />
              </div>

              <div className="py-3">
                <Label className="mb-2 block">Método de Alerta</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={settings.notificationMethod === 'push' ? 'default' : 'outline-solid'}
                    onClick={() => handleUpdateSettings('notificationMethod', 'push')}
                  >
                    Push
                  </Button>
                  <Button
                    variant={settings.notificationMethod === 'email' ? 'default' : 'outline-solid'}
                    onClick={() => handleUpdateSettings('notificationMethod', 'email')}
                  >
                    Email
                  </Button>
                  <Button
                    variant={settings.notificationMethod === 'sms' ? 'default' : 'outline-solid'}
                    onClick={() => handleUpdateSettings('notificationMethod', 'sms')}
                  >
                    SMS
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Apariencia y Visualización
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Modo Oscuro</p>
                  <p className="text-sm text-muted-foreground">Activa el tema oscuro</p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleUpdateSettings('darkMode', checked)}
                />
              </div>

              <div className="py-3">
                <Label className="mb-2 block">Idioma</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={settings.language}
                  onChange={(e) => handleUpdateSettings('language', e.target.value)}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Gestión de Datos
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Acceso a Cámara</p>
                  <p className="text-sm text-muted-foreground">Para escaneo de documentos</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Acceso a Contactos</p>
                  <p className="text-sm text-muted-foreground">Para transferencias rápidas</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="py-3 border-t pt-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Eliminar Cuenta</p>
                      <p className="text-sm text-red-700">Esta acción es permanente e irreversible</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    data-testid="delete-account-btn"
                  >
                    Solicitar Eliminación
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar tu cuenta?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente todos tus datos, tarjetas, transacciones y acceso a la plataforma.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-red-600 font-medium">
              Para confirmar, escribe "ELIMINAR" en el campo de abajo:
            </p>
            <Input placeholder="ELIMINAR" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="destructive" className="flex-1">
                Confirmar Eliminación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
