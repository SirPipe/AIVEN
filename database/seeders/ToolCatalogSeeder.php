<?php

namespace Database\Seeders;

use App\Models\Tool;
use App\Models\ToolCategory;
use App\ToolStatus;
use Illuminate\Database\Seeder;

class ToolCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $toolCategories = [];

        foreach ($this->toolCategories() as $attributes) {
            $toolCategory = ToolCategory::query()->firstOrCreate(
                ['slug' => $attributes['slug']],
                $attributes,
            );

            $toolCategories[$toolCategory->slug] = $toolCategory;
        }

        foreach ($this->tools() as $attributes) {
            $toolCategorySlug = $attributes['tool_category'];
            unset($attributes['tool_category']);

            Tool::query()->firstOrCreate(
                ['key' => $attributes['key']],
                [
                    ...$attributes,
                    'tool_category_id' => $toolCategories[$toolCategorySlug]->id,
                ],
            );
        }
    }

    /**
     * @return array<int, array<string, bool|int|string|null>>
     */
    private function toolCategories(): array
    {
        return [
            ['name' => 'Imágenes', 'slug' => 'imagenes', 'description' => 'Optimiza y transforma imágenes directamente en tu dispositivo.', 'icon' => 'image', 'display_order' => 10, 'is_active' => true],
            ['name' => 'Texto', 'slug' => 'texto', 'description' => 'Analiza y transforma texto sin enviarlo a terceros.', 'icon' => 'text-cursor-input', 'display_order' => 20, 'is_active' => true],
            ['name' => 'Programación', 'slug' => 'programacion', 'description' => 'Utilidades para código, datos y tareas de desarrollo.', 'icon' => 'code-2', 'display_order' => 30, 'is_active' => true],
            ['name' => 'Redes', 'slug' => 'redes', 'description' => 'Utilidades para comprender y planear redes.', 'icon' => 'network', 'display_order' => 40, 'is_active' => true],
            ['name' => 'Computadoras', 'slug' => 'computadoras', 'description' => 'Calcula, diagnostica y planifica equipos de cómputo.', 'icon' => 'monitor-cog', 'display_order' => 50, 'is_active' => true],
            ['name' => 'Productividad', 'slug' => 'productividad', 'description' => 'Crea recursos y resuelve tareas digitales cotidianas.', 'icon' => 'wand-sparkles', 'display_order' => 60, 'is_active' => true],
            ['name' => 'Seguridad', 'slug' => 'seguridad', 'description' => 'Protege información con herramientas locales y transparentes.', 'icon' => 'shield-check', 'display_order' => 70, 'is_active' => true],
            ['name' => 'Herramientas generales', 'slug' => 'herramientas-generales', 'description' => 'Conversiones y utilidades prácticas para cualquier tarea.', 'icon' => 'wrench', 'display_order' => 80, 'is_active' => true],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function tools(): array
    {
        return [
            $this->tool('productividad', 'qr-generator', 'generador-qr', 'qr-generator', 'Generador QR', 'Crea códigos QR en tu dispositivo.', 'Genera códigos QR sin enviar su contenido al servidor. El historial guarda únicamente configuración visual segura.', 'qr-code', ToolStatus::Available, 10, ['qr', 'generador'], true, true),
            $this->tool('seguridad', 'password-generator', 'generador-contrasenas', 'password-generator', 'Generador de contraseñas', 'Genera contraseñas fuertes sin almacenarlas.', 'Configura longitud y composición. Las contraseñas generadas nunca se envían ni se guardan.', 'key-round', ToolStatus::Available, 20, ['seguridad', 'contraseñas'], true, false),
            $this->tool('imagenes', 'image-compressor', 'comprimir-imagen', 'image-compressor', 'Comprimir imagen', 'Reduce el peso de imágenes localmente.', 'Comprime imágenes en el navegador. El servidor sólo puede guardar métricas numéricas sin archivos ni contenido.', 'minimize-2', ToolStatus::Available, 30, ['imagen', 'compresión'], true, true),
            $this->tool('imagenes', 'image-converter', 'convertir-imagen', 'image-converter', 'Convertir imagen', 'Convierte imágenes entre formatos modernos.', 'Convierte formatos localmente y conserva en el historial únicamente formatos y tamaños seguros.', 'refresh-cw', ToolStatus::Available, 40, ['imagen', 'conversión'], true, true),
            $this->tool('computadoras', 'pc-power-consumption', 'consumo-pc', 'pc-power-consumption', 'Consumo de PC', 'Estima consumo eléctrico y costo mensual.', 'Calcula energía y costo a partir de potencia y tiempo de uso.', 'zap', ToolStatus::Available, 50, ['energía', 'computadoras'], true, true),
            $this->tool('redes', 'subnet-calculator', 'calculadora-subredes', 'subnet-calculator', 'Calculadora de subredes', 'Calcula rangos y capacidad de una subred.', 'Los cálculos ocurren localmente. El historial nunca conserva direcciones IP ni contenido de red.', 'network', ToolStatus::Available, 60, ['redes', 'subredes'], true, true),
            $this->tool('imagenes', 'image-resizer', 'redimensionar-imagen', 'image-resizer', 'Redimensionar imagen', 'Ajusta dimensiones conservando la calidad.', null, 'maximize-2', ToolStatus::ComingSoon, 110, ['imagen'], false, false),
            $this->tool('imagenes', 'metadata-cleaner', 'limpiar-metadatos', 'metadata-cleaner', 'Limpiar metadatos', 'Elimina metadatos privados de imágenes.', null, 'shield-check', ToolStatus::ComingSoon, 120, ['imagen', 'privacidad'], false, false),
            $this->tool('programacion', 'json-formatter', 'formateador-json', 'json-formatter', 'Formateador JSON', 'Valida y da formato a documentos JSON.', null, 'braces', ToolStatus::ComingSoon, 130, ['json', 'desarrollo'], false, false),
            $this->tool('programacion', 'base64-url-codec', 'base64-url', 'base64-url-codec', 'Base64 y URL', 'Codifica y decodifica Base64 y URLs.', null, 'binary', ToolStatus::ComingSoon, 140, ['base64', 'url'], false, false),
            $this->tool('programacion', 'uuid-generator', 'generador-uuid', 'uuid-generator', 'Generador UUID', 'Genera identificadores UUID modernos.', null, 'fingerprint', ToolStatus::ComingSoon, 150, ['uuid', 'generador'], false, false),
            $this->tool('seguridad', 'sha256-generator', 'sha-256', 'sha256-generator', 'Generador SHA-256', 'Calcula hashes SHA-256 localmente.', null, 'hash', ToolStatus::ComingSoon, 160, ['hash', 'sha-256'], false, false),
            $this->tool('programacion', 'number-base-converter', 'conversor-bases', 'number-base-converter', 'Conversor de bases', 'Convierte números entre bases comunes.', null, 'list-ordered', ToolStatus::ComingSoon, 170, ['números', 'bases'], false, false),
            $this->tool('herramientas-generales', 'storage-converter', 'conversor-almacenamiento', 'storage-converter', 'Conversor de almacenamiento', 'Convierte bytes, KB, MB, GB y TB.', null, 'hard-drive', ToolStatus::ComingSoon, 180, ['almacenamiento', 'unidades'], false, false),
            $this->tool('productividad', 'color-tool', 'herramienta-color', 'color-tool', 'Herramienta de color', 'Convierte y explora valores de color.', null, 'palette', ToolStatus::ComingSoon, 190, ['color', 'diseño'], false, false),
            $this->tool('herramientas-generales', 'unit-converter', 'conversor-unidades', 'unit-converter', 'Conversor de unidades', 'Convierte unidades técnicas cotidianas.', null, 'ruler', ToolStatus::ComingSoon, 200, ['unidades', 'conversión'], false, false),
            $this->tool('productividad', 'timestamp-converter', 'conversor-timestamp', 'timestamp-converter', 'Conversor de timestamp', 'Convierte timestamps y fechas legibles.', null, 'clock-3', ToolStatus::ComingSoon, 210, ['fecha', 'timestamp'], false, false),
            $this->tool('texto', 'text-counter', 'contador-texto', 'text-counter', 'Contador de texto', 'Cuenta caracteres, palabras y líneas.', null, 'text', ToolStatus::ComingSoon, 220, ['texto', 'contador'], false, false),
        ];
    }

    /**
     * @param  array<int, string>  $tags
     * @return array<string, mixed>
     */
    private function tool(
        string $toolCategory,
        string $key,
        string $slug,
        string $implementation,
        string $name,
        string $shortDescription,
        ?string $fullDescription,
        string $icon,
        ToolStatus $status,
        int $displayOrder,
        array $tags,
        bool $isOfflineCapable,
        bool $historyEnabled,
    ): array {
        return [
            'tool_category' => $toolCategory,
            'key' => $key,
            'slug' => $slug,
            'implementation' => $implementation,
            'name' => $name,
            'short_description' => $shortDescription,
            'full_description' => $fullDescription,
            'icon' => $icon,
            'status' => $status,
            'is_featured' => $status->isAvailable(),
            'is_new' => $status->isAvailable(),
            'is_offline_capable' => $isOfflineCapable,
            'requires_login' => false,
            'history_enabled' => $historyEnabled,
            'version' => '1.0.0',
            'usage_count' => 0,
            'tags' => $tags,
            'display_order' => $displayOrder,
        ];
    }
}
