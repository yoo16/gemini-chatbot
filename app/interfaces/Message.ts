export interface Message {
    role: 'user' | 'models';
    content: string;
}