import { useParams } from 'react-router-dom';
import { mockEngines } from '../../data/mock/engines';
import { ConversionConfigPage }  from './config/ConversionConfigPage';
import { ReservationConfigPage } from './config/ReservationConfigPage';
import { UpsellConfigPage }      from './config/UpsellConfigPage';
import { ArrivalConfigPage }     from './config/ArrivalConfigPage';
import { ConciergeConfigPage }   from './config/ConciergeConfigPage';
import { RecoveryConfigPage }    from './config/RecoveryConfigPage';
import { ReputationConfigPage }  from './config/ReputationConfigPage';

/**
 * Dispatcher for the engine-specific configuration page.
 *
 * Each engine has its own configuration screen with engine-specific
 * settings (e.g. Upgrade Rules for Upsell, Complaint Categories for
 * Recovery). The sub-sidebar exposes a single "Configuration" item
 * with a label that varies per engine — see engineSpec.configLabel.
 */
export function EngineConfigPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);
  if (!engine) return null;

  switch (engine.name) {
    case 'Conversion':  return <ConversionConfigPage  />;
    case 'Reservation': return <ReservationConfigPage />;
    case 'Upsell':      return <UpsellConfigPage      />;
    case 'Arrival':     return <ArrivalConfigPage     />;
    case 'Concierge':   return <ConciergeConfigPage   />;
    case 'Recovery':    return <RecoveryConfigPage    />;
    case 'Reputation':  return <ReputationConfigPage  />;
    default:            return null;
  }
}
