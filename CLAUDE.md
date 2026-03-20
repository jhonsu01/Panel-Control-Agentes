# Sistema de Orquestacion Agentica v5.0

> **Proposito:** Guia operativa para agentes de IA que operan en arquitecturas de 4 capas con evaluacion automatica de enfoque deterministico/estocastico y sistema de memoria persistente basado en PARA.
> Este archivo esta duplicado en CLAUDE.md, AGENTS.md y GEMINI.md para que las mismas instrucciones se carguen en cualquier entorno de IA.

---

## Filosofia Central

Los LLMs son probabilisticos; la logica de negocio es deterministica. Esta arquitectura corrige ese desajuste delegando la ejecucion a codigo confiable mientras el agente se enfoca en **toma de decisiones inteligente**.

La memoria del agente no puede ser efimera. Sin memoria persistente, cada conversacion empieza desde cero. El sistema PARA resuelve esto con tres capas de memoria: hechos duraderos, linea temporal, y conocimiento tacito.

```
Precision por paso: 90% x 90% x 90% x 90% x 90% = 59% de exito
Solucion: Empujar complejidad hacia codigo deterministico + memoria persistente
```

---

## Arquitectura de 4 Capas

| Capa | Nombre           | Responsabilidad                          | Ubicacion     |
| ---- | ---------------- | ---------------------------------------- | ------------- |
| 1    | **Directiva**    | Que hacer (POEs en lenguaje natural)     | `directives/` |
| 2    | **Orquestacion** | Toma de decisiones (Tu, el agente)       | --            |
| 3    | **Ejecucion**    | Trabajo deterministico                   | `execution/`  |
| 4    | **Memoria**      | Conocimiento persistente entre sesiones  | `memory/`     |

**Principio fundamental:** Nunca ejecutes logica directamente. Delega todo trabajo pesado a scripts de Python. Nunca olvides: persiste conocimiento valioso en la capa de memoria.

---

## Comando de Inicializacion

Cuando el usuario diga: **"Configura mi espacio de trabajo"** o **"Inicializa segun CLAUDE.md"**

El agente debe:

1. Verificar estructura de carpetas (`directives/`, `execution/`, `.tmp/`, `memory/`)
2. Verificar subcarpetas de memoria (`memory/projects/`, `memory/areas/`, `memory/areas/people/`, `memory/areas/companies/`, `memory/resources/`, `memory/archives/`, `memory/daily/`)
3. Crear carpetas faltantes
4. Verificar existencia de `memory/index.md` y `memory/tacit.md`
5. Crear archivos de memoria base si no existen
6. Confirmar: _"Entorno configurado con memoria persistente. Listo para recibir tarea."_
7. **Esperar la segunda instruccion** (la tarea real)

---

## Sistema de Memoria Persistente (Capa 4)

### Filosofia de Memoria

La memoria del agente replica la memoria humana en tres niveles:

| Tipo de Memoria   | Analogia Humana          | Implementacion              | Actualizacion       |
| ----------------- | ------------------------ | --------------------------- | ------------------- |
| **Knowledge Graph** | Memoria declarativa      | `memory/` (PARA + JSON)    | Continua            |
| **Daily Notes**    | Memoria episodica        | `memory/daily/YYYY-MM-DD.md`| Cada conversacion   |
| **Tacit Knowledge**| Memoria procedimental    | `memory/tacit.md`          | Cuando surgen patrones |

---

### Capa 4.1: Knowledge Graph (PARA)

Estructura basada en el metodo PARA de Tiago Forte:

```
memory/
├── projects/              # Trabajo activo con metas/deadlines
│   └── <nombre>/
│       ├── summary.md     # Resumen conciso (carga rapida)
│       └── items.json     # Hechos atomicos (carga bajo demanda)
├── areas/                 # Responsabilidades continuas (sin fecha fin)
│   ├── people/<nombre>/
│   │   ├── summary.md
│   │   └── items.json
│   └── companies/<nombre>/
│       ├── summary.md
│       └── items.json
├── resources/             # Temas de interes, material de referencia
│   └── <tema>/
│       ├── summary.md
│       └── items.json
├── archives/              # Items inactivos de las otras tres categorias
├── daily/                 # Notas diarias (linea temporal)
│   ├── 2026-03-18.md
│   └── ...
├── index.md               # Indice general de entidades
└── tacit.md               # Conocimiento tacito del usuario
```

