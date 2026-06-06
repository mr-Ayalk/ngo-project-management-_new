'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import { confirmToast } from '@/lib/confirmToast';

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b' },
  in_transit: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  delivered: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  delayed: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  cancelled: { bg: '#f3f4f6', color: '#6b7280', dot: '#9ca3af' },
};

const EMPTY_FORM = {
  id: null,
  reference: '',
  description: '',
  origin: '',
  destination: '',
  carrier: '',
  status: 'pending',
  priority: 'normal',
  items: '',
  quantity: 1,
  expectedDate: '',
  deliveredDate: '',
  notes: '',
};

export default function LogisticsPage({
  data,
  loading,
  isManager,
  onRefresh,
  onSave,
  onDelete,
  submitting,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  if (loading || !data) {
    return <div className="page-loading"><div className="login-spinner" /><span>Loading logistics…</span></div>;
  }

  const { shipments = [], stats = {} } = data;

  const filtered = shipments.filter((s) => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      s.reference.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      (s.items || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, reference: `SHP-${Date.now().toString().slice(-6)}` });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setForm({
      id: s.id,
      reference: s.reference,
      description: s.description || '',
      origin: s.origin === '—' ? '' : s.origin,
      destination: s.destination,
      carrier: s.carrier === '—' ? '' : s.carrier,
      status: s.status,
      priority: s.priority,
      items: s.items || '',
      quantity: s.quantity,
      expectedDate: s.expectedDate || '',
      deliveredDate: s.deliveredDate || '',
      notes: s.notes || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, reference) => {
    const ok = await confirmToast(`Delete shipment ${reference}?`, {
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    await onDelete(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSave(form);
    if (success) {
      setModalOpen(false);
      onRefresh?.();
    }
  };

  return (
    <div className="logistics-page">
      <div className="logistics-hero">
        <div>
          <div className="logistics-badge">Supply Chain</div>
          <h1>Logistics</h1>
          <p>Track shipments, deliveries, and field supplies across programs.</p>
        </div>
        {isManager && (
          <button type="button" className="btn-primary" onClick={openCreate}>+ New Shipment</button>
        )}
      </div>

      <div className="logistics-stats">
        <div className="logistics-stat-card">
          <span className="logistics-stat-num">{stats.pending ?? 0}</span>
          <span className="logistics-stat-label">Pending</span>
        </div>
        <div className="logistics-stat-card accent-blue">
          <span className="logistics-stat-num">{stats.inTransit ?? 0}</span>
          <span className="logistics-stat-label">In Transit</span>
        </div>
        <div className="logistics-stat-card accent-green">
          <span className="logistics-stat-num">{stats.delivered ?? 0}</span>
          <span className="logistics-stat-label">Delivered</span>
        </div>
        <div className="logistics-stat-card accent-red">
          <span className="logistics-stat-num">{stats.delayed ?? 0}</span>
          <span className="logistics-stat-label">Delayed</span>
        </div>
      </div>

      <div className="logistics-toolbar">
        <div className="logistics-filters">
          {['all', 'pending', 'in_transit', 'delivered', 'delayed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`logistics-filter${statusFilter === st ? ' active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'all' ? 'All' : st.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
        <input
          className="logistics-search"
          type="text"
          placeholder="Search reference, destination, items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={`logistics-table-wrap${isManager ? '' : ' no-actions'}`}>
        <div className="logistics-table-head">
          <span>Reference</span>
          <span>Route</span>
          <span>Items</span>
          <span>Carrier</span>
          <span>Expected</span>
          <span>Status</span>
          {isManager && <span>Actions</span>}
        </div>
        {filtered.length === 0 ? (
          <div className="logistics-empty">No shipments match your filters.</div>
        ) : (
          filtered.map((s) => {
            const sc = STATUS_COLORS[s.status] || STATUS_COLORS.pending;
            return (
              <div key={s.id} className="logistics-row">
                <span className="logistics-ref">{s.reference}</span>
                <span className="logistics-route">
                  <span className="logistics-origin">{s.origin}</span>
                  <span className="logistics-arrow">→</span>
                  <span className="logistics-dest">{s.destination}</span>
                </span>
                <span>{s.items || '—'} {s.quantity > 1 ? `(×${s.quantity})` : ''}</span>
                <span>{s.carrier}</span>
                <span>{s.expectedLabel}</span>
                <span>
                  <span className="logistics-status" style={{ background: sc.bg, color: sc.color }}>
                    <span className="logistics-status-dot" style={{ background: sc.dot }} />
                    {s.statusLabel}
                  </span>
                </span>
                {isManager && (
                  <span className="logistics-actions">
                    <button type="button" onClick={() => openEdit(s)}>Edit</button>
                    <button type="button" className="danger-text" onClick={() => handleDelete(s.id, s.reference)}>Delete</button>
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal open={modalOpen} title={form.id ? 'Edit Shipment' : 'New Shipment'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="logistics-form">
          <div className="form-row">
            <div className="form-field">
              <label>Reference *</label>
              <input required value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['pending', 'in_transit', 'delivered', 'delayed', 'cancelled'].map((st) => (
                  <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Origin</label>
              <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Addis Ababa warehouse" />
            </div>
            <div className="form-field">
              <label>Destination *</label>
              <input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Bahir Dar field office" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Carrier</label>
              <input value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Items / Description</label>
              <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="Medical kits, laptops..." />
            </div>
            <div className="form-field">
              <label>Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Expected Date</label>
              <input type="date" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Delivered Date</label>
              <input type="date" value={form.deliveredDate} onChange={(e) => setForm({ ...form, deliveredDate: e.target.value })} />
            </div>
          </div>
          <div className="form-field">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save Shipment'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
