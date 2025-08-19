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

interface Member {
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  graduatingYear?: string;
  institute?: string;
  location?: string;
  specialization?: string;
}

interface SubmissionDeliverable {
  [key: string]: string; // This allows dynamic keys like "presentation", "mvp", etc.
}

interface Submission {
  phaseId: number;
  submittedAt?: string;
  submissions?: SubmissionDeliverable;
  score?: number; // Score is directly in the submission object
}

interface Registration {
  teamId: string;
  teamName?: string;
  teamLeader?: Member;
  teamMembers?: Member[];
  submissions?: Submission[];
  paymentDetails?: any;
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
  registrations?: Registration[];
}

type TabType = 'overview' | 'details' | 'phases' | 'admins' | 'judging' | 'leaderboard';

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
  
  // Judging state
  const [activePhaseId, setActivePhaseId] = useState<string>('');
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<string>>(new Set());
  const [scoreInputs, setScoreInputs] = useState<Record<string, Record<string, string>>>({});
  const [scoreSaving, setScoreSaving] = useState<Record<string, boolean>>({});

  // In-memory auth token storage (replace with your actual auth mechanism)
  const [authToken, setAuthToken] = useState<string>('');

  // Get auth token - implement your actual auth logic here
  const getAuthToken = () => {
    // For now, return empty string or implement proper auth
    // You might want to get this from context, props, or cookies
    return localStorage.getItem('auth_token');
  };

  const fetchHackathonData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${BASE_URL}/fetchhack?hackCode=${hackCode}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch hackathon data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched hackathon data:', data); // Debug log
      
      setHackData(data);
      setEditedData(data);
      setError(null);
      
      // Set default active phase for judging
      if (data.phases && data.phases.length > 0 && !activePhaseId) {
        setActivePhaseId(data.phases[0].name);
      }
    } catch (err) {
      console.error('Error fetching hackathon data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch hackathon data');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();
      
      const response = await fetch(`${BASE_URL}/managehack`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hackCode,
          action: 'update',
          updateFields: editedData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save changes: ${response.status} ${response.statusText}`);
      }

      alert('Changes saved successfully!');
      await fetchHackathonData(); // Refresh data
    } catch (err) {
      console.error('Error saving changes:', err);
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
      const token = getAuthToken();
      
      const response = await fetch(`${BASE_URL}/managehack`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hackCode,
          action: 'add_admin',
          adminEmail: newAdminEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add admin: ${response.status} ${response.statusText}`);
      }

      alert('Admin added successfully!');
      setNewAdminEmail('');
      await fetchHackathonData(); // Refresh data
    } catch (err) {
      console.error('Error adding admin:', err);
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
      const token = getAuthToken();
      
      const response = await fetch(`${BASE_URL}/managehack`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hackCode,
          action: 'remove_admin',
          adminEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove admin: ${response.status} ${response.statusText}`);
      }

      alert('Admin removed successfully!');
      await fetchHackathonData(); // Refresh data
    } catch (err) {
      console.error('Error removing admin:', err);
      alert(err instanceof Error ? err.message : 'Failed to remove admin');
    }
  };

  const handleInputChange = (field: keyof HackathonData, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addPhase = () => {
    const newPhase: Phase = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      deliverables: []
    };
    
    const updatedPhases = [...(editedData.phases || []), newPhase];
    handleInputChange('phases', updatedPhases);
  };

  const updatePhase = (index: number, field: keyof Phase, value: any) => {
    const updatedPhases = [...(editedData.phases || [])];
    updatedPhases[index] = { ...updatedPhases[index], [field]: value };
    handleInputChange('phases', updatedPhases);
  };

  const removePhase = (index: number) => {
    if (confirm('Are you sure you want to remove this phase?')) {
      const updatedPhases = editedData.phases?.filter((_, i) => i !== index) || [];
      handleInputChange('phases', updatedPhases);
    }
  };

  const addDeliverable = (phaseIndex: number) => {
    const newDeliverable: Deliverable = {
      description: '',
      type: 'github'
    };
    
    const updatedPhases = [...(editedData.phases || [])];
    updatedPhases[phaseIndex].deliverables = [...updatedPhases[phaseIndex].deliverables, newDeliverable];
    handleInputChange('phases', updatedPhases);
  };

  const updateDeliverable = (phaseIndex: number, deliverableIndex: number, field: keyof Deliverable, value: string) => {
    const updatedPhases = [...(editedData.phases || [])];
    updatedPhases[phaseIndex].deliverables[deliverableIndex] = {
      ...updatedPhases[phaseIndex].deliverables[deliverableIndex],
      [field]: value
    };
    handleInputChange('phases', updatedPhases);
  };

  const removeDeliverable = (phaseIndex: number, deliverableIndex: number) => {
    const updatedPhases = [...(editedData.phases || [])];
    updatedPhases[phaseIndex].deliverables = updatedPhases[phaseIndex].deliverables.filter((_, i) => i !== deliverableIndex);
    handleInputChange('phases', updatedPhases);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Helper function to get total team members count
  const getTotalMembersCount = (team: Registration): number => {
    let count = 0;
    if (team.teamLeader) count += 1;
    if (team.teamMembers) count += team.teamMembers.length;
    return count;
  };

  // Judging functions - Updated to match actual JSON structure
  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeamIds);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeamIds(newExpanded);
  };

  const handleScoreInputChange = (teamId: string, phaseId: string, value: string) => {
    setScoreInputs(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [phaseId]: value
      }
    }));
  };

  const handleSaveScore = async (teamId: string, phaseId: string, rawScore: string) => {
    const score = parseInt(rawScore, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      alert('Score must be a number between 0 and 100');
      return;
    }

    // Find phase index
    const phaseIndex = hackData?.phases.findIndex(p => p.name === phaseId) ?? -1;
    if (phaseIndex === -1) {
      alert('Phase not found');
      return;
    }

    const saveKey = `${teamId}-${phaseId}`;
    try {
      setScoreSaving(prev => ({ ...prev, [saveKey]: true }));
      const token = getAuthToken();

      console.log('Saving score:', { teamId, phaseIndex, hackCode, score }); // Debug log

      const response = await fetch(`${BASE_URL}/grading?hackCode=${encodeURIComponent(hackCode)}&teamId=${encodeURIComponent(teamId)}&phaseId=${phaseIndex}`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          phaseId: phaseIndex,
          hackCode,
          score
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Score save error response:', errorText);
        throw new Error(`Failed to save score: ${response.status} ${response.statusText}`);
      }

      alert('Score saved successfully!');
      
      // Clear the input for this team/phase
      setScoreInputs(prev => ({
        ...prev,
        [teamId]: {
          ...prev[teamId],
          [phaseId]: ''
        }
      }));

      // Refresh the data to get updated scores
      await fetchHackathonData();
      
    } catch (err) {
      console.error('Error saving score:', err);
      alert(err instanceof Error ? err.message : 'Failed to save score');
    } finally {
      setScoreSaving(prev => ({ ...prev, [saveKey]: false }));
    }
  };

  // Updated to match actual JSON structure
  const getTeamSubmission = (team: Registration, phaseId: string): Submission | undefined => {
    const phaseIndex = hackData?.phases.findIndex(p => p.name === phaseId) ?? -1;
    return team.submissions?.find(sub => sub.phaseId === phaseIndex);
  };

  // Updated to get score directly from submission
  const getCurrentScore = (team: Registration, phaseId: string): number | undefined => {
    const submission = getTeamSubmission(team, phaseId);
    return submission?.score;
  };

  const getScoreInput = (teamId: string, phaseId: string): string => {
    return scoreInputs[teamId]?.[phaseId] || '';
  };

  const isScoreInputActive = (teamId: string, phaseId: string): boolean => {
    const input = scoreInputs[teamId]?.[phaseId];
    return input !== undefined && input !== '';
  };

  // Helper function to calculate total score for a team
  const calculateTeamTotalScore = (team: Registration): number => {
    if (!team.submissions) return 0;
    return team.submissions.reduce((total, submission) => {
      return total + (submission.score || 0);
    }, 0);
  };

  // Helper function to get leaderboard data
  const getLeaderboardData = () => {
    if (!hackData?.registrations) return [];
    
    return hackData.registrations
      .map(team => ({
        teamId: team.teamId,
        teamName: team.teamName || team.teamId,
        totalScore: calculateTeamTotalScore(team),
        submissions: team.submissions || [],
        memberCount: getTotalMembersCount(team)
      }))
      .sort((a, b) => b.totalScore - a.totalScore); // Descending order
  };

  // 1. Add new state variables after the existing state declarations
  const [activeLeaderboardPhase, setActiveLeaderboardPhase] = useState<string>('overall');
  const [eliminationCount, setEliminationCount] = useState<string>('');
  const [eliminating, setEliminating] = useState(false);

  // 2. Add new helper functions after the existing helper functions

  // Define unified interface for leaderboard data
  interface LeaderboardTeam {
    teamId: string;
    teamName: string;
    score: number; // This will be either phase score or total score
    submissions?: Submission[];
    memberCount: number;
    hasSubmission?: boolean;
  }

  // Helper function to get phase-wise leaderboard data
  const getPhaseLeaderboardData = (phaseId: string): LeaderboardTeam[] => {
    if (!hackData?.registrations) return [];
    
    const phaseIndex = hackData.phases.findIndex(p => p.name === phaseId);
    if (phaseIndex === -1) return [];
    
    return hackData.registrations
      .map(team => {
        const submission = team.submissions?.find(sub => sub.phaseId === phaseIndex);
        const hasSubmission = submission && submission.submissions && Object.keys(submission.submissions).length > 0;
        return {
          teamId: team.teamId,
          teamName: team.teamName || team.teamId,
          score: submission?.score || 0,
          hasSubmission,
          memberCount: getTotalMembersCount(team)
        };
      })
      .filter(team => team.hasSubmission) // Only show teams that have submitted
      .sort((a, b) => b.score - a.score); // Descending order
  };

  // Helper function to get overall leaderboard data
  const getOverallLeaderboardData = (): LeaderboardTeam[] => {
    if (!hackData?.registrations) return [];
    
    return hackData.registrations
      .map(team => ({
        teamId: team.teamId,
        teamName: team.teamName || team.teamId,
        score: calculateTeamTotalScore(team), // Use 'score' instead of 'totalScore'
        submissions: team.submissions || [],
        memberCount: getTotalMembersCount(team)
      }))
      .sort((a, b) => b.score - a.score); // Descending order
  };

  // Function to handle team elimination
  const handleElimination = async () => {
    const count = parseInt(eliminationCount, 10);
    if (isNaN(count) || count <= 0) {
      alert('Please enter a valid number of teams to eliminate');
      return;
    }

    let teamsData;
    let phaseIndex = -1;
    
    if (activeLeaderboardPhase === 'overall') {
      teamsData = getOverallLeaderboardData();
    } else {
      teamsData = getPhaseLeaderboardData(activeLeaderboardPhase);
      phaseIndex = hackData?.phases.findIndex(p => p.name === activeLeaderboardPhase) ?? -1;
    }

    if (count >= teamsData.length) {
      alert('Cannot eliminate all teams!');
      return;
    }

    // Calculate cutoff score
    const sortedTeams = [...teamsData].sort((a, b) => b.score - a.score);
    
    const cutoffTeam = sortedTeams[sortedTeams.length - count - 1];
    const cutoffScore = cutoffTeam.score;

    if (!confirm(`This will eliminate ${count} teams with score ${cutoffScore} or below. Are you sure?`)) {
      return;
    }

    try {
      setEliminating(true);
      const token = getAuthToken();
      
      const response = await fetch(`${BASE_URL}/eliminate?hackCode=${encodeURIComponent(hackCode)}&phaseId=${phaseIndex}`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cutoff_score: cutoffScore
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Elimination error response:', errorText);
        throw new Error(`Failed to eliminate teams: ${response.status} ${response.statusText}`);
      }

      alert(`Successfully eliminated ${count} teams with cutoff score: ${cutoffScore}`);
      setEliminationCount('');
      await fetchHackathonData(); // Refresh data
      
    } catch (err) {
      console.error('Error eliminating teams:', err);
      alert(err instanceof Error ? err.message : 'Failed to eliminate teams');
    } finally {
      setEliminating(false);
    }
  };

  // Set a default auth token if needed (replace with your auth logic)
  useEffect(() => {
    // You might want to get the token from props, context, or some other source
    // For now, setting empty string - replace with actual auth implementation
    setAuthToken('');
  }, []);

  useEffect(() => {
    if (hackCode) {
      fetchHackathonData();
    }
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
        <div className="text-xl text-red-600">
          <p>Error: {error}</p>
          <button 
            onClick={fetchHackathonData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
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
              { id: 'phases', label: 'Phases' },
              { id: 'admins', label: 'Admins' },
              { id: 'judging', label: 'Judging' },
              { id: 'leaderboard', label: 'Leaderboard' },
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
                <p><strong>Hack Code:</strong> {hackData.hackCode}</p>
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

            {hackData.hasFee && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Fee Information</h3>
                <p><strong>Fee:</strong> ₹{hackData.fee}</p>
                <p><strong>UPI ID:</strong> {hackData.upiId}</p>
              </div>
            )}

            {hackData.sponsors && hackData.sponsors.length > 0 && (
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

            {hackData.prizes && hackData.prizes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Prizes</h3>
                {hackData.prizes.map((prize, index) => (
                  <div key={index} className="mb-2">
                    <strong>{prize.title}:</strong> {prize.description}
                  </div>
                ))}
              </div>
            )}

            {hackData.registrations && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Registration Stats</h3>
                <p><strong>Registered Teams:</strong> {hackData.registrations.length}</p>
                <p><strong>Max Teams:</strong> {hackData.maxTeams}</p>
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

        {activeTab === 'phases' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Manage Phases</h2>
              <div className="flex gap-2">
                <button
                  onClick={addPhase}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add Phase
                </button>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {editedData.phases && editedData.phases.length > 0 ? (
              <div className="space-y-6">
                {editedData.phases.map((phase, phaseIndex) => (
                  <div key={phaseIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Phase {phaseIndex + 1}</h3>
                      <button
                        onClick={() => removePhase(phaseIndex)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Remove Phase
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Phase Name</label>
                        <input
                          type="text"
                          value={phase.name}
                          onChange={(e) => updatePhase(phaseIndex, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="e.g., Ideation Phase"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={phase.description}
                          onChange={(e) => updatePhase(phaseIndex, 'description', e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Phase description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                          type="datetime-local"
                          value={phase.startDate}
                          onChange={(e) => updatePhase(phaseIndex, 'startDate', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                          type="datetime-local"
                          value={phase.endDate}
                          onChange={(e) => updatePhase(phaseIndex, 'endDate', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                      </div>
                    </div>

                    {/* Deliverables Section */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-medium">Deliverables</h4>
                        <button
                          onClick={() => addDeliverable(phaseIndex)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Add Deliverable
                        </button>
                      </div>

                      {phase.deliverables.length > 0 ? (
                        <div className="space-y-2">
                          {phase.deliverables.map((deliverable, deliverableIndex) => (
                            <div key={deliverableIndex} className="bg-gray-50 p-3 rounded border">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                                <div>
                                  <label className="block text-xs font-medium mb-1">Type</label>
                                  <select
                                    value={deliverable.type}
                                    onChange={(e) => updateDeliverable(phaseIndex, deliverableIndex, 'type', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                  >
                                    <option value="github">GitHub</option>
                                    <option value="canva">Canva</option>
                                    <option value="mvp">MVP</option>
                                    <option value="drive">Drive</option>
                                    <option value="figma">Figma</option>
                                    <option value="video">Video</option>
                                    <option value="presentation">Presentation</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium mb-1">Description</label>
                                  <input
                                    type="text"
                                    value={deliverable.description}
                                    onChange={(e) => updateDeliverable(phaseIndex, deliverableIndex, 'description', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    placeholder="Deliverable description"
                                  />
                                </div>

                                <div className="flex justify-end">
                                  <button
                                    onClick={() => removeDeliverable(phaseIndex, deliverableIndex)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No deliverables added yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No phases defined yet</p>
                <button
                  onClick={addPhase}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add First Phase
                </button>
              </div>
            )}
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

        {activeTab === 'judging' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Judging</h2>
            
            {hackData.phases && hackData.phases.length > 0 ? (
              <>
                {/* Phase tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {hackData.phases.map((phase) => (
                      <button
                        key={phase.name}
                        onClick={() => setActivePhaseId(phase.name)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activePhaseId === phase.name
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {phase.name}
                        <br />
                        <span className="text-xs text-gray-400">
                          {formatDate(phase.startDate).split(',')[0]} - {formatDate(phase.endDate).split(',')[0]}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Teams table for active phase */}
                {hackData.registrations && hackData.registrations.length > 0 ? (
                  <div className="space-y-4">
                    {hackData.registrations.map((team) => {
                      const submission = getTeamSubmission(team, activePhaseId);
                      const currentScore = getCurrentScore(team, activePhaseId);
                      const scoreInput = getScoreInput(team.teamId, activePhaseId);
                      const saveKey = `${team.teamId}-${activePhaseId}`;
                      const isSaving = scoreSaving[saveKey] || false;
                      const isExpanded = expandedTeamIds.has(team.teamId);
                      const hasSubmission = submission && submission.submissions && Object.keys(submission.submissions).length > 0;
                      
                      return (
                        <div key={team.teamId} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" 
                            onClick={() => toggleTeamExpansion(team.teamId)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg text-gray-800">
                                    {team.teamName || team.teamId}
                                  </h3>
                                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                                    {getTotalMembersCount(team)} member{getTotalMembersCount(team) !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  {/* Submission Status */}
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${hasSubmission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={`text-sm ${hasSubmission ? 'text-green-700' : 'text-red-700'}`}>
                                      {hasSubmission ? 'Submitted' : 'Not submitted'}
                                    </span>
                                    {submission?.submittedAt && (
                                      <span className="text-xs text-gray-500">
                                        on {formatDate(submission.submittedAt)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Enhanced Score Section */}
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  {currentScore !== undefined ? (
                                    // Score is already given
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                      <div className="flex items-center gap-2">
                                        <div className="text-2xl font-bold text-green-700">
                                          {currentScore}
                                        </div>
                                        <div className="text-green-600">/100</div>
                                      </div>
                                      <div className="text-xs text-green-600 mb-2">Scored</div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleScoreInputChange(team.teamId, activePhaseId, currentScore.toString());
                                        }}
                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                                      >
                                        Edit Score
                                      </button>
                                    </div>
                                  ) : hasSubmission ? (
                                    // Has submission but no score
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                      <div className="text-sm font-medium text-orange-700 mb-2">
                                        Awaiting Score
                                      </div>
                                      <div className="text-xs text-orange-600 mb-2">
                                        Submitted
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleScoreInputChange(team.teamId, activePhaseId, '');
                                        }}
                                        className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 transition-colors"
                                      >
                                        Add Score
                                      </button>
                                    </div>
                                  ) : (
                                    // No submission
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                      <div className="text-sm text-gray-600">
                                        No Submission
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Cannot score
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Score Input Modal */}
                                  {isScoreInputActive(team.teamId, activePhaseId) && (
                                    <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 ml-4">
                                      <div className="mb-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Enter Score (0-100)
                                        </label>
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          step="1"
                                          placeholder="Score"
                                          value={scoreInput}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            handleScoreInputChange(team.teamId, activePhaseId, e.target.value);
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          autoFocus
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSaveScore(team.teamId, activePhaseId, scoreInput);
                                          }}
                                          disabled={!scoreInput || isNaN(parseInt(scoreInput)) || parseInt(scoreInput) < 0 || parseInt(scoreInput) > 100 || isSaving}
                                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setScoreInputs(prev => ({
                                              ...prev,
                                              [team.teamId]: {
                                                ...prev[team.teamId],
                                                [activePhaseId]: ''
                                              }
                                            }));
                                          }}
                                          className="bg-gray-400 text-white px-3 py-2 rounded text-sm hover:bg-gray-500"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-gray-400">
                                  {isExpanded ? '▼' : '▶'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded content */}
                          {isExpanded && (
                            <div className="border-t border-gray-200 bg-gray-50">
                              <div className="p-4">
                                {/* Team members */}
                                <div className="mb-6">
                                  <h4 className="font-medium text-sm mb-3 text-gray-800">Team Members:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {/* Team Leader */}
                                    {team.teamLeader && (
                                      <div className="bg-gradient-to-r from-green-100 to-green-200 border border-green-300 text-green-800 px-3 py-2 rounded-lg text-sm">
                                        <div className="flex items-center gap-1">
                                          <span className="font-medium">👑 {team.teamLeader.name || team.teamLeader.email || 'Team Leader'}</span>
                                        </div>
                                        {team.teamLeader.course && team.teamLeader.graduatingYear && (
                                          <div className="text-xs text-green-700 mt-1">
                                            {team.teamLeader.course} - {team.teamLeader.graduatingYear}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {/* Team Members */}
                                    {team.teamMembers && team.teamMembers.map((member, idx) => (
                                      <div key={idx} className="bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-300 text-blue-800 px-3 py-2 rounded-lg text-sm">
                                        <div className="font-medium">
                                          {member.name || member.email || `Member ${idx + 1}`}
                                        </div>
                                        {member.course && member.graduatingYear && (
                                          <div className="text-xs text-blue-700 mt-1">
                                            {member.course} - {member.graduatingYear}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Deliverables */}
                                <div>
                                  <h4 className="font-medium text-sm mb-3 text-gray-800">
                                    Deliverables for {activePhaseId}:
                                  </h4>
                                  {hasSubmission ? (
                                    <div className="space-y-3">
                                      {Object.entries(submission.submissions!).map(([type, value], idx) => (
                                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                                                  {type}
                                                </span>
                                                {value && typeof value === 'string' && value.startsWith('http') && (
                                                  <a
                                                    href={value}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-2 py-1 rounded transition-colors"
                                                  >
                                                    🔗 Open Link
                                                  </a>
                                                )}
                                              </div>
                                              <p className="text-sm text-gray-700 break-all bg-gray-50 p-2 rounded">
                                                {value}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <div className="text-gray-400 text-4xl mb-2">📋</div>
                                      <p className="text-gray-500 text-sm">No deliverables submitted for this phase</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <p className="text-gray-500 text-lg">No teams registered yet</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <p className="text-gray-500 text-lg">No phases defined yet. Please add phases first.</p>
              </div>
            )}
          </div>
        )}


        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
            
            {/* Phase tabs for leaderboard */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveLeaderboardPhase('overall')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeLeaderboardPhase === 'overall'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overall
                </button>
                {hackData.phases && hackData.phases.map((phase) => (
                  <button
                    key={phase.name}
                    onClick={() => setActiveLeaderboardPhase(phase.name)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeLeaderboardPhase === phase.name
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {phase.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Elimination controls */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-medium text-red-800 mb-2">Team Elimination</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    Number of teams to eliminate from bottom
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter number of teams"
                    value={eliminationCount}
                    onChange={(e) => setEliminationCount(e.target.value)}
                    className="w-full border border-red-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button
                  onClick={handleElimination}
                  disabled={!eliminationCount || isNaN(parseInt(eliminationCount)) || parseInt(eliminationCount) <= 0 || eliminating}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {eliminating ? 'Eliminating...' : 'Eliminate Teams'}
                </button>
              </div>
              <p className="text-xs text-red-600 mt-1">
                ⚠️ This action will permanently remove teams from the hackathon based on their {activeLeaderboardPhase === 'overall' ? 'total' : 'phase'} scores.
              </p>
            </div>

            {/* Leaderboard content */}
            {(() => {
              const leaderboardData = activeLeaderboardPhase === 'overall' 
                ? getOverallLeaderboardData() 
                : getPhaseLeaderboardData(activeLeaderboardPhase);
              
              return leaderboardData.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {activeLeaderboardPhase === 'overall' ? 'Overall Rankings' : `${activeLeaderboardPhase} Rankings`}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {leaderboardData.length} team{leaderboardData.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {leaderboardData.map((team, index) => {
                    return (
                      <div
                        key={team.teamId}
                        className={`border rounded-lg p-4 ${
                          index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-yellow-100' : 
                          index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100' : 
                          index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-orange-100' : 
                          'border-gray-200 bg-white hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`text-2xl font-bold ${
                              index === 0 ? 'text-yellow-600' : 
                              index === 1 ? 'text-gray-600' : 
                              index === 2 ? 'text-orange-600' : 
                              'text-gray-500'
                            }`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{team.teamName}</h3>
                              <p className="text-sm text-gray-600">{team.memberCount} members</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {team.score}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activeLeaderboardPhase === 'overall' ? 'Total Score' : 'Phase Score'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Phase-wise breakdown for overall tab */}
                        {activeLeaderboardPhase === 'overall' && team.submissions && team.submissions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                              {team.submissions.map((submission: Submission, idx: number) => {
                                const phaseName = hackData.phases[submission.phaseId]?.name || `Phase ${submission.phaseId + 1}`;
                                return (
                                  <span
                                    key={idx}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                  >
                                    {phaseName}: {submission.score || 0}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏆</div>
                  <p className="text-gray-500 text-lg">
                    {activeLeaderboardPhase === 'overall' 
                      ? 'No teams with scores yet' 
                      : `No teams have submitted for ${activeLeaderboardPhase} yet`
                    }
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}