#### Categorias PARA

| Categoria     | Que contiene                                     | Ciclo de vida                    |
| ------------- | ------------------------------------------------ | -------------------------------- |
| **Projects**  | Trabajo activo con objetivo o deadline            | Activo -> Archives al completar  |
| **Areas**     | Responsabilidades sin fecha fin (personas, empresas) | Persiste indefinidamente      |
| **Resources** | Material de referencia, temas de interes          | Persiste o -> Archives           |
| **Archives**  | Items inactivos de cualquier categoria            | Almacenamiento permanente        |

#### Recuperacion por Niveles

Cada entidad tiene dos archivos para optimizar el uso del contexto:

1. **`summary.md`** - Se carga PRIMERO. Resumen conciso para contexto rapido.
2. **`items.json`** - Se carga SOLO cuando se necesita detalle granular.

> La mayoria de conversaciones solo necesitan el summary. El agente solo profundiza en items.json cuando la conversacion lo requiere.

---

### Capa 4.2: Schema de Hechos Atomicos

Cada hecho en `items.json` sigue este schema:

```json
{
  "id": "entity-001",
  "fact": "Descripcion concisa del hecho",
  "category": "milestone",
  "timestamp": "2026-03-18",
  "source": "2026-03-18",
  "status": "active",
  "supersededBy": null,
  "relatedEntities": ["companies/acme", "people/jane"],
  "lastAccessed": "2026-03-18",
  "accessCount": 1
}
```

#### Campos del Schema

| Campo              | Tipo     | Descripcion                                                    |
| ------------------ | -------- | -------------------------------------------------------------- |
| `id`               | string   | Identificador unico del hecho                                  |
| `fact`             | string   | Descripcion concisa y autocontenida del hecho                  |
| `category`         | enum     | `relationship` / `milestone` / `status` / `preference` / `context` |
| `timestamp`        | date     | Cuando ocurrio el hecho                                        |
| `source`           | string   | Fecha o referencia de donde se aprendio                        |
| `status`           | enum     | `active` / `superseded`                                        |
| `supersededBy`     | string   | ID del hecho que reemplaza a este (null si activo)             |
| `relatedEntities`  | string[] | Referencias cruzadas a otras entidades del grafo               |
| `lastAccessed`     | date     | Ultima vez que se uso este hecho                               |
| `accessCount`      | number   | Cuantas veces se ha referenciado                               |

#### Regla de No-Eliminacion

> **Los hechos NUNCA se eliminan.** Cuando algo cambia, el hecho viejo se marca como `superseded` y se crea uno nuevo. El campo `supersededBy` crea una cadena temporal que permite rastrear la evolucion de cualquier hecho.

---

### Capa 4.3: Daily Notes (Notas Diarias)

```
memory/daily/
├── 2026-03-18.md
├── 2026-03-17.md
└── ...
```

Las notas diarias son la linea temporal cruda -- el registro de "que paso y cuando":

- Se escriben **continuamente** durante cada conversacion
- Son cronologicas y completas
- Capturan eventos, decisiones, tareas ejecutadas y resultados
- Sirven como fuente de verdad para la extraccion de hechos duraderos

#### Formato de Nota Diaria

```markdown
# 2026-03-18

## Conversacion 1
- **Tarea:** [Descripcion de lo que se hizo]
- **Resultado:** [Exito/Fallo + detalles]
- **Decisiones:** [Decisiones tomadas]
- **Aprendizajes:** [Errores encontrados y soluciones]
- **Entidades mencionadas:** [Lista de personas, proyectos, empresas]
```

---

### Capa 4.4: Conocimiento Tacito

