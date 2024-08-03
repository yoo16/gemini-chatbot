import axios from 'axios';
import { Message } from '../interfaces/Message';

interface TranslateConfig {
    transcription: string;
    fromLang: string;
    toLang: string;
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

export const translateText = async ({
    transcription,
    fromLang,
    toLang,
    setMessages,
    setError,
}: TranslateConfig) => {
    if (transcription) {
        try {
            const response = await axios.post('/api/translate', {
                userMessage: transcription,
                fromLangCode: fromLang,
                toLangCode: toLang,
            });
            if (response?.data?.error) {
                setError(response.data.error);
            } else if (response?.data?.translate) {
                const botMessage: Message = { role: 'models', content: response.data.translate };
                setMessages((prevMessages) => [botMessage, ...prevMessages]);
            }
        } catch (err) {
            setError('Translation error');
        }
    }
};
