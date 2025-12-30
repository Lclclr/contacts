import { useState, useEffect } from 'react';

function App() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    cell_phone: '',
    voter_precinct: '',
    county: 'Bonneville',
    state: 'Idaho'
  });

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormData({
        first_name: '', last_name: '', email: '', cell_phone: '', voter_precinct: '', county: 'Bonneville', state: 'Idaho'
      });
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Voter Contact Database</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'grid', gap: '10px', maxWidth: '400px' }}>
        <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
        <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="cell_phone" placeholder="Cell Phone" value={formData.cell_phone} onChange={handleChange} />
        <input name="voter_precinct" placeholder="Voter Precinct" value={formData.voter_precinct} onChange={handleChange} />
        <input name="county" placeholder="County" value={formData.county} onChange={handleChange} maxLength="50" />
        <input name="state" placeholder="State" value={formData.state} onChange={handleChange} maxLength="20" />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>Add Contact</button>
      </form>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Precinct</th><th>County</th><th>State</th></tr>
        </thead>
        <tbody>
          {contacts.map(c => (
            <tr key={c.id}>
              <td>{c.first_name} {c.last_name}</td>
              <td>{c.email}</td>
              <td>{c.cell_phone}</td>
              <td>{c.voter_precinct}</td>
              <td>{c.county}</td>
              <td>{c.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default App;
