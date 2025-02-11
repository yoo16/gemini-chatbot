export interface Message {
    role: 'user' | 'partner' | 'model';
    content: string;
    lang?: string;
}