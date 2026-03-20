# Panel de Control para Agentes IA

Dashboard local para orquestar agentes de IA con gestión de tareas, proyectos, calendario, memorias y documentos. Construido con Next.js 16, React 19, SQLite y Tailwind CSS v4.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Capturas de pantalla

> _Tema oscuro por defecto con toggle a tema claro._

| Kanban | Calendario | Proyectos |
|--------|-----------|-----------|
| Tablero drag & drop con 4 columnas | Vista mensual/semanal con tareas programadas | Tarjetas con barra de progreso |

---

## Funcionalidades

- **Tablero Kanban** - Drag & drop entre columnas (Pendiente, En Progreso, Revision, Terminado) con prioridades y asignacion (usuario/agente)
- **Calendario** - Vista mensual con tareas programadas (unica, diaria, semanal, mensual, cron personalizado)
- **Proyectos** - Organizacion con progreso automatico, colores, iconos y alerta de inactividad (7+ dias)
- **Memorias** - Notas diarias en timeline + editor wiki de memoria a largo plazo con busqueda full-text (FTS5)
- **Documentos** - Gestion con renderizado Markdown (GFM), categorias y busqueda full-text
- **Cron Jobs** - Editor de scripts (Python/Bash/Node) con expresiones cron y ejecucion manual
- **Backups** - Exportar/importar base de datos completa como archivo comprimido
- **Tema oscuro/claro** - Toggle con variables CSS personalizadas
- **API REST completa** - 23 endpoints para integracion con agentes externos

---

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 |
| Estilos | Tailwind CSS v4 |
| Base de datos | SQLite (better-sqlite3) con WAL + FTS5 |
| Drag & Drop | @dnd-kit |
| Markdown | react-markdown + remark-gfm |
| Iconos | lucide-react |

---

## Requisitos previos

- **Node.js** >= 20
- **npm** >= 9 (incluido con Node.js)

> `better-sqlite3` compila un binding nativo. En Windows necesitas las [Build Tools de Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/) con el workload "Desktop development with C++". En Linux: `sudo apt install build-essential python3`. En macOS: `xcode-select --install`.

---

## Instalacion

### Desde el repositorio

```bash
git clone https://github.com/jhonsu01/PanelControlAgentes.git
cd PanelControlAgentes/dashboard
npm install
```

### Desde el release (tar.gz)

```bash
tar -xzf PanelControlAgentes-v1.0.0.tar.gz
cd PanelControlAgentes/dashboard
npm install
```

---

## Uso

### Desarrollo

```bash
cd dashboard
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Produccion

```bash
cd dashboard
npm run build
npm start
```

> La base de datos SQLite se crea automaticamente en `dashboard/data/database.db` al primer inicio. No requiere configuracion adicional.

---

## Estructura del proyecto

```
PanelControlAgentes/
├── dashboard/                  # Aplicacion Next.js
│   ├── src/
│   │   ├── app/                # Rutas y paginas (App Router)
│   │   │   ├── kanban/         # Tablero Kanban
│   │   │   ├── calendario/     # Calendario
│   │   │   ├── proyectos/      # Proyectos
│   │   │   ├── memorias/       # Memorias
│   │   │   ├── documentos/     # Documentos
│   │   │   ├── cronjobs/       # Cron Jobs
│   │   │   ├── backups/        # Backups
│   │   │   └── api/            # API REST (23 endpoints)
│   │   ├── components/         # Componentes React
│   │   │   ├── kanban/         # KanbanBoard, TaskCard, TaskForm
│   │   │   ├── calendario/     # CalendarGrid, DayDetail
│   │   │   ├── proyectos/      # ProjectCard, ProjectForm
│   │   │   ├── memorias/       # MemoryTimeline, LongTermEditor
│   │   │   ├── documentos/     # DocumentCard, DocumentForm
│   │   │   └── ui/             # Button, Modal, Input, Badge...
│   │   ├── hooks/              # Custom hooks (useTasks, useProjects...)
│   │   ├── lib/
│   │   │   ├── db.ts           # Inicializacion SQLite
│   │   │   └── schema.sql      # Schema completo (11 tablas + FTS5)
│   │   └── types/
│   │       └── index.ts        # Interfaces TypeScript
│   ├── data/                   # Base de datos (auto-generada)
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── CLAUDE.md                   # Instrucciones para agentes IA
└── README.md
```

---

## API REST

Todos los endpoints estan en `/api/` y aceptan/retornan JSON.

### Tareas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/tasks` | Listar tareas (filtros: `status`, `project_id`, `assigned`) |
| POST | `/api/tasks` | Crear tarea |
| GET | `/api/tasks/:id` | Obtener tarea |
| PUT | `/api/tasks/:id` | Actualizar tarea |
| DELETE | `/api/tasks/:id` | Eliminar tarea |

