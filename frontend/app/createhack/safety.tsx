'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, Users, Trophy, Building, Clock, FileText } from 'lucide-react';

// TypeScript interfaces
interface Organiser {
  name: string;
  email: string;
  phone: string;
}

interface Prize {
  title: string;
  description: string;
}

interface Sponsor {
  name: string;
}

interface Deliverable {
  type: 'canva' | 'github' | 'drive' | 'mvp' | 'other';
  description: string;
}

interface Phase {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  deliverables: Deliverable[];
}

interface EventFormData {
  // Event Details
  eventName: string;
  eventTagline: string;
  eventDescription: string;
  eventType: 'hackathon' | 'quiz' | 'codeathon' | 'ideathon';
  mode: 'online' | 'offline';
  imageUrl: string;
  
  // Organiser Details
  organisers: Organiser[];
  
  // Event Timeline
  eventStartDate: string;
  eventEndDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  
  // Participation Details
  maxTeams: number;
  teamSize: number;
  hasFee: boolean;
  fee?: number;
  upiId?: string;
  
  // Prizes & Rewards
  prizes: Prize[];
  
  // Sponsors
  sponsors: Sponsor[];
  
  // Event Phases
  phases: Phase[];
}

const steps = [
  { id: 1, title: 'Event Details', icon: FileText },
  { id: 2, title: 'Organisers', icon: Users },
  { id: 3, title: 'Timeline', icon: Calendar },
  { id: 4, title: 'Participation', icon: Users },
  { id: 5, title: 'Prizes', icon: Trophy },
  { id: 6, title: 'Sponsors', icon: Building },
  { id: 7, title: 'Phases', icon: Clock },
  { id: 8, title: 'Review', icon: FileText },
];

