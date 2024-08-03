import axios from 'axios';
import { Message } from '@/app/interfaces/Message';

interface TranslateConfig {
    userMessage: string;
    fromLangCode: string;
    toLangCode: string;
}

export const translateText = async (requestData: TranslateConfig) => {
    try {
        const response = await axios.post('/api/translate', requestData);
        return response?.data;
    } catch (err) {
        return { error: 'Translation error' };
    }
};
