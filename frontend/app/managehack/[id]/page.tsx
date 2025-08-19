'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const BASE_URL = "https://hatchplatform-dcdphngyewcwcuc4.centralindia-01.azurewebsites.net";

interface Organiser {
  email: string;
  name: string;
  phone: string;
}

interface Deliverable {
  description: string;
  type: string;
}

interface Phase {
  deliverables: Deliverable[];
  description: string;
  endDate: string;
  name: string;
  startDate: string;
}

interface Prize {
  description: string;
  title: string;
}

interface Sponsor {
  name: string;
}

interface HackathonData {
  admins: string[];
  eventDescription: string;
  eventEndDate: string;
  eventName: string;
  eventStartDate: string;
  eventTagline: string;
  eventType: string;
  fee: string;
  hackCode: string;
  hasFee: boolean;
  maxTeams: string;
  mode: string;
  organisers: Organiser[];
  phases: Phase[];
  prizes: Prize[];
  registrationEndDate: string;
  registrationStartDate: string;
  sponsors: Sponsor[];
  teamSize: string;
  upiId: string;
}

type TabType = 'overview' | 'details' | 'admins';

export default function ManageHackPage() {
  const params = useParams();
  const hackCode = params.id as string;
  
  const [hackData, setHackData] = useState<HackathonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [editedData, setEditedData] = useState<Partial<HackathonData>>({});
  const [saving, setSaving] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Get auth token (you might want to implement proper auth storage)
  const getAuthToken = () => {
    // Replace with your actual token retrieval logic
    return localStorage.getItem('auth_token') || '';
  };

  const fetchHackathonData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/fetchhack?hackCode=${hackCode}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch hackathon data: ${response.status}`);
      }

      const data = await response.json();
      setHackData(data);
      setEditedData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hackathon data');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${BASE_URL}/managehack`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hackCode,
          action: 'update',
          updateFields: editedData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save changes: ${response.status}`);
      }

      alert('Changes saved successfully!');
      await fetchHackathonData(); // Refresh data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setAdminLoading(true);
      const response = await fetch(`${BASE_URL}/managehack`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hackCode,
          action: 'add_admin',
          adminEmail: newAdminEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add admin: ${response.status}`);
      }

      alert('Admin added successfully!');
      setNewAdminEmail('');
      await fetchHackathonData(); // Refresh data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setAdminLoading(false);
    }
  };

  const removeAdmin = async (adminEmail: string) => {
    if (hackData && hackData.admins.length <= 1) {
      alert('Cannot remove the last remaining admin!');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${adminEmail} as an admin?`)) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/managehack`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hackCode,
          action: 'remove_admin',
          adminEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove admin: ${response.status}`);
      }

      alert('Admin removed successfully!');
      await fetchHackathonData(); // Refresh data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove admin');
    }
  };

  const handleInputChange = (field: keyof HackathonData, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    fetchHackathonData();
  }, [hackCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading hackathon data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!hackData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">No hackathon data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Hackathon: {hackData.eventName}</h1>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'details', label: 'Details' },
              { id: 'admins', label: 'Admins' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Hackathon Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                <p><strong>Event Name:</strong> {hackData.eventName}</p>
                <p><strong>Tagline:</strong> {hackData.eventTagline}</p>
                <p><strong>Type:</strong> {hackData.eventType}</p>
                <p><strong>Mode:</strong> {hackData.mode}</p>
                <p><strong>Team Size:</strong> {hackData.teamSize}</p>
                <p><strong>Max Teams:</strong> {hackData.maxTeams}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Dates</h3>
                <p><strong>Event Start:</strong> {formatDate(hackData.eventStartDate)}</p>
                <p><strong>Event End:</strong> {formatDate(hackData.eventEndDate)}</p>
                <p><strong>Registration Start:</strong> {formatDate(hackData.registrationStartDate)}</p>
                <p><strong>Registration End:</strong> {formatDate(hackData.registrationEndDate)}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">{hackData.eventDescription}</p>
            </div>

            {hackData.sponsors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Sponsors</h3>
                <div className="flex flex-wrap gap-2">
                  {hackData.sponsors.map((sponsor, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {sponsor.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hackData.prizes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Prizes</h3>
                {hackData.prizes.map((prize, index) => (
                  <div key={index} className="mb-2">
                    <strong>{prize.title}:</strong> {prize.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Edit Details</h2>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Event Name</label>
                <input
                  type="text"
                  value={editedData.eventName || ''}
                  onChange={(e) => handleInputChange('eventName', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Event Tagline</label>
                <input
                  type="text"
                  value={editedData.eventTagline || ''}
                  onChange={(e) => handleInputChange('eventTagline', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Event Start Date</label>
                <input
                  type="datetime-local"
                  value={editedData.eventStartDate || ''}
                  onChange={(e) => handleInputChange('eventStartDate', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Event End Date</label>
                <input
                  type="datetime-local"
                  value={editedData.eventEndDate || ''}
                  onChange={(e) => handleInputChange('eventEndDate', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Registration Start Date</label>
                <input
                  type="datetime-local"
                  value={editedData.registrationStartDate || ''}
                  onChange={(e) => handleInputChange('registrationStartDate', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Registration End Date</label>
                <input
                  type="datetime-local"
                  value={editedData.registrationEndDate || ''}
                  onChange={(e) => handleInputChange('registrationEndDate', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select
                  value={editedData.mode || ''}
                  onChange={(e) => handleInputChange('mode', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Team Size</label>
                <input
                  type="number"
                  value={editedData.teamSize || ''}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Teams</label>
                <input
                  type="number"
                  value={editedData.maxTeams || ''}
                  onChange={(e) => handleInputChange('maxTeams', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Has Fee</label>
                <select
                  value={editedData.hasFee ? 'true' : 'false'}
                  onChange={(e) => handleInputChange('hasFee', e.target.value === 'true')}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {editedData.hasFee && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fee Amount</label>
                    <input
                      type="text"
                      value={editedData.fee || ''}
                      onChange={(e) => handleInputChange('fee', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={editedData.upiId || ''}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">Event Description</label>
              <textarea
                value={editedData.eventDescription || ''}
                onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Manage Admins</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Add New Admin</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter admin email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                />
                <button
                  onClick={addAdmin}
                  disabled={adminLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {adminLoading ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Current Admins</h3>
              {hackData.admins.length === 0 ? (
                <p className="text-gray-500">No admins found</p>
              ) : (
                <div className="space-y-2">
                  {hackData.admins.map((admin, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <span>{admin}</span>
                      <button
                        onClick={() => removeAdmin(admin)}
                        disabled={hackData.admins.length <= 1}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {hackData.admins.length <= 1 && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Cannot remove the last remaining admin
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}