export default function CreateEventForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionResult, setSubmissionResult] = useState<EventFormData | null>(null);

  const { control, handleSubmit, watch, formState: { errors }, trigger, getValues } = useForm<EventFormData>({
    defaultValues: {
      organisers: [{ name: '', email: '', phone: '' }],
      prizes: [{ title: '', description: '' }],
      sponsors: [{ name: '' }],
      phases: [{ 
        name: '', 
        description: '', 
        startDate: '', 
        endDate: '', 
        deliverables: [{ type: 'github', description: '' }] 
      }],
      hasFee: false,
      mode: 'online',
      eventType: 'hackathon'
    }
  });

  const { fields: organiserFields, append: appendOrganiser, remove: removeOrganiser } = useFieldArray({
    control,
    name: 'organisers'
  });

  const { fields: prizeFields, append: appendPrize, remove: removePrize } = useFieldArray({
    control,
    name: 'prizes'
  });

  const { fields: sponsorFields, append: appendSponsor, remove: removeSponsor } = useFieldArray({
    control,
    name: 'sponsors'
  });

  const { fields: phaseFields, append: appendPhase, remove: removePhase } = useFieldArray({
    control,
    name: 'phases'
  });

  const hasFee = watch('hasFee');

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid && currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: EventFormData) => {
    setSubmissionResult(data);
    console.log('Form Data:', JSON.stringify(data, null, 2));
  };

  if (submissionResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Event Created Successfully!</h1>
              <p className="text-gray-600 mt-2">Your hackathon event has been submitted.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Submitted Data (JSON Format):</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm max-h-96">
                {JSON.stringify(submissionResult, null, 2)}
              </pre>
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setSubmissionResult(null);
                  setCurrentStep(1);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Another Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' : 
                    isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
                  <Controller
                    name="eventName"
                    control={control}
                    rules={{ required: 'Event name is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter event name"
                      />
                    )}
                  />
                  {errors.eventName && <p className="mt-1 text-sm text-red-600">{errors.eventName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Tagline *</label>
                  <Controller
                    name="eventTagline"
                    control={control}
                    rules={{ required: 'Event tagline is required' }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter a catchy tagline"
                      />
                    )}
                  />
                  {errors.eventTagline && <p className="mt-1 text-sm text-red-600">{errors.eventTagline.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Description *</label>
                  <Controller
                    name="eventDescription"
                    control={control}
                    rules={{ required: 'Event description is required' }}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your event..."
                      />
                    )}
                  />
                  {errors.eventDescription && <p className="mt-1 text-sm text-red-600">{errors.eventDescription.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                    <Controller
                      name="eventType"
                      control={control}
                      rules={{ required: 'Event type is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="hackathon">Hackathon</option>
                          <option value="quiz">Quiz</option>
                          <option value="codeathon">Codeathon</option>
                          <option value="ideathon">Ideathon</option>
                        </select>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Mode *</label>
                    <Controller
                      name="mode"
                      control={control}
                      render={({ field }) => (
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="online"
                              checked={field.value === 'online'}
                              onChange={() => field.onChange('online')}
                              className="mr-2"
                            />
                            Online
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="offline"
                              checked={field.value === 'offline'}
                              onChange={() => field.onChange('offline')}
                              className="mr-2"
                            />
                            Offline
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Image URL</label>
                  <Controller
                    name="imageUrl"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/event-image.jpg"
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Organisers */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Organiser Details</h2>
                
                {organiserFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Organiser {index + 1}</h3>
                      {organiserFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOrganiser(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <Controller
                          name={`organisers.${index}.name`}
                          control={control}
                          rules={{ required: 'Name is required' }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Organiser name"
                            />
                          )}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <Controller
                          name={`organisers.${index}.email`}
                          control={control}
                          rules={{ 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="email@example.com"
                            />
                          )}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                        <Controller
                          name={`organisers.${index}.phone`}
                          control={control}
                          rules={{ required: 'Phone is required' }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="tel"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="+1234567890"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => appendOrganiser({ name: '', email: '', phone: '' })}
                  className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Organiser
                </button>
              </div>
            )}

            {/* Step 3: Timeline */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Timeline</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Start Date *</label>
                    <Controller
                      name="eventStartDate"
                      control={control}
                      rules={{ required: 'Event start date is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.eventStartDate && <p className="mt-1 text-sm text-red-600">{errors.eventStartDate.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event End Date *</label>
                    <Controller
                      name="eventEndDate"
                      control={control}
                      rules={{ required: 'Event end date is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.eventEndDate && <p className="mt-1 text-sm text-red-600">{errors.eventEndDate.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Start Date *</label>
                    <Controller
                      name="registrationStartDate"
                      control={control}
                      rules={{ required: 'Registration start date is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.registrationStartDate && <p className="mt-1 text-sm text-red-600">{errors.registrationStartDate.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration End Date *</label>
                    <Controller
                      name="registrationEndDate"
                      control={control}
                      rules={{ required: 'Registration end date is required' }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    />
                    {errors.registrationEndDate && <p className="mt-1 text-sm text-red-600">{errors.registrationEndDate.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Participation Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Participation Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Number of Teams *</label>
                    <Controller
                      name="maxTeams"
                      control={control}
                      rules={{ required: 'Max teams is required', min: 1 }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100"
                        />
                      )}
                    />
                    {errors.maxTeams && <p className="mt-1 text-sm text-red-600">{errors.maxTeams.message}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Size *</label>
                    <Controller
                      name="teamSize"
                      control={control}
                      rules={{ required: 'Team size is required', min: 1 }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="4"
                        />
                      )}
                    />
                    {errors.teamSize && <p className="mt-1 text-sm text-red-600">{errors.teamSize.message}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <Controller
                      name="hasFee"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mr-2"
                        />
                      )}
                    />
                    <span className="text-sm font-medium text-gray-700">Event has registration fee</span>
                  </label>
                </div>
                
                {hasFee && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee *</label>
                      <Controller
                        name="fee"
                        control={control}
                        rules={{ required: hasFee ? 'Fee is required' : false, min: 0 }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="500"
                          />
                        )}
                      />
                      {errors.fee && <p className="mt-1 text-sm text-red-600">{errors.fee.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID *</label>
                      <Controller
                        name="upiId"
                        control={control}
                        rules={{ required: hasFee ? 'UPI ID is required' : false }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="yourname@upi"
                          />
                        )}
                      />
                      {errors.upiId && <p className="mt-1 text-sm text-red-600">{errors.upiId.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Prizes */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Prizes & Rewards</h2>
                
                {prizeFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Prize {index + 1}</h3>
                      {prizeFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrize(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prize Title *</label>
                        <Controller
                          name={`prizes.${index}.title`}
                          control={control}
                          rules={{ required: 'Prize title is required' }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="1st Prize"
                            />
                          )}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <Controller
                          name={`prizes.${index}.description`}
                          control={control}
                          rules={{ required: 'Prize description is required' }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="₹50,000 cash prize"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => appendPrize({ title: '', description: '' })}
                  className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Prize
                </button>
              </div>
            )}

            {/* Step 6: Sponsors */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sponsors</h2>
                
                {sponsorFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Sponsor {index + 1}</h3>
                      {sponsorFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSponsor(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sponsor Name *</label>
                      <Controller
                        name={`sponsors.${index}.name`}
                        control={control}
                        rules={{ required: 'Sponsor name is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Company name"
                          />
                        )}
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => appendSponsor({ name: '' })}
                  className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Sponsor
                </button>
              </div>
            )}

            {/* Step 7: Event Phases */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Phases</h2>
                
                {phaseFields.map((phaseField, phaseIndex) => (
                  <div key={phaseField.id} className="border rounded-lg p-6 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Phase {phaseIndex + 1}</h3>
                      {phaseFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhase(phaseIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phase Name *</label>
                        <Controller
                          name={`phases.${phaseIndex}.name`}
                          control={control}
                          rules={{ required: 'Phase name is required' }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Ideation Phase"
                            />
                          )}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phase Description *</label>
                        <Controller
                          name={`phases.${phaseIndex}.description`}
                          control={control}
                          rules={{ required: 'Phase description is required' }}
                          render={({ field }) => (
                            <textarea
                              {...field}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Describe this phase..."
                            />
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phase Start Date *</label>
                          <Controller
                            name={`phases.${phaseIndex}.startDate`}
                            control={control}
                            rules={{ required: 'Phase start date is required' }}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phase End Date *</label>
                          <Controller
                            name={`phases.${phaseIndex}.endDate`}
                            control={control}
                            rules={{ required: 'Phase end date is required' }}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-4">Deliverables</h4>
                      <Controller
                        name={`phases.${phaseIndex}.deliverables`}
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-4">
                            {field.value.map((deliverable, deliverableIndex) => (
                              <div key={deliverableIndex} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-4">
                                  <h5 className="text-sm font-medium">Deliverable {deliverableIndex + 1}</h5>
                                  {field.value.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newDeliverables = [...field.value];
                                        newDeliverables.splice(deliverableIndex, 1);
                                        field.onChange(newDeliverables);
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                                    <select
                                      value={deliverable.type}
                                      onChange={(e) => {
                                        const newDeliverables = [...field.value];
                                        newDeliverables[deliverableIndex] = {
                                          ...newDeliverables[deliverableIndex],
                                          type: e.target.value as any
                                        };
                                        field.onChange(newDeliverables);
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="github">GitHub Repo</option>
                                      <option value="canva">Canva Link</option>
                                      <option value="drive">Google Drive Content</option>
                                      <option value="mvp">MVP Link</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                    <input
                                      type="text"
                                      value={deliverable.description}
                                      onChange={(e) => {
                                        const newDeliverables = [...field.value];
                                        newDeliverables[deliverableIndex] = {
                                          ...newDeliverables[deliverableIndex],
                                          description: e.target.value
                                        };
                                        field.onChange(newDeliverables);
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Describe the deliverable"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => {
                                const newDeliverables = [...field.value, { type: 'github', description: '' }];
                                field.onChange(newDeliverables);
                              }}
                              className="flex items-center px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Deliverable
                            </button>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => appendPhase({ 
                    name: '', 
                    description: '', 
                    startDate: '', 
                    endDate: '', 
                    deliverables: [{ type: 'github', description: '' }] 
                  })}
                  className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Phase
                </button>
              </div>
            )}

            {/* Step 8: Review */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Event</h2>
                
                <div className="space-y-6">
                  {/* Event Details Preview */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Name:</strong> {watch('eventName')}</div>
                      <div><strong>Type:</strong> {watch('eventType')}</div>
                      <div><strong>Mode:</strong> {watch('mode')}</div>
                      <div><strong>Tagline:</strong> {watch('eventTagline')}</div>
                      <div className="md:col-span-2"><strong>Description:</strong> {watch('eventDescription')}</div>
                    </div>
                  </div>

                  {/* Organisers Preview */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Organisers</h3>
                    <div className="space-y-2">
                      {watch('organisers')?.map((organiser, index) => (
                        <div key={index} className="text-sm">
                          <strong>{organiser.name}</strong> - {organiser.email} - {organiser.phone}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Preview */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Event Start:</strong> {watch('eventStartDate')}</div>
                      <div><strong>Event End:</strong> {watch('eventEndDate')}</div>
                      <div><strong>Registration Start:</strong> {watch('registrationStartDate')}</div>
                      <div><strong>Registration End:</strong> {watch('registrationEndDate')}</div>
                    </div>
                  </div>

                  {/* Participation Preview */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Participation Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Max Teams:</strong> {watch('maxTeams')}</div>
                      <div><strong>Team Size:</strong> {watch('teamSize')}</div>
                      <div><strong>Has Fee:</strong> {watch('hasFee') ? 'Yes' : 'No'}</div>
                      {watch('hasFee') && (
                        <>
                          <div><strong>Fee:</strong> ₹{watch('fee')}</div>
                          <div><strong>UPI ID:</strong> {watch('upiId')}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Prizes Preview */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Prizes</h3>
                    <div className="space-y-2">
                      {watch('prizes')?.map((prize, index) => (
                        <div key={index} className="text-sm">
                          <strong>{prize.title}:</strong> {prize.description}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sponsors Preview */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Sponsors</h3>
                    <div className="space-y-2">
                      {watch('sponsors')?.map((sponsor, index) => (
                        <div key={index} className="text-sm">
                          {sponsor.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phases Preview */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Event Phases</h3>
                    <div className="space-y-4">
                      {watch('phases')?.map((phase, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="text-sm">
                            <strong>{phase.name}</strong>
                            <p className="text-gray-600">{phase.description}</p>
                            <p><strong>Duration:</strong> {phase.startDate} to {phase.endDate}</p>
                            <div className="mt-2">
                              <strong>Deliverables:</strong>
                              <ul className="list-disc list-inside ml-4">
                                {phase.deliverables?.map((deliverable, dIndex) => (
                                  <li key={dIndex}>
                                    {deliverable.type}: {deliverable.description}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-2 rounded-lg ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </button>

              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Event
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}