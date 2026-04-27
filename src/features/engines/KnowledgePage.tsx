import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Upload, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';

const ENGINE_COLORS: Record<string, string> = {
  Conversion: '#2355A7', Reservation: '#0EA5E9', Upsell: '#8B5CF6',
  Arrival: '#10B981', Concierge: '#F59E0B', Recovery: '#EF4444', Reputation: '#EC4899',
};

const QA_ITEMS = [
  { id: 'q1', question: 'What time is check-in?',             answer: 'Standard check-in is 3:00 PM. Early check-in from 10 AM is available for a fee.', category: 'Check-in',    status: 'active', uses: 142 },
  { id: 'q2', question: 'Do you have a pool?',                answer: 'Yes, we have a heated outdoor pool open from 8 AM to 10 PM daily.',               category: 'Facilities', status: 'active', uses: 89  },
  { id: 'q3', question: 'Is breakfast included?',             answer: 'Breakfast is included in Deluxe and Suite rates. Standard rooms are room-only.',   category: 'Dining',     status: 'active', uses: 201 },
  { id: 'q4', question: 'What is your cancellation policy?', answer: 'Free cancellation up to 48 hours before check-in. After that, one night is charged.', category: 'Policies', status: 'draft',  uses: 0   },
  { id: 'q5', question: 'Do you have parking?',               answer: 'Covered parking is available at €25/day. Valet parking at €35/day.',              category: 'Facilities', status: 'active', uses: 67  },
];

const DOCUMENTS = [
  { id: 'd1', name: 'Hotel Fact Sheet 2026.pdf',  size: '2.4 MB', uploaded: 'Apr 10, 2026', status: 'indexed',    category: 'General' },
  { id: 'd2', name: 'Spa Menu Spring 2026.pdf',   size: '1.1 MB', uploaded: 'Apr 12, 2026', status: 'indexed',    category: 'Spa'     },
  { id: 'd3', name: 'Restaurant Menu.pdf',         size: '3.7 MB', uploaded: 'Apr 18, 2026', status: 'processing', category: 'Dining'  },
  { id: 'd4', name: 'COVID Policies.pdf',          size: '0.4 MB', uploaded: 'Jan 05, 2025', status: 'indexed',    category: 'Policies'},
];

const URLS = [
  { id: 'u1', url: 'https://grandpalace.com/faq',      scanned: '2 hours ago',  status: 'ok',      freq: 'Daily',   category: 'FAQ'     },
  { id: 'u2', url: 'https://grandpalace.com/dining',   scanned: '1 day ago',    status: 'ok',      freq: 'Weekly',  category: 'Dining'  },
  { id: 'u3', url: 'https://grandpalace.com/spa',      scanned: '3 days ago',   status: 'ok',      freq: 'Weekly',  category: 'Spa'     },
  { id: 'u4', url: 'https://grandpalace.com/rooms',    scanned: 'Never',        status: 'pending', freq: 'Manual',  category: 'Rooms'   },
];

const STRUCTURED = [
  { id: 's1', name: 'Room rates 2026',     rows: 18, updated: 'Apr 15, 2026', category: 'Pricing'    },
  { id: 's2', name: 'Room specifications', rows: 12, updated: 'Mar 01, 2026', category: 'Rooms'      },
  { id: 's3', name: 'Restaurant menu',     rows: 42, updated: 'Apr 20, 2026', category: 'Dining'     },
];

type TabId = 'qa' | 'docs' | 'urls' | 'structured';

