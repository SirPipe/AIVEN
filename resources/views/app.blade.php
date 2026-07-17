<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="application-name" content="AIVEN">
        <meta name="aiven-asset-version" content="{{ \Illuminate\Support\Facades\Vite::manifestHash() ?? 'unversioned' }}">
        <meta name="description" content="Herramientas, simuladores, juegos y una comunidad tecnológica en un mismo lugar.">
        <meta name="color-scheme" content="light dark">
        <meta name="theme-color" content="#f8fafe" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#050c1e" media="(prefers-color-scheme: dark)">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="AIVEN">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(0.985 0.006 264);
            }

            html.dark {
                background-color: oklch(0.16 0.04 264);
            }
        </style>

        <link rel="manifest" href="/manifest.webmanifest">
        <link rel="icon" href="/icons/aiven-icon.svg" type="image/svg+xml" sizes="any">
        <link rel="icon" href="/icons/aiven-icon-192.png" type="image/png" sizes="192x192">
        <link rel="apple-touch-icon" href="/icons/aiven-icon-192.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'AIVEN') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
