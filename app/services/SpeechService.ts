import { Message } from "@/app/interfaces/Message";
export interface SpeechRecognitionConfig {
    lang: string;
    fromLang: string;
    toLang: string;
    onResult: (message: Message, fromLangCode: string, toLangCode: string) => Promise<void>;
    onError: (error: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
}

export function initializeSpeechRecognition(config: SpeechRecognitionConfig) {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = config.toLang;
        recognition.fromLang = config.fromLang;
        recognition.toLang = config.toLang;

        recognition.onstart = () => {
            if (config.onStart) {
                config.onStart();
            }
        };

        recognition.onend = () => {
            if (config.onEnd) {
                config.onEnd();
            }
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log("onresult:", transcript, config.fromLang, config.toLang)
            if (transcript) {
                config.onResult(transcript, config.fromLang, config.toLang);
            }
        };

        recognition.onerror = (event: any) => {
            config.onError(event.error);
        };

        return recognition;
    } else {
        return null;
    }
}

export const handleSpeak = (
    text: string,
    lang: string,
    setError: React.Dispatch<React.SetStateAction<string>>
) => {
    if (!text) return;
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    } else {
        setError('Your browser does not support speech synthesis.');
    }
};
