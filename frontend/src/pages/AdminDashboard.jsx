import { useEffect, useState } from 'react';
import { bloodApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ArcGisMap from '../components/ArcGisMap.jsx';
import {
  BloodTypeChart,
  RegionAvailabilityChart,
  BloodTypePieChart,
} from '../components/BloodCharts.jsx';

const AdminDashboard = () => {
  const { token, userId, role, logout } = useAuth();
  const [form, setForm] = useState({
    blood_type: '',
    quantity: '',
    location: '',
    region_name: '',
  });
  const [demandForm, setDemandForm] = useState({
    blood_type: '',
    region_name: '',
  });
  const [inventory, setInventory] = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingDemands, setLoadingDemands] = useState(false);
  const [loadingDemand, setLoadingDemand] = useState(false);
  const [error, setError] = useState('');

  const authContext = { token, userId, role };

  const loadInventory = async () => {
    setLoadingInventory(true);
    setError('');
    try {
      const data = await bloodApi.getBloodInventory(authContext);
      setInventory(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoadingInventory(false);
    }
  };

  const loadDemands = async () => {
    setLoadingDemands(true);
    try {
      const data = await bloodApi.getAdminDemands(authContext);
      setDemands(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load demands');
    } finally {
      setLoadingDemands(false);
    }
  };

  useEffect(() => {
    loadInventory();
    loadDemands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDemandChange = (e) => {
    setDemandForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        blood_type: form.blood_type,
        quantity: Number(form.quantity),
        location: form.location,
      };
      if (form.region_name?.trim()) payload.region_name = form.region_name.trim();
      await bloodApi.addBloodInventory({
        blood: payload,
        auth: authContext,
      });
      setForm({ blood_type: '', quantity: '', location: '', region_name: '' });
      await loadInventory();
    } catch (err) {
      setError(err.message || 'Failed to save inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDemandSubmit = async (e) => {
    e.preventDefault();
    setLoadingDemand(true);
    setError('');
    try {
      await bloodApi.addDemand({
        demand: {
          blood_type: demandForm.blood_type,
          region_name: demandForm.region_name.trim() || demandForm.region_name,
        },
        auth: authContext,
      });
      setDemandForm({ blood_type: '', region_name: '' });
      await loadDemands();
    } catch (err) {
      setError(err.message || 'Failed to add demand');
    } finally {
      setLoadingDemand(false);
    }
  };

  const displayRegion = (item) =>
    item.region_name || item.location || item._id;

  return (
    <div className="dashboard-layout">
      <header className="topbar">
        <div>
          <h1>Admin dashboard</h1>
          <p className="topbar-subtitle">
            Manage blood inventory, visualize availability by region, and add
            demand alerts.
          </p>
        </div>
        <div className="topbar-actions">
          <span className="pill">Role: admin</span>
          <button className="btn ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <main className="dashboard-main">
        <section className="panel">
          <h2>Add or update inventory</h2>
          <p className="panel-subtitle">
            Use longitude,latitude for location. Add a region name (e.g.
            &quot;London&quot;) for clearer charts.
          </p>

          <form className="form vertical" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="field">
                <span>Blood type</span>
                <input
                  name="blood_type"
                  value={form.blood_type}
                  onChange={handleChange}
                  required
                  placeholder="e.g. A-"
                />
              </label>
              <label className="field">
                <span>Quantity</span>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  min={0}
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Location (lng,lat)</span>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. -0.1276,51.5074"
                />
              </label>
              <label className="field">
                <span>Region name (optional)</span>
                <input
                  name="region_name"
                  value={form.region_name}
                  onChange={handleChange}
                  placeholder="e.g. London"
                />
              </label>
            </div>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Add region demand</h2>
          <p className="panel-subtitle">
            Mark regions that need specific blood types. Users will see alerts.
          </p>
          <form className="form inline" onSubmit={handleDemandSubmit}>
            <label className="field">
              <span>Blood type needed</span>
              <input
                name="blood_type"
                value={demandForm.blood_type}
                onChange={handleDemandChange}
                required
                placeholder="e.g. O+"
              />
            </label>
            <label className="field">
              <span>Region</span>
              <input
                name="region_name"
                value={demandForm.region_name}
                onChange={handleDemandChange}
                required
                placeholder="e.g. New York"
              />
            </label>
            <button
              type="submit"
              className="btn primary"
              disabled={loadingDemand}
            >
              {loadingDemand ? 'Adding...' : 'Add demand'}
            </button>
          </form>
        </section>

        <section className="panel full-width charts-row">
          <h2>Data visualization</h2>
          <p className="panel-subtitle">
            Blood availability by type and by region.
          </p>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Blood type distribution</h3>
              <BloodTypeChart inventory={inventory} />
            </div>
            <div className="chart-card">
              <h3>Availability by region</h3>
              <RegionAvailabilityChart inventory={inventory} />
            </div>
            <div className="chart-card">
              <h3>Quantity by type (pie)</h3>
              <BloodTypePieChart inventory={inventory} />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Inventory list</h2>
            {loadingInventory && <span className="pill subtle">Loading…</span>}
          </div>
          <div className="table">
            <div className="table-header">
              <span>Blood type</span>
              <span>Quantity</span>
              <span>Region / Location</span>
            </div>
            {inventory.length === 0 && (
              <div className="table-empty">No blood inventory yet.</div>
            )}
            {inventory.map((item) => (
              <div key={item._id} className="table-row">
                <span>{item.blood_type}</span>
                <span>{item.quantity}</span>
                <span>{displayRegion(item)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Active demands</h2>
            {loadingDemands && <span className="pill subtle">Loading…</span>}
          </div>
          <div className="table">
            <div className="table-header">
              <span>Blood type needed</span>
              <span>Region</span>
            </div>
            {demands.length === 0 && (
              <div className="table-empty">No demands yet.</div>
            )}
            {demands.map((d) => (
              <div key={d._id} className="table-row">
                <span>{d.blood_type}</span>
                <span>{d.region_name || '—'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel full-width">
          <h2>Inventory map</h2>
          <p className="panel-subtitle">
            Blood inventory with proximity radar (50 km radius). Click markers
            for details.
          </p>
          <ArcGisMap
            inventory={inventory}
            showProximityRadar={true}
            proximityRadiusKm={50}
          />
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
