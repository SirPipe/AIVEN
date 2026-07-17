import { Head, Link, router, useHttp, usePage } from '@inertiajs/react';
import { Construction, Wrench } from 'lucide-react';
import {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { toast } from 'sonner';
import { FavoriteButton } from '@/components/tools/favorite-button';
import { ToolErrorBoundary } from '@/components/tools/tool-error-boundary';
import { AivenToolHeader } from '@/components/tools/tool-header';
import { ToolIcon } from '@/components/tools/tool-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOfflineToolCache } from '@/hooks/use-offline-tool-cache';
import { login } from '@/routes';
import toolRoutes from '@/routes/tools';
import type {
    SafeToolConfiguration,
    ToolErrorCode,
    ToolRuntimeProps,
} from '@/types/tool-runtime';
import type { ToolSummary } from '@/types/tools';

const toolComponents: Record<
    string,
    LazyExoticComponent<ComponentType<ToolRuntimeProps>>
> = {
    'generador-qr': lazy(() => import('@/components/tools/qr-generator')),
    'generador-contrasenas': lazy(
        () => import('@/components/tools/password-generator'),
    ),
    'comprimir-imagen': lazy(
        () => import('@/components/tools/image-compressor'),
    ),
    'convertir-imagen': lazy(
        () => import('@/components/tools/image-converter'),
    ),
    'consumo-pc': lazy(() => import('@/components/tools/pc-power-calculator')),
    'calculadora-subredes': lazy(
        () => import('@/components/tools/subnet-calculator'),
    ),
};

type ToolsShowProps = {
    tool: ToolSummary;
    relatedTools: ToolSummary[];
    isFavorite: boolean;
    offlineShell: boolean;
    initialConfiguration?: SafeToolConfiguration | null;
};

type FavoriteResponse = {
    toolId: number;
    isFavorite: boolean;
};

type HistoryPayload = {
    action: 'completed' | 'downloaded' | 'shared';
    safe_configuration: SafeToolConfiguration;
};

type ErrorReportPayload = {
    code: ToolErrorCode;
};

function RelatedTools({ tools }: { tools: ToolSummary[] }) {
    if (tools.length === 0) {
        return null;
    }

    return (
        <Card className="gap-3 rounded-[1.5rem] py-5">
            <CardHeader className="px-5">
                <CardTitle className="text-base">
                    Herramientas relacionadas
                </CardTitle>
                <CardDescription>
                    Continúa con otra utilidad de{' '}
                    {tools[0].category.name.toLocaleLowerCase('es-MX')}.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 px-5">
                {tools.map((relatedTool) => (
                    <Button
                        key={relatedTool.id}
                        asChild
                        variant="ghost"
                        className="h-auto justify-start rounded-xl px-3 py-2.5"
                    >
                        <Link href={toolRoutes.show(relatedTool)} prefetch>
                            <ToolIcon
                                icon={relatedTool.icon}
                                className="size-4"
                            />
                            <span className="min-w-0 flex-1 truncate text-left">
                                {relatedTool.name}
                            </span>
                            {relatedTool.status !== 'available' && (
                                <Badge variant="outline">Próximamente</Badge>
                            )}
                        </Link>
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}

function ToolLoading() {
    return (
        <div
            className="mx-auto grid w-full max-w-[96rem] gap-5 p-4 sm:p-6 lg:p-8"
            role="status"
            aria-label="Cargando herramienta"
        >
            <Skeleton className="h-56 rounded-[1.75rem]" />
            <div className="grid gap-5 xl:grid-cols-2">
                <Skeleton className="h-[32rem] rounded-[1.5rem]" />
                <Skeleton className="h-[32rem] rounded-[1.5rem]" />
            </div>
        </div>
    );
}

function UnavailableTool({
    tool,
    relatedTools,
}: Pick<ToolsShowProps, 'tool' | 'relatedTools'>) {
    const isMaintenance = tool.status === 'maintenance';

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8">
            <AivenToolHeader
                tool={tool}
                icon={<ToolIcon icon={tool.icon} className="size-7" />}
            />
            <Card className="rounded-[1.5rem] py-8 text-center">
                <CardContent className="mx-auto grid max-w-xl justify-items-center gap-4 px-6">
                    <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <Construction aria-hidden="true" />
                    </span>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">
                            {isMaintenance
                                ? 'Volverá a estar disponible pronto'
                                : 'Está en nuestra siguiente lista de desarrollo'}
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {isMaintenance
                                ? tool.fullDescription ||
                                  'Estamos realizando ajustes para conservar resultados confiables y una experiencia segura.'
                                : 'La añadimos al catálogo para que puedas descubrir lo que viene, sin presentarla todavía como una función terminada.'}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={toolRoutes.index()}>
                            <Wrench aria-hidden="true" />
                            Usar una herramienta disponible
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <RelatedTools tools={relatedTools} />
        </div>
    );
}

export default function ToolsShow({
    tool,
    relatedTools,
    isFavorite: initialIsFavorite,
    offlineShell,
    initialConfiguration = null,
}: ToolsShowProps) {
    const { auth } = usePage().props;
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const favoriteRequest = useHttp<Record<string, never>, FavoriteResponse>(
        {},
    );
    const historyRequest = useHttp<HistoryPayload>({
        action: 'completed',
        safe_configuration: {},
    });
    const errorReportRequest = useHttp<ErrorReportPayload>({
        code: 'render_failed',
    });
    const ToolComponent = toolComponents[tool.slug];
    const canonicalUrl = toolRoutes.show(tool).url;
    const shellUrl = toolRoutes.offlineShell(tool).url;

    useEffect(() => {
        if (initialConfiguration) {
            toast.success(
                'Configuración segura restaurada desde tu historial.',
            );
        }
    }, [initialConfiguration]);

    useOfflineToolCache({
        canonicalUrl,
        enabled:
            tool.status === 'available' &&
            tool.isOfflineCapable &&
            !offlineShell,
        shellUrl,
    });

    const updateFavorite = async (nextIsFavorite: boolean) => {
        if (!auth.user) {
            router.visit(login());

            return;
        }

        if (offlineShell) {
            toast.info('Conéctate a internet para cambiar tus favoritos.');

            return;
        }

        const previousIsFavorite = isFavorite;
        setIsFavorite(nextIsFavorite);

        try {
            const response = nextIsFavorite
                ? await favoriteRequest.post(
                      toolRoutes.favorite.store(tool).url,
                  )
                : await favoriteRequest.delete(
                      toolRoutes.favorite.destroy(tool).url,
                  );

            setIsFavorite(response.isFavorite);
        } catch {
            setIsFavorite(previousIsFavorite);
            toast.error('No fue posible actualizar tus favoritos.');
        }
    };

    const recordHistory = useCallback(
        (
            action: HistoryPayload['action'],
            safeConfiguration: SafeToolConfiguration,
        ) => {
            if (
                !auth.user ||
                offlineShell ||
                !tool.historyEnabled ||
                historyRequest.processing
            ) {
                return;
            }

            historyRequest.transform(() => ({
                action,
                safe_configuration: safeConfiguration,
            }));
            void historyRequest
                .post(toolRoutes.history.store(tool).url)
                .catch(() => undefined);
        },
        [auth.user, historyRequest, offlineShell, tool],
    );
    const recordError = useCallback(
        (code: ToolErrorCode) => {
            if (offlineShell || errorReportRequest.processing) {
                return;
            }

            errorReportRequest.setData({ code });
            void errorReportRequest
                .post(toolRoutes.errors.store(tool).url)
                .catch(() => undefined);
        },
        [errorReportRequest, offlineShell, tool],
    );
    const reportRenderError = useCallback(
        () => recordError('render_failed'),
        [recordError],
    );

    const related = useMemo(
        () => <RelatedTools tools={relatedTools} />,
        [relatedTools],
    );
    const favoriteAction = (
        <FavoriteButton
            isFavorite={isFavorite}
            pending={favoriteRequest.processing}
            disabled={offlineShell}
            requiresLogin={!auth.user}
            onFavoriteChange={(nextIsFavorite) =>
                void updateFavorite(nextIsFavorite)
            }
        />
    );

    return (
        <>
            <Head title={tool.name}>
                <meta
                    name="description"
                    content={tool.fullDescription || tool.shortDescription}
                />
                <link rel="canonical" href={canonicalUrl} />
            </Head>

            {tool.status !== 'available' || !ToolComponent ? (
                <UnavailableTool tool={tool} relatedTools={relatedTools} />
            ) : (
                <Suspense fallback={<ToolLoading />}>
                    <ToolErrorBoundary
                        key={tool.id}
                        onError={reportRenderError}
                    >
                        <ToolComponent
                            tool={tool}
                            favoriteAction={favoriteAction}
                            initialConfiguration={initialConfiguration}
                            offlineShell={offlineShell}
                            recordError={recordError}
                            recordHistory={recordHistory}
                            related={related}
                        />
                    </ToolErrorBoundary>
                </Suspense>
            )}
        </>
    );
}