### Proyectos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/projects` | Listar proyectos |
| POST | `/api/projects` | Crear proyecto |
| GET | `/api/projects/:id` | Obtener proyecto con tareas |
| PUT | `/api/projects/:id` | Actualizar proyecto |
| DELETE | `/api/projects/:id` | Eliminar proyecto |

### Tareas Programadas

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/scheduled-tasks` | Listar tareas programadas |
| POST | `/api/scheduled-tasks` | Crear tarea programada |
| PUT | `/api/scheduled-tasks/:id` | Actualizar |
| DELETE | `/api/scheduled-tasks/:id` | Eliminar |
| POST | `/api/scheduled-tasks/:id/execute` | Ejecutar ahora |
| GET | `/api/scheduled-tasks/today` | Tareas de hoy |

### Memorias

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/memories` | Listar memorias |
| POST | `/api/memories` | Crear memoria |
| PUT | `/api/memories/:id` | Actualizar |
| DELETE | `/api/memories/:id` | Eliminar |
| GET | `/api/memories/search?q=texto` | Busqueda full-text |
| GET | `/api/long-term-memory` | Leer memoria a largo plazo |
| PUT | `/api/long-term-memory` | Actualizar memoria a largo plazo |

### Documentos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/documents` | Listar documentos |
| POST | `/api/documents` | Crear documento |
| PUT | `/api/documents/:id` | Actualizar |
| DELETE | `/api/documents/:id` | Eliminar |
| GET | `/api/documents/search?q=texto` | Busqueda full-text |
| GET | `/api/documents/:id/download` | Descargar |

### Otros

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET/POST | `/api/categories` | Gestionar categorias |
| GET/POST | `/api/cron-jobs` | Gestionar cron jobs |
| PUT/DELETE | `/api/cron-jobs/:id` | CRUD cron job |
| GET/POST | `/api/backups` | Listar/crear backups |
| POST | `/api/backups/import` | Restaurar backup |

---

## Base de datos

SQLite con modo WAL (Write-Ahead Log) para concurrencia y FTS5 para busqueda full-text.

**Tablas principales:**

| Tabla | Descripcion |
|-------|-------------|
| `projects` | Proyectos con color, icono y estado |
| `tasks` | Tareas Kanban con status, prioridad y posicion |
| `scheduled_tasks` | Tareas del calendario con frecuencia y cron |
| `memories` | Notas diarias con categoria |
| `long_term_memory` | Conocimiento persistente (wiki) |
| `documents` | Documentos Markdown con categoria |
| `cron_jobs` | Scripts programables (Python/Bash/Node) |
| `backups` | Registro de exportaciones/importaciones |
| `memories_fts` / `documents_fts` | Indices FTS5 con triggers automaticos |

La base de datos se auto-inicializa desde `src/lib/schema.sql` al primer request.

---

## Integracion con Agentes IA

Este dashboard esta disenado para funcionar como centro de control de agentes IA. Los agentes pueden:

1. **Leer/escribir tareas** via la API REST para reportar progreso
2. **Registrar memorias** para persistir conocimiento entre sesiones
3. **Consultar documentos** como base de conocimiento
4. **Ejecutar cron jobs** para automatizar tareas recurrentes

El archivo `CLAUDE.md` contiene las instrucciones operativas para agentes que siguen la arquitectura de 4 capas (Directiva, Orquestacion, Ejecucion, Memoria) con el sistema PARA.

---

## Licencia

MIT
