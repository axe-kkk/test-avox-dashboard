import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BarChart2, Activity } from 'lucide-react';

function ComingSoonPage({ label }: { label: string }) {
  const icon = label === 'Analytics' ? BarChart2 : Activity;
  const Icon = icon;
  return (
    <div className="flex items-center justify-center h-full" style={{ background: 'var(--color-brand-bg, #F7F8FA)' }}>
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#EEF2FC] flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 text-[#2355A7]" />
        </div>
        <p className="text-[12px] font-semibold text-[#3D4550] mb-1">{label}</p>
        <p className="text-[10px] text-[#8B9299]">Coming soon</p>
      </div>
    </div>
  );
}
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
            <Route path="analytics" element={<ComingSoonPage label="Analytics" />} />
            <Route path="monitor"   element={<ComingSoonPage label="Monitor Agent" />} />
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
