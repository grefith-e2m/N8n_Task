export class LeadAgent {
  static getLead() {
    const lead = localStorage.getItem('e2m_lead');
    return lead ? JSON.parse(lead) : null;
  }

  static saveLead(name: string, email: string) {
    const lead = {
      name,
      email,
      timestamp: new Date().toISOString(),
      interactions: []
    };
    localStorage.setItem('e2m_lead', JSON.stringify(lead));
    return lead;
  }

  static logInteraction(question: string, answer: string, intent: string, status: 'ANSWERED' | 'UNANSWERED') {
    const lead = this.getLead();
    if (lead) {
      lead.interactions.push({
        question,
        answer,
        intent,
        status,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('e2m_lead', JSON.stringify(lead));

      // Also log to a global list for admin view
      const allLeads = JSON.parse(localStorage.getItem('e2m_all_leads') || '[]');
      const existingLeadIndex = allLeads.findIndex((l: any) => l.email === lead.email);
      if (existingLeadIndex > -1) {
        allLeads[existingLeadIndex] = lead;
      } else {
        allLeads.push(lead);
      }
      localStorage.setItem('e2m_all_leads', JSON.stringify(allLeads));
    }
  }

  static isRegistered() {
    return !!this.getLead();
  }
}
