import faqs from '../data/faqs.json';

export class FAQAgent {
    static findMatch(question: string) {
        const q = question.toLowerCase().trim();
        const match = faqs.find(f => {
            const faqQ = f.question.toLowerCase().trim();
            return faqQ.includes(q) || q.includes(faqQ);
        });
        return match ? match.answer : 'NO_MATCH';
    }
}
