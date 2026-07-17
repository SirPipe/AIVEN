export type PasswordGenerationMode = 'random' | 'pronounceable' | 'passphrase';

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
    score: PasswordStrengthScore;
    label: 'Muy débil' | 'Débil' | 'Aceptable' | 'Fuerte' | 'Muy fuerte';
    entropyBits: number;
    estimatedCrackTimeSeconds: number;
    estimatedCrackTimeLabel: string;
    warnings: string[];
}

interface CommonPasswordOptions {
    count?: number;
    excludedCharacters?: string;
}

export interface RandomPasswordOptions extends CommonPasswordOptions {
    mode?: 'random';
    length?: number;
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
    excludeSimilar?: boolean;
}

export interface PronounceablePasswordOptions extends CommonPasswordOptions {
    mode: 'pronounceable';
    length?: number;
    uppercase?: boolean;
    lowercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
    excludeSimilar?: boolean;
}

export interface PassphrasePasswordOptions extends CommonPasswordOptions {
    mode: 'passphrase';
    wordCount?: number;
    separator?: string;
    capitalizeWords?: boolean;
    includeNumber?: boolean;
    wordList?: readonly string[];
}

export type PasswordGenerationOptions =
    | RandomPasswordOptions
    | PronounceablePasswordOptions
    | PassphrasePasswordOptions;

export interface GeneratedPassword {
    value: string;
    strength: PasswordStrength;
}

export interface PasswordGenerationResult {
    mode: PasswordGenerationMode;
    passwords: GeneratedPassword[];
    warnings: string[];
}

const UPPERCASE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARACTERS = '0123456789';
const SYMBOL_CHARACTERS = '!@#$%^&*()-_=+[]{};:,.?';
const SIMILAR_CHARACTERS = new Set('Il1O0o');
const VOWELS = 'aeiou';
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
const UINT32_RANGE = 0x1_0000_0000;
const OFFLINE_GUESSES_PER_SECOND = 10_000_000_000;

export const DEFAULT_PASSPHRASE_WORDS = Object.freeze([
    'abeja',
    'acero',
    'agua',
    'aire',
    'alba',
    'alce',
    'aldea',
    'alga',
    'ambar',
    'ancla',
    'arena',
    'aroma',
    'astro',
    'atlas',
    'ave',
    'bambu',
    'barco',
    'bosque',
    'brisa',
    'cable',
    'cacao',
    'cactus',
    'campo',
    'canoa',
    'canto',
    'cedro',
    'cielo',
    'cobre',
    'colina',
    'cometa',
    'coral',
    'cristal',
    'cueva',
    'dalia',
    'delta',
    'duna',
    'eco',
    'esfera',
    'faro',
    'fauna',
    'fibra',
    'flor',
    'fuego',
    'galaxia',
    'gema',
    'glaciar',
    'grano',
    'hoja',
    'horizonte',
    'isla',
    'jade',
    'jardin',
    'junco',
    'lago',
    'lazo',
    'lima',
    'lince',
    'loto',
    'luna',
    'madera',
    'mango',
    'mapa',
    'mar',
    'menta',
    'monte',
    'nave',
    'nexo',
    'nube',
    'oasis',
    'oceano',
    'olivo',
    'onda',
    'orbita',
    'panda',
    'pasto',
    'perla',
    'piedra',
    'pino',
    'pixel',
    'pluma',
    'prisma',
    'puerto',
    'quimera',
    'radio',
    'rama',
    'rio',
    'roble',
    'roca',
    'sal',
    'sauce',
    'selva',
    'sol',
    'tallo',
    'tecla',
    'tigre',
    'tinta',
    'torre',
    'trigo',
    'valle',
    'vela',
    'viento',
    'violeta',
    'volcan',
    'yate',
    'yodo',
    'zafiro',
    'zorro',
    'acorde',
    'aurora',
    'brote',
    'cascada',
    'cima',
    'costa',
    'foton',
    'girasol',
    'helecho',
    'laguna',
    'marea',
    'nucleo',
    'puma',
    'rayo',
    'semilla',
    'tundra',
    'vector',
    'zenit',
] as const);

