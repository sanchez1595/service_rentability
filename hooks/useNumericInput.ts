import { useState, useCallback } from 'react';

export const useNumericInput = () => {
  const formatearInput = useCallback((valor: string | number): string => {
    if (!valor) return '';
    
    // Convertir a string y extraer solo números
    const soloNumeros = valor.toString().replace(/[^\d]/g, '');
    if (!soloNumeros) return '';
    
    // Formatear con separadores de miles
    const numero = parseInt(soloNumeros);
    return new Intl.NumberFormat('es-CO').format(numero);
  }, []);

  const parsearInput = useCallback((valor: string): string => {
    if (!valor) return '';
    
    // Extraer solo números, sin formateo
    const soloNumeros = valor.replace(/[^\d]/g, '');
    return soloNumeros;
  }, []);

  const manejarCambioNumerico = useCallback((
    valor: string,
    callback: (valorLimpio: string) => void
  ) => {
    // Limpiar el valor de cualquier carácter no numérico
    const valorLimpio = valor.replace(/[^\d]/g, '');
    callback(valorLimpio);
  }, []);

  return {
    formatearInput,
    parsearInput,
    manejarCambioNumerico
  };
}; 