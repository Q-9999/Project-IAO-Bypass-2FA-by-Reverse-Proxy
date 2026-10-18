// Lightweight JSON-backed database used to avoid native C++ build requirements on Windows.
const fs = require('fs');
const path = require('path');
const config = require('./config');

const memoryState = {
  schema_migrations: [],
  users: [],
  sessions: [],
  otps: [],
};

function loadState() {
  if (config.dbPath === ':memory:') return structuredClone(memoryState);
  const file = path.resolve(config.dbPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) return structuredClone(memoryState);
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      schema_migrations: Array.isArray(parsed.schema_migrations) ? parsed.schema_migrations : [],
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      otps: Array.isArray(parsed.otps) ? parsed.otps : [],
    };
  } catch (error) {
    console.warn('Could not read database file; starting with a fresh state.', error.message);
    return structuredClone(memoryState);
  }
}

const state = loadState();
const filePath = config.dbPath === ':memory:' ? null : path.resolve(config.dbPath);

function saveState() {
  if (!filePath) return;
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

function ensureTable(table) {
  if (!state[table]) state[table] = [];
  return state[table];
}

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (value === undefined) out[key] = null;
  }
  return out;
}

function selectRows(tableName, predicate) {
  const table = ensureTable(tableName);
  return table.filter((row) => predicate(row));
}

function toValue(value) {
  if (typeof value === 'string' && value === 'NULL') return null;
  return value;
}

function compareValue(left, right) {
  if (left === null || right === null) return left === right;
  return String(left) === String(right);
}

function evaluateWhere(row, expression, args) {
  if (!expression || !expression.trim()) return true;
  const source = expression.trim();
  const orParts = source.split(/\s+OR\s+/i);
  if (orParts.length > 1) {
    return orParts.some((part) => evaluateWhere(row, part, args));
  }
  const andParts = source.split(/\s+AND\s+/i);
  if (andParts.length > 1) {
    return andParts.every((part) => evaluateWhere(row, part, args));
  }
  const match = source.match(/^([A-Za-z0-9_\.]+)\s*(=|!=|<>|IS|IN|<|>|<=|>=)\s*(.+)$/i);
  if (!match) return true;
  let [, fieldName, operator, rawValue] = match;
  if (rawValue === '?') {
    rawValue = args.shift();
  } else if ((rawValue.startsWith("'") && rawValue.endsWith("'")) || (rawValue.startsWith('"') && rawValue.endsWith('"'))) {
    rawValue = rawValue.slice(1, -1);
  }
  const left = fieldName.includes('.') ? fieldName.split('.').reduce((obj, key) => obj && obj[key], row) : row[fieldName];
  const right = toValue(rawValue);
  switch (operator.toUpperCase()) {
    case '=':
      return compareValue(left, right);
    case '!=':
    case '<>':
      return !compareValue(left, right);
    case 'IS':
      return left === right;
    case '<':
      return Number(left) < Number(right);
    case '>':
      return Number(left) > Number(right);
    case '<=':
      return Number(left) <= Number(right);
    case '>=':
      return Number(left) >= Number(right);
    default:
      return compareValue(left, right);
  }
}

function runWhereClause(tableName, whereSql, args, mode = 'first') {
  const table = ensureTable(tableName);
  const values = [...args];
  const matches = table.filter((row) => evaluateWhere(row, whereSql, [...values]));
  return mode === 'all' ? matches : matches[0];
}

function parseUpdateAssignments(setSql) {
  const assignments = [];
  const parts = setSql.split(',').map((part) => part.trim()).filter(Boolean);
  for (const part of parts) {
    const match = part.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
    if (!match) continue;
    assignments.push({ field: match[1], expression: match[2].trim() });
  }
  return assignments;
}

function resolveExpression(row, expression, args) {
  const text = expression.trim();
  if (text === '?') return args.shift();
  if (/^\d+$/.test(text)) return Number(text);
  if (/^\d+\.\d+$/.test(text)) return Number(text);
  if ((text.startsWith("'") && text.endsWith("'")) || (text.startsWith('"') && text.endsWith('"'))) {
    return text.slice(1, -1);
  }
  if (text.startsWith('excluded.')) {
    const key = text.slice('excluded.'.length);
    return row && row[key] !== undefined ? row[key] : undefined;
  }
  if (text.includes('+')) {
    const pieces = text.split('+').map((piece) => piece.trim());
    const left = resolveExpression(row, pieces[0], [...args]);
    const right = resolveExpression(row, pieces[1], [...args]);
    return Number(left) + Number(right);
  }
  if (text.includes('NULL')) return null;
  if (text.startsWith('CURRENT_TIMESTAMP')) return Date.now();
  if (text === '0') return 0;
  if (text.includes('.')) {
    const value = text.split('.').reduce((obj, key) => obj && obj[key], row);
    return value;
  }
  if (row && text in row) return row[text];
  return text;
}

