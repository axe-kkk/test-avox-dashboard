import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, X, ChevronDown, Settings2, Trash2 } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';
import { Switch } from '../../components/ui/Switch';

interface NativeIntegration {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
  category: string;
  /** Mock credential summary, what would be configured in the modal. */
  config: { apiKey?: string; account?: string; endpoint?: string };
}

interface McpServer {
  id: string;
  name: string;
  url: string;
  auth: 'api_key' | 'oauth' | 'bearer';
  status: 'connected' | 'error';
  tools: { id: string; name: string; enabled: boolean }[];
}

interface ApiAction {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT';
  url: string;
  headers: string;
  body: string;
  responseMapping: string;
}

const NATIVE_INTEGRATIONS: NativeIntegration[] = [
  { id: 'cloudbeds', label: 'Cloudbeds PMS',    desc: 'Property management & reservations',  enabled: true,  category: 'PMS',          config: { apiKey: 'cb_••••••42af', account: 'grand-palace' } },
  { id: 'whatsapp',  label: 'WhatsApp Business', desc: 'Guest messaging via WhatsApp',        enabled: true,  category: 'Channels',     config: { account: '+33 1 87 39 22 12' } },
  { id: 'email',     label: 'Email (SMTP)',       desc: 'Transactional & campaign email',     enabled: true,  category: 'Channels',     config: { endpoint: 'smtp.eu.sendgrid.net' } },
  { id: 'vonage',    label: 'Vonage',             desc: 'SMS & voice communications',         enabled: false, category: 'Mass Sending', config: {} },
  { id: 'mailchimp', label: 'Mailchimp',          desc: 'Email campaign service',             enabled: false, category: 'Mass Sending', config: {} },
  { id: 'webhook',   label: 'CRM Webhooks',       desc: 'Custom CRM event integration',       enabled: false, category: 'CRM',          config: {} },
  { id: 'widget',    label: 'Web Widget',         desc: 'Embeddable chat widget for website', enabled: true,  category: 'Channels',     config: { endpoint: 'https://grandpalace.com/embed.js' } },
];

const MOCK_MCP: McpServer[] = [
  {
    id: 'm1', name: 'Cloudbeds MCP', url: 'https://mcp.cloudbeds.com/v1',
    auth: 'api_key', status: 'connected',
    tools: [
      { id: 't1', name: 'get_reservation',           enabled: true  },
      { id: 't2', name: 'update_reservation',        enabled: true  },
      { id: 't3', name: 'check_availability',        enabled: true  },
      { id: 't4', name: 'get_guest_profile',         enabled: true  },
      { id: 't5', name: 'create_housekeeping_task',  enabled: false },
    ],
  },
  {
    id: 'm2', name: 'Spa & Dining', url: 'https://mcp.internal/spa',
    auth: 'bearer', status: 'connected',
    tools: [
      { id: 't6', name: 'book_spa_appointment',   enabled: true },
      { id: 't7', name: 'check_spa_availability', enabled: true },
      { id: 't8', name: 'get_menu',               enabled: true },
    ],
  },
];

const MOCK_API: ApiAction[] = [
  { id: 'a1', name: 'Get weather forecast',       method: 'GET',  url: 'https://api.weather.com/forecast',          headers: 'X-API-Key: {{secrets.weather}}', body: '', responseMapping: '$.forecast.daily[0]' },
  { id: 'a2', name: 'Create maintenance ticket',  method: 'POST', url: 'https://maintenance.internal/tickets',      headers: 'Authorization: Bearer {{secrets.maint}}', body: '{ "room": "{{room_number}}", "issue": "{{issue}}" }', responseMapping: '$.id' },
];

const EMPTY_MCP: McpServer = { id: '', name: '', url: '', auth: 'api_key', status: 'connected', tools: [] };
const EMPTY_API: ApiAction = { id: '', name: '', method: 'GET', url: '', headers: '', body: '', responseMapping: '' };

