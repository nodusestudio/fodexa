import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/layout/Layout';
import POS from './pages/POS';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Customers from './pages/Customers';
import CustomerReports from './pages/CustomerReports';
import Articles from './pages/articles/Articles';
import Tickets from './pages/Tickets';
import Cash from './pages/Cash';
import CashHistory from './pages/CashHistory';
import ImportMenu from './pages/ImportMenu';
import Settings from './pages/Settings';

import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProductProvider } from './context/ProductContext';
import { TicketProvider } from './context/TicketContext';
import { CashProvider } from './context/CashContext';
import { ReportProvider } from './context/ReportContext';
import { CustomerProvider } from './context/CustomerContext';
import { SettingsProvider } from './context/SettingsContext';
import PushMessage from './components/common/PushMessage';

function App() {
  return (
    <SettingsProvider>
      <CashProvider>
        <TicketProvider>
          <ProductProvider>
            <CartProvider>
              <OrderProvider>
                <ReportProvider>
                  <CustomerProvider>
                    <ThemeProvider>
                      <Router>
                        <PushMessage />
                        <Routes>
                          <Route path="/" element={<Layout />}>
                            <Route index element={<POS />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="customers" element={<Customers />} />
                            <Route path="customers/reports" element={<CustomerReports />} />
                            <Route path="articles/*" element={<Articles />} />
                            <Route path="tickets" element={<Tickets />} />
                            <Route path="cash" element={<Cash />} />
                            <Route path="cash/history" element={<CashHistory />} />
                            <Route path="import-menu" element={<ImportMenu />} />
                            <Route path="settings" element={<Settings />} />
                          </Route>
                        </Routes>
                      </Router>
                    </ThemeProvider>
                  </CustomerProvider>
                </ReportProvider>
              </OrderProvider>
            </CartProvider>
          </ProductProvider>
        </TicketProvider>
      </CashProvider>
    </SettingsProvider>
  );
}

export default App;
