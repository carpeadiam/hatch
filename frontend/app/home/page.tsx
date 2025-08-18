'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

interface Hackathon {
  admins: string[];
  eventDescription: string;
  eventEndDate: string;
  eventName: string;
  eventStartDate: string;
  eventTagline: string;
  eventType: string;
  fee?: string;
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
  upiId?: string;
}

export default function HomePage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://hatchplatform-dcdphngyewcwcuc4.centralindia-01.azurewebsites.net/allHacks'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch hackathons');
      }
      
      const data = await response.json();
      console.log(data);
      // Filter hackathons to show only future events
      const now = new Date();
      
      // Remove the filter for testing purposes to see all hackathons
      const futureHackathons = data;
      
      // Or alternatively, fix the date comparison if you want to keep the filter:
      // const futureHackathons = data.filter((hackathon: Hackathon) => {
      //   // Parse the date properly to ensure correct comparison
      //   const startDate = new Date(hackathon.eventStartDate);
      //   return startDate > now;
      // });
      
      console.log('Filtered hackathons:', futureHackathons.length);
      setHackathons(futureHackathons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = (registrationEndDate: string): string => {
    const now = new Date();
    const endDate = new Date(registrationEndDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Registration Closed';
    }
    
    return `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
  };

  const calculatePrizePool = (prizes: Prize[]): string => {
    let total = 0;
    
    prizes.forEach(prize => {
      // Extract numbers from the description
      const numbers = prize.description.match(/\d+/g);
      if (numbers) {
        numbers.forEach(num => {
          total += parseInt(num, 10);
        });
      }
    });
    
    return total > 0 ? `₹${total.toLocaleString()}` : 'TBA';
  };

  const getRegistrationFee = (hackathon: Hackathon): string => {
    if (hackathon.hasFee && hackathon.fee) {
      return `₹${hackathon.fee}`;
    }
    return 'Free';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hackathons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchHackathons}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upcoming Hackathons
          </h1>
          <p className="text-xl text-gray-600">
            Discover and participate in exciting hackathons
          </p>
        </div>

        {/* Hackathons Grid */}
        {hackathons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No hackathons available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {hackathons.map((hackathon) => (
              <Link
                key={hackathon.hackCode}
                href={`/hackathons/${hackathon.hackCode}`}
                className="block group"
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  {/* Placeholder Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-2xl font-bold mb-1">🚀</div>
                        <div className="text-sm opacity-90">Hackathon</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    {/* Title and Tagline */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {hackathon.eventName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {hackathon.eventTagline}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Mode:</span>
                        <span className="text-gray-900 capitalize font-medium">
                          {hackathon.mode}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Team Size:</span>
                        <span className="text-gray-900 font-medium">
                          {hackathon.teamSize} members
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Registration Fee:</span>
                        <span className="text-gray-900 font-medium">
                          {getRegistrationFee(hackathon)}
                        </span>
                      </div>
                    </div>

                    {/* Registration Status */}
                    <div className="mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Registration: </span>
                        <span className={`font-medium ${
                          calculateDaysLeft(hackathon.registrationEndDate) === 'Registration Closed'
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {calculateDaysLeft(hackathon.registrationEndDate)}
                        </span>
                      </div>
                    </div>

                    {/* Prize Pool */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="text-sm text-yellow-800">
                        <span className="font-medium">Prize Pool: </span>
                        <span className="font-bold">
                          {calculatePrizePool(hackathon.prizes)}
                        </span>
                      </div>
                    </div>

                    {/* Event Dates */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {new Date(hackathon.eventStartDate).toLocaleDateString()} - {' '}
                        {new Date(hackathon.eventEndDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/hackathons"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            View All Hackathons
            <svg 
              className="ml-2 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}