export interface Language {
    code: string;
    name: string;
}

export const languages: Language[] = [
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'en-US', name: 'English' },
    { code: 'fr-FR', name: 'French' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'de-DE', name: 'German' },
];

export function getLanguageName(code:string) {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : null;
}

export default languages;