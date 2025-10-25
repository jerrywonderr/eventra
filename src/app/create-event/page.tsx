// src/app/create-event/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/app/actions/events';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    image_url: '',
    max_tickets_per_user: null,
  });
  
  type Tier = {
    tier_name: string;
    price: number;
    quantity_total: number;
    benefits: string[];
  };

  const [tiers, setTiers] = useState<Tier[]>([
    { tier_name: 'General Admission', price: 50, quantity_total: 100, benefits: ['Access to event'] }
  ]);

  const addTier = () => {
    setTiers([...tiers, { tier_name: '', price: 0, quantity_total: 0, benefits: [] }]);
  };

  const updateTier = <K extends keyof Tier>(index: number, field: K, value: Tier[K]) => {
    setTiers(prev => {
      const newTiers = [...prev];
      newTiers[index] = { ...newTiers[index], [field]: value } as Tier;
      return newTiers;
    });
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData for server action
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('event_date', formData.event_date);
      formDataObj.append('location', formData.location);
      formDataObj.append('image_url', formData.image_url);
      formDataObj.append('tiers', JSON.stringify(tiers));

      // Call server action (backend)
      const result = await createEvent(formDataObj);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Success!
      alert('✅ Event created successfully!');
      router.push('/dashboard');
      router.refresh(); // Refresh server data

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-sm font-medium mb-2">Event Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
            placeholder="e.g., Tech Conference 2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
            placeholder="Describe your event..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Event Date *</label>
            <input
              type="datetime-local"
              required
              value={formData.event_date}
              onChange={(e) => setFormData({...formData, event_date: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700"
              placeholder="e.g., Lagos, Nigeria"
            />
          </div>
        </div>

        {/* Ticket Tiers */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Ticket Tiers</h3>
            <button
              type="button"
              onClick={addTier}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              + Add Tier
            </button>
          </div>

          {tiers.map((tier, index) => (
            <div key={index} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Tier {index + 1}</h4>
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Tier Name"
                  value={tier.tier_name}
                  onChange={(e) => updateTier(index, 'tier_name', e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={tier.price}
                  onChange={(e) => updateTier(index, 'price', parseFloat(e.target.value))}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  required
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={tier.quantity_total}
                  onChange={(e) => updateTier(index, 'quantity_total', parseInt(e.target.value))}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  required
                  min="1"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition"
        >
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}