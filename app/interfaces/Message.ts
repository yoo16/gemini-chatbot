export interface Message {
    role: 'user' | 'bot';
    content: string;
}