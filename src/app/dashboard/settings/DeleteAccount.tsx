'use client';

import { useState } from 'react';
import { createClient } from '@/libs/supabase/client';
import { useRouter } from 'next/navigation';

interface DeleteAccountProps {
  userId: string;
}

export default function DeleteAccount({ userId }: DeleteAccountProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (confirmText !== 'DELETE') {
      alert('❌ Please type DELETE to confirm');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      
      // Note: This will trigger CASCADE delete in database
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Sign out
      await supabase.auth.signOut();
      
      alert('✅ Account deleted successfully');
      router.push('/');
    } catch (error) {
      alert('❌ Failed to delete account: ' + (error as Error).message);
      console.error(error);
      setLoading(false);
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
      >
        Delete Account
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg p-4">
        <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">
          ⚠️ Warning: This action cannot be undone!
        </h3>
        <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
          <li>• All your tickets will be lost</li>
          <li>• All your certificates will be deleted</li>
          <li>• All your points will be forfeited</li>
          <li>• All your events will be cancelled</li>
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Type <span className="font-bold text-red-600">DELETE</span> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-4 py-2 border border-red-300 dark:border-red-800 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-red-500"
          placeholder="Type DELETE"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={loading || confirmText !== 'DELETE'}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-semibold"
        >
          {loading ? 'Deleting...' : 'Permanently Delete Account'}
        </button>
        <button
          onClick={() => {
            setShowConfirm(false);
            setConfirmText('');
          }}
          disabled={loading}
          className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}