import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, X, ChevronDown } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';

const ENGINE_COLORS: Record<string, string> = {
  Conversion: '#2355A7', Reservation: '#2355A7', Upsell: '#2355A7',
  Arrival: '#2355A7', Concierge: '#2355A7', Recovery: '#2355A7', Reputation: '#2355A7',
};

interface NativeIntegration {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
  category: string;
}

interface McpServer {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'error';
  tools: { id: string; name: string; enabled: boolean }[];
}

interface ApiAction {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT';
  url: string;
}

const NATIVE_INTEGRATIONS: NativeIntegration[] = [
  { id: 'cloudbeds', label: 'Cloudbeds PMS',   desc: 'Property management & reservations', enabled: true,  category: 'PMS'           },
  { id: 'whatsapp',  label: 'WhatsApp Business',desc: 'Guest messaging via WhatsApp',       enabled: true,  category: 'Channels'      },
  { id: 'email',     label: 'Email (SMTP)',      desc: 'Transactional & campaign email',    enabled: true,  category: 'Channels'      },
  { id: 'vonage',    label: 'Vonage',            desc: 'SMS & voice communications',        enabled: false, category: 'Mass Sending'  },
  { id: 'mailchimp', label: 'Mailchimp',         desc: 'Email campaign service',            enabled: false, category: 'Mass Sending'  },
  { id: 'webhook',   label: 'CRM Webhooks',      desc: 'Custom CRM event integration',     enabled: false, category: 'CRM'           },
  { id: 'widget',    label: 'Web Widget',        desc: 'Embeddable chat widget for website',enabled: true,  category: 'Channels'      },
];

const MOCK_MCP: McpServer[] = [
  {
    id: 'm1',
    name: 'Cloudbeds MCP',
    url: 'https://mcp.cloudbeds.com/v1',
    status: 'connected',
    tools: [
      { id: 't1', name: 'get_reservation',       enabled: true  },
      { id: 't2', name: 'update_reservation',    enabled: true  },
      { id: 't3', name: 'check_availability',    enabled: true  },
      { id: 't4', name: 'get_guest_profile',     enabled: true  },
      { id: 't5', name: 'create_housekeeping_task', enabled: false },
    ],
  },
  {
    id: 'm2',
    name: 'Spa & Dining',
    url: 'https://mcp.internal/spa',
    status: 'connected',
    tools: [
      { id: 't6', name: 'book_spa_appointment',  enabled: true  },
      { id: 't7', name: 'check_spa_availability',enabled: true  },
      { id: 't8', name: 'get_menu',              enabled: true  },
    ],
  },
];

const MOCK_API: ApiAction[] = [
  { id: 'a1', name: 'Get weather forecast',   method: 'GET',  url: 'https://api.weather.com/forecast' },
  { id: 'a2', name: 'Create maintenance ticket', method: 'POST', url: 'https://maintenance.internal/tickets' },
];

