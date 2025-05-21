import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { FiWifi, FiWifiOff, FiAlertCircle, FiLoader, FiRefreshCw } from 'react-icons/fi';

const DatabaseConnectionStatus = ({ expanded = false }) => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);
  const [detailedInfo, setDetailedInfo] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const isAdmin = user?.tipo_usuario === 'admin';
  
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      // Endpoint para verificar la conexión a la base de datos con información detallada
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/health/database`,
        { timeout: 8000 }
      );
      
      if (response.data.connected) {
        setConnectionStatus('connected');
        
        // Si anteriormente estaba desconectado, mostrar notificación de recuperación
        if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
          toast.success('Conexión a la base de datos restablecida');
        }
      } else {
        setConnectionStatus('disconnected');
        toast.error('Problema de conexión con la base de datos detectado', {
          autoClose: false
        });
      }
      
      // Guardar información detallada para mostrar en modo expandido
      setDetailedInfo(response.data);
    } catch (error) {
      console.error('Error al verificar la conexión a la base de datos:', error);
      setConnectionStatus('error');
      toast.error('No se pudo verificar la conexión a la base de datos', {
        autoClose: false
      });
      
      // Guardar información del error
      setDetailedInfo({
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLastChecked(new Date());
    }
  };
  
  // Función para intentar una reconexión manual
  const attemptReconnection = async () => {
    if (!isAdmin) {
      toast.warning('Solo administradores pueden realizar esta acción');
      return;
    }
    
    try {
      setIsReconnecting(true);
      toast.info('Intentando reconectar a la base de datos...');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/health/database/reconnect`,
        {},
        { timeout: 15000 }
      );
      
      if (response.data.success) {
        toast.success('Reconexión exitosa con la base de datos');
        await checkConnection(); // Verificar el estado actualizado
      } else {
        toast.error('No se pudo reconectar a la base de datos');
      }
    } catch (error) {
      console.error('Error al intentar reconexión manual:', error);
      toast.error(`Error de reconexión: ${error.message}`);
    } finally {
      setIsReconnecting(false);
    }
  };

  // Verificar la conexión al montar el componente
  useEffect(() => {
    checkConnection();
    
    // Verificar la conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Determinar el color, icono y texto según el estado
  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { 
          color: 'bg-green-500', 
          textColor: 'text-green-600',
          text: 'Conectado',
          icon: <FiWifi className="text-green-500" />
        };
      case 'disconnected':
        return { 
          color: 'bg-red-500', 
          textColor: 'text-red-600',
          text: 'Desconectado',
          icon: <FiWifiOff className="text-red-500" />
        };
      case 'error':
        return { 
          color: 'bg-yellow-500', 
          textColor: 'text-yellow-600',
          text: 'Error',
          icon: <FiAlertCircle className="text-yellow-500" />
        };
      default:
        return { 
          color: 'bg-gray-500', 
          textColor: 'text-gray-600',
          text: 'Verificando...',
          icon: <FiLoader className="text-gray-500 animate-spin" />
        };
    }
  };

  const { color, textColor, text, icon } = getStatusInfo();
  
  // Formatear la hora de la última verificación
  const formattedTime = lastChecked 
    ? lastChecked.toLocaleTimeString() 
    : '';

  // Componente básico (modo compacto)
  if (!expanded) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <span className="ml-2 text-sm text-gray-600">{text}</span>
        </div>
        {lastChecked && (
          <span className="text-xs text-gray-500">
            Última verificación: {formattedTime}
          </span>
        )}
        <button 
          onClick={checkConnection}
          className="text-xs text-blue-500 hover:text-blue-700"
          title="Verificar conexión ahora"
          disabled={connectionStatus === 'checking'}
        >
          Verificar
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-purple-500 hover:text-purple-700"
        >
          {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
        </button>
      </div>
    );
  }

  // Componente expandido (para panel de administración)
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className={`font-medium ${textColor}`}>{text}</h3>
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={checkConnection}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center space-x-1"
            disabled={connectionStatus === 'checking'}
          >
            <FiRefreshCw className={connectionStatus === 'checking' ? 'animate-spin' : ''} />
            <span>Verificar</span>
          </button>
          {(connectionStatus === 'disconnected' || connectionStatus === 'error') && isAdmin && (
            <button
              onClick={attemptReconnection}
              className="px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 flex items-center space-x-1"
              disabled={isReconnecting}
            >
              <FiRefreshCw className={isReconnecting ? 'animate-spin' : ''} />
              <span>Reconectar BD</span>
            </button>
          )}
        </div>
      </div>
      
      {lastChecked && (
        <div className="text-xs text-gray-500 mb-2">
          Última verificación: {lastChecked.toLocaleString()}
        </div>
      )}
      
      {detailedInfo && (showDetails || expanded) && (
        <div className="mt-3 border-t pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Información detallada</h4>
          <div className="bg-gray-50 p-2 rounded text-xs font-mono overflow-x-auto">
            {detailedInfo.reconnection && (
              <div className="mb-2">
                <p className="text-gray-700">Reconexión:</p>
                {detailedInfo.reconnection.successful ? (
                  <p className="text-green-600">Exitosa (Intentos: {detailedInfo.reconnection.attempts})</p>
                ) : (
                  <p className="text-red-600">
                    Fallida (Intentos: {detailedInfo.reconnection.attempts}/{detailedInfo.reconnection.maxAttempts})
                  </p>
                )}
                {detailedInfo.reconnection.lastAttempt && (
                  <p className="text-gray-600">
                    Último intento: {new Date(detailedInfo.reconnection.lastAttempt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            
            {detailedInfo.connectionPool && detailedInfo.connectionPool.size && typeof detailedInfo.connectionPool.size !== 'string' && (
              <div className="mb-2">
                <p className="text-gray-700">Pool de conexiones:</p>
                <p className="text-gray-600">Total: {detailedInfo.connectionPool.size.total}</p>
                <p className="text-gray-600">Disponibles: {detailedInfo.connectionPool.size.available}</p>
                <p className="text-gray-600">Pendientes: {detailedInfo.connectionPool.size.pending}</p>
              </div>
            )}
            
            <p className="text-gray-600">Estado: {detailedInfo.status}</p>
            <p className="text-gray-600">Timestamp: {new Date(detailedInfo.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseConnectionStatus;