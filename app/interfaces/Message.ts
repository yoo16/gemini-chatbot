export interface Message {
    role: 'models' | 'bot';
    content: string;
}