export function IntegrationsPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [natives, setNatives] = useState<NativeIntegration[]>(NATIVE_INTEGRATIONS);
  const [mcpServers, setMcpServers] = useState<McpServer[]>(MOCK_MCP);
  const [apiActions, setApiActions] = useState<ApiAction[]>(MOCK_API);
  const [showAddMcp, setShowAddMcp] = useState(false);
  const [showAddApi, setShowAddApi] = useState(false);
  const [expandedMcp, setExpandedMcp] = useState<string | null>('m1');

  if (!engine) return null;
  const color = ENGINE_COLORS[engine.name] ?? '#2355A7';

  const categories = Array.from(new Set(natives.map(n => n.category)));

  return (
    <div className="max-w-[900px] mx-auto px-6 py-6 space-y-5">

      {/* ── Native integrations ── */}
      <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EDEEF1]">
          <p className="text-[13px] font-semibold text-[#3D4550]">Native Integrations</p>
        </div>
        <div className="divide-y divide-[#F2F3F5]">
          {categories.map(cat => (
            <div key={cat}>
              <p className="px-5 py-2 text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider bg-[#FAFAFA]">{cat}</p>
              {natives.filter(n => n.category === cat).map(integration => (
                <div key={integration.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#F6F7F9] border border-[#EDEEF1] flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-[#5C6370]">{integration.label.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#3D4550]">{integration.label}</p>
                    <p className="text-[11px] text-[#8B9299]">{integration.desc}</p>
                  </div>
                  <div
                    onClick={() => setNatives(prev => prev.map(n => n.id === integration.id ? { ...n, enabled: !n.enabled } : n))}
                    className="rounded-full relative transition-colors cursor-pointer flex-shrink-0"
                    style={{ width: 40, height: 22, background: integration.enabled ? color : '#D1D5DB' }}
                  >
                    <span
                      className={cn('absolute top-0.5 rounded-full bg-white shadow-sm transition-transform', integration.enabled ? 'translate-x-5' : 'translate-x-0.5')}
                      style={{ width: 18, height: 18 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── MCP Servers ── */}
      <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EDEEF1] flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#3D4550]">MCP Servers</p>
            <p className="text-[11px] text-[#8B9299] mt-0.5">Model Context Protocol servers extend the engine's capabilities</p>
          </div>
          <button
            onClick={() => setShowAddMcp(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold text-white transition-colors"
            style={{ background: color }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add MCP
          </button>
        </div>
        <div className="divide-y divide-[#F2F3F5]">
          {mcpServers.map(server => (
            <div key={server.id}>
              <button
                onClick={() => setExpandedMcp(expandedMcp === server.id ? null : server.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors text-left"
              >
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', server.status === 'connected' ? 'bg-[#16A34A]' : 'bg-[#EF4444]')} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#3D4550]">{server.name}</p>
                  <p className="text-[11px] font-mono text-[#8B9299]">{server.url}</p>
                </div>
                <span className="text-[10px] text-[#A0A6B0]">{server.tools.filter(t => t.enabled).length}/{server.tools.length} tools active</span>
                <ChevronDown className={cn('w-4 h-4 text-[#A0A6B0] transition-transform', expandedMcp === server.id ? 'rotate-180' : '')} />
              </button>

              {expandedMcp === server.id && (
                <div className="px-5 pb-4 bg-[#FAFAFA] border-t border-[#F2F3F5]">
                  <p className="text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider py-3">Available Tools</p>
                  <div className="space-y-1.5">
                    {server.tools.map(tool => (
                      <div key={tool.id} className="flex items-center justify-between">
                        <span className="text-[12px] font-mono text-[#3D4550]">{tool.name}</span>
                        <div
                          onClick={() => setMcpServers(prev => prev.map(s => s.id === server.id ? {
                            ...s,
                            tools: s.tools.map(t => t.id === tool.id ? { ...t, enabled: !t.enabled } : t),
                          } : s))}
                          className="rounded-full relative transition-colors cursor-pointer flex-shrink-0"
                          style={{ width: 32, height: 18, background: tool.enabled ? color : '#D1D5DB' }}
                        >
                          <span
                            className={cn('absolute top-0.5 rounded-full bg-white shadow-sm transition-transform', tool.enabled ? 'translate-x-3.5' : 'translate-x-0.5')}
                            style={{ width: 14, height: 14 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add MCP form */}
      {showAddMcp && (
        <div className="bg-white rounded-2xl border border-[#2355A7] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#3D4550]">Add MCP Server</p>
            <button onClick={() => setShowAddMcp(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8B9299] hover:bg-[#F6F7F9]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#5C6370] mb-1.5">Server name</label>
              <input placeholder="My MCP Server" className="w-full h-9 px-3 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#5C6370] mb-1.5">Server URL</label>
              <input placeholder="https://mcp.example.com/v1" className="w-full h-9 px-3 rounded-xl border border-[#EDEEF1] bg-[#F9F9F9] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] focus:bg-white" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#5C6370] mb-1.5">Authentication</label>
            <div className="flex gap-2">
              {['API Key', 'OAuth', 'Bearer Token'].map(auth => (
                <button key={auth} className="h-8 px-3 rounded-lg border border-[#EDEEF1] text-[12px] text-[#5C6370] hover:border-[#2355A7] hover:text-[#2355A7] transition-colors">
                  {auth}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAddMcp(false)} className="h-9 px-4 rounded-xl border border-[#EDEEF1] text-[13px] font-medium text-[#5C6370] hover:bg-[#F6F7F9]">Cancel</button>
            <button onClick={() => { addToast({ type: 'success', title: 'MCP server connecting…' }); setShowAddMcp(false); }} className="h-9 px-4 rounded-xl text-[13px] font-semibold text-white" style={{ background: color }}>
              Connect
            </button>
          </div>
        </div>
      )}

      {/* ── Custom API Actions ── */}
      <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#EDEEF1] flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#3D4550]">Custom API Actions</p>
            <p className="text-[11px] text-[#8B9299] mt-0.5">Define custom HTTP calls the engine can make</p>
          </div>
          <button
            onClick={() => setShowAddApi(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold text-white"
            style={{ background: color }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add action
          </button>
        </div>
        <div className="divide-y divide-[#F2F3F5]">
          {apiActions.map(action => (
            <div key={action.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors">
              <span className={cn(
                'text-[10px] font-bold px-2 py-1 rounded-md font-mono flex-shrink-0',
                action.method === 'GET'  ? 'bg-[#DCFCE7] text-[#16A34A]' :
                action.method === 'POST' ? 'bg-[#EEF2FC] text-[#2355A7]' :
                                          'bg-[#FEF9C3] text-[#D97706]',
              )}>{action.method}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#3D4550]">{action.name}</p>
                <p className="text-[11px] font-mono text-[#8B9299] truncate">{action.url}</p>
              </div>
              <button
                onClick={() => setApiActions(prev => prev.filter(a => a.id !== action.id))}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#C4C8CF] hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {apiActions.length === 0 && (
            <p className="text-[13px] text-[#8B9299] text-center py-8">No custom actions defined.</p>
          )}
        </div>
      </div>
    </div>
  );
}
