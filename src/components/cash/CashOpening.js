import React, { useEffect } from 'react';
import { useCash } from '../../context/CashContext';

const CashOpening = ({ onClose }) => {
  const { openCash } = useCash();

  // Abrir caja automáticamente sin pedir información
  useEffect(() => {
    const handleOpenCash = async () => {
      try {
        await openCash({
          initialAmount: 0,
          fundAmount: 0,
          breakdown: {},
          notes: '',
          openedAt: new Date(),
        });
        // Cerrar el modal después de abrir exitosamente
        onClose();
      } catch (error) {
        console.error('❌ Error abriendo caja:', error);
        onClose();
      }
    };
    
    handleOpenCash();
  }, [openCash, onClose]);

  // Este componente solo se usa para disparar la acción, no renderiza UI
  return null;
};

export default CashOpening;
