import './i18n'; // initialize i18next before anything renders
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StorageProvider } from './context/StorageContext';
import { AuthProvider } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { ExperimentsListPage } from './pages/ExperimentsListPage';
import { ExperimentFormPage } from './pages/ExperimentFormPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { InfoPage } from './pages/InfoPage';

export default function App() {
  return (
    <BrowserRouter>
      <StorageProvider>
        <AuthProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<Navigate to="/experimenten" replace />} />
              <Route path="/experimenten" element={<ExperimentsListPage />} />
              <Route path="/experimenten/nieuw" element={<ExperimentFormPage />} />
              <Route path="/experimenten/:id" element={<ExperimentFormPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/instellingen" element={<SettingsPage />} />
              <Route path="/info" element={<InfoPage />} />
              <Route path="*" element={<Navigate to="/experimenten" replace />} />
            </Routes>
          </AppShell>
        </AuthProvider>
      </StorageProvider>
    </BrowserRouter>
  );
}
