import { useState } from 'react';
import { Search, Filter, Download, Tag, Plus, ChevronUp, ChevronDown, Star, ArrowUpRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';
import { ChannelIcon } from '../../components/ui/ChannelIcon';
import { mockGuests } from '../../data/mock/guests';
import { mockReservations } from '../../data/mock/reservations';
import { mockConversations } from '../../data/mock/conversations';
import { formatDate, formatCurrency, formatRelativeTime, cn } from '../../utils';
import type { Guest } from '../../types';
import { useApp } from '../../app/AppContext';

const guestTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'stays', label: 'Stays' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'notes', label: 'Notes & Tags' },
];

const sourceColors: Record<string, string> = {
  direct: 'bg-emerald-50 text-emerald-700',
  'booking.com': 'bg-blue-50 text-blue-700',
  expedia: 'bg-amber-50 text-amber-700',
  airbnb: 'bg-rose-50 text-rose-700',
  agoda: 'bg-purple-50 text-purple-700',
  referral: 'bg-indigo-50 text-indigo-700',
  walk_in: 'bg-slate-100 text-slate-600',
};

const statusColors: Record<string, string> = {
  checked_in: 'bg-emerald-50 text-emerald-700',
  checked_out: 'bg-slate-100 text-slate-500',
  upcoming: 'bg-blue-50 text-blue-700',
  vip: 'bg-violet-50 text-violet-700',
  flagged: 'bg-rose-50 text-rose-700',
};

