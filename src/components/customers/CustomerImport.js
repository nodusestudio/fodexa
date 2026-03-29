import React, { useRef, useState } from 'react';
import { useCustomers } from '../../context/CustomerContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';

function extractCustomersFromRows(rows) {
  // Adaptar para aceptar encabezados exactos del CSV del usuario
  const nameKeys = [
    'nombre del cliente', 'nombre', 'name', 'cliente'
  ];
  const addressKeys = [
    'dirección', 'direccion', 'address', 'dirección del cliente', 'dirección de envío', 'dirección de facturación'
  ];
  const phoneKeys = [
    'número de teléfono', 'telefono', 'teléfono', 'phone', 'celular', 'número', 'numero'
  ];
  return rows.map(row => {
    // Normalizar claves a minúsculas y sin tildes
    const normalize = s => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    const keys = Object.keys(row).reduce((acc, k) => {
      acc[normalize(k)] = row[k];
      return acc;
    }, {});
    const getValue = (arr) => arr.map(k => keys[normalize(k)]).find(Boolean) || '';
    return {
      name: getValue(nameKeys),
      address: getValue(addressKeys),
      phone: getValue(phoneKeys),
    };
  }).filter(c => c.name && c.phone);
}

const CustomerImport = ({ onImportResult }) => {
  const { importCustomersBatch } = useCustomers();
  const fileInput = useRef();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFile = async (file) => {
    let customers = [];
    try {
      setImporting(true);
      setProgress(0);
      setStatusMessage('Leyendo archivo...');
      
      if (file.type.includes('csv')) {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true });
        customers = extractCustomersFromRows(parsed.data);
      } else if (file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        customers = extractCustomersFromRows(rows);
      } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const text = await file.text();
        const rows = JSON.parse(text);
        customers = extractCustomersFromRows(Array.isArray(rows) ? rows : [rows]);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const pdfjsLib = await import('pdfjs-dist/build/pdf');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join('\n') + '\n';
        }
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        customers = lines.map(line => {
          const match = line.match(/([A-Za-zÁÉÍÓÚáéíóúñÑ ]+)[,;\-\s]+([0-9\-\s]{7,})/);
          if (match) {
            return { name: match[1].trim(), phone: match[2].replace(/\D/g, ''), address: '' };
          }
          return null;
        }).filter(Boolean);
      } else {
        onImportResult && onImportResult({ type: 'error', message: 'Formato no soportado. Usa CSV, Excel, PDF o JSON.' });
        setImporting(false);
        return;
      }
      
      if (customers.length === 0) {
        onImportResult && onImportResult({ 
          type: 'error', 
          message: 'No se encontraron clientes válidos en el archivo' 
        });
        setImporting(false);
        return;
      }
      
      setStatusMessage(`Guardando ${customers.length} clientes en la nube...`);
      
      // Usar writeBatch para importar de forma eficiente (sin congelar la app)
      await importCustomersBatch(customers, (progress) => {
        setProgress(progress.percent);
        setStatusMessage(`Importado ${progress.count}/${progress.total} clientes...`);
        onImportResult && onImportResult({ 
          type: 'progress', 
          message: `Importando... ${progress.count}/${progress.total}` 
        });
      });
      
      // Usar writeBatch para importar de forma eficiente (sin congelar la app)
      await importCustomersBatch(customers, (progress) => {
        setProgress(progress.percent);
        setStatusMessage(`Importado ${progress.count}/${progress.total} clientes...`);
        onImportResult && onImportResult({ 
          type: 'progress', 
          message: `Importando... ${progress.count}/${progress.total}` 
        });
      });
      
      // Esperar a que Firestore listener notifique los cambios (adicional 3 segundos)
      setStatusMessage('Sincronizando datos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStatusMessage('✅ ¡Importación completada!');
      setProgress(100);
      
      onImportResult && onImportResult({ 
        type: 'success', 
        message: `✅ ¡Éxito! ${customers.length} clientes guardados en la nube.` 
      });
      
      // Limpiar después de 2 segundos
      setTimeout(() => {
        setImporting(false);
        setProgress(0);
        setStatusMessage('');
      }, 2000);
      
    } catch (e) {
      console.error('❌ Error importando:', e);
      setStatusMessage('Error durante la importación');
      onImportResult && onImportResult({ 
        type: 'error', 
        message: 'Error al importar: ' + e.message 
      });
      setImporting(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .json, application/pdf"
        ref={fileInput}
        style={{ display: 'none' }}
        onChange={e => e.target.files && handleFile(e.target.files[0])}
      />
      <button
        type="button"
        title="Importar clientes"
        disabled={importing}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => fileInput.current && fileInput.current.click()}
      >
        {importing ? (
          <Loader size={18} className="animate-spin" />
        ) : (
          <Upload size={18} />
        )}
        {importing ? 'Importando...' : 'Importar'}
      </button>
      
      {/* Modal de progreso */}
      {importing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <Loader size={32} className="animate-spin text-blue-600 dark:text-blue-400" />
            </div>
            
            <h3 className="text-lg font-bold text-center text-gray-800 dark:text-white mb-4">
              Importando clientes
            </h3>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
              {statusMessage}
            </p>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {progress}%
            </p>
            
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              No cierres esta ventana ni la aplicación
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerImport;
