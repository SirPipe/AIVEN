<?php

use App\Http\Controllers\Admin\OverviewController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('admin', OverviewController::class)
        ->middleware('administrator')
        ->name('admin.overview');
});

require __DIR__.'/platform.php';
require __DIR__.'/settings.php';
