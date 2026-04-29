import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus, Search, Upload, RefreshCw, Sparkles, Trash2, X, Edit2, FileText,
  Download, ChevronDown,
} from 'lucide-react';
import { mockEngines } from '../../data/mock/engines';
import { cn } from '../../utils';
import { useApp } from '../../app/AppContext';

interface QA {
  id: string;
  question: string;
  variations: string;
  answer: string;
  category: string;
  status: 'active' | 'draft';
  uses: number;
}

interface Doc {
  id: string;
  name: string;
  size: string;
  uploaded: string;
  status: 'indexed' | 'processing' | 'error';
  category: string;
}

interface UrlEntry {
  id: string;
  url: string;
  scanned: string;
  status: 'ok' | 'pending' | 'error';
  freq: 'Daily' | 'Weekly' | 'Manual';
  category: string;
}

interface StructuredTable {
  id: string;
  name: string;
  rows: number;
  updated: string;
  category: string;
  columns: string[];
  data: string[][];
}

const QA_ITEMS: QA[] = [
  { id: 'q1', question: 'What time is check-in?',            variations: 'check-in time, when can I arrive', answer: 'Standard check-in is 3:00 PM. Early check-in from 10 AM is available for a fee.',     category: 'Check-in',    status: 'active', uses: 142 },
  { id: 'q2', question: 'Do you have a pool?',                variations: 'swimming pool, pool hours',         answer: 'Yes, we have a heated outdoor pool open from 8 AM to 10 PM daily.',                  category: 'Facilities', status: 'active', uses: 89  },
  { id: 'q3', question: 'Is breakfast included?',             variations: 'breakfast, included meals',         answer: 'Breakfast is included in Deluxe and Suite rates. Standard rooms are room-only.',     category: 'Dining',     status: 'active', uses: 201 },
  { id: 'q4', question: 'What is your cancellation policy?', variations: 'cancellation, refund',              answer: 'Free cancellation up to 48 hours before check-in. After that, one night is charged.', category: 'Policies',    status: 'draft',  uses: 0   },
  { id: 'q5', question: 'Do you have parking?',               variations: 'parking, where to park',            answer: 'Covered parking is available at €25/day. Valet parking at €35/day.',                category: 'Facilities', status: 'active', uses: 67  },
];

const DOCUMENTS: Doc[] = [
  { id: 'd1', name: 'Hotel Fact Sheet 2026.pdf',  size: '2.4 MB', uploaded: 'Apr 10, 2026', status: 'indexed',    category: 'General' },
  { id: 'd2', name: 'Spa Menu Spring 2026.pdf',   size: '1.1 MB', uploaded: 'Apr 12, 2026', status: 'indexed',    category: 'Spa'     },
  { id: 'd3', name: 'Restaurant Menu.pdf',        size: '3.7 MB', uploaded: 'Apr 18, 2026', status: 'processing', category: 'Dining'  },
  { id: 'd4', name: 'COVID Policies.pdf',         size: '0.4 MB', uploaded: 'Jan 05, 2025', status: 'indexed',    category: 'Policies'},
];

const URLS: UrlEntry[] = [
  { id: 'u1', url: 'https://grandpalace.com/faq',     scanned: '2 hours ago', status: 'ok',      freq: 'Daily',  category: 'FAQ'    },
  { id: 'u2', url: 'https://grandpalace.com/dining',  scanned: '1 day ago',   status: 'ok',      freq: 'Weekly', category: 'Dining' },
  { id: 'u3', url: 'https://grandpalace.com/spa',     scanned: '3 days ago',  status: 'ok',      freq: 'Weekly', category: 'Spa'    },
  { id: 'u4', url: 'https://grandpalace.com/rooms',   scanned: 'Never',       status: 'pending', freq: 'Manual', category: 'Rooms'  },
];

