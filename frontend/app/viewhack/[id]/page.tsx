'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from "next/link";


interface Organiser {
  name: string;
  email: string;
  phone: string;
}

interface Phase {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  deliverables: {
    type: string;
    description: string;
  }[];
}

interface Prize {
  title: string;
  description: string;
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
}

interface HackathonStatus {
  phase: 'upcoming' | 'registration' | 'active' | 'ended';
  message: string;
  canRegister: boolean;
  daysRemaining?: number;
}

// Status calculation component
function HackathonStatusCard({ data }: { data: HackathonData }) {
  const calculateStatus = (): HackathonStatus => {
    const now = new Date();
    const regStart = new Date(data.registrationStartDate);
    const regEnd = new Date(data.registrationEndDate);
    const eventStart = new Date(data.eventStartDate);
    const eventEnd = new Date(data.eventEndDate);

    if (now < regStart) {
      const daysUntilReg = Math.ceil((regStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        phase: 'upcoming',
        message: `Registration opens in ${daysUntilReg} day${daysUntilReg !== 1 ? 's' : ''}`,
        canRegister: false,
        daysRemaining: daysUntilReg
      };
    }

    if (now >= regStart && now <= regEnd) {
      const daysLeft = Math.ceil((regEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        phase: 'registration',
        message: `Registration closes in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        canRegister: true,
        daysRemaining: daysLeft
      };
    }

    if (now > regEnd && now < eventStart) {
      const daysUntilEvent = Math.ceil((eventStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        phase: 'upcoming',
        message: `Event starts in ${daysUntilEvent} day${daysUntilEvent !== 1 ? 's' : ''}`,
        canRegister: false,
        daysRemaining: daysUntilEvent
      };
    }

    if (now >= eventStart && now <= eventEnd) {
      const daysLeft = Math.ceil((eventEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        phase: 'active',
        message: `Competition ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        canRegister: false,
        daysRemaining: daysLeft
      };
    }

    return {
      phase: 'ended',
      message: 'This hackathon has ended',
      canRegister: false
    };
  };

  const status = calculateStatus();

  const getStatusColor = () => {
    switch (status.phase) {
      case 'registration': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg capitalize">{status.phase} Phase</h3>
          <p className="text-sm opacity-90">{status.message}</p>
        </div>
        {status.daysRemaining && (
          <div className="text-right">
            <div className="text-2xl font-bold">{status.daysRemaining}</div>
            <div className="text-xs opacity-75">days</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Action button component
function ActionButton({ data }: { data: HackathonData }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserEmail(userData.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const isAdmin = userEmail && data.admins.includes(userEmail);
  const now = new Date();
  const regStart = new Date(data.registrationStartDate);
  const regEnd = new Date(data.registrationEndDate);
  const canRegister = now >= regStart && now <= regEnd;
  const params = useParams();
  const hackCode = params.id as string;


if (isAdmin) {
  return (
    <Link href={`/managehack/${hackCode}`}>

      <button className="w-full bg-[#008622] hover:bg-[#006b1b] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
        Manage Hackathon
      </button>
    </Link>
  );
}

if (canRegister) {
  return (
    <Link href={`/registerhack/${hackCode}`}>
      <button className="w-full bg-[#008622] hover:bg-[#006b1b] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
        Register Now
      </button>
    </Link>
  );
}


  return (
    <button 
      disabled 
      className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
    >
      Registration Closed
    </button>
  );
}

export default function HackathonPage() {
  const params = useParams();
  const [hackData, setHackData] = useState<HackathonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const hackCode = params.id as string;
        const response = await fetch(
          `https://hatchplatform-dcdphngyewcwcuc4.centralindia-01.azurewebsites.net/fetchhack?hackCode=${hackCode}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch hackathon data');
        }
        
        const data = await response.json();
        setHackData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchHackathon();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#008622]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Hackathon</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!hackData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Hackathon Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{hackData.eventName}</h1>
              <p className="text-xl text-gray-600 mb-4">{hackData.eventTagline}</p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-[#008622] text-white text-sm font-medium rounded-full">
                  {hackData.eventType}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full capitalize">
                  {hackData.mode}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Max {hackData.maxTeams} teams
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  Team size: {hackData.teamSize}
                </span>
                {!hackData.hasFee && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    Free Entry
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <HackathonStatusCard data={hackData} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{hackData.eventDescription}</p>
            </div>

            {/* Phases */}
            {hackData.phases && hackData.phases.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Competition Phases</h2>
                <div className="space-y-4">
                  {hackData.phases.map((phase, index) => (
                    <div key={index} className="border-l-4 border-[#008622] pl-4 py-2">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{phase.name}</h3>
                      <p className="text-gray-700 mb-3">{phase.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span><strong>Start:</strong> {formatDate(phase.startDate)}</span>
                        <span><strong>End:</strong> {formatDate(phase.endDate)}</span>
                      </div>
                      {phase.deliverables && phase.deliverables.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Deliverables:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {phase.deliverables.map((deliverable, idx) => (
                              <li key={idx} className="text-gray-700">
                                <span className="font-medium capitalize">{deliverable.type}:</span> {deliverable.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prizes */}
            {hackData.prizes && hackData.prizes.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Prizes & Rewards</h2>
                <div className="grid gap-4">
                  {hackData.prizes.map((prize, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{prize.title}</h3>
                      <p className="text-gray-700">{prize.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sponsors */}
            {hackData.sponsors && hackData.sponsors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sponsors</h2>
                <div className="flex flex-wrap gap-3">
                  {hackData.sponsors.map((sponsor, index) => (
                    <span key={index} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium">
                      {sponsor.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration Action */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <ActionButton data={hackData} />
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Important Dates</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Registration Opens</h3>
                  <p className="text-sm text-gray-600">{formatDate(hackData.registrationStartDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Registration Closes</h3>
                  <p className="text-sm text-gray-600">{formatDate(hackData.registrationEndDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Event Start</h3>
                  <p className="text-sm text-gray-600">{formatDate(hackData.eventStartDate)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Event End</h3>
                  <p className="text-sm text-gray-600">{formatDate(hackData.eventEndDate)}</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-mono font-medium">{hackData.hackCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium capitalize">{hackData.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Size:</span>
                  <span className="font-medium">{hackData.teamSize} members</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Teams:</span>
                  <span className="font-medium">{hackData.maxTeams}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entry Fee:</span>
                  <span className="font-medium">{hackData.hasFee ? 'Paid' : 'Free'}</span>
                </div>
              </div>
            </div>

            {/* Organisers */}
            {hackData.organisers && hackData.organisers.some(org => org.name || org.email) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Organisers</h2>
                <div className="space-y-3">
                  {hackData.organisers.filter(org => org.name || org.email).map((organiser, index) => (
                    <div key={index} className="pb-3 border-b border-gray-200 last:border-b-0">
                      {organiser.name && <p className="font-medium text-gray-900">{organiser.name}</p>}
                      {organiser.email && <p className="text-sm text-gray-600">{organiser.email}</p>}
                      {organiser.phone && <p className="text-sm text-gray-600">{organiser.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}