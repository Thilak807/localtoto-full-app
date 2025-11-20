import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

type Settings = {
  appName: string;
  supportEmail: string;
  baseFare: number;
  privatePerKm: number;
  sharedPerKm: number;
};

const STORAGE_KEY = 'adminSettings';

const defaultSettings: Settings = {
  appName: 'Local ToTo',
  supportEmail: 'support@localtoto.com',
  baseFare: 20,
  privatePerKm: 10,
  sharedPerKm: 8
};

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/admin/config/pricing');
        const baseFare = res.data?.baseFare ?? res.data?.base_fare ?? defaultSettings.baseFare;
        const privatePerKm = res.data?.privatePerKm ?? res.data?.privateRatePerKm ?? defaultSettings.privatePerKm;
        const sharedPerKm = res.data?.sharedPerKm ?? res.data?.sharedRatePerKm ?? defaultSettings.sharedPerKm;
        setSettings((s) => ({ ...s, baseFare, privatePerKm, sharedPerKm }));
      } catch {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<Settings>;
            setSettings({
              ...defaultSettings,
              ...parsed,
              privatePerKm: parsed.privatePerKm ?? parsed.perKmFare ?? defaultSettings.privatePerKm,
              sharedPerKm: parsed.sharedPerKm ?? defaultSettings.sharedPerKm,
              baseFare: parsed.baseFare ?? defaultSettings.baseFare
            });
          }
        } catch {}
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.put('/admin/config/pricing', {
        baseFare: settings.baseFare,
        privatePerKm: settings.privatePerKm,
        sharedPerKm: settings.sharedPerKm
      });
    } catch {
      // fall back to local
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedAt(new Date().toLocaleTimeString());
  };

  const handleReset = () => {
    if (!confirm('Reset settings to defaults?')) return;
    setSettings(defaultSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    setSavedAt(new Date().toLocaleTimeString());
  };

  return (
    <div className="container-classic">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Settings</h1>
          <div className="muted">Manage platform defaults and preferences</div>
        </div>
        <div className="muted">{savedAt ? `Saved at ${savedAt}` : ''}</div>
      </div>

      <form onSubmit={handleSave} className="card">
        <div className="card-section space-y-8">
          <section className="space-y-4">
            <h2 className="section-title">General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">App Name</label>
                <input
                  value={settings.appName}
                  onChange={(e) => setSettings((s) => ({ ...s, appName: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))}
                  className="input"
                  required
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="section-title">Fares</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Base Fare (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.baseFare}
                  onChange={(e) => setSettings((s) => ({ ...s, baseFare: Number(e.target.value) }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Private Ride Per KM (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.privatePerKm}
                  onChange={(e) => setSettings((s) => ({ ...s, privatePerKm: Number(e.target.value) }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Shared Ride Per KM (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.sharedPerKm}
                  onChange={(e) => setSettings((s) => ({ ...s, sharedPerKm: Number(e.target.value) }))}
                  className="input"
                  required
                />
              </div>
            </div>
          </section>
        </div>

        <div className="card-section border-t border-gray-100 flex items-center justify-end gap-3">
          <button type="button" onClick={handleReset} className="btn btn-secondary">Reset Defaults</button>
          <button type="submit" className="btn btn-primary">Save Settings</button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

