<?php

use Inertia\Testing\AssertableInertia as Assert;

test('guests can explore the public platform areas', function (string $routeName, string $component) {
    $this->get(route($routeName))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'explore' => ['explore', 'explore'],
    'tools' => ['tools', 'modules/show'],
    'simulators' => ['simulators', 'modules/show'],
    'games' => ['games', 'modules/show'],
    'community' => ['community', 'modules/show'],
    'technology map' => ['map', 'modules/show'],
]);

test('module previews expose only informational content', function (string $routeName, string $moduleKey) {
    $this->get(route($routeName))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('modules/show')
            ->where('module.key', $moduleKey)
            ->has('module.title')
            ->has('module.description')
            ->has('module.highlights', 3)
            ->has('module.previews', 4)
        );
})->with([
    'tools' => ['tools', 'tools'],
    'simulators' => ['simulators', 'simulators'],
    'games' => ['games', 'games'],
    'community' => ['community', 'community'],
    'technology map' => ['map', 'map'],
]);

test('legal documents are publicly available', function (string $routeName, string $kind) {
    $this->get(route($routeName))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('legal/show')
            ->where('document.kind', $kind)
            ->has('document.title')
            ->has('document.updatedAt')
        );
})->with([
    'terms' => ['terms', 'terms'],
    'privacy' => ['privacy', 'privacy'],
]);