export function generatePasswords(
    options: PasswordGenerationOptions = {},
): PasswordGenerationResult {
    const mode = options.mode ?? 'random';
    const count = validateInteger(options.count ?? 1, 'cantidad', 1, 100);
    const passwords: GeneratedPassword[] = [];
    const warnings: string[] = [];

    for (let index = 0; index < count; index += 1) {
        const generated = generateForMode(mode, options);

        passwords.push(generated);
    }

    if (mode === 'pronounceable') {
        warnings.push(
            'Las contraseñas pronunciables tienen una estructura más predecible que una contraseña aleatoria equivalente.',
        );
    }

    if (mode === 'passphrase') {
        warnings.push(
            'La estimación depende del tamaño real y la aleatoriedad de la lista de palabras.',
        );
    }

    return { mode, passwords, warnings };
}

export function estimatePasswordStrength(password: string): PasswordStrength {
    if (password.length === 0) {
        return createStrength(0, ['La contraseña está vacía.']);
    }

    let poolSize = 0;

    if (/[a-z]/u.test(password)) {
        poolSize += LOWERCASE_CHARACTERS.length;
    }

    if (/[A-Z]/u.test(password)) {
        poolSize += UPPERCASE_CHARACTERS.length;
    }

    if (/\d/u.test(password)) {
        poolSize += NUMBER_CHARACTERS.length;
    }

    if (/[^A-Za-z0-9]/u.test(password)) {
        poolSize += SYMBOL_CHARACTERS.length;
    }

    const uniqueCharacters = new Set(password).size;
    const repetitionRatio = uniqueCharacters / password.length;
    let entropyBits = password.length * Math.log2(Math.max(poolSize, 1));
    const warnings: string[] = [];

    if (repetitionRatio < 0.6) {
        entropyBits *= 0.75;
        warnings.push('Contiene varios caracteres repetidos.');
    }

    if (/(.)\1{2,}/u.test(password)) {
        entropyBits -= 8;
        warnings.push('Contiene una repetición consecutiva fácil de adivinar.');
    }

    if (hasSimpleSequence(password)) {
        entropyBits -= 10;
        warnings.push('Contiene una secuencia común.');
    }

    if (password.length < 12) {
        warnings.push('Una longitud de al menos 12 caracteres es preferible.');
    }

    return createStrength(Math.max(0, entropyBits), warnings);
}

function generateForMode(
    mode: PasswordGenerationMode,
    options: PasswordGenerationOptions,
): GeneratedPassword {
    switch (mode) {
        case 'pronounceable':
            return generatePronounceablePassword(
                options as PronounceablePasswordOptions,
            );
        case 'passphrase':
            return generatePassphrase(options as PassphrasePasswordOptions);
        case 'random':
            return generateRandomPassword(options as RandomPasswordOptions);
    }
}

