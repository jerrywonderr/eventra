import React from "react";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  price: string;
  category: string;
  imageUrl?: string;
  onBook?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  location,
  price,
  category,
  imageUrl,
  onBook,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-slate-100 dark:border-slate-700">
      {/* Event Image */}
      <div
        className="h-48 bg-gradient-to-br from-blue-400 to-purple-500"
        style={
          imageUrl
            ? {
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      />

      {/* Event Details */}
      <div className="p-6">
        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
          {category}
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          {title}
        </h3>

        <div className="space-y-2 text-slate-600 dark:text-slate-300 mb-4">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {price}
          </span>
          <button
            onClick={onBook}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:scale-105"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
