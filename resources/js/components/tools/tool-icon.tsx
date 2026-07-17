import {
    Binary,
    Braces,
    Calculator,
    Clock3,
    Code2,
    FileCode2,
    Fingerprint,
    Gauge,
    HardDrive,
    Hash,
    Image,
    KeyRound,
    ListOrdered,
    Maximize2,
    Minimize2,
    Network,
    Palette,
    QrCode,
    RefreshCw,
    Repeat2,
    Ruler,
    ShieldCheck,
    Terminal,
    Text,
    TextCursorInput,
    WandSparkles,
    Wrench,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { createElement } from 'react';

const toolIcons: Record<string, LucideIcon> = {
    binary: Binary,
    braces: Braces,
    calculator: Calculator,
    'clock-3': Clock3,
    code: Code2,
    'code-2': Code2,
    file: FileCode2,
    'file-code': FileCode2,
    gauge: Gauge,
    fingerprint: Fingerprint,
    hash: Hash,
    'hard-drive': HardDrive,
    image: Image,
    key: KeyRound,
    'key-round': KeyRound,
    network: Network,
    'list-ordered': ListOrdered,
    'maximize-2': Maximize2,
    'minimize-2': Minimize2,
    palette: Palette,
    qr: QrCode,
    'qr-code': QrCode,
    'refresh-cw': RefreshCw,
    'repeat-2': Repeat2,
    ruler: Ruler,
    shield: ShieldCheck,
    'shield-check': ShieldCheck,
    terminal: Terminal,
    text: Text,
    'text-cursor-input': TextCursorInput,
    'wand-sparkles': WandSparkles,
    wrench: Wrench,
    zap: Zap,
};

export function getToolIcon(icon: string | null | undefined): LucideIcon {
    if (!icon) {
        return Wrench;
    }

    return toolIcons[icon.toLocaleLowerCase()] ?? Wrench;
}

export function ToolIcon({
    icon,
    className,
}: {
    icon: string | null | undefined;
    className?: string;
}) {
    return createElement(getToolIcon(icon), {
        'aria-hidden': true,
        className,
    });
}
