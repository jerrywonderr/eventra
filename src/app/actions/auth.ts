'use server';

import { sendWelcomeEmail } from '@/libs/email/resend';
import { createClient } from '@/libs/supabase/server';

export async function sendWelcomeEmailToNewUser(userId: string) {
  try {
    const supabase = await createClient();
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (!profile?.email) {
      return { error: 'Profile not found' };
    }

    await sendWelcomeEmail(profile.email, {
      userName: profile.full_name || profile.email.split('@')[0],
    });

    console.log('✅ Welcome email sent to:', profile.email);
    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { error: 'Failed to send welcome email' };
  }
}