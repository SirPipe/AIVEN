<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

test('public app shell advertises install metadata', function () {
    $response = $this->get(route('home'));

    $response
        ->assertOk()
        ->assertSee('content="width=device-width, initial-scale=1, viewport-fit=cover"', false)
        ->assertSee('<link rel="manifest" href="/manifest.webmanifest">', false)
        ->assertSee('<meta name="application-name" content="AIVEN">', false)
        ->assertSee('<meta name="aiven-asset-version"', false)
        ->assertSee('name="mobile-web-app-capable" content="yes"', false)
        ->assertSee('name="apple-mobile-web-app-capable" content="yes"', false)
        ->assertSee('/icons/aiven-icon-192.png', false);
});

test('web app manifest defines the installable AIVEN experience', function () {
    $manifestPath = public_path('manifest.webmanifest');

    expect(File::exists($manifestPath))->toBeTrue();

    $manifest = json_decode(
        File::get($manifestPath),
        associative: true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect($manifest['id'])->toBe('/')
        ->and($manifest['name'])->toBe('AIVEN')
        ->and($manifest['short_name'])->toBe('AIVEN')
        ->and($manifest['start_url'])->toBe('/')
        ->and($manifest['scope'])->toBe('/')
        ->and($manifest['display'])->toBe('standalone')
        ->and($manifest['background_color'])->toBe('#0b1020')
        ->and($manifest['theme_color'])->toBe('#0b1020');

    expect(array_column($manifest['shortcuts'], 'url'))->toContain(
        '/herramientas/generador-qr',
        '/herramientas/generador-contrasenas',
        '/herramientas/comprimir-imagen',
        '/herramientas/convertir-imagen',
        '/herramientas/consumo-pc',
        '/herramientas/calculadora-subredes',
    );

    $iconsBySource = [];

    foreach ($manifest['icons'] as $icon) {
        $iconsBySource[$icon['src']] = $icon;

        expect(File::exists(public_path(Str::after($icon['src'], '/'))))
            ->toBeTrue();
    }

    expect($iconsBySource['/icons/aiven-icon-192.png']['sizes'])
        ->toBe('192x192')
        ->and($iconsBySource['/icons/aiven-icon-512.png']['sizes'])
        ->toBe('512x512')
        ->and($iconsBySource['/icons/aiven-icon-maskable-192.png']['purpose'])
        ->toBe('maskable')
        ->and($iconsBySource['/icons/aiven-icon-maskable-512.png']['purpose'])
        ->toBe('maskable');

    foreach ([192, 512] as $size) {
        foreach (['aiven-icon', 'aiven-icon-maskable'] as $iconName) {
            $dimensions = getimagesize(
                public_path("icons/{$iconName}-{$size}.png"),
            );

            expect($dimensions)->not->toBeFalse()
                ->and($dimensions[0])->toBe($size)
                ->and($dimensions[1])->toBe($size)
                ->and($dimensions['mime'])->toBe('image/png');
        }
    }
});

test('offline fallback is public and privacy conscious', function () {
    $offlinePath = public_path('offline.html');

    expect(File::exists($offlinePath))->toBeTrue();

    $offlinePage = File::get($offlinePath);

    expect($offlinePage)->toContain('Estás sin conexión')
        ->and($offlinePage)->toContain('tus páginas privadas')
        ->and($offlinePage)->toContain('href="/"');
});

test('service worker only persists explicit public tool shells', function () {
    $serviceWorker = File::get(public_path('service-worker.js'));
    $navigationStrategy = Str::between(
        $serviceWorker,
        'async function networkFirstNavigation',
        'async function matchPublicToolShell',
    );
    $toolShellStrategy = Str::between(
        $serviceWorker,
        'async function cachePublicToolShell',
        'function parseSameOriginUrl',
    );
    $precacheDeclaration = Str::between(
        $serviceWorker,
        'const PRECACHE_ASSETS',
        'const NEVER_CACHE_PATH_PREFIXES',
    );

    expect($serviceWorker)->toContain("const CACHE_VERSION = '")
        ->and($serviceWorker)->toContain("request.mode === 'navigate'")
        ->and($serviceWorker)->toContain("request.headers.has('Authorization')")
        ->and($serviceWorker)->toContain("request.headers.has('X-Inertia')")
        ->and($serviceWorker)->toContain("credentials: 'omit'")
        ->and($serviceWorker)->toContain("response.headers.has('Set-Cookie')")
        ->and($serviceWorker)->toContain('private|no-store')
        ->and($serviceWorker)->toContain('CACHE_TOOL_SHELL')
        ->and($serviceWorker)->toContain('PUBLIC_TOOL_SHELL_HEADER')
        ->and($serviceWorker)->toContain('matchPublicToolShell')
        ->and($serviceWorker)->toContain('if (networkResponse)')
        ->and($serviceWorker)->not->toContain('networkResponse.status < 500')
        ->and($navigationStrategy)->not->toContain('cache.put')
        ->and($navigationStrategy)->not->toContain('caches.open')
        ->and($toolShellStrategy)->toContain("credentials: 'omit'")
        ->and($toolShellStrategy)->toContain(
            "shellUrl.pathname !== canonicalUrl.pathname + '/sin-conexion'",
        )
        ->and($toolShellStrategy)->toContain(
            'isCacheablePublicToolShell(shellResponse)',
        )
        ->and($toolShellStrategy)->toContain(
            'cache.put(canonicalUrl.pathname, shellResponse)',
        )
        ->and($precacheDeclaration)->not->toContain("'/login'")
        ->and($precacheDeclaration)->not->toContain("'/dashboard'")
        ->and($precacheDeclaration)->not->toContain("'/settings'");
});

test('service worker registration is revisioned with the Inertia asset version', function () {
    $pwaHook = File::get(resource_path('js/hooks/use-pwa.ts'));

    expect($pwaHook)
        ->toContain('aiven-asset-version')
        ->toContain('${SERVICE_WORKER_URL}?v=')
        ->toContain('updateViaCache');
});

test('service worker lists sensitive route families as never cacheable', function (
    string $privatePath,
) {
    $serviceWorker = File::get(public_path('service-worker.js'));

    expect($serviceWorker)->toContain("'{$privatePath}'");
})->with([
    'admin' => '/admin',
    'api' => '/api',
    'dashboard' => '/dashboard',
    'login' => '/login',
    'logout' => '/logout',
    'passkeys' => '/passkey',
    'password' => '/password',
    'profile' => '/profile',
    'registration' => '/register',
    'security' => '/security',
    'settings' => '/settings',
    'storage' => '/storage',
    'two factor' => '/two-factor',
    'verification' => '/verification',
]);
