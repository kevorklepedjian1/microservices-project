import { useEffect, useState } from 'react';
import { bloodApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ArcGisMap from '../components/ArcGisMap.jsx';

const UserDashboard = () => {
  const { token, userId, role, logout } = useAuth();
  const [subscriptionForm, setSubscriptionForm] = useState({
    blood_type: '',
    location: '',
  });
  const [subs, setSubs] = useState([]);
  const [demands, setDemands] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingDemands, setLoadingDemands] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState('');

  const authContext = { token, userId, role };

  const loadSubscriptions = async () => {
    setLoadingSubs(true);
    setError('');
    try {
      const data = await bloodApi.getSubscriptions(authContext);
      setSubs(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load subscriptions');
    } finally {
      setLoadingSubs(false);
    }
  };

  const loadDemands = async () => {
    setLoadingDemands(true);
    try {
      const data = await bloodApi.getDemands(authContext);
      setDemands(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load demand alerts');
    } finally {
      setLoadingDemands(false);
    }
  };

  const proximityData = (() => {
    const parse = (loc) => {
      if (!loc) return null;
      const parts = String(loc).split(',').map((p) => p.trim());
      if (parts.length !== 2) return null;
      const [lng, lat] = parts.map(Number);
      return Number.isNaN(lat) || Number.isNaN(lng) ? null : { lng, lat };
    };
    const dist = (a, b) => {
      const R = 6371;
      const dLat = ((b.lat - a.lat) * Math.PI) / 180;
      const dLon = ((b.lng - a.lng) * Math.PI) / 180;
      const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) *
          Math.cos((b.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    };
    return subs.map((sub) => {
      const sc = parse(sub.location);
      let nearestKm = null;
      let nearestRegion = null;
      if (sc) {
        const matching = availability.filter(
          (a) => a.blood_type === sub.blood_type
        );
        const withCoords = matching
          .map((a) => ({ item: a, coords: parse(a.location) }))
          .filter((x) => x.coords);
        const nearest = withCoords
          .map(({ item, coords }) => ({ item, km: dist(sc, coords) }))
          .sort((a, b) => a.km - b.km)[0];
        if (nearest) {
          nearestKm = nearest.km.toFixed(1);
          nearestRegion =
            nearest.item.region_name || nearest.item.location || 'inventory';
        }
      }
      return {
        _id: sub._id,
        blood_type: sub.blood_type,
        location: sub.location,
        nearestKm,
        nearestRegion,
      };
    });
  })();

  const loadAvailability = async () => {
    setLoadingAvailability(true);
    try {
      const data = await bloodApi.getAvailability(authContext);
      setAvailability(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load availability');
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    loadDemands();
    loadAvailability();
  }, []);

  const handleChange = (e) => {
    setSubscriptionForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await bloodApi.subscribe({
        subscription: subscriptionForm,
        auth: authContext,
      });
      setSubscriptionForm({ blood_type: '', location: '' });
      await loadSubscriptions();
    } catch (err) {
      setError(err.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <header className="topbar">
        <div>
          <h1>User dashboard</h1>
          <p className="topbar-subtitle">
            Manage your subscriptions, see availability, and get alerts for
            regions that need blood.
          </p>
        </div>
        <div className="topbar-actions">
          <span className="pill">Role: user</span>
          <button className="btn ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <section className="alerts-section">
        <h2>Regions needing blood</h2>
        <p className="panel-subtitle">
          These regions need donors. If you can help, consider donating.
        </p>
        {loadingDemands && (
          <span className="pill subtle">Loading alerts…</span>
        )}
        {!loadingDemands && demands.length === 0 && (
          <p className="alerts-empty">No demand alerts at the moment.</p>
        )}
        {!loadingDemands && demands.length > 0 && (
          <div className="alerts-grid">
            {demands.map((d) => (
              <div key={d._id} className="alert-card">
                <span className="alert-blood-type">{d.blood_type}</span>
                <span className="alert-region">{d.region_name || 'Unknown'}</span>
                <p className="alert-message">
                  <strong>{d.region_name || 'This region'}</strong> needs blood
                  type <strong>{d.blood_type}</strong>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <main className="dashboard-main">
        <section className="panel">
          <h2>Subscribe to blood availability</h2>
          <p className="panel-subtitle">
            You will be notified when this blood type is available at your
            preferred location.
          </p>

          <form className="form inline" onSubmit={handleSubmit}>
            <label className="field">
              <span>Blood type</span>
              <input
                name="blood_type"
                value={subscriptionForm.blood_type}
                onChange={handleChange}
                required
                placeholder="e.g. O+"
              />
            </label>

            <label className="field">
              <span>Location (lng,lat)</span>
              <input
                name="location"
                value={subscriptionForm.location}
                onChange={handleChange}
                required
                placeholder="e.g. -0.1276,51.5074"
              />
            </label>

            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Saving...' : 'Subscribe'}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Your subscriptions & proximity</h2>
            {loadingSubs && <span className="pill subtle">Loading…</span>}
          </div>
          <div className="table">
            <div className="table-header">
              <span>Blood type</span>
              <span>Your location</span>
              <span>Nearest match (km)</span>
            </div>
            {subs.length === 0 && (
              <div className="table-empty">No subscriptions yet.</div>
            )}
            {proximityData.map((p) => (
              <div key={p._id} className="table-row">
                <span>{p.blood_type}</span>
                <span>{p.location}</span>
                <span>
                  {p.nearestKm != null
                    ? `${p.nearestKm} km — ${p.nearestRegion}`
                    : 'No matching inventory'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Available in regions</h2>
            {loadingAvailability && (
              <span className="pill subtle">Loading…</span>
            )}
          </div>
          <p className="panel-subtitle">
            Where blood inventory is available right now.
          </p>
          <div className="table">
            <div className="table-header">
              <span>Blood type</span>
              <span>Quantity</span>
              <span>Region / Location</span>
            </div>
            {availability.length === 0 && (
              <div className="table-empty">No inventory yet.</div>
            )}
            {availability.map((item) => (
              <div key={item._id} className="table-row">
                <span>{item.blood_type}</span>
                <span>{item.quantity}</span>
                <span>
                  {item.region_name || item.location || item._id}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel full-width">
          <h2>Blood inventory map</h2>
          <p className="panel-subtitle">
            Your subscription locations (blue), inventory (green), proximity
            radar (circles), and distance to nearest match. Click markers for
            details.
          </p>
          <ArcGisMap
            inventory={availability}
            userSubscriptions={subs}
            showProximityRadar={true}
            proximityRadiusKm={50}
          />
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