Archivo unico `memory/tacit.md` que captura COMO opera el usuario:

- Preferencias de comunicacion (herramientas, formatos, verbosidad)
- Patrones de trabajo (como brainstormea, toma decisiones, gestiona proyectos)
- Preferencias de herramientas y workflows
- Reglas y limites que el agente debe seguir

> Este archivo cambia LENTAMENTE. Solo se actualiza cuando el agente detecta un nuevo patron, no en cada conversacion.

---

### Capa 4.5: Memory Decay (Decaimiento de Memoria)

No todos los hechos son iguales. El sistema implementa decaimiento por recencia:

#### Niveles de Acceso

| Nivel    | Criterio                      | Tratamiento en summary.md        |
| -------- | ----------------------------- | -------------------------------- |
| **Hot**  | Accedido en ultimos 7 dias    | Incluido prominentemente         |
| **Warm** | Accedido hace 8-30 dias       | Incluido con menor prioridad     |
| **Cold** | Sin acceso en 30+ dias        | Omitido del summary (vive en items.json) |

#### Resistencia por Frecuencia

Los hechos con alto `accessCount` resisten el decaimiento. Un hecho referenciado semanalmente durante meses permanece **Warm** aunque se salten algunas semanas.

#### Sintesis Semanal

Periodicamente (idealmente semanal), los `summary.md` se reescriben:

1. Cargar todos los hechos activos de `items.json`
2. Clasificar por nivel (Hot -> Warm -> Cold)
3. Dentro de cada nivel, ordenar por `accessCount` (descendente)
4. Escribir hechos Hot y Warm en `summary.md`
5. Omitir hechos Cold del summary (permanecen en `items.json`)

---

### Capa 4.6: Heartbeat (Extraccion Automatizada)

El proceso de heartbeat es una tarea periodica que:

```
┌─────────────────────────────────────────────────────────────┐
│                    PROCESO HEARTBEAT                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ESCANEAR conversaciones recientes                       │
│     └─> Identificar informacion nueva                       │
│                                                             │
│  2. EXTRAER hechos duraderos                                │
│     └─> Relaciones, cambios de estado, hitos, decisiones    │
│     └─> IGNORAR: chat casual, requests transitorios,        │
│         informacion ya capturada                            │
│                                                             │
│  3. ESCRIBIR hechos al Knowledge Graph                      │
│     └─> Entidad apropiada en PARA                           │
│                                                             │
│  4. ACTUALIZAR notas diarias                                │
│     └─> Entradas de linea temporal                          │
│                                                             │
│  5. BUMP metadata de acceso                                 │
│     └─> accessCount + lastAccessed                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Heuristicas de Creacion de Entidades

No todo merece su propia carpeta:

| Criterio                                         | Accion                          |
| ------------------------------------------------ | ------------------------------- |
| Mencionado 3+ veces                              | Crear entidad en PARA           |
| Relacion directa con el usuario                  | Crear entidad en PARA           |
| Proyecto/empresa significativa                   | Crear entidad en PARA           |
| Mencion unica o casual                           | Solo capturar en daily notes    |

---

## Ciclo de Vida del Proyecto

### Fase 0: Recepcion de Tarea

**Trigger:** Usuario proporciona la segunda instruccion despues de inicializar.

**Accion inmediata:** Ejecutar evaluacion de arquitectura ANTES de cualquier otra accion.

```
┌─────────────────────────────────────────────────────────────┐
│           EVALUACION AUTOMATICA DE ARQUITECTURA             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Al recibir nueva tarea, evaluar SILENCIOSAMENTE:           │
│                                                             │
│  CRITERIOS DETERMINISTICOS (sumar puntos si aplica):        │
│  +2  Requiere reproducibilidad para auditoria               │
│  +2  Involucra calculos financieros o precision critica      │
│  +1  Salida tiene formato estrictamente definido            │
│  +1  Opera sobre datos completamente estructurados          │
│  +1  Logica expresable con reglas if/else                   │
│  +1  Se ejecutara en batch sin supervision                  │
│                                                             │
│  CRITERIOS ESTOCASTICOS (sumar puntos si aplica):           │
│  +2  Genera contenido para consumo humano                   │
│  +2  Multiples soluciones igualmente validas                │
│  +1  Procesa lenguaje natural o datos no estructurados      │
│  +1  Requiere adaptacion contextual o personalizacion       │
│  +1  Se beneficia de exploracion de soluciones              │
│  +1  Incluye interaccion conversacional                     │
│                                                             │
│  RESULTADO:                                                 │
│  - DET > STO+2  ->  Arquitectura DETERMINISTICA             │
│  - STO > DET+2  ->  Arquitectura ESTOCASTICA                │
│  - Diferencia <=2 -> Arquitectura HIBRIDA                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Declaracion obligatoria:**

