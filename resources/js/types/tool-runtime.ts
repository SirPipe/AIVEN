import type { ReactNode } from 'react';
import type { ToolSummary } from './tools';

export type SafeToolConfiguration = Record<
    string,
    boolean | number | string | null
>;

export type ToolErrorCode =
    'export_failed' | 'processing_failed' | 'render_failed' | 'share_failed';

export type ToolRuntimeProps = {
    favoriteAction?: ReactNode;
    initialConfiguration?: SafeToolConfiguration | null;
    offlineShell?: boolean;
    related?: ReactNode;
    recordHistory: (
        action: 'completed' | 'downloaded' | 'shared',
        safeConfiguration: SafeToolConfiguration,
    ) => void;
    recordError: (code: ToolErrorCode) => void;
    tool: ToolSummary;
};