export function KnowledgePage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [tab, setTab] = useState<TabId>('qa');
  const [search, setSearch] = useState('');
  const [qaFilter, setQaFilter] = useState('All');

  if (!engine) return null;
  const color = ENGINE_COLORS[engine.name] ?? '#2355A7';

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'qa',         label: 'Q&A Pairs',       count: QA_ITEMS.length    },
    { id: 'docs',       label: 'Documents',        count: DOCUMENTS.length   },
    { id: 'urls',       label: 'URLs',             count: URLS.length        },
    { id: 'structured', label: 'Structured Data',  count: STRUCTURED.length  },
  ];

  const categories = ['All', ...Array.from(new Set(QA_ITEMS.map(q => q.category)))];
  const filteredQA = QA_ITEMS.filter(q =>
    (qaFilter === 'All' || q.category === qaFilter) &&
    (!search || q.question.toLowerCase().includes(search.toLowerCase()))
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const conf: Record<string, string> = {
      active:     'bg-[#DCFCE7] text-[#16A34A]',
      draft:      'bg-[#F1F5F9] text-[#64748B]',
      indexed:    'bg-[#DCFCE7] text-[#16A34A]',
      processing: 'bg-[#FEF9C3] text-[#D97706]',
      error:      'bg-[#FEE2E2] text-[#EF4444]',
      ok:         'bg-[#DCFCE7] text-[#16A34A]',
      pending:    'bg-[#FEF9C3] text-[#D97706]',
    };
    return (
      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', conf[status] ?? 'bg-[#F1F5F9] text-[#64748B]')}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-6">

      {/* Top action bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B9299] pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search knowledge base…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#EDEEF1] bg-white text-[12px] text-[#3D4550] placeholder:text-[#8B9299] focus:outline-none focus:ring-2 focus:ring-[#BED4F6] transition"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => addToast({ type: 'info', title: 'Import CSV' })} className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#EDEEF1] bg-white text-[12px] font-medium text-[#5C6370] hover:bg-[#F6F7F9] transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <button onClick={() => addToast({ type: 'info', title: 'Import from URL' })} className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#EDEEF1] bg-white text-[12px] font-medium text-[#5C6370] hover:bg-[#F6F7F9] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Import URL
          </button>
          <button onClick={() => addToast({ type: 'success', title: 'AI generating Q&A…' })} className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12px] font-semibold text-white transition-colors" style={{ background: color }}>
            <Sparkles className="w-3.5 h-3.5" />
            Generate Q&A with AI
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EDEEF1] mb-5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-[#2355A7] text-[#2355A7]' : 'border-transparent text-[#8B9299] hover:text-[#5C6370]',
            )}
          >
            {t.label}
            <span className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
              tab === t.id ? 'bg-[#EEF2FC] text-[#2355A7]' : 'bg-[#F6F7F9] text-[#8B9299]',
            )}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── Q&A ── */}
      {tab === 'qa' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setQaFilter(cat)}
                className={cn(
                  'h-7 px-3 rounded-full text-[11px] font-medium border transition-all',
                  qaFilter === cat ? 'bg-[#2355A7] text-white border-[#2355A7]' : 'bg-white text-[#5C6370] border-[#E4E6EA] hover:border-[#2355A7] hover:text-[#2355A7]',
                )}
              >{cat}</button>
            ))}
            <button
              onClick={() => addToast({ type: 'info', title: 'Add Q&A' })}
              className="ml-auto flex items-center gap-1 h-7 px-3 rounded-full text-[11px] font-semibold text-white transition-colors"
              style={{ background: color }}
            >
              <Plus className="w-3 h-3" />
              Add Q&A
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#EDEEF1]">
                  {['Question', 'Answer preview', 'Category', 'Status', 'Uses', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F3F5]">
                {filteredQA.map(q => (
                  <tr key={q.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <p className="text-[13px] font-medium text-[#3D4550] truncate">{q.question}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <p className="text-[12px] text-[#5C6370] line-clamp-2">{q.answer}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-[#5C6370] bg-[#F6F7F9] px-2 py-0.5 rounded-md border border-[#EDEEF1]">{q.category}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={q.status} /></td>
                    <td className="px-5 py-3.5 text-[12px] tabular-nums text-[#5C6370]">{q.uses}</td>
                    <td className="px-5 py-3.5">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#C4C8CF] hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Documents ── */}
      {tab === 'docs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => addToast({ type: 'info', title: 'Upload document' })}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white"
              style={{ background: color }}
            >
              <Upload className="w-4 h-4" />
              Upload document
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#EDEEF1]">
                  {['File name', 'Size', 'Category', 'Status', 'Uploaded', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F3F5]">
                {DOCUMENTS.map(doc => (
                  <tr key={doc.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#3D4550]">{doc.name}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8B9299] tabular-nums">{doc.size}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-[#5C6370] bg-[#F6F7F9] px-2 py-0.5 rounded-md border border-[#EDEEF1]">{doc.category}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={doc.status} /></td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8B9299]">{doc.uploaded}</td>
                    <td className="px-5 py-3.5">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#C4C8CF] hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── URLs ── */}
      {tab === 'urls' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => addToast({ type: 'info', title: 'Add URL' })}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white"
              style={{ background: color }}
            >
              <Plus className="w-4 h-4" />
              Add URL
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-[#EDEEF1] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#EDEEF1]">
                  {['URL', 'Category', 'Last scanned', 'Status', 'Frequency', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#8B9299] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F3F5]">
                {URLS.map(url => (
                  <tr key={url.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-mono text-[#2355A7] max-w-[260px] truncate">{url.url}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-[#5C6370] bg-[#F6F7F9] px-2 py-0.5 rounded-md border border-[#EDEEF1]">{url.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#8B9299]">{url.scanned}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={url.status} /></td>
                    <td className="px-5 py-3.5 text-[12px] text-[#5C6370]">{url.freq}</td>
                    <td className="px-5 py-3.5">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-[#C4C8CF] hover:bg-[#FEE2E2] hover:text-[#EF4444] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Structured Data ── */}
      {tab === 'structured' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button onClick={() => addToast({ type: 'info', title: 'Import CSV' })} className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[#EDEEF1] bg-white text-[12px] font-medium text-[#5C6370] hover:bg-[#F6F7F9] transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Import CSV
            </button>
            <button onClick={() => addToast({ type: 'info', title: 'New table' })} className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white" style={{ background: color }}>
              <Plus className="w-4 h-4" />
              New table
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {STRUCTURED.map(tbl => (
              <div key={tbl.id} className="bg-white rounded-2xl border border-[#EDEEF1] p-5 hover:border-[#BED4F6] transition-colors cursor-pointer group">
                <p className="text-[13px] font-semibold text-[#3D4550] mb-1 group-hover:text-[#2355A7] transition-colors">{tbl.name}</p>
                <p className="text-[11px] text-[#8B9299]">{tbl.rows} rows · {tbl.category}</p>
                <p className="text-[10px] text-[#C4C8CF] mt-2">Updated {tbl.updated}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
