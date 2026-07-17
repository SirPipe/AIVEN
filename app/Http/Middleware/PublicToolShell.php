<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PublicToolShell
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $response->isSuccessful()) {
            return $response;
        }

        $response->headers->set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        $response->headers->set('X-Aiven-Public-Tool-Shell', '1');

        return $response;
    }
}
