
import { supabase } from '../supabase'

export class LeadAgent {
  private static leadId: string | null = localStorage.getItem('e2m_lead_id');
  private static leadName: string | null = localStorage.getItem('e2m_lead_name');

  static async registerUser(name: string, email: string) {
    try {
      // Check if user exists
      let { data: existingUser } = await supabase
        .from('leads')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        this.leadId = existingUser.id;
        this.leadName = existingUser.name;
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('leads')
          .insert([{ name, email }])
          .select()
          .single()

        if (error) throw error;
        this.leadId = data.id;
        this.leadName = data.name;
      }

      if (this.leadId) localStorage.setItem('e2m_lead_id', this.leadId);
      if (this.leadName) localStorage.setItem('e2m_lead_name', this.leadName!);

      return { id: this.leadId, name: this.leadName };
    } catch (err) {
      console.error('Lead registration failed:', err);
      alert('Failed to connect to the database. Please check your connection.');
      throw err;
    }
  }

  static async logInteraction(question: string, answer: string, intent: string, status: 'ANSWERED' | 'UNANSWERED') {
    if (!this.leadId) return;

    const { error } = await supabase.from('interactions').insert([{
      lead_id: this.leadId,
      question,
      answer,
      intent,
      status,
      timestamp: new Date().toISOString()
    }])

    if (error) console.error('Error logging interaction:', error);
  }

  static getLead() {
    if (this.leadId && this.leadName) {
      return { name: this.leadName, id: this.leadId };
    }
    return null;
  }

  static isRegistered() {
    return !!this.leadId;
  }
}