```
"Evaluacion: [DET: X | STO: Y] -> Arquitectura [TIPO]"
```

**Accion de memoria:** Consultar `memory/` para contexto previo relevante a la tarea.

---

### Fase 1: Analisis

**Objetivo:** Comprender el problema antes de actuar.

#### Checklist de Analisis

- [ ] Existe una directiva para esta tarea en `directives/`?
- [ ] Existen scripts reutilizables en `execution/`?
- [ ] Hay contexto previo en `memory/` relevante a esta tarea?
- [ ] Que entradas requiere la tarea?
- [ ] Cual es la salida esperada (entregable vs intermedio)?
- [ ] Hay dependencias externas (APIs, tokens, credenciales)?

#### Acciones

1. **Si existe directiva:** Leerla completamente antes de proceder
2. **Si no existe:** Declara: _"Creando nueva directiva para [Tarea]..."_
3. **Consultar memoria:** Buscar entidades relacionadas en el Knowledge Graph
4. Identificar restricciones conocidas (limites de API, formatos, tiempos)

#### Entregable de Fase

Comprension clara del problema, recursos disponibles y contexto historico de memoria.

---

### Fase 2: Planeacion

**Objetivo:** Disenar la solucion antes de implementar.

#### Estructura de Directiva (con arquitectura)

Toda directiva debe contener:

```markdown
# [Nombre de la Tarea]

## Metadata

- **Arquitectura:** [DETERMINISTICA | ESTOCASTICA | HIBRIDA]
- **Score:** DET: [X] | STO: [Y]
- **Temperatura LLM:** [Valor recomendado]
- **Creado:** [Fecha]
- **Ultima ejecucion:** [Fecha]
- **Entidades relacionadas:** [Referencias a memory/]

## Objetivo

[Descripcion concisa del resultado esperado]

## Entradas

- [Input 1]: [Descripcion y formato]
- [Input 2]: [Descripcion y formato]

## Salidas

- **Entregable:** [Destino final - Google Sheets, Slides, archivo local]
- **Intermedios:** [Archivos temporales en .tmp/]

## Flujo de Ejecucion

[Varia segun arquitectura - ver plantillas abajo]

## Herramientas Requeridas

- Script: `execution/[nombre].py`
- APIs: [Lista de APIs necesarias]

## Configuracion de Ejecucion

[Parametros especificos segun arquitectura]

## Restricciones y Casos Borde

- [Restriccion 1]: [Solucion]
- [Restriccion 2]: [Solucion]

## Historial de Aprendizajes

| Fecha | Problema | Solucion |
| ----- | -------- | -------- |
| --    | --       | --       |
```

---

### Plantillas de Flujo por Arquitectura

#### DETERMINISTICA (DET > STO+2)

```markdown
## Flujo de Ejecucion

1. **[MEM]** Consultar memoria para contexto previo
2. **[DET]** Validar inputs contra schema
3. **[DET]** Cargar configuracion de .env
4. **[DET]** Ejecutar `execution/[script].py`
5. **[DET]** Verificar output contra formato esperado
6. **[DET]** Persistir resultado
7. **[MEM]** Actualizar memoria con resultados y aprendizajes

## Configuracion de Ejecucion

- Temperatura: 0.0 - 0.2
- Reintentos en fallo: 3
- Validacion estricta: Si
- Logging: Completo para auditoria
```

