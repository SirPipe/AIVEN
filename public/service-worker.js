const CACHE_VERSION = '2026-07-17-tools-4';
const AIVEN_CACHE_PREFIX = 'aiven-public-';
const CACHE_NAME = AIVEN_CACHE_PREFIX + CACHE_VERSION;
const OFFLINE_URL = '/offline.html';
const PUBLIC_TOOL_SHELL_HEADER = 'X-Aiven-Public-Tool-Shell';
const PUBLIC_TOOL_PATH_PATTERN = /^\/herramientas\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PRECACHE_ASSETS = Object.freeze([
    OFFLINE_URL,
    '/manifest.webmanifest',
    '/icons/aiven-icon.svg',
    '/icons/aiven-icon-192.png',
    '/icons/aiven-icon-512.png',
    '/icons/aiven-icon-maskable.svg',
    '/icons/aiven-icon-maskable-192.png',
    '/icons/aiven-icon-maskable-512.png',
]);

const NEVER_CACHE_PATH_PREFIXES = Object.freeze([
    '/admin',
    '/api',
    '/dashboard',
    '/email',
    '/login',
    '/logout',
    '/passkey',
    '/password',
    '/profile',
    '/register',
    '/sanctum',
    '/security',
    '/settings',
    '/storage',
    '/two-factor',
    '/user-password',
    '/verification',
]);

const SAFE_PUBLIC_ASSET_PATHS = new Set(PRECACHE_ASSETS);
const SAFE_PUBLIC_ASSET_PREFIXES = Object.freeze(['/build/assets/', '/icons/']);
const CACHEABLE_DESTINATIONS = new Set(['font', 'image', 'script', 'style']);

self.addEventListener('install', (event) => {
    event.waitUntil(precachePublicShell());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(activateCurrentVersion());
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();

        return;
    }

    if (event.data?.type === 'CACHE_TOOL_SHELL') {
        event.waitUntil(cachePublicToolShell(event.data));
    }
});

self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            networkFirstNavigation(request, event.preloadResponse),
        );

        return;
    }

    if (isNeverCacheRequest(request, url) || !isSafePublicAsset(request, url)) {
        return;
    }

    event.respondWith(cacheFirstPublicAsset(request));
});

async function precachePublicShell() {
    const cache = await caches.open(CACHE_NAME);
    const publicRequests = PRECACHE_ASSETS.map(
        (asset) =>
            new Request(asset, {
                cache: 'reload',
                credentials: 'omit',
            }),
    );

    await cache.addAll(publicRequests);
}

async function activateCurrentVersion() {
    const cacheNames = await caches.keys();
    const outdatedAivenCaches = cacheNames.filter(
        (cacheName) =>
            cacheName.startsWith(AIVEN_CACHE_PREFIX) &&
            cacheName !== CACHE_NAME,
    );

    await Promise.all(
        outdatedAivenCaches.map((cacheName) => caches.delete(cacheName)),
    );

    if ('navigationPreload' in self.registration) {
        try {
            await self.registration.navigationPreload.enable();
        } catch {}
    }

    await self.clients.claim();
}

async function networkFirstNavigation(request, preloadResponsePromise) {
    let networkResponse;

    try {
        networkResponse = await preloadResponsePromise;
    } catch {
        networkResponse = undefined;
    }

    if (!networkResponse) {
        try {
            networkResponse = await fetch(request);
        } catch {
            networkResponse = undefined;
        }
    }

    if (networkResponse) {
        return networkResponse;
    }

    const cachedToolShell = await matchPublicToolShell(request);

    if (cachedToolShell) {
        return cachedToolShell;
    }

    const offlineResponse = await caches.match(OFFLINE_URL, {
        cacheName: CACHE_NAME,
        ignoreSearch: true,
    });

    return offlineResponse ?? networkResponse ?? Response.error();
}

async function matchPublicToolShell(request) {
    const url = new URL(request.url);

    if (!PUBLIC_TOOL_PATH_PATTERN.test(url.pathname)) {
        return undefined;
    }

    const cache = await caches.open(CACHE_NAME);

    return cache.match(url.pathname, { ignoreSearch: true });
}

