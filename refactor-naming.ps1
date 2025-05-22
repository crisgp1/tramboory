#Requires -Version 5.1

<#
.SYNOPSIS
    Sistema de Refactorización de Naming Patterns
.DESCRIPTION
    Herramienta optimizada para estandarización de nomenclatura en arquitecturas de dominio
.PARAMETER ProjectRoot
    Directorio raíz del proyecto (default: directorio actual)
.EXAMPLE
    .\refactor-naming.ps1
#>

param(
    [Parameter(Mandatory = $false)]
    [ValidateScript({Test-Path $_ -PathType Container})]
    [string]$ProjectRoot = (Get-Location).Path
)

# Configuración del entorno de ejecución
$ErrorActionPreference = "Stop"
$InformationPreference = "Continue"

# Definición de transformaciones estructuradas
$script:BackendMappings = @{
    'app\domains\galeria\controllers\galeriaHome.controller.js' = 'galeria.controller.js'
    'app\domains\galeria\models\galeriaHome.model.js' = 'galeria.model.js'
    'app\domains\galeria\routes\galeriaHome.routes.js' = 'galeria.routes.js'
    'app\domains\inventario\controllers\alertaInventario.controller.js' = 'alerta.controller.js'
    'app\domains\inventario\controllers\movimientoInventario.controller.js' = 'movimiento.controller.js'
    'app\domains\inventario\controllers\proyeccionInventario.controller.js' = 'proyeccion.controller.js'
}

$script:FrontendMappings = @{
    'client\src\domains\catalogo\services\alimentosStore.js' = 'alimentos.service.js'
    'client\src\domains\catalogo\services\categoriasStore.js' = 'categorias.service.js'
    'client\src\domains\catalogo\services\extrasStore.js' = 'extras.service.js'
    'client\src\domains\catalogo\services\mamparasStore.js' = 'mamparas.service.js'
    'client\src\domains\catalogo\services\paquetesStore.js' = 'paquetes.service.js'
    'client\src\domains\catalogo\services\tematicasStore.js' = 'tematicas.service.js'
}

# Función de validación de prerrequisitos
function Test-ProjectStructure {
    param([string]$Path)
    
    Write-Information "🔍 Validando estructura del proyecto en: $Path"
    
    $RequiredDirectories = @(
        'app\domains'
        'client\src\domains'
    )
    
    foreach ($Directory in $RequiredDirectories) {
        $FullPath = Join-Path $Path $Directory
        if (-not (Test-Path $FullPath)) {
            throw "Estructura de proyecto inválida. Directorio faltante: $Directory"
        }
    }
    
    Write-Information "✅ Estructura del proyecto validada correctamente"
}

# Función de creación de backup de seguridad
function New-SafetyBackup {
    param([string]$ProjectPath)
    
    $BackupDirectory = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    $BackupPath = Join-Path $ProjectPath $BackupDirectory
    
    try {
        Write-Information "💾 Creando backup de seguridad..."
        New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
        
        $CriticalDirectories = @('app', 'client')
        foreach ($Dir in $CriticalDirectories) {
            $SourcePath = Join-Path $ProjectPath $Dir
            if (Test-Path $SourcePath) {
                $DestinationPath = Join-Path $BackupPath $Dir
                Copy-Item -Path $SourcePath -Destination $DestinationPath -Recurse -Force
                Write-Information "  ✓ Backup completado: $Dir"
            }
        }
        
        Write-Information "✅ Backup creado en: $BackupDirectory"
        return $BackupPath
        
    } catch {
        Write-Error "Error durante creación de backup: $($_.Exception.Message)"
        throw
    }
}

