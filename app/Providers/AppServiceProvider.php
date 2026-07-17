<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\ExceptionResponse;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureInertiaExceptionHandling();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Configure branded Inertia responses for production errors.
     */
    private function configureInertiaExceptionHandling(): void
    {
        Inertia::handleExceptionsUsing(function (ExceptionResponse $response): ?ExceptionResponse {
            if (app()->environment(['local', 'testing'])) {
                return null;
            }

            if (! in_array($response->statusCode(), [403, 404, 419, 500, 503], true)) {
                return null;
            }

            return $response
                ->render('error', ['status' => $response->statusCode()])
                ->withSharedData();
        });
    }
}
