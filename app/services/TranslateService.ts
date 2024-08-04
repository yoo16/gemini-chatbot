import axios from 'axios';
import { Message } from '@/app/interfaces/Message';


export const translateText = async (message: Message, toLang: string) => {
    try {
        const data = { message: message, toLang: toLang}
        console.log("translateText: ", message)
        const response = await axios.post('/api/translate', data);
        console.log("translateText response: ", response?.data)
        return response?.data;
    } catch (err) {
        return { error: 'Translation error' };
    }
};
