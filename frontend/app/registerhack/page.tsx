"use client"

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';


// TypeScript interfaces
interface Organizer {
  name: string;
  email: string;
  phone: string;
}

interface Deliverable {
  type: string;
  description: string;
}

interface Phase {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  deliverables: Deliverable[];
}

interface Prize {
  title: string;
  description: string;
}

interface Sponsor {
  name: string;
  logo?: string;
}

interface Hackathon {
  admins: string[];
  eventName: string;
  eventTagline: string;
  eventDescription: string;
  eventType: string;
  eventStartDate: string;
  eventEndDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  organisers: Organizer[];
  phases: Phase[];
  prizes: Prize[];
  sponsors: Sponsor[];
  teamSize: string;
  maxTeams: string;
  mode: string;
  hasFee: boolean;
  fee?: string;
  upiId?: string;
  hackCode: string;
}

interface TeamMember {
  name: string;
  email: string;
  phone: string;
  institute: string;
  course: string;
  specialization: string;
  graduatingYear: string;
  location: string;
}

interface RegistrationFormData {
  teamLeader: TeamMember;
  teamName: string;
  teamMembers: TeamMember[];
  transactionId?: string;
}

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
];

const RegistrationPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
    const hackCode = searchParams.get("hackCode");

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalTeams, setTotalTeams] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    reset,
    setValue
  } = useForm<RegistrationFormData>({
    mode: 'onChange',
    defaultValues: {
      teamLeader: {
        name: '',
        email: '',
        phone: '',
        institute: '',
        course: '',
        specialization: '',
        graduatingYear: '',
        location: ''
      },
      teamName: '',
      teamMembers: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'teamMembers'
  });

  useEffect(() => {
    const fetchHackathonData = async () => {
      try {
        const response = await fetch('https://hatchplatform-dcdphngyewcwcuc4.centralindia-01.azurewebsites.net/hack-create');
        if (!response.ok) {
          throw new Error('Failed to fetch hackathon data');
        }
        const data: Hackathon[] = await response.json();
        const selectedHackathon = data.find(h => h.hackCode === hackCode);
        
        if (!selectedHackathon) {
          throw new Error('Hackathon not found');
        }
        
        setHackathon(selectedHackathon);
        
        // Fetch current team count (mock - in a real app, you'd call an API)
        setTotalTeams(Math.floor(Math.random() * parseInt(selectedHackathon.maxTeams) * 0.7));
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    if (hackCode) {
      fetchHackathonData();
    }
  }, [hackCode]);

  const onSubmit: SubmitHandler<RegistrationFormData> = async (data) => {
    try {
      // In a real app, you would POST this data to your API
      console.log('Registration data:', data);
      
      // Mock submission
      alert('Registration submitted successfully!');
      
      // Reset form
      reset();
      setCurrentStep(1);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit registration. Please try again.');
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const addTeamMember = () => {
    if (fields.length < parseInt(hackathon?.teamSize || '4') - 1) {
      append({
        name: '',
        email: '',
        phone: '',
        institute: '',
        course: '',
        specialization: '',
        graduatingYear: '',
        location: ''
      });
    }
  };

  const removeTeamMember = (index: number) => {
    remove(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hackathon Not Found</h2>
          <p className="text-gray-700">The hackathon you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Check if registration is open
  const now = new Date();
  const regStart = new Date(hackathon.registrationStartDate);
  const regEnd = new Date(hackathon.registrationEndDate);

  if (now < regStart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Not Open Yet</h2>
          <p className="text-gray-700">
            Registration for {hackathon.eventName} opens on {regStart.toLocaleDateString()}.
          </p>
        </div>
      </div>
    );
  }

  if (now > regEnd) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Closed</h2>
          <p className="text-gray-700">
            Registration for {hackathon.eventName} closed on {regEnd.toLocaleDateString()}.
          </p>
        </div>
      </div>
    );
  }

  if (totalTeams >= parseInt(hackathon.maxTeams)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Full</h2>
          <p className="text-gray-700">
            Sorry, {hackathon.eventName} has reached its maximum capacity of {hackathon.maxTeams} teams.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">{hackathon.eventName}</h1>
            <p className="mt-2 text-lg text-gray-600">{hackathon.eventTagline}</p>
            <p className="mt-1 text-sm text-gray-500">
              Teams remaining: {parseInt(hackathon.maxTeams) - totalTeams} / {hackathon.maxTeams}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <nav className="flex items-center justify-center">
              <ol className="flex items-center space-x-5">
                {[1, 2, hackathon.hasFee ? 3 : null, hackathon.hasFee ? 4 : 3].filter(Boolean).map((step) => (
                  <li key={step}>
                    {step === currentStep ? (
                      <span className="flex items-center">
                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                          <span className="text-sm font-medium text-white">{step}</span>
                        </span>
                        <span className="ml-3 text-sm font-medium text-blue-600">
                          {step === 1 && 'Participant'}
                          {step === 2 && 'Team'}
                          {step === 3 && (hackathon.hasFee ? 'Payment' : 'Summary')}
                          {step === 4 && 'Summary'}
                        </span>
                      </span>
                    ) : step! < currentStep ? (
                      <span className="flex items-center">
                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                          <svg
                            className="h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-500">
                          {step === 1 && 'Participant'}
                          {step === 2 && 'Team'}
                          {step === 3 && (hackathon.hasFee ? 'Payment' : 'Summary')}
                          {step === 4 && 'Summary'}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                          <span className="text-sm font-medium text-gray-600">{step}</span>
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-500">
                          {step === 1 && 'Participant'}
                          {step === 2 && 'Team'}
                          {step === 3 && (hackathon.hasFee ? 'Payment' : 'Summary')}
                          {step === 4 && 'Summary'}
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="bg-white shadow rounded-lg p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Participant Details */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Team Leader Details</h2>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="teamLeader.name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="teamLeader.name"
                        {...register('teamLeader.name', { required: 'Name is required' })}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamLeader?.name ? 'border-red-500' : 'border'}`}
                      />
                      {errors.teamLeader?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.teamLeader.name.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="teamLeader.email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="teamLeader.email"
                        {...register('teamLeader.email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamLeader?.email ? 'border-red-500' : 'border'}`}
                      />
                      {errors.teamLeader?.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.teamLeader.email.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="teamLeader.phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="teamLeader.phone"
                        {...register('teamLeader.phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Invalid phone number (10 digits required)'
                          }
                        })}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamLeader?.phone ? 'border-red-500' : 'border'}`}
                      />
                      {errors.teamLeader?.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.teamLeader.phone.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="teamLeader.institute" className="block text-sm font-medium text-gray-700">
                        Institute Name
                      </label>
                      <input
                        type="text"
                        id="teamLeader.institute"
                        {...register('teamLeader.institute', { required: 'Institute name is required' })}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamLeader?.institute ? 'border-red-500' : 'border'}`}
                      />
                      {errors.teamLeader?.institute && (
                        <p className="mt-1 text-sm text-red-600">{errors.teamLeader.institute.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="teamLeader.course" className="block text-sm font-medium text-gray-700">
                        Course
                      </label>
                      <input
                        type="text"
                        id="teamLeader.course"
                        {...register('teamLeader.course', { required: 'Course is required' })}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamLeader?.course ? 'border-red-500' : 'border'}`}
                      />
                      {errors.teamLeader?.course && (
                        <p className="mt-1 text-sm text-red-600">{errors.teamLeader.course.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="teamLeader.specialization" className="block text-sm font-medium text-gray-700">
                        Specialization
                      </label>
                      <input
                        type="text"
                        id="teamLeader.specialization"
                        {...register('teamLeader.specialization', { required: 'Specialization is required' })}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamLeader?.specialization ? 'border-red-500' : 'border'}`}
                      />
                      {errors.teamLeader?.specialization && (
                        <p className="mt-1 text-sm text-red-600">{errors.teamLeader.specialization.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="teamLeader.graduatingYear" className="block text-sm font-medium text-gray-700">
                        Graduating Year
                      </label>
                      <select
                        id="teamLeader.graduatingYear"
                        {...register('teamLeader.graduatingYear', { required: 'Graduating year is required' })}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamLeader?.graduatingYear ? 'border-red-500' : 'border'}`}
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        ))}
                      </select>
                      {errors.teamLeader?.graduatingYear && (
                        <p className="mt-1 text-sm text-red-600">{errors.teamLeader.graduatingYear.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="teamLeader.location" className="block text-sm font-medium text-gray-700">
                        Location (City)
                      </label>
                      <select
                        id="teamLeader.location"
                        {...register('teamLeader.location', { required: 'Location is required' })}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamLeader?.location ? 'border-red-500' : 'border'}`}
                      >
                        <option value="">Select City</option>
                        {INDIAN_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.teamLeader?.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.teamLeader.location.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Team Details */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Team Details</h2>
                  
                  <div className="mb-6">
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                      Team Name
                    </label>
                    <input
                      type="text"
                      id="teamName"
                      {...register('teamName', { required: 'Team name is required' })}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamName ? 'border-red-500' : 'border'}`}
                    />
                    {errors.teamName && (
                      <p className="mt-1 text-sm text-red-600">{errors.teamName.message}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Team Members</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Maximum team size: {hackathon.teamSize} (including team leader)
                    </p>

                    {fields.map((member, index) => (
                      <div key={member.id} className="mb-8 p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-md font-medium text-gray-700">Member {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeTeamMember(index)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove Member
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor={`teamMembers.${index}.name`} className="block text-sm font-medium text-gray-700">
                              Full Name
                            </label>
                            <input
                              type="text"
                              id={`teamMembers.${index}.name`}
                              {...register(`teamMembers.${index}.name`, { required: 'Name is required' })}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamMembers?.[index]?.name ? 'border-red-500' : 'border'}`}
                            />
                            {errors.teamMembers?.[index]?.name && (
                              <p className="mt-1 text-sm text-red-600">{errors.teamMembers[index]?.name?.message}</p>
                            )}
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor={`teamMembers.${index}.email`} className="block text-sm font-medium text-gray-700">
                              Email Address
                            </label>
                            <input
                              type="email"
                              id={`teamMembers.${index}.email`}
                              {...register(`teamMembers.${index}.email`, {
                                required: 'Email is required',
                                pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: 'Invalid email address'
                                }
                              })}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamMembers?.[index]?.email ? 'border-red-500' : 'border'}`}
                            />
                            {errors.teamMembers?.[index]?.email && (
                              <p className="mt-1 text-sm text-red-600">{errors.teamMembers[index]?.email?.message}</p>
                            )}
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor={`teamMembers.${index}.phone`} className="block text-sm font-medium text-gray-700">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              id={`teamMembers.${index}.phone`}
                              {...register(`teamMembers.${index}.phone`, {
                                required: 'Phone number is required',
                                pattern: {
                                  value: /^[0-9]{10}$/,
                                  message: 'Invalid phone number (10 digits required)'
                                }
                              })}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamMembers?.[index]?.phone ? 'border-red-500' : 'border'}`}
                            />
                            {errors.teamMembers?.[index]?.phone && (
                              <p className="mt-1 text-sm text-red-600">{errors.teamMembers[index]?.phone?.message}</p>
                            )}
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor={`teamMembers.${index}.institute`} className="block text-sm font-medium text-gray-700">
                              Institute Name
                            </label>
                            <input
                              type="text"
                              id={`teamMembers.${index}.institute`}
                              {...register(`teamMembers.${index}.institute`, { required: 'Institute name is required' })}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamMembers?.[index]?.institute ? 'border-red-500' : 'border'}`}
                            />
                            {errors.teamMembers?.[index]?.institute && (
                              <p className="mt-1 text-sm text-red-600">{errors.teamMembers[index]?.institute?.message}</p>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <label htmlFor={`teamMembers.${index}.course`} className="block text-sm font-medium text-gray-700">
                              Course
                            </label>
                            <input
                              type="text"
                              id={`teamMembers.${index}.course`}
                              {...register(`teamMembers.${index}.course`, { required: 'Course is required' })}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamMembers?.[index]?.course ? 'border-red-500' : 'border'}`}
                            />
                            {errors.teamMembers?.[index]?.course && (
                              <p className="mt-1 text-sm text-red-600">{errors.teamMembers[index]?.course?.message}</p>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <label htmlFor={`teamMembers.${index}.specialization`} className="block text-sm font-medium text-gray-700">
                              Specialization
                            </label>
                            <input
                              type="text"
                              id={`teamMembers.${index}.specialization`}
                              {...register(`teamMembers.${index}.specialization`, { required: 'Specialization is required' })}
                              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamMembers?.[index]?.specialization ? 'border-red-500' : 'border'}`}
                            />
                          {errors.teamMembers?.[index]?.specialization && (
                            <p className="mt-1 text-sm text-red-600">{errors.teamMembers[index]?.specialization?.message}</p>
                            )}
                            </div>

                            <div className="sm:col-span-2">
                            <label htmlFor={`teamMembers.${index}.graduatingYear`} className="block text-sm font-medium text-gray-700">
                                Graduating Year
                            </label>
                            <select
                                id={`teamMembers.${index}.graduatingYear`}
                                {...register(`teamMembers.${index}.graduatingYear`, { required: 'Graduating year is required' })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamMembers?.[index]?.graduatingYear ? 'border-red-500' : 'border'}`}
                            >
                                <option value="">Select Year</option>
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                <option key={year} value={year.toString()}>
                                    {year}
                                </option>
                                ))}
                            </select>
                            {errors.teamMembers?.[index]?.graduatingYear && (
                                <p className="mt-1 text-sm text-red-600">{errors.teamMembers[index]?.graduatingYear?.message}</p>
                            )}
                            </div>

                            <div className="sm:col-span-3">
                            <label htmlFor={`teamMembers.${index}.location`} className="block text-sm font-medium text-gray-700">
                                Location (City)
                            </label>
                            <select
                                id={`teamMembers.${index}.location`}
                                {...register(`teamMembers.${index}.location`, { required: 'Location is required' })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.teamMembers?.[index]?.location ? 'border-red-500' : 'border'}`}
                            >
                                <option value="">Select City</option>
                                {INDIAN_CITIES.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                                ))}
                            </select>
                            {errors.teamMembers?.[index]?.location && (
                                <p className="mt-1 text-sm text-red-600">{errors.teamMembers[index]?.location?.message}</p>
                            )}
                            </div>
                            </div>
                            </div>
                            ))}

                            {fields.length < parseInt(hackathon.teamSize) - 1 && (
                            <button
                                type="button"
                                onClick={addTeamMember}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Add Team Member
                            </button>
                            )}
                            </div>
                            </div>
                            )}

                            {/* Step 3: Payment (only if hasFee is true) */}
                            {currentStep === 3 && hackathon.hasFee && (
                            <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Details</h2>
                            
                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-medium text-blue-800 mb-2">Payment Instructions</h3>
                                <p className="text-blue-700 mb-4">
                                Please pay the registration fee of ₹{hackathon.fee} to the following UPI ID:
                                </p>
                                <div className="bg-white p-3 rounded-md border border-blue-200 inline-block">
                                <p className="font-mono text-lg font-bold text-blue-900">{hackathon.upiId}</p>
                                </div>
                                <p className="text-blue-700 mt-4">
                                After payment, enter the transaction ID below to complete your registration.
                                </p>
                            </div>

                            <div className="sm:col-span-4">
                                <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
                                Transaction ID
                                </label>
                                <input
                                type="text"
                                id="transactionId"
                                {...register('transactionId', { required: 'Transaction ID is required' })}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.transactionId ? 'border-red-500' : 'border'}`}
                                />
                                {errors.transactionId && (
                                <p className="mt-1 text-sm text-red-600">{errors.transactionId.message}</p>
                                )}
                            </div>
                            </div>
                            )}

                            {/* Final Step: Confirmation */}
                            {currentStep === (hackathon.hasFee ? 4 : 3) && (
                            <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Registration Summary</h2>
                            
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">Team Leader Details</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                    <p className="text-sm font-medium text-gray-500">Name</p>
                                    <p className="mt-1 text-sm text-gray-900">{watch('teamLeader.name')}</p>
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="mt-1 text-sm text-gray-900">{watch('teamLeader.email')}</p>
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="mt-1 text-sm text-gray-900">{watch('teamLeader.phone')}</p>
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-500">Institute</p>
                                    <p className="mt-1 text-sm text-gray-900">{watch('teamLeader.institute')}</p>
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-500">Course</p>
                                    <p className="mt-1 text-sm text-gray-900">{watch('teamLeader.course')}</p>
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-500">Specialization</p>
                                    <p className="mt-1 text-sm text-gray-900">{watch('teamLeader.specialization')}</p>
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-500">Graduating Year</p>
                                    <p className="mt-1 text-sm text-gray-900">{watch('teamLeader.graduatingYear')}</p>
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-500">Location</p>
                                    <p className="mt-1 text-sm text-gray-900">{watch('teamLeader.location')}</p>
                                    </div>
                                </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">Team Details</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-500">Team Name</p>
                                    <p className="mt-1 text-sm text-gray-900">{watch('teamName')}</p>
                                </div>

                                <h4 className="text-md font-medium text-gray-700 mb-2">Team Members</h4>
                                {watch('teamMembers').map((member, index) => (
                                    <div key={index} className="mb-6 p-3 bg-white rounded-md border border-gray-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                        <p className="text-sm font-medium text-gray-500">Name</p>
                                        <p className="mt-1 text-sm text-gray-900">{member.name}</p>
                                        </div>
                                        <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="mt-1 text-sm text-gray-900">{member.email}</p>
                                        </div>
                                        <div>
                                        <p className="text-sm font-medium text-gray-500">Phone</p>
                                        <p className="mt-1 text-sm text-gray-900">{member.phone}</p>
                                        </div>
                                        <div>
                                        <p className="text-sm font-medium text-gray-500">Institute</p>
                                        <p className="mt-1 text-sm text-gray-900">{member.institute}</p>
                                        </div>
                                        <div>
                                        <p className="text-sm font-medium text-gray-500">Course</p>
                                        <p className="mt-1 text-sm text-gray-900">{member.course}</p>
                                        </div>
                                        <div>
                                        <p className="text-sm font-medium text-gray-500">Specialization</p>
                                        <p className="mt-1 text-sm text-gray-900">{member.specialization}</p>
                                        </div>
                                        <div>
                                        <p className="text-sm font-medium text-gray-500">Graduating Year</p>
                                        <p className="mt-1 text-sm text-gray-900">{member.graduatingYear}</p>
                                        </div>
                                        <div>
                                        <p className="text-sm font-medium text-gray-500">Location</p>
                                        <p className="mt-1 text-sm text-gray-900">{member.location}</p>
                                        </div>
                                    </div>
                                    </div>
                                ))}
                                </div>
                            </div>

                            {hackathon.hasFee && (
                                <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">Payment Details</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                                        <p className="mt-1 text-sm text-gray-900">₹{hackathon.fee}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                                        <p className="mt-1 text-sm text-gray-900">{watch('transactionId')}</p>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            )}

                            <div className="mt-6">
                                <p className="text-sm text-gray-500">
                                By submitting this form, you agree to the terms and conditions of the hackathon.
                                </p>
                            </div>
                            </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-8 flex justify-between">
                            {currentStep > 1 ? (
                                <button
                                type="button"
                                onClick={prevStep}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                Previous
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {currentStep < (hackathon.hasFee ? 4 : 3) ? (
                                <button
                                type="button"
                                onClick={nextStep}
                                disabled={!isValid}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                Next
                                </button>
                            ) : (
                                <button
                                type="submit"
                                disabled={!isValid}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                Complete Registration
                                </button>
                            )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div>Loading registration form...</div>}>
      <RegistrationPageContent />
    </Suspense>
  );
}