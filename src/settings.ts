export interface Settings {
    ['javaImports.showAllUsagesLinks']: boolean
}

export function resolveSettings(raw: Partial<Settings>): Settings {
    return {
        ['javaImports.showAllUsagesLinks']: !!raw['javaImports.showAllUsagesLinks'],
    }
}
