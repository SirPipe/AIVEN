export type ToolStatus =
    'available' | 'coming_soon' | 'maintenance' | 'disabled';

export type ToolErrorCode =
    'processing_failed' | 'export_failed' | 'share_failed' | 'render_failed';

export type ToolCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    displayOrder: number;
};

export type ToolSummary = {
    id: number;
    key: string;
    slug: string;
    name: string;
    shortDescription: string;
    fullDescription: string | null;
    category: ToolCategory;
    icon: string | null;
    status: ToolStatus;
    isFeatured: boolean;
    isNew: boolean;
    isOfflineCapable: boolean;
    requiresLogin: boolean;
    historyEnabled: boolean;
    version: string;
    usageCount: number;
    tags: string[];
    displayOrder: number;
    isFavorite: boolean;
};

export type ToolHistoryTool = Pick<
    ToolSummary,
    'id' | 'slug' | 'name' | 'icon'
>;

export type ToolHistoryEntry = {
    id: number;
    toolId: number;
    tool: ToolHistoryTool;
    action: 'completed' | 'downloaded' | 'shared';
    summary: string | null;
    safeConfiguration: Record<string, boolean | number | string | null>;
    createdAt: string;
};

export type ToolErrorReportEntry = {
    id: number;
    tool: ToolHistoryTool;
    code: ToolErrorCode;
    createdAt: string | null;
};

export type LaravelPaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type LaravelPaginator<T> = {
    data: T[];
    links: LaravelPaginationLink[];
    current_page?: number;
    currentPage?: number;
    last_page?: number;
    lastPage?: number;
    per_page?: number;
    perPage?: number;
    total?: number;
};

export type ToolHistoryCollection =
    ToolHistoryEntry[] | LaravelPaginator<ToolHistoryEntry>;

export type ToolIndexMode = 'all' | 'favorites' | 'category';

export type ToolIndexPageProps = {
    categories: ToolCategory[];
    tools: ToolSummary[];
    favoriteToolIds: number[];
    recentHistory: ToolHistoryEntry[];
    mode: ToolIndexMode;
    activeCategory?: ToolCategory | null;
};

export type ToolHistoryPageProps = {
    history: ToolHistoryCollection;
    historyEnabled: boolean;
};

export type ToolAdminStats = {
    total?: number;
    available?: number;
    comingSoon?: number;
    maintenance?: number;
    offlineCapable?: number;
    errorReports?: number;
    [key: string]: number | undefined;
};

export type AdminToolsPageProps = {
    tools: ToolSummary[];
    categories: ToolCategory[];
    stats: ToolAdminStats;
    errorReports: ToolErrorReportEntry[];
};