const STRUCTURED: StructuredTable[] = [
  {
    id: 's1', name: 'Room rates 2026', rows: 4, updated: 'Apr 15, 2026', category: 'Pricing',
    columns: ['Room type', 'Low season', 'Mid season', 'High season', 'Currency'],
    data: [
      ['Standard Queen',  '180', '220', '290', 'EUR'],
      ['Deluxe King',     '240', '290', '380', 'EUR'],
      ['Junior Suite',    '320', '410', '540', 'EUR'],
      ['Presidential',    '780', '980', '1280','EUR'],
    ],
  },
  {
    id: 's2', name: 'Room specifications', rows: 4, updated: 'Mar 01, 2026', category: 'Rooms',
    columns: ['Room type', 'Size (m²)', 'View', 'Capacity', 'Bed config'],
    data: [
      ['Standard Queen', '24', 'Courtyard', '2', '1× Queen'      ],
      ['Deluxe King',    '34', 'City',      '2', '1× King'        ],
      ['Junior Suite',   '48', 'River',     '3', '1× King + Sofa'],
      ['Presidential',   '92', 'River',     '4', '1× King + 2× Twin'],
    ],
  },
  {
    id: 's3', name: 'Restaurant menu', rows: 4, updated: 'Apr 20, 2026', category: 'Dining',
    columns: ['Item', 'Course', 'Price', 'Allergens'],
    data: [
      ['Beef tartare',          'Starter', '24', 'egg'        ],
      ['Burrata & heirloom',    'Starter', '22', 'dairy'      ],
      ['Lamb shoulder, 7-hour', 'Main',    '48', '—'          ],
      ['Soufflé Grand Marnier', 'Dessert', '18', 'egg, dairy'],
    ],
  },
];

const EMPTY_QA: QA = { id: '', question: '', variations: '', answer: '', category: '', status: 'draft', uses: 0 };
const EMPTY_URL: UrlEntry = { id: '', url: '', scanned: 'Never', status: 'pending', freq: 'Weekly', category: '' };
const EMPTY_TABLE: StructuredTable = {
  id: '', name: '', rows: 0, updated: '', category: '',
  columns: ['Column 1', 'Column 2'],
  data: [['', '']],
};

type TabId = 'qa' | 'docs' | 'urls' | 'structured';

/* ─── Status badge — Inbox-toned (no rainbow) ─── */
function StatusBadge({ status }: { status: string }) {
  /* Three semantic groups:
     - "ok" / "active" / "indexed" → brand-blue accent
     - "processing" / "pending"    → neutral muted
     - "error" / "draft"           → black accent */
  const ok = ['active', 'indexed', 'ok'].includes(status);
  const muted = ['processing', 'pending', 'draft'].includes(status);
  return (
    <span
      className={cn(
        'text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border whitespace-nowrap',
        ok       ? 'bg-brand-blue-50 text-brand-blue border-brand-blue-light' :
        muted    ? 'bg-surface-3 text-subtle border-brand-border'             :
                   'bg-surface-3 text-brand-black border-brand-border',
      )}
    >
      {status}
    </span>
  );
}

