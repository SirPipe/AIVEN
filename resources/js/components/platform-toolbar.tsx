import { Link, usePage } from '@inertiajs/react';
import { Bell, CheckCircle2, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { searchableNavItems } from '@/lib/platform-navigation';
import { dashboard, home } from '@/routes';

export function PlatformToolbar() {
    const [query, setQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth.user);
    const normalizedQuery = query.trim().toLocaleLowerCase('es');
    const results = useMemo(
        () =>
            searchableNavItems
                .map((item) =>
                    item.title === 'Inicio'
                        ? {
                              ...item,
                              href: isAuthenticated ? dashboard() : home(),
                          }
                        : item,
                )
                .filter((item) =>
                    item.title
                        .toLocaleLowerCase('es')
                        .includes(normalizedQuery),
                ),
        [isAuthenticated, normalizedQuery],
    );

    return (
        <div className="ml-auto flex items-center gap-1.5">
            <Dialog
                open={isSearchOpen}
                onOpenChange={(open) => {
                    setIsSearchOpen(open);

                    if (!open) {
                        setQuery('');
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-9 justify-start gap-2 rounded-full px-3 text-muted-foreground sm:w-52"
                    >
                        <Search className="size-4" />
                        <span className="hidden sm:inline">
                            Buscar en AIVEN
                        </span>
                        <span className="sr-only sm:hidden">
                            Buscar en AIVEN
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="top-[18%] translate-y-0 gap-4 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Buscar en AIVEN</DialogTitle>
                        <DialogDescription>
                            Encuentra rápidamente cualquier área de la
                            plataforma.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Herramientas, juegos, mapa..."
                        aria-label="Buscar áreas de AIVEN"
                        autoFocus
                    />
                    <div className="grid max-h-72 gap-2 overflow-y-auto">
                        {results.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    onClick={() => setIsSearchOpen(false)}
                                    className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition-colors hover:border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {Icon && <Icon className="size-4" />}
                                    </span>
                                    {item.title}
                                </Link>
                            );
                        })}
                        {results.length === 0 && (
                            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                                No encontramos resultados para “{query}”.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full"
                    >
                        <Bell className="size-4.5" />
                        <span className="sr-only">Ver notificaciones</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-2">
                    <DropdownMenuLabel className="flex items-center justify-between gap-3 px-2 py-2">
                        <span>Notificaciones</span>
                        <Badge variant="secondary">0 nuevas</Badge>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="flex gap-3 rounded-xl p-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-5" />
                        </span>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Todo está al día
                            </p>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Te avisaremos aquí cuando haya actividad nueva.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                        <Sparkles className="size-3.5 text-primary" />
                        Tu centro de novedades está listo.
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
