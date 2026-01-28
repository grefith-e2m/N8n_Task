import kb from '../data/knowledge_base.json';

export class ScraperAgent {
    static answer(question: string) {
        const q = question.toLowerCase();

        // Check services
        const serviceMatch = kb.services.find(s =>
            q.includes(s.name.toLowerCase()) ||
            s.details.toLowerCase().includes(q)
        );
        if (serviceMatch) return serviceMatch.details;

        // Check company info
        if (q.includes('about') || q.includes('who are you') || q.includes('mission')) {
            return `${kb.company.description} Our mission is: ${kb.company.mission}`;
        }

        if (q.includes('location') || q.includes('office') || q.includes('where')) {
            return `We are located in: ${kb.company.locations.join(', ')}.`;
        }

        if (q.includes('experience') || q.includes('how many projects')) {
            return kb.company.experience;
        }

        if (q.includes('benefit') || q.includes('why chose you')) {
            return `Benefits include: ${kb.benefits.join(', ')}.`;
        }

        return "NO_ANSWER_FOUND";
    }
}
