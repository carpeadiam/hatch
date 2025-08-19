'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

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

interface TeamData {
  teamId: string;
  teamName: string;
  members: Array<{
    email: string;
    name: string;
    role: string;
  }>;
}

export default function HackathonSubmissionPage() {
  const params = useParams();
  const hackCode = params.id as string;
  
  const [hackathonData, setHackathonData] = useState<HackathonData | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [activePhase, setActivePhase] = useState<number>(0);
  const [submissions, setSubmissions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseURI = 'https://hatchplatform-dcdphngyewcwcuc4.centralindia-01.azurewebsites.net';

  useEffect(() => {
    fetchHackathonData();
    fetchTeamData();
  }, [hackCode]);

  const fetchHackathonData = async () => {
    try {
      const response = await fetch(`${baseURI}/fetchhack?hackCode=${hackCode}`);
      if (!response.ok) throw new Error('Failed to fetch hackathon data');
      const data = await response.json();
      setHackathonData(data);
    } catch (err) {
      setError('Failed to load hackathon data');
      console.error(err);
    }
  };

  const fetchTeamData = async () => {
    try {
        const userEmail = JSON.parse(localStorage.getItem('user') || '{}').email;
      const authToken = localStorage.getItem('auth_token');
      
      if (!userEmail || !authToken) {
        // Skip team data fetch if no auth, but don't show error
        setLoading(false);
        return;
      }

      const response = await fetch(`${baseURI}/getTeamDetails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          hackCode: hackCode,
          auth_token: authToken,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch team data');
      const data = await response.json();
      setTeamData(data);
    } catch (err) {
      console.error('Failed to load team data:', err);
      // Don't set error, just log it
    } finally {
      setLoading(false);
    }
  };

  const getPhaseStatus = (phase: Phase): 'upcoming' | 'active' | 'completed' => {
    const now = new Date();
    const startDate = new Date(phase.startDate);
    const endDate = new Date(phase.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
  };

  const handleSubmissionChange = (deliverableType: string, value: string) => {
    setSubmissions(prev => ({
      ...prev,
      [deliverableType]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!teamData || !hackathonData) return;

    setSubmitting(true);
    try {
      const authToken = localStorage.getItem('auth_token');
      console.log('submissions:', submissions, "\nphaseIndex:", activePhase);
      const response = await fetch(`${baseURI}/submission?teamId=${teamData.teamId}&hackCode=${hackCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissions: submissions,
          teamId: teamData.teamId,
          hackCode: hackCode,
          phaseIndex: activePhase,
        }),
      });


      if (!response.ok) throw new Error('Failed to submit');
      
      alert('Submission successful!');
      setSubmissions({});
    } catch (err) {
      alert('Submission failed. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-300">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-400">{error}</div>
      </div>
    );
  }

  if (!hackathonData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-300">Hackathon not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{hackathonData.eventName}</h1>
              <p className="text-lg text-gray-300 mt-1">{hackathonData.eventTagline}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                <span>Mode: {hackathonData.mode}</span>
                <span>Team Size: {hackathonData.teamSize}</span>
                <span>Max Teams: {hackathonData.maxTeams}</span>
              </div>
            </div>
            {teamData && (
              <div className="mt-4 md:mt-0 bg-blue-900 rounded-lg p-4 border border-blue-700">
                <h3 className="font-semibold text-blue-100">Team: {teamData.teamName}</h3>
                <p className="text-sm text-blue-200">Team ID: {teamData.teamId}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Event Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-200">Start:</span>
                  <p className="text-gray-300">{formatDate(hackathonData.eventStartDate)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-200">End:</span>
                  <p className="text-gray-300">{formatDate(hackathonData.eventEndDate)}</p>
                </div>
                {hackathonData.hasFee && (
                  <div>
                    <span className="font-medium text-gray-200">Fee:</span>
                    <p className="text-gray-300">₹{hackathonData.fee}</p>
                  </div>
                )}
              </div>

              {hackathonData.prizes.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-white">Prizes</h4>
                  <div className="space-y-2">
                    {hackathonData.prizes.map((prize, index) => (
                      <div key={index} className="bg-yellow-900 rounded p-3 border border-yellow-700">
                        <div className="font-medium text-yellow-200">{prize.title}</div>
                        <div className="text-sm text-yellow-300">{prize.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hackathonData.sponsors.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-white">Sponsors</h4>
                  <div className="space-y-1">
                    {hackathonData.sponsors.map((sponsor, index) => (
                      <div key={index} className="text-sm text-gray-300">{sponsor.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Phase Tabs */}
            <div className="bg-gray-800 rounded-lg shadow mb-6 border border-gray-700">
              <div className="border-b border-gray-600">
                <nav className="flex space-x-8 px-6" aria-label="Phases">
                  {hackathonData.phases.map((phase, index) => {
                    const status = getPhaseStatus(phase);
                    const isActive = activePhase === index;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setActivePhase(index)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          isActive
                            ? 'border-blue-400 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{phase.name}</span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status === 'completed'
                                ? 'bg-green-900 text-green-200 border border-green-700'
                                : status === 'active'
                                ? 'bg-blue-900 text-blue-200 border border-blue-700'
                                : 'bg-gray-700 text-gray-300 border border-gray-600'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Phase Content */}
              <div className="p-6 bg-gray-800">
                {hackathonData.phases.map((phase, index) => (
                  <div key={index} className={activePhase === index ? 'block' : 'hidden'}>
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-white mb-2">{phase.name}</h2>
                      <p className="text-gray-300 mb-4">{phase.description}</p>
                      <div className="flex flex-col sm:flex-row sm:space-x-6 text-sm text-gray-400">
                        <span>Start: {formatDate(phase.startDate)}</span>
                        <span>End: {formatDate(phase.endDate)}</span>
                      </div>
                    </div>

                    {getPhaseStatus(phase) === 'active' && teamData ? (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-white">Submit Deliverables</h3>
                        {phase.deliverables.map((deliverable, deliverableIndex) => (
                          <div key={deliverableIndex} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                            <label className="block text-sm font-medium text-gray-200 mb-2">
                              {deliverable.type.charAt(0).toUpperCase() + deliverable.type.slice(1)}
                            </label>
                            <p className="text-sm text-gray-300 mb-3">{deliverable.description}</p>
                            <input
                              type="text"
                              placeholder={`Enter ${deliverable.type} link/details`}
                              value={submissions[deliverable.type] || ''}
                              onChange={(e) => handleSubmissionChange(deliverable.type, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        ))}
                        
                        <button
                          onClick={handleSubmit}
                          disabled={submitting || Object.keys(submissions).length === 0}
                          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Submitting...' : 'Submit Deliverables'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Required Deliverables</h3>
                        {phase.deliverables.map((deliverable, deliverableIndex) => (
                          <div key={deliverableIndex} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                            <div className="font-medium text-gray-200">
                              {deliverable.type.charAt(0).toUpperCase() + deliverable.type.slice(1)}
                            </div>
                            <div className="text-sm text-gray-300 mt-1">{deliverable.description}</div>
                          </div>
                        ))}
                        
                        {getPhaseStatus(phase) === 'upcoming' && (
                          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                            <p className="text-yellow-200">This phase hasn't started yet. Submissions will be available when the phase begins.</p>
                          </div>
                        )}
                        
                        {getPhaseStatus(phase) === 'completed' && (
                          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                            <p className="text-gray-300">This phase has ended. No more submissions are accepted.</p>
                          </div>
                        )}

                        {!teamData && (
                          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                            <p className="text-red-200">You need to be part of a team to submit deliverables.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}