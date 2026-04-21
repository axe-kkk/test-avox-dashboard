import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { HomePage } from '../features/home/HomePage';
import { InboxPage } from '../features/inbox/InboxPage';
import { GuestsPage } from '../features/guests/GuestsPage';
import { EnginesPage } from '../features/engines/EnginesPage';
import { SequencesPage } from '../features/sequences/SequencesPage';
import { ChannelsPage } from '../features/channels/ChannelsPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/guests" element={<GuestsPage />} />
          <Route path="/engines" element={<EnginesPage />} />
          <Route path="/sequences" element={<SequencesPage />} />
          <Route path="/channels" element={<ChannelsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
