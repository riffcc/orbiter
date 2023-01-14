export function downloadFile(filename: string, content: string|Uint8Array) {
    var element = document.createElement('a');
    
    let url: string
    if (content instanceof Uint8Array) {
        url = URL.createObjectURL(new Blob([content.buffer]))
    } else {
        url = content
    }
    element.setAttribute('href', url);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

export function selectTranslation(options?: {[language: string]: string}): string|undefined {
    // Constellation has a multilingual-centric structure, but for now the Riff.CC site is monolingual,
    // so we'll just use any name. Once Riff.CC has an internationalised interface, we can match displayed
    // usernames with the viewer's chosen site language here, and do fancy stuff looking up fallback languages.
    
    // Another idea: we could also set up community translations of the Riff.CC site interface itself with
    // Kilimukku, which is a Constellation-based community translation software.
    return options && Object.keys(options).length ? Object.values(options)[0] : undefined
}

export async function copyText(text: string|undefined) {
    if (!text) return
    await navigator.clipboard.writeText(text);
};
