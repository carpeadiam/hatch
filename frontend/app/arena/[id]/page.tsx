'use client';

import { useState, useEffect } from 'react';
import { Instrument_Sans } from 'next/font/google';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
});
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
  team: any & {
    status?: string; // Added status field
  };
  teamId: string;
  teamName: string;
  members: Array<{
    email: string;
    name: string;
    role: string;
  }>;
}

interface ExistingSubmission {
  [key: string]: any;
}

export default function HackathonSubmissionPage() {
  return (
    <div className={instrumentSans.className}>
      <HackathonSubmissionContent />
    </div>
  );
}

function HackathonSubmissionContent() {
  const params = useParams();
  const hackCode = params.id as string;
  
  const [hackathonData, setHackathonData] = useState<HackathonData | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [activePhase, setActivePhase] = useState<number>(0);
  const [submissions, setSubmissions] = useState<Record<string, string>>({});
  const [existingSubmissions, setExistingSubmissions] = useState<ExistingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseURI = 'https://hatchplatform-dcdphngyewcwcuc4.centralindia-01.azurewebsites.net';

  useEffect(() => {
    fetchHackathonData();
    fetchTeamData();
  }, [hackCode]);

  useEffect(() => {
    if (teamData) {
      fetchExistingSubmissions();
    }
  }, [teamData]);

  useEffect(() => {
    // Pre-fill submissions when existing submissions are loaded or active phase changes
    if (existingSubmissions.length > 0 && hackathonData) {
      const currentPhaseSubmission = existingSubmissions.find(sub => sub.phaseIndex === activePhase);
      if (currentPhaseSubmission && currentPhaseSubmission.submissions) {
        setSubmissions(currentPhaseSubmission.submissions);
      } else {
        setSubmissions({});
      }
    }
  }, [existingSubmissions, activePhase, hackathonData]);

  // Helper function to check if team is active
  const isTeamActive = (): boolean => {
    return teamData?.team?.status !== 'inactive';
  };

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

  const fetchExistingSubmissions = async () => {
    try {
      if (!teamData) return;
      
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${baseURI}/fetchsubmissions?teamId=${teamData.team.teamId}&hackCode=${hackCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`Fetching existing submissions:`);
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        // Handle both array and object responses
        if (Array.isArray(data)) {
          setExistingSubmissions(data);
        } else if (data && typeof data === 'object') {
          setExistingSubmissions([data]);
        } else {
          setExistingSubmissions([]);
        }
      } else {
        // Natural fallback for no submissions
        setExistingSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to fetch existing submissions:', err);
      // Natural fallback
      setExistingSubmissions([]);
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

  const hasSubmissionForPhase = (phaseIndex: number): boolean => {
    return existingSubmissions.some(sub => sub.phaseIndex === phaseIndex);
  };

  const getSubmissionForPhase = (phaseIndex: number): ExistingSubmission | null => {
    return existingSubmissions.find(sub => sub.phaseIndex === phaseIndex) || null;
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
      
      const response = await fetch(`${baseURI}/submissions?teamId=${teamData.team.teamId}&hackCode=${hackCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissions: submissions,
          teamId: teamData.team.teamId,
          hackCode: hackCode,
          phaseIndex: activePhase,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');
      
      alert('Submission successful!');
      // Refresh existing submissions after successful submit
      fetchExistingSubmissions();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{hackathonData.eventName}</h1>
              <p className="text-lg text-gray-700 mt-1">{hackathonData.eventTagline}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-800">
                <span>Mode: {hackathonData.mode}</span>
                <span>Team Size: {hackathonData.teamSize}</span>
                <span>Max Teams: {hackathonData.maxTeams}</span>
              </div>
            </div>
            {teamData && (
              <div className={`mt-4 md:mt-0 rounded-lg p-4 ${
                isTeamActive() ? 'bg-blue-50' : 'bg-red-50'
              }`}>
                <h3 className={`font-semibold ${
                  isTeamActive() ? 'text-blue-900' : 'text-red-900'
                }`}>
                  Team: {teamData.team.teamName}
                </h3>
                <p className={`text-sm ${
                  isTeamActive() ? 'text-blue-700' : 'text-red-700'
                }`}>
                  Team ID: {teamData.team.teamId}
                </p>
                {!isTeamActive() && (
                  <p className="text-sm text-red-700 font-medium mt-1">
                    Status: Inactive
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inactive Team Alert */}
      {teamData && !isTeamActive() && (
        <div className="bg-red-900 border-b border-red-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-100">Team Inactive</h3>
                <p className="text-red-200">You are not part of this hackathon anymore. Submissions are not allowed.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Event Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-800">Start:</span>
                  <p className="text-gray-700">{formatDate(hackathonData.eventStartDate)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-800">End:</span>
                  <p className="text-gray-700">{formatDate(hackathonData.eventEndDate)}</p>
                </div>
                {hackathonData.hasFee && (
                  <div>
                    <span className="font-medium text-gray-800">Fee:</span>
                    <p className="text-gray-700">₹{hackathonData.fee}</p>
                  </div>
                )}
              </div>

              {hackathonData.prizes.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-gray-900">Prizes</h4>
                  <div className="space-y-2">
                    {hackathonData.prizes.map((prize, index) => (
                      <div key={index} className="bg-yellow-50 rounded p-3">
                        <div className="font-medium text-yellow-800">{prize.title}</div>
                        <div className="text-sm text-yellow-700">{prize.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hackathonData.sponsors.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-gray-900">Sponsors</h4>
                  <div className="space-y-1">
                    {hackathonData.sponsors.map((sponsor, index) => (
                      <div key={index} className="text-sm text-gray-700">{sponsor.name}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Phase Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Phases">
                  {hackathonData.phases.map((phase, index) => {
                    const status = getPhaseStatus(phase);
                    const isActive = activePhase === index;
                    const hasSubmission = hasSubmissionForPhase(index);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setActivePhase(index)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          isActive
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{phase.name}</span>
                          <div className="flex space-x-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : status === 'active'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {status}
                            </span>
                            {hasSubmission && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                ✓ Submitted
                              </span>
                            )}
                          </div>
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

                    {/* Team Inactive Warning */}
                    {teamData && !isTeamActive() && (
                      <div className="mb-6 bg-red-900 border border-red-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <p className="text-red-200 font-medium">
                            You are not part of this hackathon anymore
                          </p>
                        </div>
                        <p className="text-red-300 text-sm mt-1">
                          Your team status is inactive. Submissions are not allowed.
                        </p>
                      </div>
                    )}

                    {/* Submission Status Indicator */}
                    {hasSubmissionForPhase(index) && (
                      <div className="mb-6 bg-emerald-900 border border-emerald-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          <p className="text-emerald-200 font-medium">
                            Submission already made for this phase
                          </p>
                        </div>
                        {isTeamActive() && (
                          <p className="text-emerald-300 text-sm mt-1">
                            You can update your submission below if the phase is still active.
                          </p>
                        )}
                      </div>
                    )}

                    {getPhaseStatus(phase) === 'active' && teamData && isTeamActive() ? (
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
                          {submitting ? 'Submitting...' : hasSubmissionForPhase(index) ? 'Update Submission' : 'Submit Deliverables'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Required Deliverables</h3>
                        {phase.deliverables.map((deliverable, deliverableIndex) => {
                          const submissionData = getSubmissionForPhase(index);
                          const submittedValue = submissionData?.submissions?.[deliverable.type];
                          
                          return (
                            <div key={deliverableIndex} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                              <div className="font-medium text-gray-200">
                                {deliverable.type.charAt(0).toUpperCase() + deliverable.type.slice(1)}
                              </div>
                              <div className="text-sm text-gray-300 mt-1">{deliverable.description}</div>
                              {submittedValue && (
                                <div className="mt-3 p-3 bg-gray-600 rounded border-l-4 border-emerald-500">
                                  <div className="text-xs text-emerald-400 font-medium mb-1">Your Submission:</div>
                                  <div className="text-sm text-gray-200 break-all">{submittedValue}</div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
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

                        {teamData && !isTeamActive() && (
                          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                            <p className="text-red-200">You are not part of this hackathon anymore. Submissions are not allowed.</p>
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