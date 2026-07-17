import { Form, Head } from '@inertiajs/react';
import {
    CheckCircle2,
    CloudOff,
    Plus,
    Search,
    Settings2,
    Sparkles,
    TriangleAlert,
    Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import InputError from '@/components/input-error';
import { ToolStatusBadge } from '@/components/tools/tool-badges';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { overview } from '@/routes/admin';
import adminToolRoutes from '@/routes/admin/tools';
import type {
    AdminToolsPageProps,
    ToolErrorCode,
    ToolStatus,
    ToolSummary,
} from '@/types/tools';

const toolStatuses: Array<{ value: ToolStatus; label: string }> = [
    { value: 'available', label: 'Disponible' },
    { value: 'coming_soon', label: 'Próximamente' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'disabled', label: 'Deshabilitada' },
];

const errorCodeLabels: Record<ToolErrorCode, string> = {
    processing_failed: 'Fallo de procesamiento',
    export_failed: 'Fallo de exportación',
    share_failed: 'Fallo al compartir',
    render_failed: 'Fallo de renderizado',
};

const errorReportDateFormatter = new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

type AdminFlagProps = {
    id: string;
    name: 'is_featured' | 'is_new' | 'is_offline_capable' | 'requires_login';
    label: string;
    description: string;
    defaultChecked: boolean;
};

function AdminFlag({
    id,
    name,
    label,
    description,
    defaultChecked,
}: AdminFlagProps) {
    return (
        <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-3">
            <input type="hidden" name={name} value="0" />
            <Checkbox
                id={id}
                name={name}
                value="1"
                defaultChecked={defaultChecked}
                className="mt-0.5"
            />
            <div className="min-w-0">
                <Label htmlFor={id}>{label}</Label>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function Field({
    className,
    ...props
}: ComponentProps<'div'> & { className?: string }) {
    return <div className={cn('grid gap-2', className)} {...props} />;
}

function CreateToolDialog({
    categories,
}: Pick<AdminToolsPageProps, 'categories'>) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button disabled={categories.length === 0}>
                    <Plus className="size-4" aria-hidden="true" />
                    Nueva herramienta
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Nueva herramienta</DialogTitle>
                    <DialogDescription>
                        Registra la ficha inicial. Se guardará como Próximamente
                        y su identidad técnica se generará en el servidor.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...adminToolRoutes.store.form()}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    disableWhileProcessing
                    onSuccess={() => setOpen(false)}
                    className="space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field>
                                    <Label htmlFor="new-tool-name">
                                        Nombre
                                    </Label>
                                    <Input
                                        id="new-tool-name"
                                        name="name"
                                        placeholder="Conversor de archivos"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </Field>
                                <Field>
                                    <Label htmlFor="new-tool-slug">Slug</Label>
                                    <Input
                                        id="new-tool-slug"
                                        name="slug"
                                        placeholder="conversor-archivos"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Se normaliza a minúsculas y guiones.
                                    </p>
                                    <InputError message={errors.slug} />
                                </Field>
                                <Field>
                                    <Label htmlFor="new-tool-category">
                                        Categoría
                                    </Label>
                                    <Select name="category_id" required>
                                        <SelectTrigger
                                            id="new-tool-category"
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={String(category.id)}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.category_id} />
                                </Field>
                                <Field>
                                    <Label htmlFor="new-tool-icon">Icono</Label>
                                    <Input
                                        id="new-tool-icon"
                                        name="icon"
                                        placeholder="file-cog"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Nombre de Lucide en formato kebab-case.
                                    </p>
                                    <InputError message={errors.icon} />
                                </Field>
                                <Field className="sm:col-span-2">
                                    <Label htmlFor="new-tool-short-description">
                                        Descripción breve
                                    </Label>
                                    <Input
                                        id="new-tool-short-description"
                                        name="short_description"
                                        placeholder="Explica en una frase qué resuelve."
                                        required
                                    />
                                    <InputError
                                        message={errors.short_description}
                                    />
                                </Field>
                                <Field className="sm:col-span-2">
                                    <Label htmlFor="new-tool-full-description">
                                        Descripción completa
                                    </Label>
                                    <textarea
                                        id="new-tool-full-description"
                                        name="full_description"
                                        rows={4}
                                        placeholder="Añade contexto, casos de uso y el resultado esperado."
                                        className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <InputError
                                        message={errors.full_description}
                                    />
                                </Field>
                                <Field className="sm:col-span-2">
                                    <Label htmlFor="new-tool-tags">
                                        Etiquetas
                                    </Label>
                                    <Input
                                        id="new-tool-tags"
                                        name="tags"
                                        placeholder="archivos, conversión, productividad"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Hasta ocho etiquetas separadas por
                                        comas.
                                    </p>
                                    <InputError message={errors.tags} />
                                </Field>
                            </div>

                            <div
                                role="note"
                                className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground"
                            >
                                La herramienta no se publicará todavía. Podrás
                                completar su implementación y cambiar el estado
                                desde esta misma pantalla cuando tenga un
                                runtime registrado.
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <Spinner className="motion-reduce:animate-none" />
                                    )}
                                    {processing
                                        ? 'Creando…'
                                        : 'Crear como Próximamente'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function AdminToolForm({
    tool,
    categories,
}: Pick<AdminToolsPageProps, 'categories'> & { tool: ToolSummary }) {
    return (
        <details className="group rounded-2xl border bg-card shadow-sm open:border-primary/20">
            <summary className="flex cursor-pointer list-none items-center gap-4 rounded-2xl p-4 outline-none marker:hidden hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring sm:p-5 [&::-webkit-details-marker]:hidden">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ToolIcon icon={tool.icon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold sm:text-base">
                            {tool.name}
                        </span>
                        <ToolStatusBadge status={tool.status} />
                        {tool.isFeatured && (
                            <Badge variant="secondary">Destacada</Badge>
                        )}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {tool.category.name} · {tool.slug} · {tool.key}
                    </span>
                </span>
                <span className="flex items-center gap-2 text-xs font-medium text-primary">
                    Editar
                    <Settings2
                        className="size-4 transition-transform group-open:rotate-90 motion-reduce:transition-none"
                        aria-hidden="true"
                    />
                </span>
            </summary>

            <Form
                {...adminToolRoutes.update.form(tool.slug)}
                options={{ preserveScroll: true }}
                disableWhileProcessing
                className="border-t p-4 sm:p-5"
            >
                {({ errors, processing, recentlySuccessful }) => (
                    <div className="space-y-6">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Field>
                                <Label htmlFor={`tool-${tool.id}-name`}>
                                    Nombre
                                </Label>
                                <Input
                                    id={`tool-${tool.id}-name`}
                                    name="name"
                                    defaultValue={tool.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </Field>
                            <Field>
                                <Label htmlFor={`tool-${tool.id}-version`}>
                                    Versión
                                </Label>
                                <Input
                                    id={`tool-${tool.id}-version`}
                                    name="version"
                                    defaultValue={tool.version}
                                    required
                                />
                                <InputError message={errors.version} />
                            </Field>
                            <Field className="lg:col-span-2">
                                <Label
                                    htmlFor={`tool-${tool.id}-short-description`}
                                >
                                    Descripción breve
                                </Label>
                                <Input
                                    id={`tool-${tool.id}-short-description`}
                                    name="short_description"
                                    defaultValue={tool.shortDescription}
                                    required
                                />
                                <InputError
                                    message={errors.short_description}
                                />
                            </Field>
                            <Field className="lg:col-span-2">
                                <Label
                                    htmlFor={`tool-${tool.id}-full-description`}
                                >
                                    Descripción completa
                                </Label>
                                <textarea
                                    id={`tool-${tool.id}-full-description`}
                                    name="full_description"
                                    defaultValue={tool.fullDescription ?? ''}
                                    rows={4}
                                    className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Si marcas la herramienta en mantenimiento,
                                    este texto se mostrará como aviso público.
                                </p>
                                <InputError message={errors.full_description} />
                            </Field>
                            <Field>
                                <Label htmlFor={`tool-${tool.id}-icon`}>
                                    Icono
                                </Label>
                                <Input
                                    id={`tool-${tool.id}-icon`}
                                    name="icon"
                                    defaultValue={tool.icon ?? ''}
                                    placeholder="calculator"
                                />
                                <InputError message={errors.icon} />
                            </Field>
                            <Field>
                                <Label htmlFor={`tool-${tool.id}-tags`}>
                                    Etiquetas
                                </Label>
                                <Input
                                    id={`tool-${tool.id}-tags`}
                                    name="tags"
                                    defaultValue={tool.tags.join(', ')}
                                    placeholder="texto, desarrollo, conversión"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Sepáralas con comas.
                                </p>
                                <InputError message={errors.tags} />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field>
                                <Label htmlFor={`tool-${tool.id}-status`}>
                                    Estado
                                </Label>
                                <Select
                                    name="status"
                                    defaultValue={tool.status}
                                >
                                    <SelectTrigger
                                        id={`tool-${tool.id}-status`}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Selecciona un estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {toolStatuses.map((status) => (
                                            <SelectItem
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </Field>
                            <Field>
                                <Label htmlFor={`tool-${tool.id}-category`}>
                                    Categoría
                                </Label>
                                <Select
                                    name="category_id"
                                    defaultValue={String(tool.category.id)}
                                >
                                    <SelectTrigger
                                        id={`tool-${tool.id}-category`}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category_id} />
                            </Field>
                            <Field>
                                <Label
                                    htmlFor={`tool-${tool.id}-display-order`}
                                >
                                    Orden
                                </Label>
                                <Input
                                    id={`tool-${tool.id}-display-order`}
                                    type="number"
                                    name="display_order"
                                    min={0}
                                    step={1}
                                    defaultValue={tool.displayOrder}
                                    required
                                />
                                <InputError message={errors.display_order} />
                            </Field>
                        </div>

                        <fieldset className="space-y-3">
                            <legend className="text-sm font-semibold">
                                Visibilidad y capacidades
                            </legend>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <AdminFlag
                                    id={`tool-${tool.id}-featured`}
                                    name="is_featured"
                                    label="Destacada"
                                    description="Aparece en la selección principal."
                                    defaultChecked={tool.isFeatured}
                                />
                                <AdminFlag
                                    id={`tool-${tool.id}-new`}
                                    name="is_new"
                                    label="Nueva"
                                    description="Muestra la insignia de novedad."
                                    defaultChecked={tool.isNew}
                                />
                                <AdminFlag
                                    id={`tool-${tool.id}-offline`}
                                    name="is_offline_capable"
                                    label="Disponible offline"
                                    description="Puede ejecutarse sin conexión."
                                    defaultChecked={tool.isOfflineCapable}
                                />
                                <AdminFlag
                                    id={`tool-${tool.id}-login`}
                                    name="requires_login"
                                    label="Requiere sesión"
                                    description="Restringe el uso a cuentas autenticadas."
                                    defaultChecked={tool.requiresLogin}
                                />
                            </div>
                        </fieldset>

                        <div className="flex flex-wrap items-center justify-end gap-3">
                            {recentlySuccessful && (
                                <span
                                    role="status"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                                >
                                    <CheckCircle2
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Cambios guardados
                                </span>
                            )}
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <Spinner className="motion-reduce:animate-none" />
                                )}
                                {processing ? 'Guardando…' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </details>
    );
}

export default function AdminTools({
    tools,
    categories,
    stats,
    errorReports,
}: AdminToolsPageProps) {
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLocaleLowerCase('es-MX');
    const visibleTools = useMemo(
        () =>
            tools.filter((tool) =>
                [
                    tool.name,
                    tool.slug,
                    tool.key,
                    tool.category.name,
                    ...tool.tags,
                ]
                    .join(' ')
                    .toLocaleLowerCase('es-MX')
                    .includes(normalizedQuery),
            ),
        [normalizedQuery, tools],
    );
    const statisticCards = [
        {
            label: 'Herramientas',
            value: stats.total ?? tools.length,
            icon: Wrench,
        },
        {
            label: 'Disponibles',
            value:
                stats.available ??
                tools.filter((tool) => tool.status === 'available').length,
            icon: CheckCircle2,
        },
        {
            label: 'Próximamente',
            value:
                stats.comingSoon ??
                tools.filter((tool) => tool.status === 'coming_soon').length,
            icon: Sparkles,
        },
        {
            label: 'Sin conexión',
            value:
                stats.offlineCapable ??
                tools.filter((tool) => tool.isOfflineCapable).length,
            icon: CloudOff,
        },
    ];

    return (
        <>
            <Head title="Administrar herramientas" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        <Badge variant="secondary">Administración AIVEN</Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight">
                                Catálogo de herramientas
                            </h1>
                            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                Crea fichas y edita metadatos, publicación,
                                orden y capacidades sin exponer la identidad
                                técnica de cada herramienta.
                            </p>
                        </div>
                    </div>
                    <CreateToolDialog categories={categories} />
                </header>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statisticCards.map((statistic) => (
                        <Card key={statistic.label} className="gap-3 py-5">
                            <CardHeader className="flex-row items-center justify-between px-5">
                                <div className="space-y-1">
                                    <CardDescription>
                                        {statistic.label}
                                    </CardDescription>
                                    <CardTitle className="text-3xl">
                                        {statistic.value}
                                    </CardTitle>
                                </div>
                                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <statistic.icon
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <Card className="gap-4 rounded-2xl py-5">
                    <CardHeader className="px-5 sm:px-6">
                        <CardTitle>Buscar en el catálogo</CardTitle>
                        <CardDescription>
                            Encuentra una herramienta por nombre, clave,
                            categoría o etiqueta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-5 sm:px-6">
                        <div className="relative">
                            <Label
                                htmlFor="admin-tool-search"
                                className="sr-only"
                            >
                                Buscar herramientas
                            </Label>
                            <Search
                                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                id="admin-tool-search"
                                type="search"
                                value={query}
                                placeholder="Buscar herramientas…"
                                className="pl-9"
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <section aria-labelledby="recent-error-reports-title">
                    <Card className="gap-4 rounded-2xl py-5">
                        <CardHeader className="flex-row items-start justify-between gap-4 px-5 sm:px-6">
                            <div className="space-y-1.5">
                                <CardTitle id="recent-error-reports-title">
                                    Reportes de error recientes
                                </CardTitle>
                                <CardDescription className="max-w-2xl leading-relaxed">
                                    Solo se conserva la herramienta, un código
                                    técnico controlado y la fecha. Nunca se
                                    almacena contenido, archivos, IP ni datos
                                    del navegador.
                                </CardDescription>
                            </div>
                            <Badge
                                variant="secondary"
                                aria-label={`${stats.errorReports ?? errorReports.length} reportes totales`}
                            >
                                {stats.errorReports ?? errorReports.length}
                            </Badge>
                        </CardHeader>
                        <CardContent className="px-5 sm:px-6">
                            {errorReports.length === 0 ? (
                                <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                                    <TriangleAlert
                                        className="mx-auto size-5 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <p className="mt-2 text-sm font-medium">
                                        No hay reportes recientes
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Los fallos técnicos seguros aparecerán
                                        aquí.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y rounded-xl border">
                                    {errorReports.map((errorReport) => (
                                        <li
                                            key={errorReport.id}
                                            className="flex items-start gap-3 p-3 sm:items-center sm:p-4"
                                        >
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                                                <ToolIcon
                                                    icon={errorReport.tool.icon}
                                                    className="size-4"
                                                />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {errorReport.tool.name}
                                                </p>
                                                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                                    <span>
                                                        {
                                                            errorCodeLabels[
                                                                errorReport.code
                                                            ]
                                                        }
                                                    </span>
                                                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground">
                                                        <span className="sr-only">
                                                            Código técnico:{' '}
                                                        </span>
                                                        {errorReport.code}
                                                    </code>
                                                </p>
                                            </div>
                                            {errorReport.createdAt && (
                                                <time
                                                    dateTime={
                                                        errorReport.createdAt
                                                    }
                                                    className="shrink-0 text-xs text-muted-foreground"
                                                >
                                                    {errorReportDateFormatter.format(
                                                        new Date(
                                                            errorReport.createdAt,
                                                        ),
                                                    )}
                                                </time>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section
                    aria-labelledby="admin-tools-title"
                    className="space-y-4"
                >
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                                Configuración
                            </p>
                            <h2
                                id="admin-tools-title"
                                className="mt-1 text-xl font-semibold"
                            >
                                {visibleTools.length}{' '}
                                {visibleTools.length === 1
                                    ? 'herramienta'
                                    : 'herramientas'}
                            </h2>
                        </div>
                    </div>

                    {visibleTools.length === 0 ? (
                        <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
                            <p className="text-sm font-medium">
                                No hay coincidencias
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Ajusta la búsqueda para encontrar otra
                                herramienta.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {visibleTools.map((tool) => (
                                <AdminToolForm
                                    key={tool.id}
                                    tool={tool}
                                    categories={categories}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

AdminTools.layout = {
    breadcrumbs: [
        {
            title: 'Administración',
            href: overview(),
        },
        {
            title: 'Herramientas',
            href: adminToolRoutes.index(),
        },
    ],
};