function generateRandomPassword(
    options: RandomPasswordOptions,
): GeneratedPassword {
    const length = validateInteger(options.length ?? 20, 'longitud', 4, 256);
    const excludeSimilar = options.excludeSimilar ?? true;
    const excludedCharacters = new Set(options.excludedCharacters ?? '');
    const requestedPools = [
        {
            enabled: options.uppercase ?? true,
            label: 'mayúsculas',
            pool: filterPool(
                UPPERCASE_CHARACTERS,
                excludedCharacters,
                excludeSimilar,
            ),
        },
        {
            enabled: options.lowercase ?? true,
            label: 'minúsculas',
            pool: filterPool(
                LOWERCASE_CHARACTERS,
                excludedCharacters,
                excludeSimilar,
            ),
        },
        {
            enabled: options.numbers ?? true,
            label: 'números',
            pool: filterPool(
                NUMBER_CHARACTERS,
                excludedCharacters,
                excludeSimilar,
            ),
        },
        {
            enabled: options.symbols ?? true,
            label: 'símbolos',
            pool: filterPool(
                SYMBOL_CHARACTERS,
                excludedCharacters,
                excludeSimilar,
            ),
        },
    ];
    const selectedPools = requestedPools.filter((item) => item.enabled);
    const unavailablePool = selectedPools.find(
        (item) => item.pool.length === 0,
    );
    const pools = selectedPools.map((item) => item.pool);

    if (selectedPools.length === 0) {
        throw new Error(
            'Selecciona al menos una clase con caracteres disponibles.',
        );
    }

    if (unavailablePool) {
        throw new Error(
            `Los caracteres excluidos vaciaron la clase de ${unavailablePool.label}.`,
        );
    }

    if (length < pools.length) {
        throw new Error(
            'La longitud debe permitir al menos un carácter de cada clase seleccionada.',
        );
    }

    const combinedPool = pools.join('');
    const characters = pools.map((pool) => pickSecureCharacter(pool));

    while (characters.length < length) {
        characters.push(pickSecureCharacter(combinedPool));
    }

    secureShuffle(characters);

    const value = characters.join('');

    return {
        value,
        strength: createStrength(
            length * Math.log2(combinedPool.length),
            length < 12
                ? ['Una longitud de al menos 12 caracteres es preferible.']
                : [],
        ),
    };
}

function generatePronounceablePassword(
    options: PronounceablePasswordOptions,
): GeneratedPassword {
    const length = validateInteger(options.length ?? 18, 'longitud', 6, 128);
    const excludedCharacters = new Set(options.excludedCharacters ?? '');
    const excludeSimilar = options.excludeSimilar ?? true;
    const lowercase = options.lowercase ?? true;
    const uppercase = options.uppercase ?? true;
    const includeNumbers = options.numbers ?? true;
    const includeSymbols = options.symbols ?? false;
    const vowels = filterPool(VOWELS, excludedCharacters, excludeSimilar, true);
    const consonants = filterPool(
        CONSONANTS,
        excludedCharacters,
        excludeSimilar,
        true,
    );
    const numberPool = includeNumbers
        ? filterPool(NUMBER_CHARACTERS, excludedCharacters, excludeSimilar)
        : '';
    const symbolPool = includeSymbols
        ? filterPool(SYMBOL_CHARACTERS, excludedCharacters, excludeSimilar)
        : '';
    const additions = Number(includeNumbers) + Number(includeSymbols);
    const baseLength = length - additions;

    if (!lowercase && !uppercase) {
        throw new Error(
            'El modo pronunciable requiere letras minúsculas, mayúsculas o ambas.',
        );
    }

    if (!vowels || !consonants) {
        throw new Error(
            'Los caracteres excluidos no permiten construir sílabas pronunciables.',
        );
    }

    if (includeNumbers && !numberPool) {
        throw new Error('No quedan números disponibles después de excluirlos.');
    }

    if (includeSymbols && !symbolPool) {
        throw new Error(
            'No quedan símbolos disponibles después de excluirlos.',
        );
    }

    if (baseLength < 4) {
        throw new Error(
            'La longitud no deja suficientes letras pronunciables.',
        );
    }

    const startsWithVowel = secureRandomIndex(2) === 1;
    const characters: string[] = [];
    let entropyBits = 1;

    for (let index = 0; index < baseLength; index += 1) {
        const useVowel = (index % 2 === 0) === startsWithVowel;
        const pool = useVowel ? vowels : consonants;

        characters.push(pickSecureCharacter(pool));
        entropyBits += Math.log2(pool.length);
    }

    if (!lowercase) {
        for (let index = 0; index < characters.length; index += 1) {
            characters[index] = characters[index].toUpperCase();
        }
    } else if (uppercase) {
        const uppercaseIndex = secureRandomIndex(characters.length);

        characters[uppercaseIndex] = characters[uppercaseIndex].toUpperCase();
        entropyBits += Math.log2(characters.length);
    }

    if (includeNumbers) {
        insertAtSecurePosition(characters, pickSecureCharacter(numberPool));
        entropyBits += Math.log2(numberPool.length * characters.length);
    }

    if (includeSymbols) {
        insertAtSecurePosition(characters, pickSecureCharacter(symbolPool));
        entropyBits += Math.log2(symbolPool.length * characters.length);
    }

    const value = characters.join('');

    return {
        value,
        strength: createStrength(entropyBits, [
            'La estructura alterna consonantes y vocales, por lo que es más predecible.',
        ]),
    };
}

