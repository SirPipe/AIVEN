import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="relative flex aspect-square size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-violet to-brand-cyan text-white shadow-sm shadow-brand-violet/20">
                <div className="absolute inset-px rounded-[0.7rem] bg-brand-ink/10" />
                <AppLogoIcon className="relative size-6" />
            </div>
            <div className="ml-1.5 grid min-w-0 flex-1 text-left">
                <span className="truncate text-sm leading-none font-bold tracking-[0.18em] text-foreground">
                    AIVEN
                </span>
                <span className="mt-1 hidden truncate text-[0.65rem] leading-none font-medium tracking-wide text-muted-foreground sm:block">
                    Explora · Aprende · Crea
                </span>
            </div>
        </>
    );
}