# Motor de renombrado con validación
function Invoke-FileRenaming {
    param(
        [hashtable]$Mappings,
        [string]$BasePath,
        [string]$Context
    )
    
    Write-Information "🔧 Procesando renombrado: $Context"
    
    $ProcessedFiles = 0
    $ErrorsEncountered = 0
    
    foreach ($RelativePath in $Mappings.Keys) {
        $NewFileName = $Mappings[$RelativePath]
        $CurrentFilePath = Join-Path $BasePath $RelativePath
        
        if (Test-Path $CurrentFilePath) {
            try {
                $ParentDirectory = Split-Path $CurrentFilePath -Parent
                $NewFilePath = Join-Path $ParentDirectory $NewFileName
                
                # Validación de conflictos
                if (Test-Path $NewFilePath) {
                    Write-Warning "⚠️ Archivo destino existe: $NewFileName (omitiendo)"
                    continue
                }
                
                # Ejecución del renombrado
                Rename-Item -Path $CurrentFilePath -NewName $NewFileName -Force
                Write-Information "  ✓ $(Split-Path $RelativePath -Leaf) → $NewFileName"
                $ProcessedFiles++
                
            } catch {
                Write-Warning "❌ Error renombrando $(Split-Path $RelativePath -Leaf): $($_.Exception.Message)"
                $ErrorsEncountered++
            }
        } else {
            Write-Information "  ℹ️ Archivo no encontrado: $(Split-Path $RelativePath -Leaf)"
        }
    }
    
    Write-Information "📊 $Context - Procesados: $ProcessedFiles | Errores: $ErrorsEncountered"
}

# Función de validación post-ejecución
function Test-RenamingIntegrity {
    param([string]$ProjectPath)
    
    Write-Information "🔍 Validando integridad post-renombrado..."
    
    # Verificar que no queden archivos con patrones antiguos
    $OldPatterns = @('*Home.*.js', '*Store.js')
    $FoundOldPatterns = @()
    
    foreach ($Pattern in $OldPatterns) {
        $Files = Get-ChildItem -Path $ProjectPath -Filter $Pattern -Recurse -ErrorAction SilentlyContinue
        if ($Files) {
            $FoundOldPatterns += $Files
        }
    }
    
    if ($FoundOldPatterns.Count -eq 0) {
        Write-Information "✅ Validación de integridad exitosa"
        return $true
    } else {
        Write-Warning "⚠️ Se encontraron $($FoundOldPatterns.Count) archivos con patrones antiguos"
        return $false
    }
}

# Función principal de orquestación
function Start-NamingRefactoring {
    param([string]$ProjectRoot)
    
    Write-Host @"
╔═══════════════════════════════════════════════════════╗
║            NAMING REFACTOR ENGINE v3.0               ║
║              Arquitectura Simplificada               ║
╚═══════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan
    
    Write-Information "📂 Directorio del proyecto: $ProjectRoot"
    
    try {
        # Pipeline de ejecución
        Test-ProjectStructure -Path $ProjectRoot
        $BackupPath = New-SafetyBackup -ProjectPath $ProjectRoot
        
        Invoke-FileRenaming -Mappings $script:BackendMappings -BasePath $ProjectRoot -Context "Backend"
        Invoke-FileRenaming -Mappings $script:FrontendMappings -BasePath $ProjectRoot -Context "Frontend"
        
        $IntegrityCheck = Test-RenamingIntegrity -ProjectPath $ProjectRoot
        
        # Métricas de resultado
        $TotalMappings = $script:BackendMappings.Count + $script:FrontendMappings.Count
        
        Write-Host @"

╔═══════════════════════════════════════════════════════╗
║                OPERACIÓN COMPLETADA                  ║
║  Total de archivos procesados: $TotalMappings                    ║
║  Integridad validada: $($IntegrityCheck ? "✅" : "⚠️")                       ║
╚═══════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
        
        Write-Information @"

📋 VERIFICACIONES RECOMENDADAS:
  • Ejecutar: npm run dev (validar funcionamiento)
  • Revisar: git status (confirmar cambios)
  • Probar: funcionalidades críticas del sistema

💾 Backup disponible en: $(Split-Path $BackupPath -Leaf)
"@
        
    } catch {
        Write-Error @"
╔═══════════════════════════════════════════════════════╗
║                   ERROR CRÍTICO                      ║
║  $($_.Exception.Message)
╚═══════════════════════════════════════════════════════╝
"@
        throw
    }
}

# Punto de entrada con validación de contexto
if ($MyInvocation.InvocationName -ne '.') {
    Start-NamingRefactoring -ProjectRoot $ProjectRoot
}   