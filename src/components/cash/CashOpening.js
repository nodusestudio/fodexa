import React, { useEffect } from 'react';
import { useCash } from '../../context/CashContext';

const CashOpening = ({ onClose }) => {
  const { openCash } = useCash();

  // Abrir caja automáticamente sin pedir información
  useEffect(() => {
    openCash({
      initialAmount: 0,
      fundAmount: 0,
      breakdown: {},
      notes: '',
      openedAt: new Date(),
    });
    // Cerrar el modal inmediatamente
    onClose();
  }, [openCash, onClose]);

  // Este componente solo se usa para disparar la acción, no renderiza UI
  return null;
};

export default CashOpening;