export function KnowledgePage() {
  const { engineSlug } = useParams<{ engineSlug: string }>();
  const { addToast } = useApp();
  const engine = mockEngines.find(e => e.name.toLowerCase() === engineSlug);

  const [tab, setTab] = useState<TabId>('qa');
  const [search, setSearch] = useState('');
  const [qaFilter, setQaFilter] = useState('All');

  const [qaItems, setQaItems] = useState<QA[]>(QA_ITEMS);
  const [docs, setDocs] = useState<Doc[]>(DOCUMENTS);
  const [urls, setUrls] = useState<UrlEntry[]>(URLS);
  const [tables, setTables] = useState<StructuredTable[]>(STRUCTURED);

  /* Modals */
  const [qaDraft, setQaDraft] = useState<QA | null>(null);
  const [urlDraft, setUrlDraft] = useState<UrlEntry | null>(null);
  const [tblDraft, setTblDraft] = useState<StructuredTable | null>(null);
  const [docDraft, setDocDraft] = useState<Doc | null>(null);

  /* ── Structured-table grid helpers ── */
  const gridUpdateCell = (rowIdx: number, colIdx: number, value: string) => {
    if (!tblDraft) return;
    const next = tblDraft.data.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => ci === colIdx ? value : cell) : row,
    );
    setTblDraft({ ...tblDraft, data: next });
  };
  const gridUpdateColumn = (colIdx: number, value: string) => {
    if (!tblDraft) return;
    setTblDraft({ ...tblDraft, columns: tblDraft.columns.map((c, i) => i === colIdx ? value : c) });
  };
  const gridAddRow = () => {
    if (!tblDraft) return;
    setTblDraft({ ...tblDraft, data: [...tblDraft.data, tblDraft.columns.map(() => '')] });
  };
  const gridDeleteRow = (rowIdx: number) => {
    if (!tblDraft) return;
    setTblDraft({ ...tblDraft, data: tblDraft.data.filter((_, i) => i !== rowIdx) });
  };
  const gridAddColumn = () => {
    if (!tblDraft) return;
    setTblDraft({
      ...tblDraft,
      columns: [...tblDraft.columns, `Column ${tblDraft.columns.length + 1}`],
      data: tblDraft.data.map(row => [...row, '']),
    });
  };
  const gridDeleteColumn = (colIdx: number) => {
    if (!tblDraft || tblDraft.columns.length <= 1) return;
    setTblDraft({
      ...tblDraft,
      columns: tblDraft.columns.filter((_, i) => i !== colIdx),
      data: tblDraft.data.map(row => row.filter((_, i) => i !== colIdx)),
    });
  };

  /* ── Document editor save ── */
  const saveDoc = () => {
    if (!docDraft) return;
    setDocs(prev => prev.map(d => d.id === docDraft.id ? docDraft : d));
    addToast({ type: 'success', title: 'Document updated' });
    setDocDraft(null);
  };
  const rescanDoc = () => {
    if (!docDraft) return;
    setDocDraft({ ...docDraft, status: 'processing' });
    addToast({ type: 'info', title: 'Re-indexing started…' });
    /* Mark indexed after a short delay to mimic the pipeline. */
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.id === docDraft.id ? { ...d, status: 'indexed' } : d));
      setDocDraft(prev => prev ? { ...prev, status: 'indexed' } : prev);
      addToast({ type: 'success', title: 'Re-indexed' });
    }, 1800);
  };

  if (!engine) return null;

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'qa',         label: 'Q&A Pairs',       count: qaItems.length },
    { id: 'docs',       label: 'Documents',        count: docs.length    },
    { id: 'urls',       label: 'URLs',             count: urls.length    },
    { id: 'structured', label: 'Structured Data',  count: tables.length  },
  ];

  const categories = ['All', ...Array.from(new Set(qaItems.map(q => q.category)))];
  const filteredQA = qaItems.filter(q =>
    (qaFilter === 'All' || q.category === qaFilter) &&
    (!search || q.question.toLowerCase().includes(search.toLowerCase()) || q.answer.toLowerCase().includes(search.toLowerCase())),
  );

  const saveQa = () => {
    if (!qaDraft) return;
    if (!qaDraft.question.trim() || !qaDraft.answer.trim()) {
      addToast({ type: 'warning', title: 'Question and answer are required' });
      return;
    }
    if (qaDraft.id) {
      setQaItems(prev => prev.map(q => q.id === qaDraft.id ? qaDraft : q));
      addToast({ type: 'success', title: 'Q&A updated' });
    } else {
      setQaItems(prev => [...prev, { ...qaDraft, id: `q${Date.now()}` }]);
      addToast({ type: 'success', title: 'Q&A added' });
    }
    setQaDraft(null);
  };

  const saveUrl = () => {
    if (!urlDraft) return;
    if (!urlDraft.url.trim()) { addToast({ type: 'warning', title: 'URL is required' }); return; }
    if (urlDraft.id) {
      setUrls(prev => prev.map(u => u.id === urlDraft.id ? urlDraft : u));
    } else {
      setUrls(prev => [...prev, { ...urlDraft, id: `u${Date.now()}` }]);
    }
    addToast({ type: 'success', title: 'URL saved' });
    setUrlDraft(null);
  };

  const saveTable = () => {
    if (!tblDraft) return;
    if (!tblDraft.name.trim()) { addToast({ type: 'warning', title: 'Table name required' }); return; }
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    /* Keep `rows` in sync with the actual data length so list cards stay accurate. */
    const synced: StructuredTable = { ...tblDraft, rows: tblDraft.data.length, updated: today };
    if (tblDraft.id) {
      setTables(prev => prev.map(t => t.id === tblDraft.id ? synced : t));
    } else {
      setTables(prev => [...prev, { ...synced, id: `s${Date.now()}` }]);
    }
    addToast({ type: 'success', title: 'Table saved' });
    setTblDraft(null);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-6">

      {/* Top action bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-subtle pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search knowledge base…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-brand-border bg-white text-[12px] text-strong placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brand-blue-light transition-colors"
          />
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => addToast({ type: 'info', title: 'Import CSV' })}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-brand-border bg-white text-[12px] font-medium text-muted hover:bg-surface-3 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <button
            onClick={() => addToast({ type: 'info', title: 'Import from URL' })}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-brand-border bg-white text-[12px] font-medium text-muted hover:bg-surface-3 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Import URL
          </button>
          <button
            onClick={() => addToast({ type: 'success', title: 'AI generating Q&A…' })}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-brand-blue text-white text-[12px] font-semibold hover:bg-brand-blue-hover transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate with AI
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-border mb-5">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-subtle hover:text-strong',
            )}
          >
            {t.label}
            <span className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full tabular-nums',
              tab === t.id ? 'bg-brand-blue-50 text-brand-blue' : 'bg-surface-3 text-subtle',
            )}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── Q&A ── */}
      {tab === 'qa' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setQaFilter(cat)}
                className={cn(
                  'h-7 px-3 rounded-full text-[11px] font-medium border transition-colors',
                  qaFilter === cat
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                )}
              >{cat}</button>
            ))}
            <button
              onClick={() => setQaDraft({ ...EMPTY_QA, category: qaFilter === 'All' ? '' : qaFilter })}
              className="ml-auto flex items-center gap-1 h-7 px-3 rounded-full bg-brand-blue text-white text-[11px] font-semibold hover:bg-brand-blue-hover transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Q&A
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  {['Question', 'Answer preview', 'Category', 'Status', 'Uses', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-subtle uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {filteredQA.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[12px] text-subtle">
                      No Q&A pairs match the current filter.
                    </td>
                  </tr>
                ) : filteredQA.map(q => (
                  <tr
                    key={q.id}
                    onClick={() => setQaDraft(q)}
                    className="hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <p className="text-[13px] font-medium text-strong truncate">{q.question}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <p className="text-[12px] text-muted line-clamp-2">{q.answer}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-muted bg-surface-3 px-2 py-0.5 rounded-md border border-brand-border">{q.category}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={q.status} /></td>
                    <td className="px-5 py-3.5 text-[12px] tabular-nums text-muted">{q.uses}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); setQaDraft(q); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-brand-blue transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setQaItems(prev => prev.filter(x => x.id !== q.id)); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
              onClick={() => {
                const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const fresh: Doc = { id: `d${Date.now()}`, name: 'New_upload.pdf', size: '0.0 MB', uploaded: today, status: 'processing', category: 'General' };
                setDocs(prev => [...prev, fresh]);
                setDocDraft(fresh);
              }}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload document
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  {['File name', 'Size', 'Category', 'Status', 'Uploaded', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-subtle uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {docs.map(doc => (
                  <tr
                    key={doc.id}
                    onClick={() => setDocDraft(doc)}
                    className="hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-3.5 h-3.5 text-faint flex-shrink-0" />
                        <p className="text-[13px] font-medium text-strong truncate">{doc.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-subtle tabular-nums">{doc.size}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-muted bg-surface-3 px-2 py-0.5 rounded-md border border-brand-border">{doc.category}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={doc.status} /></td>
                    <td className="px-5 py-3.5 text-[12px] text-subtle">{doc.uploaded}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); setDocDraft(doc); }}
                          className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-brand-blue transition-colors"
                          title="Open"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDocs(prev => prev.filter(d => d.id !== doc.id)); }}
                          className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
              onClick={() => setUrlDraft({ ...EMPTY_URL })}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add URL
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-brand-border">
                  {['URL', 'Category', 'Last scanned', 'Status', 'Frequency', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-subtle uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {urls.map(u => (
                  <tr
                    key={u.id}
                    onClick={() => setUrlDraft(u)}
                    className="hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-[13px] font-mono text-brand-blue max-w-[260px] truncate">{u.url}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] text-muted bg-surface-3 px-2 py-0.5 rounded-md border border-brand-border">{u.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-subtle">{u.scanned}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-3.5 text-[12px] text-muted">{u.freq}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); setUrls(prev => prev.filter(x => x.id !== u.id)); }}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint hover:bg-surface-3 hover:text-brand-black transition-colors"
                      >
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
            <button
              onClick={() => addToast({ type: 'info', title: 'Import CSV' })}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-brand-border bg-white text-[12px] font-medium text-muted hover:bg-surface-3 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import CSV
            </button>
            <button
              onClick={() => setTblDraft({ ...EMPTY_TABLE })}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              New table
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {tables.map(t => (
              <button
                key={t.id}
                onClick={() => setTblDraft(t)}
                className="bg-white rounded-2xl border border-brand-border p-5 hover:border-brand-blue-light transition-colors text-left group"
              >
                <p className="text-[13px] font-semibold text-strong mb-1 group-hover:text-brand-blue transition-colors">{t.name}</p>
                <p className="text-[11px] text-subtle">{t.rows} rows · {t.category}</p>
                <p className="text-[10px] text-faint mt-2">Updated {t.updated}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════
         Q&A Add/Edit modal
      ═════════════════════════════════════════════════ */}
      {qaDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setQaDraft(null)} aria-label="Close" />
          <div className="relative w-[600px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1">
                  {qaDraft.id ? 'Edit Q&A' : 'New Q&A'}
                </p>
                <h3 className="text-[16px] font-semibold text-strong">
                  {qaDraft.id ? qaDraft.question || 'Untitled' : 'Add a question and its answer'}
                </h3>
              </div>
              <button onClick={() => setQaDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Question</p>
                <input
                  value={qaDraft.question}
                  onChange={e => setQaDraft({ ...qaDraft, question: e.target.value })}
                  placeholder="What time is check-in?"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Variations (comma-separated)</p>
                <input
                  value={qaDraft.variations}
                  onChange={e => setQaDraft({ ...qaDraft, variations: e.target.value })}
                  placeholder="check-in time, when can I arrive, what time can I check in"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
                <p className="text-[10px] text-subtle mt-1">Helps the engine match different phrasings of the same question.</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Answer</p>
                <textarea
                  value={qaDraft.answer}
                  onChange={e => setQaDraft({ ...qaDraft, answer: e.target.value })}
                  rows={4}
                  placeholder="Standard check-in is 3:00 PM. Use {{guest_name}} for personalisation."
                  className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Category</p>
                  <input
                    value={qaDraft.category}
                    onChange={e => setQaDraft({ ...qaDraft, category: e.target.value })}
                    placeholder="Check-in, Dining, Spa…"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Status</p>
                  <div className="flex gap-2">
                    {(['active', 'draft'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setQaDraft({ ...qaDraft, status: s })}
                        className={cn(
                          'flex-1 h-9 rounded-xl text-[12px] font-semibold border transition-colors capitalize',
                          qaDraft.status === s
                            ? 'bg-brand-blue text-white border-brand-blue'
                            : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                        )}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setQaDraft(null)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={saveQa}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >{qaDraft.id ? 'Save changes' : 'Add Q&A'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════
         URL Add/Edit modal
      ═════════════════════════════════════════════════ */}
      {urlDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setUrlDraft(null)} aria-label="Close" />
          <div className="relative w-[480px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <h3 className="text-[15px] font-semibold text-strong">
                {urlDraft.id ? 'Edit URL' : 'Add URL'}
              </h3>
              <button onClick={() => setUrlDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">URL</p>
                <input
                  value={urlDraft.url}
                  onChange={e => setUrlDraft({ ...urlDraft, url: e.target.value })}
                  placeholder="https://example.com/faq"
                  className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Category</p>
                  <input
                    value={urlDraft.category}
                    onChange={e => setUrlDraft({ ...urlDraft, category: e.target.value })}
                    placeholder="FAQ, Spa…"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Refresh frequency</p>
                  <div className="flex gap-1.5">
                    {(['Daily', 'Weekly', 'Manual'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setUrlDraft({ ...urlDraft, freq: f })}
                        className={cn(
                          'flex-1 h-9 rounded-xl text-[11px] font-semibold border transition-colors',
                          urlDraft.freq === f
                            ? 'bg-brand-blue text-white border-brand-blue'
                            : 'bg-white text-muted border-brand-border hover:border-brand-blue-light hover:text-brand-blue',
                        )}
                      >{f}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2">
              <button
                onClick={() => setUrlDraft(null)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={saveUrl}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >{urlDraft.id ? 'Save' : 'Add URL'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════
         Structured table — metadata + inline data-grid editor
      ═════════════════════════════════════════════════ */}
      {tblDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setTblDraft(null)} aria-label="Close" />
          <div className="relative w-[920px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1">
                  {tblDraft.id ? 'Edit table' : 'New table'}
                </p>
                <h3 className="text-[16px] font-semibold text-strong">
                  {tblDraft.name || 'Untitled table'}
                </h3>
              </div>
              <button onClick={() => setTblDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Metadata */}
              <div className="px-6 py-5 grid grid-cols-2 gap-3 border-b border-brand-border">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Table name</p>
                  <input
                    value={tblDraft.name}
                    onChange={e => setTblDraft({ ...tblDraft, name: e.target.value })}
                    placeholder="Room rates 2026"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Category</p>
                  <input
                    value={tblDraft.category}
                    onChange={e => setTblDraft({ ...tblDraft, category: e.target.value })}
                    placeholder="Pricing, Rooms…"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider">Data</p>
                    <p className="text-[10px] text-faint mt-0.5 tabular-nums">
                      {tblDraft.data.length} rows · {tblDraft.columns.length} columns
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={gridAddColumn}
                      className="h-7 px-2.5 inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white text-[11px] font-medium text-muted hover:bg-surface-3 hover:text-strong transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Column
                    </button>
                    <button
                      onClick={gridAddRow}
                      className="h-7 px-2.5 inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white text-[11px] font-medium text-muted hover:bg-surface-3 hover:text-strong transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Row
                    </button>
                    <button
                      onClick={() => addToast({ type: 'info', title: 'CSV exported (mock)' })}
                      className="h-7 px-2.5 inline-flex items-center gap-1 rounded-lg border border-brand-border bg-white text-[11px] font-medium text-muted hover:bg-surface-3 hover:text-strong transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border overflow-x-auto bg-white">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface-2 border-b border-brand-border">
                        <th className="w-9 text-[10px] font-semibold uppercase tracking-wider text-subtle text-center py-2 border-r border-brand-border">#</th>
                        {tblDraft.columns.map((col, ci) => (
                          <th key={ci} className="px-2 py-1.5 border-r border-brand-border last:border-r-0 group">
                            <div className="flex items-center gap-1">
                              <input
                                value={col}
                                onChange={e => gridUpdateColumn(ci, e.target.value)}
                                placeholder={`Column ${ci + 1}`}
                                className="w-full h-7 px-2 rounded-md border border-transparent hover:border-brand-border bg-transparent hover:bg-white focus:border-brand-blue focus:bg-white text-[11px] font-semibold text-strong uppercase tracking-wider focus:outline-none transition-colors"
                              />
                              {tblDraft.columns.length > 1 && (
                                <button
                                  onClick={() => gridDeleteColumn(ci)}
                                  className="w-5 h-5 inline-flex items-center justify-center rounded text-faint opacity-0 group-hover:opacity-100 hover:bg-surface-3 hover:text-brand-black transition-all flex-shrink-0"
                                  title="Remove column"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="w-9 border-l border-brand-border" />
                      </tr>
                    </thead>
                    <tbody>
                      {tblDraft.data.map((row, ri) => (
                        <tr key={ri} className="border-b border-border-soft last:border-b-0 group hover:bg-surface-2">
                          <td className="text-[10px] text-subtle text-center tabular-nums border-r border-brand-border bg-surface-2">
                            {ri + 1}
                          </td>
                          {row.map((cell, ci) => (
                            <td key={ci} className="border-r border-border-soft last:border-r-0 p-0">
                              <input
                                value={cell}
                                onChange={e => gridUpdateCell(ri, ci, e.target.value)}
                                className="w-full h-9 px-2.5 bg-transparent text-[12px] text-strong focus:outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-blue-light"
                              />
                            </td>
                          ))}
                          <td className="border-l border-brand-border w-9 text-center">
                            <button
                              onClick={() => gridDeleteRow(ri)}
                              className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-faint opacity-0 group-hover:opacity-100 hover:bg-surface-3 hover:text-brand-black transition-all"
                              title="Delete row"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {tblDraft.data.length === 0 && (
                        <tr>
                          <td colSpan={tblDraft.columns.length + 2} className="px-3 py-8 text-center text-[12px] text-subtle">
                            Empty table — click <span className="font-semibold text-strong">+ Row</span> to add data.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] text-subtle mt-3 leading-relaxed">
                  Tip: each row is treated as one record. Column names become field keys for the engine.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setTblDraft(null)}
                className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
              >Cancel</button>
              <button
                onClick={saveTable}
                className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
              >{tblDraft.id ? 'Save changes' : 'Create table'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════
         Document editor modal
      ═════════════════════════════════════════════════ */}
      {docDraft && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-brand-black/30" onClick={() => setDocDraft(null)} aria-label="Close" />
          <div className="relative w-[600px] max-w-[calc(100vw-32px)] bg-white border border-brand-border rounded-2xl shadow-panel overflow-hidden flex flex-col max-h-[88vh]">
            <div className="px-6 pt-5 pb-4 border-b border-brand-border flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-subtle uppercase tracking-[0.16em] mb-1">Document</p>
                <h3 className="text-[15px] font-semibold text-strong truncate">{docDraft.name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={docDraft.status} />
                  <span className="text-[11px] text-subtle">·</span>
                  <span className="text-[11px] text-subtle tabular-nums">{docDraft.size}</span>
                  <span className="text-[11px] text-subtle">·</span>
                  <span className="text-[11px] text-subtle">Uploaded {docDraft.uploaded}</span>
                </div>
              </div>
              <button onClick={() => setDocDraft(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-subtle hover:bg-surface-3 hover:text-muted transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">File name</p>
                  <input
                    value={docDraft.name}
                    onChange={e => setDocDraft({ ...docDraft, name: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] font-mono text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Category</p>
                  <input
                    value={docDraft.category}
                    onChange={e => setDocDraft({ ...docDraft, category: e.target.value })}
                    placeholder="General, Spa, Dining…"
                    className="w-full h-9 px-3 rounded-xl border border-brand-border bg-surface-2 text-[13px] text-strong focus:outline-none focus:ring-2 focus:ring-brand-blue-light focus:bg-white"
                  />
                </div>
              </div>

              {/* Indexed text preview — mock-extracted snippet */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1.5">Indexed content preview</p>
                <div className="rounded-xl border border-brand-border bg-surface-2 p-4 max-h-[180px] overflow-y-auto">
                  <p className="text-[11px] text-muted leading-relaxed font-mono whitespace-pre-line">
{`${docDraft.name.replace(/\.[^/.]+$/, '').toUpperCase()} — extracted summary

This document covers ${docDraft.category.toLowerCase()} information used by the engine
to answer guest questions. Includes pricing, availability windows, hours,
contact details and policy boilerplate.

Indexed sections (sample):
• Welcome message and house rules
• Dining hours and reservation policy
• Spa treatments and pricing
• Frequently asked questions

The full document is parsed into ~${Math.max(1, Math.round(parseFloat(docDraft.size) * 18))} chunks stored
in the engine's vector store. Re-index after editing the source file.`}
                  </p>
                </div>
                <p className="text-[10px] text-subtle mt-1.5">
                  Preview reflects what the engine actually retrieves — not the raw file.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-between gap-2 flex-shrink-0">
              <button
                onClick={() => { setDocs(prev => prev.filter(d => d.id !== docDraft.id)); setDocDraft(null); addToast({ type: 'info', title: 'Document removed' }); }}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl text-[12px] font-medium text-muted hover:bg-surface-3 hover:text-brand-black transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={rescanDoc}
                  disabled={docDraft.status === 'processing'}
                  className="h-9 px-3 inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white text-[12px] font-semibold text-strong hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', docDraft.status === 'processing' && 'animate-spin')} />
                  Re-index
                </button>
                <button
                  onClick={() => setDocDraft(null)}
                  className="h-9 px-4 rounded-xl border border-brand-border text-[13px] font-medium text-muted hover:bg-surface-3 transition-colors"
                >Close</button>
                <button
                  onClick={saveDoc}
                  className="h-9 px-5 rounded-xl bg-brand-blue text-white text-[13px] font-semibold hover:bg-brand-blue-hover transition-colors"
                >Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
