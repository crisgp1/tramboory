#Requires -Version 5.1
param([string]$ProjectRoot = (Get-Location).Path)

$ErrorActionPreference = "Stop"

# Mapeo de transformaciones críticas
$Transformations = @{
    'app\domains\galeria\controllers\galeriaHome.controller.js' = 'galeria.controller.js'
    'app\domains\galeria\models\galeriaHome.model.js' = 'galeria.model.js'
    'app\domains\galeria\routes\galeriaHome.routes.js' = 'galeria.routes.js'
    'client\src\domains\catalogo\services\alimentosStore.js' = 'alimentos.service.js'
    'client\src\domains\catalogo\services\categoriasStore.js' = 'categorias.service.js'
    'client\src\domains\catalogo\services\extrasStore.js' = 'extras.service.js'
    'client\src\domains\catalogo\services\mamparasStore.js' = 'mamparas.service.js'
    'client\src\domains\catalogo\services\paquetesStore.js' = 'paquetes.service.js'
    'client\src\domains\catalogo\services\tematicasStore.js' = 'tematicas.service.js'
}

Write-Host "🔧 Iniciando refactorización de naming patterns..." -ForegroundColor Cyan

$ProcessedFiles = 0
foreach ($RelativePath in $Transformations.Keys) {
    $NewFileName = $Transformations[$RelativePath]
    $FullPath = Join-Path $ProjectRoot $RelativePath
    
    if (Test-Path $FullPath) {
        $NewFullPath = Join-Path (Split-Path $FullPath -Parent) $NewFileName
        
        if (-not (Test-Path $NewFullPath)) {
            Rename-Item -Path $FullPath -NewName $NewFileName -Force
            Write-Host "✅ $(Split-Path $RelativePath -Leaf) → $NewFileName" -ForegroundColor Green
            $ProcessedFiles++
        } else {
            Write-Host "⚠️ Destino existe: $NewFileName" -ForegroundColor Yellow
        }
    }
}

Write-Host "📊 Refactorización completada: $ProcessedFiles archivos procesados" -ForegroundColor Magenta