export function IntegrationsPage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [natives, setNatives]       = useState<NativeIntegration[]>(NATIVE_INTEGRATIONS);
  const [mcpServers, setMcpServers] = useState<McpServer[]>(MOCK_MCP);
  const [apiActions, setApiActions] = useState<ApiAction[]>(MOCK_API);
  const [expandedMcp, setExpandedMcp] = useState<string | null>('m1');

  const [nativeDraft, setNativeDraft] = useState<NativeIntegration | null>(null);
  const [mcpDraft, setMcpDraft]       = useState<McpServer | null>(null);
  const [apiDraft, setApiDraft]       = useState<ApiAction | null>(null);

  if (!engine) return null;

  const categories = Array.from(new Set(natives.map(n => n.category)));

  const saveNative = () => {
    if (!nativeDraft) return;
    setNatives(prev => prev.map(n => n.id === nativeDraft.id ? nativeDraft : n));
    addToast({ type: 'success', title: 'Integration saved' });
    setNativeDraft(null);
  };

  const saveMcp = () => {
    if (!mcpDraft) return;
    if (!mcpDraft.name.trim() || !mcpDraft.url.trim()) {
      addToast({ type: 'warning', title: 'Name and URL required' });
      return;
    }
    if (mcpDraft.id) {
      setMcpServers(prev => prev.map(s => s.id === mcpDraft.id ? mcpDraft : s));
    } else {
      setMcpServers(prev => [...prev, { ...mcpDraft, id: `m${Date.now()}` }]);
    }
    addToast({ type: 'success', title: 'MCP server saved' });
    setMcpDraft(null);
  };

  const saveApi = () => {
    if (!apiDraft) return;
    if (!apiDraft.name.trim() || !apiDraft.url.trim()) {
      addToast({ type: 'warning', title: 'Name and URL required' });
      return;
    }
    if (apiDraft.id) {
      setApiActions(prev => prev.map(a => a.id === apiDraft.id ? apiDraft : a));
    } else {
      setApiActions(prev => [...prev, { ...apiDraft, id: `a${Date.now()}` }]);
    }
    addToast({ type: 'success', title: 'API action saved' });
    setApiDraft(null);
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-6 space-y-5">

      {/* ── Native integrations ── */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border">
          <p className="text-[13px] font-semibold text-strong">Native Integrations</p>
        </div>
        <div className="divide-y divide-border-soft">
          {categories.map(cat => (
            <div key={cat}>
              <p className="px-5 py-2 text-[10px] font-semibold text-subtle uppercase tracking-wider bg-surface-2">
                {cat}
              </p>
              {natives.filter(n => n.category === cat).map(integration => (
                <div key={integration.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-surface-3 border border-brand-border flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-semibold text-muted">
                      {integration.label.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-strong">{integration.label}</p>
                    <p className="text-[11px] text-subtle">{integration.desc}</p>
                  </div>
                  <button
                    onClick={() => setNativeDraft(integration)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-brand-blue transition-colors"
                    title="Configure"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  <Switch
                    checked={integration.enabled}
                    onChange={() => setNatives(prev => prev.map(n => n.id === integration.id ? { ...n, enabled: !n.enabled } : n))}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── MCP Servers ── */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-strong">MCP Servers</p>
            <p className="text-[11px] text-subtle mt-0.5">
              Model Context Protocol servers extend the engine's capabilities
            </p>
          </div>
          <button
            onClick={() => setMcpDraft({ ...EMPTY_MCP })}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add MCP
          </button>
        </div>
        <div className="divide-y divide-border-soft">
          {mcpServers.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[12px] text-subtle">No MCP servers connected.</p>
            </div>
          ) : mcpServers.map(server => (
            <div key={server.id}>
              <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors">
                <button
                  onClick={() => setExpandedMcp(expandedMcp === server.id ? null : server.id)}
                  className="flex-1 flex items-center gap-3 min-w-0 text-left"
                >
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', server.status === 'connected' ? 'bg-brand-blue' : 'bg-brand-black')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-strong">{server.name}</p>
                    <p className="text-[11px] font-mono text-subtle truncate">{server.url}</p>
                  </div>
                  <span className="text-[10px] text-subtle tabular-nums whitespace-nowrap">
                    {server.tools.filter(t => t.enabled).length}/{server.tools.length} tools
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-faint transition-transform', expandedMcp === server.id ? 'rotate-180' : '')} />
                </button>
                <button
                  onClick={() => setMcpDraft(server)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-brand-blue transition-colors flex-shrink-0"
                  title="Edit"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMcpServers(prev => prev.filter(s => s.id !== server.id))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {expandedMcp === server.id && (
                <div className="px-5 pb-4 bg-surface-2 border-t border-border-soft">
                  <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider py-3">
                    Available Tools
                  </p>
                  <div className="space-y-1.5">
                    {server.tools.map(tool => (
                      <div key={tool.id} className="flex items-center justify-between">
                        <span
                          className="text-[12px] text-strong"
                          style={{ fontFamily: "'Azeret Mono', monospace" }}
                        >{tool.name}</span>
                        <Switch
                          size="sm"
                          checked={tool.enabled}
                          onChange={() => setMcpServers(prev => prev.map(s => s.id === server.id ? {
                            ...s,
                            tools: s.tools.map(t => t.id === tool.id ? { ...t, enabled: !t.enabled } : t),
                          } : s))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Custom API Actions ── */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-strong">Custom API Actions</p>
            <p className="text-[11px] text-subtle mt-0.5">
              Define custom HTTP calls the engine can make
            </p>
          </div>
          <button
            onClick={() => setApiDraft({ ...EMPTY_API })}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add action
          </button>
        </div>
        <div className="divide-y divide-border-soft">
          {apiActions.length === 0 ? (
            <p className="text-[12px] text-subtle text-center py-12">No custom actions defined.</p>
          ) : apiActions.map(action => (
            <div
              key={action.id}
              onClick={() => setApiDraft(action)}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <span className={cn(
                'text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0',
                action.method === 'GET'  ? 'bg-brand-blue-50 text-brand-blue border border-brand-blue-light' :
                action.method === 'POST' ? 'bg-surface-3 text-strong border border-brand-border'             :
                                           'bg-surface-3 text-muted border border-brand-border',
              )}
              style={{ fontFamily: "'Azeret Mono', monospace" }}>{action.method}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-strong">{action.name}</p>
                <p
                  className="text-[11px] text-subtle truncate"
                  style={{ fontFamily: "'Azeret Mono', monospace" }}
                >{action.url}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setApiActions(prev => prev.filter(a => a.id !== action.id)); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors flex-shrink-0"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════
         Native integration config modal
      ═════════════════════════════════════════════════ */}
      {nativeDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setNativeDraft(null)} aria-label="Close" />
          <div className="relative w-[480px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1">
                  Configure integration
                </p>
                <h3 className="text-[15px] font-semibold text-strong">{nativeDraft.label}</h3>
              </div>
              <button onClick={() => setNativeDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">API key</p>
                <input
                  value={nativeDraft.config.apiKey ?? ''}
                  onChange={e => setNativeDraft({ ...nativeDraft, config: { ...nativeDraft.config, apiKey: e.target.value } })}
                  placeholder="sk-…"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Account / number</p>
                <input
                  value={nativeDraft.config.account ?? ''}
                  onChange={e => setNativeDraft({ ...nativeDraft, config: { ...nativeDraft.config, account: e.target.value } })}
                  placeholder="grand-palace, +33…"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Endpoint</p>
                <input
                  value={nativeDraft.config.endpoint ?? ''}
                  onChange={e => setNativeDraft({ ...nativeDraft, config: { ...nativeDraft.config, endpoint: e.target.value } })}
                  placeholder="https://api.example.com"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2">
              <button
                onClick={() => setNativeDraft(null)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={saveNative}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════
         MCP Add/Edit modal
      ═════════════════════════════════════════════════ */}
      {mcpDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setMcpDraft(null)} aria-label="Close" />
          <div className="relative w-[520px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <h3 className="text-[15px] font-semibold text-strong">
                {mcpDraft.id ? 'Edit MCP server' : 'Add MCP server'}
              </h3>
              <button onClick={() => setMcpDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Server name</p>
                <input
                  value={mcpDraft.name}
                  onChange={e => setMcpDraft({ ...mcpDraft, name: e.target.value })}
                  placeholder="My MCP Server"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Server URL</p>
                <input
                  value={mcpDraft.url}
                  onChange={e => setMcpDraft({ ...mcpDraft, url: e.target.value })}
                  placeholder="https://mcp.example.com/v1"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Authentication</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'api_key', label: 'API Key'      },
                    { id: 'oauth',   label: 'OAuth'        },
                    { id: 'bearer',  label: 'Bearer Token' },
                  ] as const).map(a => (
                    <button
                      key={a.id}
                      onClick={() => setMcpDraft({ ...mcpDraft, auth: a.id })}
                      className={cn(
                        'h-9 rounded-xl text-[12px] font-semibold border transition-colors',
                        mcpDraft.auth === a.id
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                      )}
                    >{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2">
              <button
                onClick={() => setMcpDraft(null)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={saveMcp}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >{mcpDraft.id ? 'Save changes' : 'Connect'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════
         Custom API Action Add/Edit modal
      ═════════════════════════════════════════════════ */}
      {apiDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setApiDraft(null)} aria-label="Close" />
          <div className="relative w-[640px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1">
                  {apiDraft.id ? 'Edit API action' : 'New API action'}
                </p>
                <h3 className="text-[15px] font-semibold text-strong">
                  {apiDraft.name || 'Untitled action'}
                </h3>
              </div>
              <button onClick={() => setApiDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Name</p>
                <input
                  value={apiDraft.name}
                  onChange={e => setApiDraft({ ...apiDraft, name: e.target.value })}
                  placeholder="Get weather forecast"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Method</p>
                  <div className="relative">
                    <select
                      value={apiDraft.method}
                      onChange={e => setApiDraft({ ...apiDraft, method: e.target.value as ApiAction['method'] })}
                      className="w-full h-9 pl-3 pr-9 rounded-xl border border-brand-border bg-surface-2 text-[13px] font-semibold text-strong appearance-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
                      style={{ fontFamily: "'Azeret Mono', monospace" }}
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">URL</p>
                  <input
                    value={apiDraft.url}
                    onChange={e => setApiDraft({ ...apiDraft, url: e.target.value })}
                    placeholder="https://api.example.com/path"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Headers</p>
                <textarea
                  value={apiDraft.headers}
                  onChange={e => setApiDraft({ ...apiDraft, headers: e.target.value })}
                  rows={2}
                  placeholder="X-API-Key: {{secrets.weather}}"
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-surface-2 text-[12px] font-mono text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Body template</p>
                <textarea
                  value={apiDraft.body}
                  onChange={e => setApiDraft({ ...apiDraft, body: e.target.value })}
                  rows={4}
                  placeholder='{ "room": "{{room_number}}", "issue": "{{issue}}" }'
                  className="w-full px-3 py-2 rounded-xl border border-brand-border bg-surface-2 text-[12px] font-mono text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Response mapping</p>
                <input
                  value={apiDraft.responseMapping}
                  onChange={e => setApiDraft({ ...apiDraft, responseMapping: e.target.value })}
                  placeholder="$.forecast.daily[0]"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
                <p className="text-[10px] text-subtle mt-1">JSONPath that extracts the value the engine will use.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setApiDraft(null)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={saveApi}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >{apiDraft.id ? 'Save changes' : 'Add action'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
