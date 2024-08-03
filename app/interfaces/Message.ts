export interface Message {
    role: 'user' | 'partner' | 'models';
    content: string;
}