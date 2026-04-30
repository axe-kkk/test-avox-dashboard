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
import { ChannelsPage } from '../features/channels/ChannelsPage';
import { SettingsPage } from '../features/settings/SettingsPage';

import { OverviewPage as AnalyticsOverviewPage } from '../features/analytics/pages/OverviewPage';
import { ConnectsPage } from '../features/analytics/pages/ConnectsPage';
import { ChannelsAnalyticsPage } from '../features/analytics/pages/ChannelsAnalyticsPage';
import { OperatorsPage } from '../features/analytics/pages/OperatorsPage';
import { DepartmentsPage } from '../features/analytics/pages/DepartmentsPage';
import { LoadPage } from '../features/analytics/pages/LoadPage';
import { GuestInsightsPage } from '../features/analytics/pages/GuestInsightsPage';
import { ScheduledReportsPage } from '../features/analytics/pages/ScheduledReportsPage';
import { ConversionEnginePage } from '../features/analytics/pages/engines/ConversionEnginePage';
import { ReservationEnginePage } from '../features/analytics/pages/engines/ReservationEnginePage';
import { UpsellEnginePage } from '../features/analytics/pages/engines/UpsellEnginePage';
import { ArrivalEnginePage } from '../features/analytics/pages/engines/ArrivalEnginePage';
import { ConciergeEnginePage } from '../features/analytics/pages/engines/ConciergeEnginePage';
import { RecoveryEnginePage } from '../features/analytics/pages/engines/RecoveryEnginePage';
import { ReputationEnginePage } from '../features/analytics/pages/engines/ReputationEnginePage';

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
          <Route path="/channels" element={<ChannelsPage />} />

          {/* Analytics module — TZ §7 */}
          <Route path="/analytics" element={<AnalyticsOverviewPage />} />
          <Route path="/analytics/overview" element={<HomePage />} />
          <Route path="/analytics/connects" element={<ConnectsPage />} />
          <Route path="/analytics/engines/conversion"  element={<ConversionEnginePage />} />
          <Route path="/analytics/engines/reservation" element={<ReservationEnginePage />} />
          <Route path="/analytics/engines/upsell"      element={<UpsellEnginePage />} />
          <Route path="/analytics/engines/arrival"     element={<ArrivalEnginePage />} />
          <Route path="/analytics/engines/concierge"   element={<ConciergeEnginePage />} />
          <Route path="/analytics/engines/recovery"    element={<RecoveryEnginePage />} />
          <Route path="/analytics/engines/reputation"  element={<ReputationEnginePage />} />
          <Route path="/analytics/channels"   element={<ChannelsAnalyticsPage />} />
          <Route path="/analytics/operators"  element={<OperatorsPage />} />
          <Route path="/analytics/departments" element={<DepartmentsPage />} />
          <Route path="/analytics/load"       element={<LoadPage />} />
          <Route path="/analytics/guests"     element={<GuestInsightsPage />} />
          <Route path="/analytics/reports"    element={<ScheduledReportsPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
