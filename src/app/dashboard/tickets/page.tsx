export default function MyTicketsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          My Tickets
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          View and manage your NFT tickets
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎟️</div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No tickets yet
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Your NFT tickets will appear here after booking
          </p>
        </div>
      </div>
    </div>
  );
}
