-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  archived INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tasks (Kanban)
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','en_progreso','revision','terminado')),
  priority TEXT NOT NULL DEFAULT 'media'
    CHECK (priority IN ('alta','media','baja')),
  assigned TEXT DEFAULT 'yo'
    CHECK (assigned IN ('yo','agente')),
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  position INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Scheduled Tasks (Calendar)
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'unica'
    CHECK (frequency IN ('unica','diaria','semanal','mensual','personalizada')),
  cron_expression TEXT,
  scheduled_time TEXT NOT NULL,
  scheduled_date TEXT,
  status TEXT NOT NULL DEFAULT 'activa'
    CHECK (status IN ('activa','pausada')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Scheduled Task Executions
CREATE TABLE IF NOT EXISTS scheduled_task_executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scheduled_task_id INTEGER NOT NULL REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
  executed_at TEXT DEFAULT (datetime('now')),
  result TEXT
);

-- Memories
CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'nota'
    CHECK (category IN ('conversacion','decision','insight','nota')),
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  memory_date TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Long Term Memory
CREATE TABLE IF NOT EXISTS long_term_memory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  section TEXT DEFAULT 'general',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'otro',
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'document'
    CHECK (type IN ('document','memory'))
);

-- Seed default document categories
INSERT OR IGNORE INTO categories (name, type) VALUES
  ('planificacion','document'),
  ('arquitectura','document'),
  ('PRD','document'),
  ('newsletter','document'),
  ('contenido','document'),
  ('otro','document');

-- FTS5 for memories
CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
  title, content, content=memories, content_rowid=id
);

-- FTS5 triggers for memories
CREATE TRIGGER IF NOT EXISTS memories_ai AFTER INSERT ON memories BEGIN
  INSERT INTO memories_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS memories_ad AFTER DELETE ON memories BEGIN
  INSERT INTO memories_fts(memories_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
END;

CREATE TRIGGER IF NOT EXISTS memories_au AFTER UPDATE ON memories BEGIN
  INSERT INTO memories_fts(memories_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
  INSERT INTO memories_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

-- FTS5 for documents
CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
  title, content, content=documents, content_rowid=id
);

-- FTS5 triggers for documents
CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO documents_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
  INSERT INTO documents_fts(documents_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
END;

CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
  INSERT INTO documents_fts(documents_fts, rowid, title, content) VALUES ('delete', old.id, old.title, old.content);
  INSERT INTO documents_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

-- Cron Jobs (scripts programables)
CREATE TABLE IF NOT EXISTS cron_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  script TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'python'
    CHECK (language IN ('python','bash','node')),
  cron_expression TEXT,
  scheduled_task_id INTEGER REFERENCES scheduled_tasks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'activo'
    CHECK (status IN ('activo','pausado','borrador')),
  last_run TEXT,
  last_result TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Backups log
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  size_bytes INTEGER,
  type TEXT NOT NULL DEFAULT 'export'
    CHECK (type IN ('export','import')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed long term memory with default entry
INSERT OR IGNORE INTO long_term_memory (id, title, content, section) VALUES
  (1, 'Memoria a Largo Plazo', '# Memoria a Largo Plazo

## Flujos de Trabajo
_(por definir)_

## Objetivos
_(por definir)_

## Perfil
_(por definir)_

## Reglas del Agente
_(por definir)_
', 'general');