```
FLUJO DETERMINISTICO:

[MEMORIA] --> [INPUT] --> [VALIDACION] --> [SCRIPT.PY] --> [VERIFICACION] --> [OUTPUT] --> [MEMORIA]
    |            |            |               |                |               |            |
    v            v            v               v                v               v            v
 Contexto    Directiva   Schema JSON    execution/       Assertions      Formato      Actualizar
 previo      estricta    predefinido    codigo Python    automaticas     fijo         hechos
```

#### ESTOCASTICA (STO > DET+2)

```markdown
## Flujo de Ejecucion

1. **[MEM]** Consultar memoria y conocimiento tacito
2. **[STO]** Interpretar intencion del usuario
3. **[STO]** Generar contenido/respuesta
4. **[STO]** Aplicar filtros de calidad
5. **[DET]** Formatear salida final
6. **[MEM]** Registrar en notas diarias

## Configuracion de Ejecucion

- Temperatura: 0.6 - 0.9
- Variaciones permitidas: Si
- Validacion: Post-generacion
- Personalizacion: Segun contexto + tacit.md
```

```
FLUJO ESTOCASTICO:

[MEMORIA] --> [CONTEXTO] --> [INTERPRETACION] --> [GENERACION] --> [FILTROS] --> [OUTPUT] --> [MEMORIA]
    |             |               |                    |              |            |            |
    v             v               v                    v              v            v            v
 tacit.md      Usuario        Agente LLM          Temp: 0.7      Calidad       Variable    Daily
 + hechos      + historial    comprende           creatividad    minima        adaptado    notes
```

#### HIBRIDA (Diferencia <= 2)

```markdown
## Flujo de Ejecucion

1. **[MEM]** Consultar memoria relevante
2. **[DET]** Validar inputs
3. **[DET]** Extraer/transformar datos
4. **[STO]** Procesar/interpretar contenido
5. **[STO]** Generar respuesta/contenido
6. **[DET]** Formatear segun template
7. **[DET]** Persistir resultado
8. **[MEM]** Actualizar Knowledge Graph y daily notes

## Configuracion de Ejecucion

- Temperatura fases DET: 0.1 - 0.2
- Temperatura fases STO: 0.5 - 0.7
- Puntos de control: Entre cada transicion DET<->STO
```

```
FLUJO HIBRIDO:

[MEM] --> [INPUT] --> [VALIDACION] --> [PROCESAMIENTO] --> [GENERACION] --> [FORMATO] --> [OUTPUT] --> [MEM]
  |          |            |                 |                  |              |            |           |
  v          v            v                 v                  v              v            v           v
Graph     Mixto      Script DET        Agente STO         Agente STO     Script DET    Fijo       Update
+ tacit              temp: 0.1         temp: 0.6          temp: 0.6      temp: 0.1                hechos

         ════════════════════     ════════════════════════════     ════════════════
              CAPA 3                        CAPA 2                     CAPA 3
         ═══════════════════════════════════════════════════════════════════════════
                                         CAPA 4 (MEMORIA)
```

---

### Fase 3: Ejecucion

**Objetivo:** Implementar la solucion con codigo deterministico.

#### Principios de Ejecucion

| Principio                 | Descripcion                                                                |
| ------------------------- | -------------------------------------------------------------------------- |
| **Busca antes de crear**  | Revisa `execution/` antes de escribir un nuevo script                      |
| **Consulta memoria**      | Revisa `memory/` para contexto y errores previos similares                 |
| **Idempotencia**          | Los scripts deben poder ejecutarse multiples veces sin efectos secundarios |
| **Secretos en `.env`**    | Nunca hardcodees tokens o credenciales                                     |
| **Salidas estructuradas** | Usa `.tmp/` para intermedios, nube para entregables                        |
| **Persiste aprendizajes** | Actualiza memoria despues de cada ejecucion significativa                  |

#### Flujo de Ejecucion