function GuestDetailPanel({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const reservations = mockReservations.filter(r => r.guestId === guest.id);
  const conversations = mockConversations.filter(c => c.guestId === guest.id);

  return (
    <div className="w-[480px] flex-shrink-0 border-l border-slate-100 bg-white flex flex-col overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start gap-4 mb-4">
          <Avatar name={guest.name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">{guest.name}</h2>
              {guest.tags.includes('VIP') && <Badge variant="purple">VIP</Badge>}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{guest.email} · {guest.phone}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', statusColors[guest.status])}>
                {guest.status.replace('_', ' ')}
              </span>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', sourceColors[guest.source])}>
                {guest.source}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Stays', value: guest.totalVisits },
            { label: 'Lifetime Value', value: formatCurrency(guest.lifetimeValue) },
            { label: 'Language', value: guest.language.toUpperCase() },
            { label: 'Pref. Channel', value: <ChannelIcon channel={guest.preferredChannel} size="sm" /> },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] text-slate-400 mb-0.5">{stat.label}</p>
              <div className="text-sm font-semibold text-slate-900">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
      <Tabs tabs={guestTabs} activeTab={activeTab} onChange={setActiveTab} className="px-6 flex-shrink-0" />
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {guest.satisfactionScore && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Satisfaction Score</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={cn('w-5 h-5', i <= (guest.satisfactionScore ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                  ))}
                  <span className="text-sm font-semibold text-slate-700 ml-2">{guest.satisfactionScore}/5</span>
                </div>
              </div>
            )}
            {guest.companions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Travel Party</p>
                <div className="space-y-2">
                  {guest.companions.map(c => (
                    <div key={c} className="flex items-center gap-2">
                      <Avatar name={c} size="xs" />
                      <span className="text-sm text-slate-700">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {guest.tags.map(tag => (
                  <Badge key={tag} variant={tag === 'VIP' ? 'purple' : 'default'}>{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stays' && (
          <div className="space-y-3">
            {reservations.length === 0 ? (
              <p className="text-sm text-slate-500">No reservations found.</p>
            ) : reservations.map(res => (
              <div key={res.id} className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">{res.roomType}</span>
                  <Badge variant={res.status === 'confirmed' ? 'info' : res.status === 'checked_in' ? 'success' : 'default'}>
                    {res.status}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-slate-500">{res.bookingRef}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div><span className="text-slate-400">Check-in:</span> {formatDate(res.checkIn)}</div>
                  <div><span className="text-slate-400">Check-out:</span> {formatDate(res.checkOut)}</div>
                  <div><span className="text-slate-400">Room:</span> #{res.roomNumber}</div>
                  <div><span className="text-slate-400">Total:</span> <strong>{formatCurrency(res.totalAmount)}</strong></div>
                </div>
                {res.specialRequests.length > 0 && (
                  <div className="text-xs text-slate-500 border-t border-slate-200 pt-2">
                    {res.specialRequests.map(r => <div key={r}>· {r}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="text-sm text-slate-500">No conversations found.</p>
            ) : conversations.map(conv => (
              <div key={conv.id} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <ChannelIcon channel={conv.channel} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{conv.lastMessage}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatRelativeTime(conv.lastMessageAt)}</p>
                  </div>
                  {conv.engineName && (
                    <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {conv.engineName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Lifetime Value</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(guest.lifetimeValue)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Avg per Stay</p>
                <p className="text-xl font-bold text-slate-900">
                  {guest.totalVisits > 0 ? formatCurrency(Math.round(guest.lifetimeValue / guest.totalVisits)) : '—'}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-2">Revenue Breakdown</p>
              {[
                { label: 'Room Revenue', value: Math.round(guest.lifetimeValue * 0.72) },
                { label: 'F&B', value: Math.round(guest.lifetimeValue * 0.15) },
                { label: 'Spa & Experiences', value: Math.round(guest.lifetimeValue * 0.09) },
                { label: 'Upsells', value: Math.round(guest.lifetimeValue * 0.04) },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-xs py-1.5 border-b border-slate-200 last:border-0">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</p>
              <textarea
                defaultValue={guest.notes || 'No notes yet. Click to add...'}
                rows={5}
                className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {guest.tags.map(tag => (
                  <Badge key={tag} variant={tag === 'VIP' ? 'purple' : 'default'}>{tag} ×</Badge>
                ))}
              </div>
              <Button size="sm" variant="outline">
                <Plus className="w-3.5 h-3.5" /> Add Tag
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function GuestsPage() {
  const { addToast } = useApp();
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Guest>('lastInquiryAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = mockGuests.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (field: keyof Guest) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-slate-300" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-600" /> : <ChevronDown className="w-3 h-3 text-slate-600" />;
  };

  const cols: { label: string; field: keyof Guest; width?: string }[] = [
    { label: 'Guest', field: 'name', width: 'min-w-[200px]' },
    { label: 'Source', field: 'source' },
    { label: 'Last Inquiry', field: 'lastInquiryAt' },
    { label: 'Last Stay', field: 'lastStayAt' },
    { label: 'Visits', field: 'totalVisits' },
    { label: 'LTV', field: 'lifetimeValue' },
    { label: 'Language', field: 'language' },
    { label: 'Status', field: 'status' },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
          <h1 className="text-base font-semibold text-slate-900 mr-2">Guests</h1>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search guests..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 rounded-lg border border-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <Button size="sm" variant="outline">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-slate-500">{selectedIds.size} selected</span>
              <Button size="sm" variant="secondary" onClick={() => addToast({ type: 'success', title: 'Added to sequence', message: `${selectedIds.size} guests enrolled` })}>
                <ArrowUpRight className="w-3.5 h-3.5" /> Add to Sequence
              </Button>
              <Button size="sm" variant="secondary" onClick={() => addToast({ type: 'info', title: 'Tagged', message: `${selectedIds.size} guests tagged` })}>
                <Tag className="w-3.5 h-3.5" /> Tag
              </Button>
              <Button size="sm" variant="secondary" onClick={() => addToast({ type: 'info', title: 'Export started', message: 'CSV will be ready shortly' })}>
                <Download className="w-3.5 h-3.5" /> Export
              </Button>
            </>
          )}
          <div className="ml-auto">
            <Button size="sm" variant="primary">
              <Plus className="w-3.5 h-3.5" /> Add Guest
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded" onChange={() => {}} />
                </th>
                {cols.map(col => (
                  <th
                    key={col.field}
                    className={cn('px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 whitespace-nowrap', col.width)}
                    onClick={() => toggleSort(col.field)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label} <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {sorted.map(guest => (
                <tr
                  key={guest.id}
                  className={cn(
                    'hover:bg-slate-50 cursor-pointer transition-colors',
                    selectedGuest?.id === guest.id && 'bg-blue-50/60',
                  )}
                  onClick={() => setSelectedGuest(guest)}
                >
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(guest.id); }}>
                    <input type="checkbox" checked={selectedIds.has(guest.id)} onChange={() => {}} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={guest.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{guest.name}</p>
                        <p className="text-xs text-slate-400">{guest.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', sourceColors[guest.source])}>
                      {guest.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                    {formatRelativeTime(guest.lastInquiryAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                    {guest.lastStayAt ? formatDate(guest.lastStayAt) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 tabular-nums">
                    {guest.totalVisits}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 tabular-nums">
                    {formatCurrency(guest.lifetimeValue)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {guest.language.toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', statusColors[guest.status])}>
                      {guest.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 hover:text-slate-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedGuest && (
        <GuestDetailPanel guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
      )}
    </div>
  );
}
