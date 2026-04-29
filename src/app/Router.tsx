import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { HomePage } from '../features/home/HomePage';
import { InboxPage } from '../features/inbox/InboxPage';
import { GuestsPage } from '../features/guests/GuestsPage';
import { EnginesPage } from '../features/engines/EnginesPage';
import { EnginePage, EngineOverviewPage } from '../features/engines/EnginePage';
import { ActivationPage } from '../features/engines/ActivationPage';
import { EngineSettingsPage } from '../features/engines/EngineSettingsPage';
import { OffersPage } from '../features/engines/OffersPage';
import { KnowledgePage } from '../features/engines/KnowledgePage';
import { EngineRoutingPage } from '../features/engines/EngineRoutingPage';
import { IntegrationsPage } from '../features/engines/IntegrationsPage';
import { PlaygroundPage } from '../features/engines/PlaygroundPage';
import { EngineAnalyticsPage } from '../features/engines/EngineAnalyticsPage';
import { EngineMonitorPage } from '../features/engines/EngineMonitorPage';
import { EngineConfigPage } from '../features/engines/EngineConfigPage';
import { SequencesPage } from '../features/sequences/SequencesPage';
import { ChannelsPage } from '../features/channels/ChannelsPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<InboxPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/guests" element={<GuestsPage />} />
          <Route path="/engines" element={<EnginesPage />} />
          <Route path="/engines/:engineSlug" element={<EnginePage />}>
            <Route index element={<EngineOverviewPage />} />
            <Route path="activation" element={<ActivationPage />} />
            <Route path="settings" element={<EngineSettingsPage />} />
            <Route path="offers" element={<OffersPage />} />
            <Route path="knowledge" element={<KnowledgePage />} />
            <Route path="routing" element={<EngineRoutingPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="playground" element={<PlaygroundPage />} />
            <Route path="analytics"  element={<EngineAnalyticsPage />} />
            <Route path="monitor"    element={<EngineMonitorPage />} />
            <Route path="config"     element={<EngineConfigPage />} />
          </Route>
          <Route path="/sequences" element={<SequencesPage />} />
          <Route path="/channels" element={<ChannelsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/analytics/overview" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