```
┌─────────────────┐
│ Consultar Memoria│
└────────┬────────┘
         v
┌─────────────────┐
│ Leer Directiva  │
└────────┬────────┘
         v
┌─────────────────┐
│ Verificar Tools │──── Existe script? ──── Si --> Usar existente
└────────┬────────┘                          |
         | No                                |
         v                                   |
┌─────────────────┐                          |
│ Crear Script    │                          |
└────────┬────────┘                          |
         v                                   |
┌─────────────────┐<─────────────────────────┘
│ Ejecutar        │
└────────┬────────┘
         v
┌─────────────────┐
│ Exito?          │──── Si --> Fase 4: Control + Actualizar Memoria
└────────┬────────┘
         | No
         v
┌─────────────────┐
│ Protocolo de    │
│ Auto-Correccion │──── Registrar error en memoria
└─────────────────┘
```

#### Estructura de Archivos

```
.
├── .tmp/                    # Intermedios (regenerables, no commitear)
├── directives/              # POEs en Markdown
│   ├── _plantilla_det.md    # Template para tareas deterministicas
│   ├── _plantilla_sto.md    # Template para tareas estocasticas
│   ├── _plantilla_hyb.md    # Template para tareas hibridas
│   └── [tarea].md
├── execution/               # Scripts de Python deterministicos
│   ├── [herramienta].py
│   └── webhooks.json        # Mapeo de webhooks
├── memory/                  # Sistema de memoria persistente (PARA)
│   ├── projects/            # Proyectos activos
│   ├── areas/               # Responsabilidades continuas
│   │   ├── people/          # Personas
│   │   └── companies/       # Empresas
│   ├── resources/           # Material de referencia
│   ├── archives/            # Items inactivos
│   ├── daily/               # Notas diarias
│   ├── index.md             # Indice general de entidades
│   └── tacit.md             # Conocimiento tacito del usuario
├── .env                     # Variables de entorno y secretos
├── credentials.json         # OAuth de Google (en .gitignore)
├── token.json               # Token OAuth (en .gitignore)
└── requirements.txt         # Dependencias
```

#### Entregable de Fase

Codigo ejecutado exitosamente, salidas generadas y memoria actualizada.

---

### Fase 4: Control

**Objetivo:** Verificar resultados, capturar aprendizajes y persistir en memoria.

#### Protocolo de Auto-Correccion

Cuando un script falla o produce resultados inesperados:

```
┌─────────────────────────────────────────────────────────────┐
│                    CICLO DE APRENDIZAJE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. DIAGNOSTICAR                                            │
│     └─> Leer stack trace                                    │
│     └─> Consultar memoria por errores similares previos     │
│     └─> Identificar causa raiz (API, logica, limite, etc.)  │
│                                                             │
│  2. PARCHEAR CODIGO                                         │
│     └─> Corregir script en execution/                       │
│     └─> Probar correccion                                   │
│                                                             │
│  3. PARCHEAR DIRECTIVA (MEMORIA DE DIRECTIVA)               │
│     └─> Abrir .md correspondiente en directives/            │
│     └─> Agregar a "Restricciones y Casos Borde"             │
│     └─> Documentar: "No hacer X porque causa Y. Hacer Z."   │
│                                                             │
│  4. PERSISTIR EN MEMORIA (MEMORIA PERSISTENTE)               │
│     └─> Registrar error y solucion en daily notes           │
│     └─> Si es un patron recurrente, actualizar tacit.md     │
│     └─> Actualizar items.json de entidades afectadas        │
│                                                             │
│  5. VERIFICAR                                               │
│     └─> Re-ejecutar script                                  │
│     └─> Confirmar que el fix funciona                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Declaraciones Obligatorias

| Situacion                | Declaracion                                                                |
| ------------------------ | -------------------------------------------------------------------------- |
| Al recibir tarea         | _"Evaluacion: [DET: X \| STO: Y] -> Arquitectura [TIPO]"_                 |
| Antes de programar       | _"Leyendo directiva para [Tarea]..."_                                      |
| Directiva nueva          | _"Creando directiva [TIPO] para [Tarea]..."_                               |
| Despues de error         | _"Error detectado. Reparando script y actualizando memoria."_              |
| Contexto de memoria      | _"Memoria consultada: [N] hechos relevantes encontrados."_                 |
| Actualizacion de memoria | _"Memoria actualizada: [tipo de actualizacion]."_                          |

#### Regla de Oro

> **"No cometemos el mismo error dos veces."**
>
> Al actualizar la Directiva Y la Memoria, garantizas que la proxima ejecucion (o un script similar) "recordara" la limitacion -- incluso en conversaciones futuras.

#### Entregable de Fase

- Codigo funcional verificado
- Directiva actualizada con aprendizajes
- Memoria persistente actualizada (daily notes + Knowledge Graph)
- Sistema mas robusto que antes del error

---

## Operaciones de Memoria

### Cuando Escribir en Memoria

| Evento                          | Accion en Memoria                                        |
| ------------------------------- | -------------------------------------------------------- |
| Nueva persona/empresa mencionada | Evaluar heuristicas de creacion de entidad               |
| Proyecto iniciado/completado    | Crear/mover en PARA                                      |
| Error resuelto                  | Registrar en daily notes + items.json de entidad         |
| Preferencia del usuario         | Actualizar `tacit.md`                                    |
| Decision importante             | Registrar en daily notes + entidad relacionada           |
| Fin de conversacion             | Escribir resumen en daily notes del dia                  |

### Cuando Leer de Memoria

| Situacion                        | Que consultar                                            |
| -------------------------------- | -------------------------------------------------------- |
| Nueva tarea recibida             | Entidades relacionadas + errores previos similares       |
| Mencion de persona/empresa       | `summary.md` de la entidad                               |
| Error durante ejecucion          | Historial de errores similares en daily notes            |
| Generacion de contenido          | `tacit.md` para preferencias de estilo                   |
| Necesidad de detalle granular    | `items.json` de la entidad                               |

### Protocolo de Acceso a Hechos

Cada vez que un hecho se usa en una conversacion:

1. Incrementar `accessCount` en `items.json`
2. Actualizar `lastAccessed` a la fecha de hoy
3. Esto mantiene vivo el ciclo de decaimiento de memoria

---

## Matriz de Decision Rapida

Para evaluacion instantanea, usar esta matriz:

| Si la tarea involucra...                    | Entonces...                               |
| ------------------------------------------- | ----------------------------------------- |
| Calculos financieros, auditoria, compliance | -> **DET** (temp: 0.1)                    |
| Generacion de texto para usuarios           | -> **STO** (temp: 0.7)                    |
| ETL, transformacion de datos                | -> **DET** (temp: 0.0)                    |
| Chatbot, asistente conversacional           | -> **STO** (temp: 0.6)                    |
| Reportes con formato fijo                   | -> **HYB** (datos: DET, narrativa: STO)   |
| Clasificacion/routing de requests           | -> **HYB** (decision: STO, accion: DET)   |
| Scraping, extraccion de datos               | -> **DET** (temp: 0.0)                    |
| Emails personalizados                       | -> **HYB** (template: DET, contenido: STO)|
| Validacion de formularios                   | -> **DET** (temp: 0.0)                    |
| Recomendaciones                             | -> **STO** (temp: 0.7)                    |

---

## Webhooks en la Nube (Modal)

El sistema soporta ejecucion basada en eventos mediante webhooks.

#### Configuracion de Webhooks

1. Leer `directives/add_webhook.md`
2. Crear directiva en `directives/`
3. Agregar entrada a `execution/webhooks.json`
4. Desplegar: `modal deploy execution/modal_webhook.py`
5. Probar endpoint

#### Endpoints Disponibles

| Endpoint                             | Funcion            |
| ------------------------------------ | ------------------ |
| `...list-webhooks.modal.run`         | Listar webhooks    |
| `...directive.modal.run?slug={slug}` | Ejecutar directiva |
| `...test-email.modal.run`            | Probar email       |

#### Herramientas para Webhooks

`send_email` | `read_sheet` | `update_sheet`

---

## Principios Operativos

### Se Pragmatico

- Busca herramientas existentes antes de crear nuevas
- Consulta memoria antes de empezar desde cero
- Usa el modelo mas capaz disponible (Opus-4.6 recomendado)
- Prioriza velocidad sin sacrificar confiabilidad

### Se Confiable

- Nunca ejecutes sin directiva
- Valida entradas antes de procesar
- Documenta todo comportamiento inesperado
- Persiste aprendizajes en memoria

### Auto-Mejorate

- Los errores son oportunidades de aprendizaje
- Cada fallo debe fortalecer el sistema Y la memoria
- Las directivas evolucionan con el proyecto
- La memoria crece y se refina con el tiempo

### Recuerda

- La memoria no es opcional: es parte del flujo de trabajo
- Los hechos nunca se eliminan, solo se superseden
- El summary es para lectura rapida, items.json para profundidad
- El conocimiento tacito es el mas valioso y el mas lento de construir

---

## Resumen Ejecutivo

```
╔═══════════════════════════════════════════════════════════════╗
║                    OPERACION DEL AGENTE v5.0                  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  INICIALIZACION  ->  "Configura espacio de trabajo"           ║
║       |              Verificar/crear estructura + memoria     ║
║                                                               ║
║  RECEPCION       ->  Usuario da tarea real                    ║
║       |              Evaluacion automatica DET/STO            ║
║       |              Consulta de memoria relevante            ║
║                                                               ║
║  ANALISIS        ->  Entender problema, revisar recursos      ║
║       |              Buscar contexto previo en memoria         ║
║                                                               ║
║  PLANEACION      ->  Crear/leer directiva con arquitectura    ║
║       |                                                       ║
║  EJECUCION       ->  Codigo segun tipo (DET/STO/HYB)          ║
║       |                                                       ║
║  CONTROL         ->  Verificar, aprender, documentar          ║
║       |              Actualizar memoria persistente            ║
║                                                               ║
║  [CICLO]         ->  Repetir con sistema + memoria mejorados  ║
║                                                               ║
║  CAPAS:                                                       ║
║  [1-Directiva] [2-Orquestacion] [3-Ejecucion] [4-Memoria]    ║
║                                                               ║
║  MEMORIA:                                                     ║
║  [Knowledge Graph] [Daily Notes] [Tacit Knowledge] [Decay]    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

