import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: Date): string => {
  return Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatDateToTimePassed = (date: Date): string => {
  //example: hace 2 horas atrás/ 2 dias / 1 mes / 1 año/ 1 minuto / 1 segundo
  // format distance
  return formatDistance(date, new Date(), { locale: es });
};
