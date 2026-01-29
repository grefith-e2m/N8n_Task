
import { supabase } from './supabase'

declare const lucide: any;

// Store leads in memory for filtering
let allLeads: any[] = [];

async function init() {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const intentFilter = document.getElementById('intent-filter') as HTMLSelectElement;
    const statusFilter = document.getElementById('status-filter') as HTMLSelectElement;

    if (searchInput) searchInput.addEventListener('input', render);
    if (intentFilter) intentFilter.addEventListener('change', render);
    if (statusFilter) statusFilter.addEventListener('change', render);

    await fetchLeads();
    // Refresh loop
    setInterval(fetchLeads, 10000);
}

async function fetchLeads() {
    const { data, error } = await supabase
        .from('leads')
        .select('*, interactions(*)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading leads', error);
        return;
    }

    allLeads = data || [];
    render();
}

function render() {
    const statsContainer = document.getElementById('stats-container');
    const leadsContainer = document.getElementById('leads-container');
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const intentFilter = document.getElementById('intent-filter') as HTMLSelectElement;
    const statusFilter = document.getElementById('status-filter') as HTMLSelectElement;

    if (!statsContainer || !leadsContainer) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const intentVal = intentFilter ? intentFilter.value : 'ALL';
    const statusVal = statusFilter ? statusFilter.value : 'ALL';

    // Calculate Stats
    const totalLeads = allLeads.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalInteractions = allLeads.reduce((sum: number, l: any) => sum + (l.interactions?.length || 0), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unansweredCount = allLeads.reduce((sum: number, l: any) =>
        sum + (l.interactions?.filter((i: any) => i.status === 'UNANSWERED').length || 0), 0);

    statsContainer.innerHTML = `
    <div class="stat-card">
      <p class="label">Total Leads</p>
      <p class="value">${totalLeads}</p>
    </div>
    <div class="stat-card">
      <p class="label">Total Inquiries</p>
      <p class="value">${totalInteractions}</p>
    </div>
    <div class="stat-card">
      <p class="label">Pending Review</p>
      <p class="value" style="color: ${unansweredCount > 0 ? 'hsl(0, 72%, 50%)' : 'inherit'}">${unansweredCount}</p>
    </div>
  `;

    // Filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredLeads = allLeads.filter((lead: any) => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm) || lead.email.toLowerCase().includes(searchTerm);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasMatch = lead.interactions?.some((i: any) => {
            return (intentVal === 'ALL' || i.intent === intentVal) &&
                (statusVal === 'ALL' || i.status === statusVal);
        });

        const filterActive = intentVal !== 'ALL' || statusVal !== 'ALL';
        return matchesSearch && (!filterActive || hasMatch);
    });

    if (filteredLeads.length === 0) {
        leadsContainer.innerHTML = '<div style="padding: 4rem; text-align: center; color: var(--slate-400)">No matches found</div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leadsContainer.innerHTML = filteredLeads.map((lead: any) => `
    <div class="lead-card">
      <div class="lead-card-header">
        <div class="lead-name-group">
          <h3>${lead.name} ${lead.interactions?.some((i: any) => i.status === 'UNANSWERED' && i.intent === 'HIGH') ? '<span class="urgent-tag">Priority</span>' : ''}</h3>
          <p>${lead.email} • ID: ${lead.id.slice(0, 8)}</p>
        </div>
        <div class="timestamp">${new Date(lead.created_at).toLocaleDateString()}</div>
      </div>
      <div class="interaction-list">
        ${(lead.interactions || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((i: any) => (intentVal === 'ALL' || i.intent === intentVal) && (statusVal === 'ALL' || i.status === statusVal))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((i: any) => `
          <div class="interaction-item status-${(i.status || 'ANSWERED').toLowerCase()}">
            <div class="interaction-meta">
              <span class="badge badge-${(i.intent || 'LOW').toLowerCase()}">${i.intent || 'LOW'} Intent</span>
              <span class="badge" style="background: var(--slate-100); color: var(--slate-600)">${i.status || 'ANSWERED'}</span>
            </div>
            <div class="q-a">
              <p><strong>Query:</strong> ${i.question}</p>
              <p><strong>Response:</strong> ${i.answer}</p>
            </div>
            <div class="timestamp">${new Date(i.timestamp).toLocaleTimeString()}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

init();
