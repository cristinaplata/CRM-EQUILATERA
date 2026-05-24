/**
 * EQUILATERA CRM — Google Sheets Sync
 * ─────────────────────────────────────────────────────────────────────────────
 * Paste this entire file into Google Apps Script (Extensions → Apps Script)
 * inside the licitaciones Google Sheet.
 *
 * Setup steps:
 *   1. Paste this code into Apps Script.
 *   2. Edit the two constants below (CRM_URL and SYNC_SECRET).
 *   3. Run "installTriggers()" once manually (▶ button) to register the triggers.
 *   4. Authorize the script when prompted.
 *
 * The script will then:
 *   - Sync automatically every hour (time-based trigger)
 *   - Allow manual sync from the custom "CRM" menu
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── CONFIG ──────────────────────────────────────────────────────────────────
const CRM_URL     = "https://crm.equilatera.com.co/api/sync/licitaciones"
const SYNC_SECRET = "REEMPLAZA_ESTE_VALOR_CON_TU_SYNC_SECRET"  // ← copiar de Coolify

// Owner emails by name (must match CRM users)
const OWNER_MAP = {
  "cristina":  "cristina@equilatera.com.co",
  "cristina plata": "cristina@equilatera.com.co",
  "monica":    "monica@equilatera.com.co",
  "monica cortes": "monica@equilatera.com.co",
  "diana":     "diana@equilatera.com.co",
  "diana soto": "diana@equilatera.com.co",
}

const DEFAULT_OWNER = "cristina@equilatera.com.co"

// ── SHEET → STAGE MAPPING ────────────────────────────────────────────────────
const SHEET_STAGE = {
  "Licitaciones presentadas":   null,             // derived from "enviada" / "aprobada" columns
  "revisadas y No presentadas": "not_submitted",  // reviewed but decided not to present
  "licitaciones No ganadas":    "lost",
  "Licitaciones SI ganadas":    "won",
  "Estudios de mercado":        "sent",
}

// Column indices (0-based) for sheets with the standard licitaciones layout
const COL = {
  TEMA:         0,
  ORGANIZACION: 1,
  FECHA_APERTURA: 2,
  FECHA_CIERRE:   3,
  DURACION:       4,
  EQ_SOLA:        5,
  ALIADOS:        6,
  TIENE_PRECIO:   7,
  PRECIO:         8,
  FACTIBLE:       9,
  LINK:          10,
  COMENTARIOS:   11,
  ENVIADA:       12,
  APROBADA:      13,
  FEEDBACK:      14,
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function toBoolean(val) {
  if (val === null || val === undefined || val === "") return null
  const s = String(val).trim().toLowerCase()
  if (["si", "sí", "yes", "s", "true", "1", "x"].includes(s)) return true
  if (["no", "false", "0"].includes(s)) return false
  return null
}

function toDateString(val) {
  if (!val) return null
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null
    return val.toISOString().split("T")[0]
  }
  const s = String(val).trim()
  if (!s) return null
  // Try to parse "9 de abril" style dates (Spanish) — fallback to raw string
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0]
}

function resolveOwner(responsable) {
  if (!responsable) return DEFAULT_OWNER
  const key = String(responsable).split(/[\/,]/)[0].trim().toLowerCase()
  return OWNER_MAP[key] ?? DEFAULT_OWNER
}

function resolveStage(sheetName, enviada, aprobada) {
  const fixed = SHEET_STAGE[sheetName]
  if (fixed !== null && fixed !== undefined) return fixed

  // "Licitaciones presentadas" — derive from columns
  const env = toBoolean(enviada)
  const apr = toBoolean(aprobada)
  if (env === true && apr === true)  return "won"
  if (env === true && apr === false) return "lost"
  if (env === true)                  return "sent"
  if (env === false)                 return "preparing"
  return "evaluating"
}

// ── CORE SYNC ────────────────────────────────────────────────────────────────

function syncSheet(sheet) {
  const sheetName = sheet.getName()
  if (!(sheetName in SHEET_STAGE)) {
    Logger.log("Saltando hoja: " + sheetName)
    return { sent: 0, sheetName }
  }

  const allData = sheet.getDataRange().getValues()

  // Find the header row (contains "Temática" or "nombre")
  let headerRow = -1
  for (let i = 0; i < Math.min(allData.length, 5); i++) {
    const first = String(allData[i][0]).toLowerCase()
    if (first.includes("temática") || first.includes("tematica") || first.includes("nombre")) {
      headerRow = i
      break
    }
  }
  if (headerRow === -1) {
    Logger.log("No se encontró fila de encabezado en: " + sheetName)
    return { sent: 0, sheetName }
  }

  const rows = []
  for (let i = headerRow + 1; i < allData.length; i++) {
    const r = allData[i]
    const tema = String(r[COL.TEMA] ?? "").trim()
    if (!tema) continue  // skip empty rows

    const stage = resolveStage(
      sheetName,
      r[COL.ENVIADA],
      r[COL.APROBADA]
    )

    rows.push({
      sheetRef:      sheetName + "::" + (i + 1),
      tema,
      organizacion:  String(r[COL.ORGANIZACION] ?? "").trim() || null,
      fechaApertura: toDateString(r[COL.FECHA_APERTURA]),
      fechaCierre:   toDateString(r[COL.FECHA_CIERRE]),
      duracion:      String(r[COL.DURACION] ?? "").trim() || null,
      eqSola:        toBoolean(r[COL.EQ_SOLA]),
      aliados:       String(r[COL.ALIADOS] ?? "").trim() || null,
      tienePrecio:   toBoolean(r[COL.TIENE_PRECIO]),
      precio:        String(r[COL.PRECIO] ?? "").trim() || null,
      factible:      toBoolean(r[COL.FACTIBLE]),
      link:          String(r[COL.LINK] ?? "").trim() || null,
      comentarios:   String(r[COL.COMENTARIOS] ?? "").trim() || null,
      feedback:      String(r[COL.FEEDBACK] ?? "").trim() || null,
      stage,
      ownerEmail:    null,  // no responsable column in licitaciones — uses default
    })
  }

  if (rows.length === 0) return { sent: 0, sheetName }

  // Send in batches of 50
  let totalSent = 0
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50)
    const options = {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + SYNC_SECRET },
      payload: JSON.stringify({ rows: batch }),
      muteHttpExceptions: true,
    }
    const response = UrlFetchApp.fetch(CRM_URL, options)
    const code = response.getResponseCode()
    const text = response.getContentText()
    Logger.log(sheetName + " batch " + i + ": HTTP " + code + " — " + text.slice(0, 200))
    if (code === 200) totalSent += batch.length
  }

  return { sent: totalSent, sheetName }
}

// ── PUBLIC FUNCTIONS ─────────────────────────────────────────────────────────

/** Sync all sheets — called by time trigger and from menu */
function syncAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheets = ss.getSheets()
  let total = 0

  for (const sheet of sheets) {
    const result = syncSheet(sheet)
    total += result.sent
    Logger.log("✓ " + result.sheetName + ": " + result.sent + " filas enviadas")
  }

  Logger.log("✅ Sync completo: " + total + " filas procesadas")
  SpreadsheetApp.getActiveSpreadsheet()
    .toast("✅ Sync completo: " + total + " registros enviados al CRM", "Equilatera CRM", 5)
}

/** Install time-based trigger (run once manually) */
function installTriggers() {
  // Remove existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers()
  for (const t of triggers) {
    if (t.getHandlerFunction() === "syncAllSheets") {
      ScriptApp.deleteTrigger(t)
    }
  }

  // Sync every hour
  ScriptApp.newTrigger("syncAllSheets")
    .timeBased()
    .everyHours(1)
    .create()

  Logger.log("✅ Trigger instalado: sync cada 1 hora")
  SpreadsheetApp.getActiveSpreadsheet()
    .toast("✅ Trigger instalado. Sync automático cada hora.", "Equilatera CRM", 5)
}

/** Add custom menu when sheet opens */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🔄 CRM Equilatera")
    .addItem("Sincronizar ahora", "syncAllSheets")
    .addItem("Instalar sync automático (1x)", "installTriggers")
    .addToUi()
}
