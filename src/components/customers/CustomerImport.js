import React, { useRef } from 'react';
import { useCustomers } from '../../context/CustomerContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
  const { addCustomer } = useCustomers();
  const fileInput = useRef();

  const handleFile = async (file) => {
    let customers = [];
    try {
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
        return;
      }
      let count = 0;
      for (let i = 0; i < customers.length; i++) {
        addCustomer(customers[i]);
        count++;
      }
      onImportResult && onImportResult({ type: 'success', message: `¡Importación finalizada! ${count} clientes nuevos extraídos.` });
    } catch (e) {
      onImportResult && onImportResult({ type: 'error', message: 'Error al importar: ' + e.message });
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
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        onClick={() => fileInput.current && fileInput.current.click()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Importar
      </button>
    </>
  );
};

export default CustomerImport;