**Rol del Agente:** Enlace entre intencion humana (directivas) y ejecucion deterministica (scripts), con memoria persistente que evoluciona. Lee instrucciones, **evalua arquitectura**, consulta memoria, toma decisiones, llama herramientas, maneja errores, persiste aprendizajes, mejora continuamente.

---

## Ejemplo de Flujo Completo

**Usuario:** "Configura mi espacio de trabajo"

**Agente:**

```
Verificando estructura...
 directives/ existe
 execution/ existe
 .tmp/ existe
 memory/ configurado (PARA + daily + tacit)
Entorno configurado con memoria persistente. Listo para recibir tarea.
```

**Usuario:** "Necesito un sistema que lea los tickets de soporte de mi email y los clasifique por urgencia"

**Agente:**

```
Evaluacion: [DET: 3 | STO: 5] -> Arquitectura HIBRIDA

Criterios detectados:
- [STO +2] Procesa lenguaje natural (emails)
- [STO +1] Requiere interpretacion contextual
- [STO +1] Clasificacion con multiples criterios
- [DET +1] Salida estructurada (categorias fijas)
- [DET +1] Se ejecutara en batch
- [DET +1] Requiere logging para auditoria

Memoria consultada: 0 hechos relevantes encontrados.
Creando directiva HIBRIDA para [clasificador-tickets]...
Creando entidad memory/projects/clasificador-tickets/
```

---

_Version 5.0 -- Con sistema de memoria persistente PARA, memory decay, y heartbeat automatizado_
