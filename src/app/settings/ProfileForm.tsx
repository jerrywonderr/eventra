// src/app/settings/ProfileForm.tsx

'use client';

import { useState } from 'react';
import { createClient } from '@/libs/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileFormProps {
userId: string;
email: string;
fullName: string;
phone: string;
}

export default function ProfileForm({ userId, email, fullName, phone }: ProfileFormProps) {
const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
full_name: fullName,
phone: phone,
});
const router = useRouter();

async function handleSubmit(e: React.FormEvent) {
e.preventDefault();
setLoading(true);


try {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.full_name,
      phone: formData.phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;

  alert('✅ Profile updated successfully!');
  router.refresh();
} catch (error) {
  alert('❌ Failed to update profile: ' + (error as Error).message);
  console.error(error);
} finally {
  setLoading(false);
}


}

return (
<form onSubmit={handleSubmit} className="space-y-4">
<div>
<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
Email Address
</label>
<input
type="email"
value={email}
disabled
className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
/>
<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
Email cannot be changed
</p>
</div>


  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      Full Name
    </label>
    <input
      type="text"
      value={formData.full_name}
      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
      placeholder="Enter your full name"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
      Phone Number
    </label>
    <input
      type="tel"
      value={formData.phone}
      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500"
      placeholder="+234 xxx xxx xxxx"
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
  >
    {loading ? 'Saving...' : 'Save Changes'}
  </button>
</form>


);
}



