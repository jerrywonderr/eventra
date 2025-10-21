// src/app/events/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type EventItem = {
  id: string | number;
  title?: string | null;
  description?: string | null;
  location?: string | null;
  event_date?: string | null;
  is_active?: boolean | null;
  profiles?: {
    full_name?: string | null;
    email?: string | null;
  } | null;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const { data } = await supabase
      .from('events')
      .select(`
        *,
        profiles!events_organizer_id_fkey (
          full_name,
          email
        )
      `)
      .eq('is_active', true)
      .order('event_date', { ascending: true });

    setEvents(data || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Browse Events</h1>
      
      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No events available yet</p>
          <Link href="/create-event" className="text-blue-600 hover:underline">
            Be the first to create an event
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl">
                
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {event.description || 'No description'}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                   {event.location}
                </p>
                <p className="text-sm text-gray-500">
                   {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBA'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}