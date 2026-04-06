import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import POS from './pages/POS';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Ledger from './pages/Ledger';
import Customers from './pages/Customers';
import CustomerReports from './pages/CustomerReports';
import Articles from './pages/articles/Articles';
import Tickets from './pages/Tickets';
import Deliveries from './pages/Deliveries';
import Cash from './pages/Cash';
import CashHistory from './pages/CashHistory';
import ImportMenu from './pages/ImportMenu';
import Settings from './pages/Settings';

import { AuthProvider } from './context/AuthContext';
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
import LastUpdateIndicator from './components/common/LastUpdateIndicator';

function App() {
  return (
    <AuthProvider>
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
                          <LastUpdateIndicator />
                          <Routes>
                            {/* Login Route */}
                            <Route path="/login" element={<Login />} />

                            {/* Protected Routes */}
                            <Route
                              path="/"
                              element={
                                <ProtectedRoute>
                                  <Layout />
                                </ProtectedRoute>
                              }
                            >
                              <Route index element={<POS />} />
                              <Route path="dashboard" element={<Dashboard />} />
                              <Route path="reports" element={<Reports />} />
                              <Route path="ledger" element={<Ledger />} />
                              <Route path="deliveries" element={<Deliveries />} />
                              <Route path="customers" element={<Customers />} />
                              <Route path="customers/reports" element={<CustomerReports />} />
                              <Route path="articles/*" element={<Articles />} />
                              <Route path="tickets" element={<Tickets />} />
                              <Route path="cash" element={<Cash />} />
                              <Route path="cash/history" element={<CashHistory />} />
                              <Route path="import-menu" element={<ImportMenu />} />
                              <Route path="settings" element={<Settings />} />
                            </Route>

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
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
    </AuthProvider>
  );
}

export default App;
