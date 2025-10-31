'use client';

export default function PrintReportButton({ eventId }: { eventId: string }) {
  function openReport() {
    window.open(`/dashboard/events/${eventId}/analytics/report`, '_blank');
  }

  return (
    <button
      onClick={openReport}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition text-center group"
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition">📄</div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-1">Export Report</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">Generate printable report</p>
    </button>
  );
}
