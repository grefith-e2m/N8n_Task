export class IntentAgent {
    static classify(question: string): 'HIGH' | 'MEDIUM' | 'LOW' {
        const q = question.toLowerCase();

        const highKeywords = ['pricing', 'cost', 'quote', 'hire'];
        const mediumKeywords = ['service', 'seo', 'design', 'dev', 'content', 'white label', 'how', 'offer'];

        if (highKeywords.some(k => q.includes(k))) return 'HIGH';
        if (mediumKeywords.some(k => q.includes(k))) return 'MEDIUM';

        return 'LOW';
    }
}
