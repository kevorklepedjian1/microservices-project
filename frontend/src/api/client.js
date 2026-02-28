const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:5002';
const BLOOD_BASE_URL = import.meta.env.VITE_BLOOD_BASE_URL || 'http://localhost:5003';

const buildHeaders = (options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  return headers;
};

export const authApi = {
  async login({ email, password }) {
    const res = await fetch(`${AUTH_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Login failed');
    }
    return res.json();
  },

  async register({ name, email, password, role }) {
    const res = await fetch(`${AUTH_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Registration failed');
    }
    return res.json();
  },
};

const buildAuthHeaders = ({ token, userId, role }) => {
  if (!token || !userId || !role) {
    throw new Error('Missing auth information');
  }
  return buildHeaders({
    headers: {
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId,
      'X-Role': role,
    },
  });
};

export const bloodApi = {
  async subscribe({ subscription, auth }) {
    const res = await fetch(`${BLOOD_BASE_URL}/blood/user/subscribe`, {
      method: 'POST',
      headers: buildAuthHeaders(auth),
      body: JSON.stringify(subscription),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Subscription failed');
    }
    return res.json();
  },

  async getSubscriptions(auth) {
    const res = await fetch(`${BLOOD_BASE_URL}/blood/user/subscriptions`, {
      headers: buildAuthHeaders(auth),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Failed to load subscriptions');
    }
    return res.json();
  },

  async addBloodInventory({ blood, auth }) {
    const res = await fetch(`${BLOOD_BASE_URL}/blood/admin/blood`, {
      method: 'POST',
      headers: buildAuthHeaders(auth),
      body: JSON.stringify(blood),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Failed to save inventory');
    }
    return res.json();
  },

  async getBloodInventory(auth) {
    const res = await fetch(`${BLOOD_BASE_URL}/blood/admin/blood`, {
      headers: buildAuthHeaders(auth),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Failed to load inventory');
    }
    return res.json();
  },

  async getAvailability(auth) {
    const res = await fetch(`${BLOOD_BASE_URL}/blood/user/availability`, {
      headers: buildAuthHeaders(auth),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Failed to load availability');
    }
    return res.json();
  },

  async getDemands(auth) {
    const res = await fetch(`${BLOOD_BASE_URL}/blood/user/demands`, {
      headers: buildAuthHeaders(auth),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Failed to load demands');
    }
    return res.json();
  },

  async addDemand({ demand, auth }) {
    const res = await fetch(`${BLOOD_BASE_URL}/blood/admin/demand`, {
      method: 'POST',
      headers: buildAuthHeaders(auth),
      body: JSON.stringify(demand),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Failed to add demand');
    }
    return res.json();
  },

  async getAdminDemands(auth) {
    const res = await fetch(`${BLOOD_BASE_URL}/blood/admin/demands`, {
      headers: buildAuthHeaders(auth),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Failed to load demands');
    }
    return res.json();
  },
};

