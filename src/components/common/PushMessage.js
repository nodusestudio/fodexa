import React, { useEffect, useState } from 'react';

const PushMessage = () => {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState('success');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail.message);
      setType(e.detail.type || 'success');
      setVisible(true);
      setTimeout(() => setVisible(false), 3500);
    };
    window.addEventListener('push-message', handler);
    return () => window.removeEventListener('push-message', handler);
  }, []);

  if (!visible || !message) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      style={{ minWidth: 260 }}>
      {message}
    </div>
  );
};

export default PushMessage;