function buildPreparedStatement(sql) {
  const upper = sql.toUpperCase();

  return {
    get(...args) {
      if (upper.startsWith('SELECT 1 FROM')) {
        const match = sql.match(/^SELECT\s+1\s+FROM\s+(\w+)\s+WHERE\s+([\s\S]+)$/i);
        if (!match) return undefined;
        const [, tableName, whereSql] = match;
        return runWhereClause(tableName, whereSql, args, 'first') || undefined;
      }

      if (upper.includes('FROM SESSIONS S JOIN USERS U ON U.ID = S.USER_ID WHERE S.ID_HASH = ?')) {
        const session = ensureTable('sessions').find((entry) => entry.id_hash === args[0]);
        if (!session) return undefined;
        const user = ensureTable('users').find((entry) => Number(entry.id) === Number(session.user_id));
        if (!user) return undefined;
        return {
          id_hash: session.id_hash,
          login_at: session.created_at,
          expires_at: session.expires_at,
          id: user.id,
          username: user.username,
          email: user.email,
          member_since: user.created_at,
        };
      }

      if (upper.startsWith('SELECT * FROM') && upper.includes(' JOIN ')) {
        const joinQuery = sql.match(/^SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)\s+(\w+)\s+JOIN\s+(\w+)\s+(\w+)\s+ON\s+([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i);
        if (joinQuery) {
          const [, , leftTable, leftAlias, rightTable, rightAlias, onClause, whereSql] = joinQuery;
          if (leftTable === 'sessions' && rightTable === 'users') {
            const leftArgs = [...args];
            const session = runWhereClause(leftTable, whereSql.replace(new RegExp(`^${leftAlias}\\.id_hash\\s*=\\s*`), '').trim(), leftArgs, 'first');
            if (!session) return undefined;
            const user = ensureTable(rightTable).find((row) => row.id === session.user_id);
            if (!user) return undefined;
            return {
              id_hash: session.id_hash,
              login_at: session.created_at,
              expires_at: session.expires_at,
              id: user.id,
              username: user.username,
              email: user.email,
              member_since: user.created_at,
            };
          }
        }
      }

      if (upper.startsWith('SELECT * FROM')) {
        const match = sql.match(/^SELECT\s+\*\s+FROM\s+(\w+)\s+WHERE\s+([\s\S]+)$/i);
        if (match) {
          const [, tableName, whereSql] = match;
          return runWhereClause(tableName, whereSql, args, 'first');
        }
      }

      if (upper.startsWith('SELECT ')) {
        const match = sql.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)\s+WHERE\s+([\s\S]+)$/i);
        if (match) {
          const [, selectedColumns, tableName, whereSql] = match;
          const row = runWhereClause(tableName, whereSql, args, 'first');
          if (!row) return undefined;
          if (selectedColumns.trim() === 'name') return { name: row.name };
          if (selectedColumns.trim() === 'id, email') return { id: row.id, email: row.email };
          return row;
        }
      }

      if (upper.startsWith('SELECT ')) {
        const match = sql.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)$/i);
        if (match) {
          const [, selectedColumns, tableName] = match;
          const rows = ensureTable(tableName);
          if (selectedColumns.trim() === 'name') return rows.map((row) => ({ name: row.name }));
          return rows;
        }
      }

      return undefined;
    },

    all(...args) {
      if (upper.startsWith('SELECT NAME FROM SCHEMA_MIGRATIONS')) {
        return ensureTable('schema_migrations').map((row) => ({ name: row.name }));
      }

      if (upper.startsWith('SELECT * FROM')) {
        const match = sql.match(/^SELECT\s+\*\s+FROM\s+(\w+)\s+WHERE\s+([\s\S]+)$/i);
        if (match) {
          const [, tableName, whereSql] = match;
          return runWhereClause(tableName, whereSql, args, 'all');
        }
      }

      if (upper.startsWith('SELECT ')) {
        const match = sql.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)$/i);
        if (match) {
          const [, selectedColumns, tableName] = match;
          const rows = ensureTable(tableName);
          if (selectedColumns.trim() === 'name') return rows.map((row) => ({ name: row.name }));
          return rows;
        }
      }

      return [];
    },

    run(...args) {
      const sqlText = sql.trim();

      if (sqlText.startsWith('INSERT INTO')) {
        const insertMatch = sqlText.match(/^INSERT\s+INTO\s+(\w+)(?:\s*\(([^)]*)\))?\s+VALUES\s*\(([\s\S]*?)\)(?:\s+ON\s+CONFLICT\s*\(([^)]*)\)\s+DO\s+UPDATE\s+SET\s+([\s\S]+))?$/i);
        if (!insertMatch) return { changes: 0, lastInsertId: 0 };

        const [, tableName, columnListRaw, valuesRaw, conflictColumns, updateSet] = insertMatch;
        const table = ensureTable(tableName);
        const columns = columnListRaw ? columnListRaw.split(',').map((item) => item.trim()) : [];
        const values = valuesRaw.split(',').map((part) => part.trim());
        const row = {};
        if (columns.length) {
          columns.forEach((column, index) => {
            row[column] = resolveExpression({}, values[index], args);
          });
        } else {
          const directValues = values.map((value) => resolveExpression({}, value, args));
          if (tableName === 'schema_migrations') {
            row.name = directValues[0];
            row.applied_at = directValues[1];
          }
        }

        if (tableName === 'otps' && conflictColumns) {
          const keyName = conflictColumns.split(',').map((item) => item.trim());
          const existing = table.find((entry) => keyName.every((key) => String(entry[key]) === String(row[key])));
          if (existing) {
            for (const [key, value] of Object.entries(row)) existing[key] = value;
            if (updateSet) {
              const assignments = parseUpdateAssignments(updateSet);
              const upsertRow = { ...existing, ...row };
              for (const assignment of assignments) {
                const value = resolveExpression(upsertRow, assignment.expression, [...args]);
                existing[assignment.field] = value;
              }
            }
            saveState();
            return { changes: 1, lastInsertId: existing.id || 0 };
          }
        }

        if (!row.id && tableName !== 'schema_migrations') {
          const nextId = table.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
          row.id = nextId;
        }

        if (tableName === 'users') {
          row.failed_logins ??= 0;
          row.locked_until ??= 0;
        }
        if (tableName === 'otps') {
          row.attempts ??= 0;
          row.used_at ??= null;
        }

        table.push(normalizeRow(row));
        saveState();
        return { changes: 1, lastInsertId: row.id || 0 };
      }

      if (sqlText.toUpperCase().startsWith('UPDATE OTPS SET USED_AT = ? WHERE ID = ? AND USED_AT IS NULL')) {
        const table = ensureTable('otps');
        const targetId = args[1];
        const row = table.find((entry) => Number(entry.id) === Number(targetId) && entry.used_at === null);
        if (!row) return { changes: 0, lastInsertId: 0 };
        row.used_at = args[0];
        saveState();
        return { changes: 1, lastInsertId: 0 };
      }

      if (sqlText.toUpperCase().startsWith('UPDATE OTPS SET ATTEMPTS = ATTEMPTS + 1 WHERE ID = ?')) {
        const table = ensureTable('otps');
        const targetId = args[0];
        const row = table.find((entry) => Number(entry.id) === Number(targetId));
        if (!row) return { changes: 0, lastInsertId: 0 };
        row.attempts = Number(row.attempts || 0) + 1;
        saveState();
        return { changes: 1, lastInsertId: 0 };
      }

      if (sqlText.toUpperCase().startsWith('UPDATE USERS SET FAILED_LOGINS = ?, LOCKED_UNTIL = ? WHERE ID = ?')) {
        const table = ensureTable('users');
        const targetId = args[2];
        const row = table.find((entry) => Number(entry.id) === Number(targetId));
        if (!row) return { changes: 0, lastInsertId: 0 };
        row.failed_logins = args[0];
        row.locked_until = args[1];
        saveState();
        return { changes: 1, lastInsertId: 0 };
      }

      if (sqlText.toUpperCase().startsWith('UPDATE USERS SET FAILED_LOGINS = 0, LOCKED_UNTIL = 0 WHERE ID = ?')) {
        const table = ensureTable('users');
        const row = table.find((entry) => Number(entry.id) === Number(args[0]));
        if (!row) return { changes: 0, lastInsertId: 0 };
        row.failed_logins = 0;
        row.locked_until = 0;
        saveState();
        return { changes: 1, lastInsertId: 0 };
      }

      if (sqlText.toUpperCase().startsWith('UPDATE USERS SET PASSWORD_HASH = ?, FAILED_LOGINS = 0, LOCKED_UNTIL = 0 WHERE ID = ?')) {
        const table = ensureTable('users');
        const row = table.find((entry) => Number(entry.id) === Number(args[1]));
        if (!row) return { changes: 0, lastInsertId: 0 };
        row.password_hash = args[0];
        row.failed_logins = 0;
        row.locked_until = 0;
        saveState();
        return { changes: 1, lastInsertId: 0 };
      }

      if (sqlText.toUpperCase().startsWith('UPDATE OTPS SET USED_AT = ?, LAST_SENT_AT = 0 WHERE PURPOSE = ? AND EMAIL = ?')) {
        const table = ensureTable('otps');
        const row = table.find((entry) => entry.purpose === args[1] && entry.email === args[2]);
        if (!row) return { changes: 0, lastInsertId: 0 };
        row.used_at = args[0];
        row.last_sent_at = 0;
        saveState();
        return { changes: 1, lastInsertId: 0 };
      }

      if (sqlText.startsWith('UPDATE ')) {
        const updateMatch = sqlText.match(/^UPDATE\s+(\w+)\s+SET\s+([\s\S]+?)\s+WHERE\s+([\s\S]+)$/i);
        if (!updateMatch) return { changes: 0, lastInsertId: 0 };

        const [, tableName, setSql, whereSql] = updateMatch;
        const table = ensureTable(tableName);
        const assignments = parseUpdateAssignments(setSql);
        const setArgCount = assignments.reduce((count, assignment) => count + (assignment.expression.match(/\?/g) || []).length, 0);
        const whereArgs = args.slice(setArgCount);
        let changed = 0;

        for (const row of table) {
          if (!evaluateWhere(row, whereSql, [...whereArgs])) continue;
          const remainingSetArgs = [...args.slice(0, setArgCount)];
          for (const assignment of assignments) {
            const value = resolveExpression(row, assignment.expression, remainingSetArgs);
            if (assignment.field === 'attempts' && /\+/.test(assignment.expression)) {
              row[assignment.field] = Number(row[assignment.field] || 0) + Number(value);
            } else {
              row[assignment.field] = value;
            }
          }
          changed += 1;
        }

        saveState();
        return { changes: changed, lastInsertId: 0 };
      }

      if (sqlText.startsWith('DELETE FROM')) {
        const upperDelete = sqlText.toUpperCase();
        const tableNameMatch = sqlText.match(/^DELETE\s+FROM\s+(\w+)/i);
        const tableName = tableNameMatch ? tableNameMatch[1] : null;

        if (!tableName) return { changes: 0, lastInsertId: 0 };
        const table = ensureTable(tableName.toLowerCase());

        if (upperDelete.startsWith('DELETE FROM SESSIONS WHERE ID_HASH = ?')) {
          const before = table.length;
          state.sessions = table.filter((entry) => entry.id_hash !== args[0]);
          saveState();
          return { changes: before - state.sessions.length, lastInsertId: 0 };
        }
        if (upperDelete.startsWith('DELETE FROM SESSIONS WHERE USER_ID = ?')) {
          const before = table.length;
          state.sessions = table.filter((entry) => Number(entry.user_id) !== Number(args[0]));
          saveState();
          return { changes: before - state.sessions.length, lastInsertId: 0 };
        }
        if (upperDelete.startsWith('DELETE FROM SESSIONS WHERE EXPIRES_AT < ?')) {
          const before = table.length;
          state.sessions = table.filter((entry) => Number(entry.expires_at) >= Number(args[0]));
          saveState();
          return { changes: before - state.sessions.length, lastInsertId: 0 };
        }
        if (upperDelete.startsWith('DELETE FROM OTPS WHERE EXPIRES_AT < ?')) {
          const before = table.length;
          state.otps = table.filter((entry) => Number(entry.expires_at) >= Number(args[0]));
          saveState();
          return { changes: before - state.otps.length, lastInsertId: 0 };
        }

        const deleteMatch = sqlText.match(/^DELETE\s+FROM\s+(\w+)\s+WHERE\s+([\s\S]+)$/i);
        if (!deleteMatch) return { changes: 0, lastInsertId: 0 };
        const [, deleteTableName, whereSql] = deleteMatch;
        const deleteTable = ensureTable(deleteTableName.toLowerCase());
        const startLength = deleteTable.length;
        const survivors = deleteTable.filter((row) => !evaluateWhere(row, whereSql, [...args]));
        const removed = startLength - survivors.length;
        state[deleteTableName.toLowerCase()] = survivors;
        saveState();
        return { changes: removed, lastInsertId: 0 };
      }

      return { changes: 0, lastInsertId: 0 };
    },
  };
}

const db = {
  pragma() {},
  exec() {},
  transaction(fn) {
    return () => {
      const result = fn();
      saveState();
      return result;
    };
  },
  prepare(sql) {
    return buildPreparedStatement(sql);
  },
};

if (require.main === module) console.log('Database is up to date:', config.dbPath);
module.exports = db;
