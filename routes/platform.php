<?php

use Illuminate\Support\Facades\Route;

Route::inertia('explorar', 'explore')->name('explore');

Route::inertia('herramientas', 'modules/show', [
    'module' => [
        'key' => 'tools',
        'eyebrow' => 'Utilidades prácticas',
        'title' => 'Herramientas que resuelven contigo',
        'description' => 'Una colección de utilidades claras y rápidas para calcular, convertir, diagnosticar y tomar mejores decisiones tecnológicas.',
        'highlights' => [
            'Resultados claros y fáciles de guardar.',
            'Favoritos sincronizados entre dispositivos.',
            'Diseño accesible para móvil y computadora.',
        ],
        'previews' => [
            [
                'title' => 'Conversores inteligentes',
                'description' => 'Transforma unidades, formatos y valores con explicaciones sencillas.',
            ],
            [
                'title' => 'Diagnóstico guiado',
                'description' => 'Sigue pasos concretos para identificar problemas comunes.',
            ],
            [
                'title' => 'Calculadoras técnicas',
                'description' => 'Obtén resultados confiables sin perder de vista el procedimiento.',
            ],
            [
                'title' => 'Historial personal',
                'description' => 'Retoma cálculos recientes desde cualquier dispositivo.',
            ],
        ],
    ],
])->name('tools');

Route::inertia('simuladores', 'modules/show', [
    'module' => [
        'key' => 'simulators',
        'eyebrow' => 'Aprendizaje interactivo',
        'title' => 'Experimenta antes de hacerlo en el mundo real',
        'description' => 'Simuladores visuales para comprender conceptos de hardware, redes, electrónica y programación mediante práctica segura.',
        'highlights' => [
            'Escenarios guiados con dificultad progresiva.',
            'Progreso guardado en tu cuenta.',
            'Explicaciones visuales después de cada decisión.',
        ],
        'previews' => [
            [
                'title' => 'Arma una computadora',
                'description' => 'Conoce cada componente y aprende a elegir piezas compatibles.',
            ],
            [
                'title' => 'Laboratorio de redes',
                'description' => 'Conecta equipos y observa cómo viaja la información.',
            ],
            [
                'title' => 'Circuitos básicos',
                'description' => 'Experimenta con voltaje, corriente y resistencia sin riesgos.',
            ],
            [
                'title' => 'Retos paso a paso',
                'description' => 'Aplica lo aprendido y recibe retroalimentación inmediata.',
            ],
        ],
    ],
])->name('simulators');

Route::inertia('juegos', 'modules/show', [
    'module' => [
        'key' => 'games',
        'eyebrow' => 'Aprender jugando',
        'title' => 'Retos tecnológicos que sí quieres completar',
        'description' => 'Juegos breves, claros y competitivos para practicar lógica, memoria, diagnóstico y conceptos digitales.',
        'highlights' => [
            'Partidas rápidas adaptadas a dispositivos táctiles.',
            'Clasificaciones justas y logros personales.',
            'Experiencias que refuerzan conocimientos reales.',
        ],
        'previews' => [
            [
                'title' => 'Código contrarreloj',
                'description' => 'Resuelve patrones de lógica antes de que termine el tiempo.',
            ],
            [
                'title' => 'Detective de hardware',
                'description' => 'Identifica componentes y descubre fallas a partir de pistas.',
            ],
            [
                'title' => 'Ruta del paquete',
                'description' => 'Guía información por una red y evita cuellos de botella.',
            ],
            [
                'title' => 'Desafíos diarios',
                'description' => 'Mantén tu racha con pequeños retos que cambian cada día.',
            ],
        ],
    ],
])->name('games');

Route::inertia('comunidad', 'modules/show', [
    'module' => [
        'key' => 'community',
        'eyebrow' => 'Conocimiento compartido',
        'title' => 'Una comunidad para construir y aprender en público',
        'description' => 'Un espacio cuidado para preguntar, responder, publicar proyectos y conectar con personas que comparten tu curiosidad.',
        'highlights' => [
            'Preguntas organizadas y respuestas votadas.',
            'Perfiles con reputación e insignias útiles.',
            'Moderación y reportes desde el primer día.',
        ],
        'previews' => [
            [
                'title' => 'Preguntas y respuestas',
                'description' => 'Expón una duda y recibe ayuda de la comunidad.',
            ],
            [
                'title' => 'Proyectos abiertos',
                'description' => 'Comparte lo que construyes y documenta tu aprendizaje.',
            ],
            [
                'title' => 'Blog tecnológico',
                'description' => 'Lee explicaciones, noticias y experiencias seleccionadas.',
            ],
            [
                'title' => 'Reputación con propósito',
                'description' => 'Reconoce contribuciones útiles, respetuosas y verificables.',
            ],
        ],
    ],
])->name('community');

Route::inertia('mapa', 'modules/show', [
    'module' => [
        'key' => 'map',
        'eyebrow' => 'Tecnología cercana',
        'title' => 'Descubre oportunidades en el mapa tecnológico',
        'description' => 'Explora lugares, talleres, comunidades, eventos y recursos tecnológicos disponibles cerca de ti.',
        'highlights' => [
            'Lugares públicos visibles para cualquier visitante.',
            'Aportes de la comunidad revisados y moderados.',
            'Filtros claros y privacidad de ubicación por diseño.',
        ],
        'previews' => [
            [
                'title' => 'Lugares tecnológicos',
                'description' => 'Encuentra talleres, laboratorios, tiendas y espacios de aprendizaje.',
            ],
            [
                'title' => 'Eventos cercanos',
                'description' => 'Descubre encuentros, cursos y actividades comunitarias.',
            ],
            [
                'title' => 'Filtros útiles',
                'description' => 'Busca por categoría, distancia, accesibilidad y disponibilidad.',
            ],
            [
                'title' => 'Contribuciones verificadas',
                'description' => 'Propón nuevos sitios y ayuda a mantener la información actualizada.',
            ],
        ],
    ],
])->name('map');

Route::inertia('terminos', 'legal/show', [
    'document' => [
        'kind' => 'terms',
        'title' => 'Términos de uso',
        'updatedAt' => '17 de julio de 2026',
    ],
])->name('terms');

Route::inertia('privacidad', 'legal/show', [
    'document' => [
        'kind' => 'privacy',
        'title' => 'Política de privacidad',
        'updatedAt' => '17 de julio de 2026',
    ],
])->name('privacy');