function generatePassphrase(
    options: PassphrasePasswordOptions,
): GeneratedPassword {
    const wordCount = validateInteger(
        options.wordCount ?? 8,
        'cantidad de palabras',
        3,
        20,
    );
    const separator = options.separator ?? '-';
    const words = normalizeWordList(
        options.wordList ?? DEFAULT_PASSPHRASE_WORDS,
        options.excludedCharacters ?? '',
    );
    const selectedWords: string[] = [];

    for (let index = 0; index < wordCount; index += 1) {
        const selected = words[secureRandomIndex(words.length)];

        selectedWords.push(
            options.capitalizeWords
                ? selected.charAt(0).toUpperCase() + selected.slice(1)
                : selected,
        );
    }

    let entropyBits = wordCount * Math.log2(words.length);

    if (options.includeNumber) {
        const number = secureRandomIndex(100).toString().padStart(2, '0');

        selectedWords.splice(
            secureRandomIndex(selectedWords.length + 1),
            0,
            number,
        );
        entropyBits += Math.log2(100 * (wordCount + 1));
    }

    const value = selectedWords.join(separator);
    const warnings = [
        `La lista utilizada contiene ${words.length.toLocaleString('es-MX')} palabras únicas.`,
    ];

    if (words.length < 2_048) {
        warnings.push(
            'Para frases de máxima entropía conviene proporcionar una lista auditada de al menos 2,048 palabras.',
        );
    }

    return {
        value,
        strength: createStrength(entropyBits, warnings),
    };
}

function normalizeWordList(
    source: readonly string[],
    excludedCharacters: string,
): string[] {
    const excluded = new Set(excludedCharacters);
    const words = Array.from(
        new Set(
            source
                .map((word) => word.trim())
                .filter(
                    (word) =>
                        word.length > 0 &&
                        !Array.from(word).some((character) =>
                            excluded.has(character),
                        ),
                ),
        ),
    );

    if (words.length < 16) {
        throw new Error(
            'La lista de palabras debe contener al menos 16 palabras únicas disponibles.',
        );
    }

    return words;
}

function filterPool(
    pool: string,
    excludedCharacters: ReadonlySet<string>,
    excludeSimilar: boolean,
    caseInsensitive = false,
): string {
    return Array.from(pool)
        .filter((character) => {
            const isExplicitlyExcluded = caseInsensitive
                ? Array.from(excludedCharacters).some(
                      (excluded) =>
                          excluded.toLocaleLowerCase('es') ===
                          character.toLocaleLowerCase('es'),
                  )
                : excludedCharacters.has(character);

            return (
                !isExplicitlyExcluded &&
                (!excludeSimilar || !SIMILAR_CHARACTERS.has(character))
            );
        })
        .join('');
}

function pickSecureCharacter(pool: string): string {
    return pool.charAt(secureRandomIndex(pool.length));
}

