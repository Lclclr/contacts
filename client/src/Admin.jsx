import { useEffect, useState, useRef } from 'react';
import './Admin.css';

function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open && confirmRef.current) confirmRef.current.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal" role="document">
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button ref={confirmRef} onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ first_name:'', last_name:'', email:'', cell_phone:'', voter_precinct:'', county:'Bonneville', state:'Idaho' });
  const [editingId, setEditingId] = useState(null);
  const [notif, setNotif] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts', err);
      setNotif('Error fetching contacts');
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const clearNotif = () => setTimeout(() => setNotif(''), 3000);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error('Create failed');
      setNotif('Contact created');
      clearNotif();
      setFormData({ first_name:'', last_name:'', email:'', cell_phone:'', voter_precinct:'', county:'Bonneville', state:'Idaho' });
      fetchContacts();
    } catch (err) { console.error(err); setNotif('Error creating contact'); clearNotif(); }
    setIsProcessing(false);
  };

  const startEdit = (c) => { setEditingId(c.id); setFormData({ first_name:c.first_name, last_name:c.last_name, email:c.email, cell_phone:c.cell_phone, voter_precinct:c.voter_precinct, county:c.county||'Bonneville', state:c.state||'Idaho' }); };

  const cancelEdit = () => { setEditingId(null); setFormData({ first_name:'', last_name:'', email:'', cell_phone:'', voter_precinct:'', county:'Bonneville', state:'Idaho' }); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/contacts/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error('Update failed');
      setNotif('Contact updated');
      clearNotif();
      cancelEdit();
      fetchContacts();
    } catch (err) { console.error(err); setNotif('Error updating contact'); clearNotif(); }
    setIsProcessing(false);
  };

  const handleDelete = (id) => {
    setConfirmTarget(id);
  };

  const confirmDelete = async () => {
    const id = confirmTarget;
    setConfirmTarget(null);
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setNotif('Contact deleted');
      clearNotif();
      fetchContacts();
    } catch (err) { console.error(err); setNotif('Error deleting contact'); clearNotif(); }
    setIsProcessing(false);
  };

  return (
    <main className="admin-root">
      <h1>Admin</h1>

      <div role="status" aria-live="polite" className={`notif ${notif ? 'visible' : ''}`}>{notif}</div>

      <form onSubmit={editingId ? handleUpdate : handleCreate} className="admin-form" aria-labelledby="admin-form-title">
        <h2 id="admin-form-title">{editingId ? 'Edit Contact' : 'Create Contact'}</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="first_name">First</label>
            <input id="first_name" name="first_name" placeholder="First" value={formData.first_name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label htmlFor="last_name">Last</label>
            <input id="last_name" name="last_name" placeholder="Last" value={formData.last_name} onChange={handleChange} required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} type="email" required />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="cell_phone">Phone</label>
            <input id="cell_phone" name="cell_phone" placeholder="Phone" value={formData.cell_phone} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="voter_precinct">Precinct</label>
            <input id="voter_precinct" name="voter_precinct" placeholder="Precinct" value={formData.voter_precinct} onChange={handleChange} />
          </div>
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="county">County</label>
            <input id="county" name="county" placeholder="County" value={formData.county} onChange={handleChange} maxLength="50" />
          </div>
          <div className="field">
            <label htmlFor="state">State</label>
            <input id="state" name="state" placeholder="State" value={formData.state} onChange={handleChange} maxLength="20" />
          </div>
        </div>

        <div className="actions">
          <button type="submit" disabled={isProcessing}>{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      <table className="admin-table" role="table" aria-label="Contacts table">
        <thead>
          <tr role="row"><th role="columnheader">Name</th><th role="columnheader">Email</th><th role="columnheader">Phone</th><th role="columnheader">Precinct</th><th role="columnheader">County</th><th role="columnheader">State</th><th role="columnheader">Actions</th></tr>
        </thead>
        <tbody>
          {contacts.map(c => (
            <tr key={c.id} role="row">
              <td role="cell">{c.first_name} {c.last_name}</td>
              <td role="cell">{c.email}</td>
              <td role="cell">{c.cell_phone}</td>
              <td role="cell">{c.voter_precinct}</td>
              <td role="cell">{c.county}</td>
              <td role="cell">{c.state}</td>
              <td role="cell">
                <button onClick={() => startEdit(c)} aria-label={`Edit ${c.first_name} ${c.last_name}`}>Edit</button>
                <button onClick={() => handleDelete(c.id)} aria-label={`Delete ${c.first_name} ${c.last_name}`}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog open={!!confirmTarget} title="Confirm delete" message="Are you sure you want to delete this contact?" onConfirm={confirmDelete} onCancel={() => setConfirmTarget(null)} />
    </main>
  );
}