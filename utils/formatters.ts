export const formatearNumero = (numero: number | string): string => {
  const num = typeof numero === 'string' ? parseFloat(numero) : numero;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('es-CO').format(num);
};

export const formatearInput = (valor: string | number): string => {
  if (!valor) return '';
  const soloNumeros = valor.toString().replace(/[^\d]/g, '');
  if (!soloNumeros) return '';
  const numero = parseInt(soloNumeros);
  return new Intl.NumberFormat('es-CO').format(numero);
};

export const parsearInput = (valor: string | number): string => {
  if (!valor) return '';
  const soloNumeros = valor.toString().replace(/[^\d]/g, '');
  if (!soloNumeros) return '';
  return soloNumeros;
};

export const formatearInputSinFormato = (valor: string | number): string => {
  if (!valor) return '';
  return valor.toString().replace(/[^\d]/g, '');
};

export const formatearMoneda = (valor: number | string): string => {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return '$0';
  return `$${formatearNumero(num)}`;
};

export const formatearPorcentaje = (valor: number | string): string => {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(num)) return '0%';
  return `${num.toFixed(1)}%`;
};