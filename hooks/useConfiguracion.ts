import { useState } from 'react';
import { Configuracion, Metas, Alertas } from '../types';
import { CONFIGURACION_INICIAL, METAS_INICIALES, ALERTAS_INICIALES } from '../utils/constants';

export const useConfiguracion = () => {
  const [configuracion, setConfiguracion] = useState<Configuracion>(CONFIGURACION_INICIAL);
  const [metas, setMetas] = useState<Metas>(METAS_INICIALES);
  const [alertas, setAlertas] = useState<Alertas>(ALERTAS_INICIALES);

  const actualizarConfiguracion = (nuevaConfiguracion: Partial<Configuracion>) => {
    setConfiguracion(prev => ({
      ...prev,
      ...nuevaConfiguracion
    }));
  };

  const actualizarMetas = (nuevasMetas: Partial<Metas>) => {
    setMetas(prev => ({
      ...prev,
      ...nuevasMetas
    }));
  };

  const actualizarAlertas = (nuevasAlertas: Partial<Alertas>) => {
    setAlertas(prev => ({
      ...prev,
      ...nuevasAlertas
    }));
  };

  return {
    configuracion,
    metas,
    alertas,
    actualizarConfiguracion,
    actualizarMetas,
    actualizarAlertas,
    setConfiguracion,
    setMetas,
    setAlertas
  };
};