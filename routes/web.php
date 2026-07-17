<?php

use App\Http\Controllers\Admin\OverviewController;
use App\Http\Controllers\Admin\ToolController as AdminToolController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', 'administrator'])
    ->group(function () {
        Route::get('/', OverviewController::class)->name('overview');
        Route::get('herramientas', [AdminToolController::class, 'index'])->name('tools.index');
        Route::post('herramientas', [AdminToolController::class, 'store'])->name('tools.store');
        Route::patch('herramientas/{tool:slug}', [AdminToolController::class, 'update'])->name('tools.update');
    });

require __DIR__.'/platform.php';
require __DIR__.'/settings.php';