function secureRandomIndex(maxExclusive: number): number {
    if (!Number.isSafeInteger(maxExclusive) || maxExclusive < 1) {
        throw new Error('El límite aleatorio debe ser un entero positivo.');
    }

    if (maxExclusive > UINT32_RANGE) {
        throw new Error('El límite aleatorio supera el rango permitido.');
    }

    const cryptoApi = globalThis.crypto;

    if (!cryptoApi?.getRandomValues) {
        throw new Error(
            'El navegador no ofrece un generador criptográfico seguro.',
        );
    }

    const rejectionLimit = UINT32_RANGE - (UINT32_RANGE % maxExclusive);
    const randomValue = new Uint32Array(1);
    let value: number;

    do {
        cryptoApi.getRandomValues(randomValue);
        value = randomValue[0];
    } while (value >= rejectionLimit);

    return value % maxExclusive;
}

function secureShuffle<T>(items: T[]): void {
    for (let index = items.length - 1; index > 0; index -= 1) {
        const swapIndex = secureRandomIndex(index + 1);
        const current = items[index];

        items[index] = items[swapIndex];
        items[swapIndex] = current;
    }
}

function insertAtSecurePosition(items: string[], character: string): void {
    items.splice(secureRandomIndex(items.length + 1), 0, character);
}

function createStrength(
    entropyBits: number,
    warnings: string[],
): PasswordStrength {
    const roundedEntropy = Math.max(0, Math.round(entropyBits * 10) / 10);
    const score = entropyToScore(roundedEntropy);
    const labels = [
        'Muy débil',
        'Débil',
        'Aceptable',
        'Fuerte',
        'Muy fuerte',
    ] as const;
    const averageGuesses = 2 ** Math.min(roundedEntropy - 1, 1_023);
    const estimatedCrackTimeSeconds =
        averageGuesses / OFFLINE_GUESSES_PER_SECOND;

    return {
        score,
        label: labels[score],
        entropyBits: roundedEntropy,
        estimatedCrackTimeSeconds,
        estimatedCrackTimeLabel: formatDuration(estimatedCrackTimeSeconds),
        warnings: Array.from(new Set(warnings)),
    };
}

function entropyToScore(entropyBits: number): PasswordStrengthScore {
    if (entropyBits < 28) {
        return 0;
    }

    if (entropyBits < 40) {
        return 1;
    }

    if (entropyBits < 60) {
        return 2;
    }

    if (entropyBits < 80) {
        return 3;
    }

    return 4;
}

function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds >= 31_557_600_000_000) {
        return 'más de un millón de años';
    }

    if (seconds < 1) {
        return 'menos de un segundo';
    }

    const units = [
        { label: 'año', seconds: 31_557_600 },
        { label: 'día', seconds: 86_400 },
        { label: 'hora', seconds: 3_600 },
        { label: 'minuto', seconds: 60 },
        { label: 'segundo', seconds: 1 },
    ];

    for (const unit of units) {
        if (seconds >= unit.seconds) {
            const value = Math.floor(seconds / unit.seconds);

            return `${value.toLocaleString('es-MX')} ${unit.label}${value === 1 ? '' : unit.label === 'mes' ? 'es' : 's'}`;
        }
    }

    return 'menos de un segundo';
}

function hasSimpleSequence(password: string): boolean {
    const normalized = password.toLocaleLowerCase('es');
    const sequences = [
        '0123456789',
        'abcdefghijklmnopqrstuvwxyz',
        'qwertyuiop',
    ];

    return sequences.some((sequence) => {
        for (
            let length = 3;
            length <= Math.min(6, password.length);
            length += 1
        ) {
            for (let start = 0; start <= sequence.length - length; start += 1) {
                const fragment = sequence.slice(start, start + length);

                if (
                    normalized.includes(fragment) ||
                    normalized.includes(Array.from(fragment).reverse().join(''))
                ) {
                    return true;
                }
            }
        }

        return false;
    });
}

function validateInteger(
    value: number,
    name: string,
    minimum: number,
    maximum: number,
): number {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
        throw new Error(
            `La ${name} debe ser un entero entre ${minimum} y ${maximum}.`,
        );
    }

    return value;
}