async function cachePublicToolShell(message) {
    const canonicalUrl = parseSameOriginUrl(message.canonicalUrl);
    const shellUrl = parseSameOriginUrl(message.shellUrl);

    if (
        !canonicalUrl ||
        !shellUrl ||
        !PUBLIC_TOOL_PATH_PATTERN.test(canonicalUrl.pathname) ||
        shellUrl.pathname !== canonicalUrl.pathname + '/sin-conexion' ||
        canonicalUrl.search !== '' ||
        shellUrl.search !== ''
    ) {
        return;
    }

    const shellResponse = await fetch(shellUrl.pathname, {
        cache: 'reload',
        credentials: 'omit',
        headers: { Accept: 'text/html' },
        redirect: 'follow',
    });

    if (!isCacheablePublicToolShell(shellResponse)) {
        return;
    }

    const shellHtml = await shellResponse.clone().text();
    const embeddedAssets = extractPublicAssetPaths(shellHtml);
    const reportedAssets = Array.isArray(message.assetUrls)
        ? message.assetUrls.slice(0, 50)
        : [];
    const assetPaths = new Set([...embeddedAssets, ...reportedAssets]);
    const cache = await caches.open(CACHE_NAME);

    await cache.put(canonicalUrl.pathname, shellResponse);
    await Promise.all(
        [...assetPaths].map((assetPath) => cachePublicAssetPath(assetPath)),
    );
}

function parseSameOriginUrl(value) {
    if (typeof value !== 'string') {
        return undefined;
    }

    let url;

    try {
        url = new URL(value, self.location.origin);
    } catch {
        return undefined;
    }

    return url.origin === self.location.origin ? url : undefined;
}

function isCacheablePublicToolShell(response) {
    const cacheControl = response.headers.get('Cache-Control') ?? '';
    const contentType = response.headers.get('Content-Type') ?? '';

    return (
        response.ok &&
        response.headers.get(PUBLIC_TOOL_SHELL_HEADER) === '1' &&
        contentType.includes('text/html') &&
        !response.headers.has('Set-Cookie') &&
        !response.headers.has('X-Inertia') &&
        !/(?:private|no-store)/i.test(cacheControl)
    );
}

function extractPublicAssetPaths(html) {
    const assetPaths = [];
    const attributePattern = /(?:src|href)=["'](\/build\/assets\/[^"']+)["']/g;
    let match;

    while ((match = attributePattern.exec(html)) !== null) {
        assetPaths.push(match[1]);
    }

    return assetPaths;
}

async function cachePublicAssetPath(value) {
    const url = parseSameOriginUrl(value);

    if (
        !url ||
        url.search !== '' ||
        !SAFE_PUBLIC_ASSET_PREFIXES.some((pathPrefix) =>
            url.pathname.startsWith(pathPrefix),
        )
    ) {
        return;
    }

    try {
        await cacheFirstPublicAsset(
            new Request(url.href, {
                cache: 'no-cache',
                credentials: 'omit',
                method: 'GET',
                mode: 'same-origin',
            }),
        );
    } catch {}
}

function isNeverCacheRequest(request, url) {
    const containsPrivateHeaders =
        request.headers.has('Authorization') ||
        request.headers.has('X-CSRF-TOKEN') ||
        request.headers.has('X-Inertia') ||
        request.headers.has('X-XSRF-TOKEN');
    const hasPrivatePath = NEVER_CACHE_PATH_PREFIXES.some(
        (pathPrefix) =>
            url.pathname === pathPrefix ||
            url.pathname.startsWith(pathPrefix + '/'),
    );

    return containsPrivateHeaders || hasPrivatePath;
}

function isSafePublicAsset(request, url) {
    if (url.search !== '') {
        return false;
    }

    if (SAFE_PUBLIC_ASSET_PATHS.has(url.pathname)) {
        return true;
    }

    return (
        CACHEABLE_DESTINATIONS.has(request.destination) &&
        SAFE_PUBLIC_ASSET_PREFIXES.some((pathPrefix) =>
            url.pathname.startsWith(pathPrefix),
        )
    );
}

async function cacheFirstPublicAsset(request) {
    const publicRequest = new Request(request.url, {
        cache: 'no-cache',
        credentials: 'omit',
        method: 'GET',
        mode: 'same-origin',
        redirect: 'follow',
    });
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(publicRequest);

    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse = await fetch(publicRequest);

    if (isCacheablePublicResponse(networkResponse)) {
        await cache.put(publicRequest, networkResponse.clone());
    }

    return networkResponse;
}

function isCacheablePublicResponse(response) {
    const cacheControl = response.headers.get('Cache-Control') ?? '';

    return (
        response.ok &&
        (response.type === 'basic' || response.type === 'default') &&
        !response.headers.has('Set-Cookie') &&
        !response.headers.has('X-Inertia') &&
        !/(?:private|no-store)/i.test(cacheControl)
    );
}
