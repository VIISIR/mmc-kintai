/* 自動生成：bash test/build-mock.sh で作り直す。GAS のコードをブラウザで動かすデモ用。*/
(function(){
/* Apps Script のサービスを最小限に模した in-memory 実装（テスト用）。
 * SpreadsheetApp / CacheService / PropertiesService / LockService / Utilities / UrlFetchApp / ScriptApp / Logger / ContentService
 */
var __NOW__ = new Date('2026-10-19T14:10:00+09:00').getTime();
const __RealDate = Date;
Date = class extends __RealDate {
  constructor(...a) { if (a.length === 0) super(__NOW__); else super(...a); }
  static now() { return __NOW__; }
};
function setNow(iso) { __NOW__ = new __RealDate(iso).getTime(); }

function colLetterToIndex(s) { let n = 0; for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 64); return n; }

class Range {
  constructor(sheet, r, c, nr, nc) { this.sheet = sheet; this.r = r; this.c = c; this.nr = nr; this.nc = nc; }
  getValues() { const out = []; for (let i = 0; i < this.nr; i++) { const row = this.sheet.rows[this.r - 1 + i] || []; const o = []; for (let j = 0; j < this.nc; j++) { const v = row[this.c - 1 + j]; o.push(v === undefined || v === null ? '' : v); } out.push(o); } return out; }
  getValue() { return this.getValues()[0][0]; }
  setValues(vals) { vals.forEach((row, i) => row.forEach((v, j) => this.sheet.set(this.r + i, this.c + j, v))); return this; }
  setValue(v) { this.sheet.set(this.r, this.c, v); return this; }
  setNumberFormat() { return this; } setFontWeight() { return this; } setBackground() { return this; } setFontColor() { return this; } setFontSize() { return this; }
}
class Sheet {
  constructor(name) { this.name = name; this.rows = []; this.maxRows = 1000; }
  getName() { return this.name; }
  set(r, c, v) { while (this.rows.length < r) this.rows.push([]); const row = this.rows[r - 1]; while (row.length < c) row.push(''); row[c - 1] = v; }
  getLastRow() { let last = 0; this.rows.forEach((row, i) => { if (row.some(v => v !== '' && v !== null && v !== undefined)) last = i + 1; }); return last; }
  getLastColumn() { let m = 0; this.rows.forEach(row => { for (let j = row.length - 1; j >= 0; j--) { if (row[j] !== '' && row[j] != null) { m = Math.max(m, j + 1); break; } } }); return m; }
  getMaxRows() { return this.maxRows; }
  getRange(a, b, c, d) {
    if (typeof a === 'string') { const m = a.match(/^([A-Z]+):([A-Z]+)$/); if (m) return new Range(this, 1, colLetterToIndex(m[1]), this.maxRows, colLetterToIndex(m[2]) - colLetterToIndex(m[1]) + 1); throw new Error('unsupported A1: ' + a); }
    return new Range(this, a, b, c || 1, d || 1);
  }
  getDataRange() { const lr = Math.max(1, this.getLastRow()), lc = Math.max(1, this.getLastColumn()); return new Range(this, 1, 1, lr, lc); }
  appendRow(vals) { const r = this.getLastRow() + 1; vals.forEach((v, j) => this.set(r, j + 1, v)); return this; }
  deleteRow(r) { this.rows.splice(r - 1, 1); return this; }
  deleteRows(r, n) { this.rows.splice(r - 1, n); return this; }
  clear() { this.rows = []; return this; }
  setFrozenRows() { return this; } autoResizeColumns() { return this; }
}
class Spreadsheet {
  constructor() { this.sheets = [new Sheet('シート1')]; }
  getSheetByName(n) { return this.sheets.find(s => s.name === n) || null; }
  insertSheet(n) { const s = new Sheet(n); this.sheets.push(s); return s; }
  getSheets() { return this.sheets; }
  deleteSheet(s) { this.sheets = this.sheets.filter(x => x !== s); }
  setSpreadsheetTimeZone() {}
}
const __SS = new Spreadsheet();
const SpreadsheetApp = { getActiveSpreadsheet: () => __SS, flush() {}, getUi() { return { createMenu: () => ({ addItem() { return this; }, addSeparator() { return this; }, addToUi() {} }) }; } };

const __cache = {};
const CacheService = { getScriptCache: () => ({ get: k => (__cache[k] === undefined ? null : __cache[k]), put: (k, v) => { __cache[k] = v; }, remove: k => { delete __cache[k]; }, removeAll: ks => ks.forEach(k => delete __cache[k]) }) };
function clearMockCache() { Object.keys(__cache).forEach(k => delete __cache[k]); }

const __props = {};
const PropertiesService = { getScriptProperties: () => ({ getProperty: k => (__props[k] === undefined ? null : __props[k]), setProperty: (k, v) => { __props[k] = String(v); }, deleteProperty: k => { delete __props[k]; }, getProperties: () => Object.assign({}, __props) }) };
const LockService = { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) };
let __uuid = 0;
const Utilities = {
  getUuid: () => String(++__uuid).padStart(8, '0') + '-aaaa-4bbb-8ccc-ddddddddeeee',
  DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
  computeDigest: (alg, str) => { // テスト用の簡易ハッシュ（衝突しなければよい）
    let h1 = 0x811c9dc5, h2 = 0x12345678; for (let i = 0; i < str.length; i++) { h1 = Math.imul(h1 ^ str.charCodeAt(i), 16777619) >>> 0; h2 = Math.imul(h2 + str.charCodeAt(i), 2654435761) >>> 0; }
    const out = []; for (let i = 0; i < 32; i++) out.push(((i % 2 ? h1 : h2) >> ((i * 7) % 24)) & 0xff); return out; },
  formatDate: (d, tz, fmt) => d.toISOString(),
};
let __fetchResponder = null;
const UrlFetchApp = { fetch: (url, opt) => { if (!__fetchResponder) throw new Error('no fetch responder'); const r = __fetchResponder(url, opt); return { getResponseCode: () => r.code || 200, getContentText: () => r.body }; } };
function setFetchResponder(fn) { __fetchResponder = fn; }
const ScriptApp = { getProjectTriggers: () => [], newTrigger: () => ({ timeBased() { return this; }, everyDays() { return this; }, onMonthDay() { return this; }, atHour() { return this; }, inTimezone() { return this; }, create() {} }), deleteTrigger() {} };
const Logger = { log: () => {} };
const ContentService = { MimeType: { JSON: 'json' }, createTextOutput: t => ({ setMimeType() { return { text: t }; } }) };
/* ===== gas/AI.gs ===== */
/**
 * MMC 勤怠 v2 — AI（Gemini）で下書きを作る
 *
 * 今ある下書きは残し、空いている日だけ埋める。結果は必ずルールで検証し、通ったものだけを「下書き」として保存する。
 * API キーは「設定」シートに貼る → 次回アクセス時にスクリプトプロパティへ移す（シートには残らない）。
 */

function aiDraft_(admin, ym, storeFilter) {
  absorbGeminiKey_();
  const key = geminiKey_(); if (!key) throwErr_('Gemini API キーが設定されていません（設定 → GEMINI_API_KEY）');
  if (isPublished_(ym)) throwErr_('確定済みの月には AI 下書きを作れません');
  const company = getCompany_();
  const stores = getStores_().filter(s => allowStore_(admin, s.name) && (!storeFilter || storeFilter === '全店' || s.name === storeFilter));
  if (!stores.length) throwErr_('対象の店舗がありません');
  const staff = activeStaff_().filter(s => s.stores.some(n => stores.some(S => S.name === n)));
  const patterns = getPatterns_().filter(p => p.kind === '勤務');
  const hopes = getHopes_(ym).byKey, existing = getShifts_(ym);
  const n = daysInMonth_(ym);

  const ctx = {
    month: ym, weekStart: company.weekStart,
    stores: stores.map(S => ({ name: S.name, closedWeekdays: S.closed.map(i => WD_JA[i]), need: getNeed_()[S.name] || [], holidays: getHolidays_().filter(h => h.store === '全店' || h.store === S.name).map(h => h.date) })),
    patterns: patterns.map(p => ({ name: p.name, store: p.store, start: p.s, end: p.e, breakMin: p.brk, hours: round2_(patternHours_(p)) })),
    staff: staff.map(s => ({ id: s.id, name: s.name, type: s.type, stores: s.stores, usual: s.defaults, maxHoursPerWeek: 40, maxHoursPerDay: 8,
      hopes: Array.from({ length: n }, (_, i) => ym + '-' + pad2_(i + 1)).map(d => { const h = hopes[s.id + '|' + d]; return h ? { date: d, kind: h.kind, pat: h.pat || undefined, time: h.kind === '時間' ? h.s + '-' + h.e : undefined } : null; }).filter(Boolean),
      fixed: existing.filter(x => x.staffId === s.id).map(x => ({ date: x.date, store: x.store, pat: x.pat })) })),
  };
  const prompt = [
    'あなたはカフェのシフト作成アシスタントです。以下の JSON の条件で、' + ym + ' の「まだシフトが入っていない日」だけを埋める案を作ってください。',
    '優先順位：1) 希望が「休み」の日には絶対に入れない 2) 正社員は週5日・1日8時間・週40時間以内 3) 各店舗の必要人数（曜日別、月〜日の配列）を満たす。定休日と休日は入れない 4) アルバイトで不足する時間帯を補う。希望のパターンがあればそれを使う 5) 希望叶え率を上げ、時間を均等にする。',
    '出力は JSON 配列のみ：[{"date":"yyyy-mm-dd","staffId":"001","store":"店舗","pat":"中番"}]。fixed に入っている日は出力しない。パターンは patterns の name から、その店舗で使えるもの（store が一致するか「共通」）だけを使う。',
    JSON.stringify(ctx),
  ].join('\n');

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(company.geminiModel) + ':generateContent?key=' + encodeURIComponent(key);
  const res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }) });
  if (res.getResponseCode() !== 200) throwErr_('Gemini の呼び出しに失敗しました（' + res.getResponseCode() + '）: ' + res.getContentText().slice(0, 200));
  let items = [];
  try {
    const j = JSON.parse(res.getContentText());
    const text = j.candidates[0].content.parts.map(p => p.text || '').join('');
    items = JSON.parse(text);
    if (!Array.isArray(items)) items = items.shifts || items.items || [];
  } catch (e) { throwErr_('AI の出力を読み取れませんでした。もう一度お試しください'); }

  // 検証して通ったものだけ保存
  const valid = [], skipped = [];
  const weekStart = company.weekStart;
  const added = [];
  items.forEach(it => {
    const s = staffById_(it.staffId); const date = normDate_(it.date); const st = storeByName_(it.store); const p = patternByName_(it.pat);
    const why = !s || !s.active ? '従業員なし' : !date || date.slice(0, 7) !== ym ? '日付' : !st ? '店舗なし' : s.stores.indexOf(st.name) < 0 ? '所属外' : !p || p.kind !== '勤務' ? 'パターンなし' : (p.store !== '共通' && p.store !== st.name) ? 'パターンの店舗違い'
      : (hopes[s.id + '|' + date] || {}).kind === '休み' ? '希望休' : isStoreClosed_(st, date) ? '定休日' : existing.concat(added).some(x => x.staffId === s.id && x.date === date) ? '既にあり' : null;
    if (why) { skipped.push({ date: date, staffId: it.staffId, pat: it.pat, why: why }); return; }
    const mine = existing.concat(added).filter(x => x.staffId === s.id).concat([{ date: date, hours: patternHours_(p), kind: '勤務' }]);
    if (Math.max.apply(null, weekHoursOf_(mine, ym, weekStart).concat([0])) > 40) { skipped.push({ date: date, staffId: s.id, pat: p.name, why: '週40h超' }); return; }
    added.push({ date: date, staffId: s.id, store: st.name, pat: p.name, hours: patternHours_(p), kind: '勤務' });
    valid.push({ date: date, staffId: s.id, store: st.name, pat: p.name, origin: 'AI' });
  });
  if (valid.length) saveShifts_(admin, ym, valid, {});
  return { added: valid.length, skipped: skipped };
}
/* ===== gas/Attendance.gs ===== */
/**
 * MMC 勤怠 v2 — 打刻・勤務計算・修正・月締め
 *
 * 打刻は追記のみ。修正は元の行を「無効」にして新しい行（確認方法＝修正）を追加する。
 */

const T = { IN: '出勤', BS: '休憩開始', BE: '休憩終了', OUT: '退勤' };
const STATE_LABEL = { off: '勤務外', working: '勤務中', break: '休憩中' };
const OPEN_SESSION_MAX_HOURS = 20;
const NIGHT_START = 22 * 60, NIGHT_END = 5 * 60;

/* ============================== 読み込み ============================== */

/** limit=0 で全件。無効行は除く */
function readLogs_(limit) {
  const sh = sheet_(SH.LOG);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const head = headers_(sh);
  const start = limit ? Math.max(2, last - limit + 1) : 2;
  const vals = sh.getRange(start, 1, last - start + 1, head.length).getValues();
  const ix = n => head.indexOf(n);
  const cT = ix('打刻日時'), cD = ix('勤務日'), cId = ix('従業員番号'), cN = ix('氏名'), cTy = ix('種別'), cM = ix('確認方法'), cS = ix('店舗'), cV = ix('無効'), cNote = ix('備考');
  const out = [];
  vals.forEach((r, i) => {
    if (!r[cT] || !String(r[cId]).trim() || !String(r[cTy]).trim()) return;
    if (cV >= 0 && truthy_(r[cV])) return;
    const t = r[cT] instanceof Date ? r[cT] : new Date(r[cT]);
    if (isNaN(t.getTime())) return;
    out.push({ row: start + i, time: t, workDate: normDate_(r[cD]), id: String(r[cId]).trim(), name: String(r[cN]), type: String(r[cTy]).trim(),
      method: cM >= 0 ? String(r[cM] || '') : '', store: cS >= 0 ? String(r[cS] || '').trim() : '', note: cNote >= 0 ? String(r[cNote] || '') : '' });
  });
  return out;
}
function logsOf_(staffId, limit) { return readLogs_(limit === undefined ? 3000 : limit).filter(l => l.id === staffId); }

/* ============================== 打刻 ============================== */

/**
 * @param staff   従業員
 * @param type    出勤/休憩開始/休憩終了/退勤
 * @param storeName 打刻する店舗（端末なら端末の店舗）
 * @param loc     {lat,lng,acc,ip}
 * @param device  店舗端末（あれば位置確認なし）
 */
function doPunch_(staff, type, storeName, loc, device) {
  if ([T.IN, T.BS, T.BE, T.OUT].indexOf(type) < 0) throwErr_('不正な打刻種別です');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throwErr_('混み合っています。もう一度お試しください');
  try {
    const now = new Date();
    const logs = logsOf_(staff.id);
    const st = stateFrom_(logs, now);
    const allowed = { off: [T.IN], working: [T.BS, T.OUT], break: [T.BE] }[st.state];
    if (allowed.indexOf(type) < 0) throwErr_('現在「' + STATE_LABEL[st.state] + '」のため「' + type + '」は打刻できません');

    let store;
    if (device) store = requireStore_(device.store || staff.home);
    else {
      store = requireStore_(storeName || staff.home);
      if (staff.stores.indexOf(store.name) < 0) throwErr_(store.name + ' には所属していません');
    }
    // 出勤以外は、そのセッションの店舗を引き継ぐ
    if (type !== T.IN && st.store) store = requireStore_(st.store);

    const v = verifyLocation_(store, loc, device);
    if (!v.ok) throwErr_(v.message);

    const workDate = type === T.IN ? jstDate_(now) : st.workDate;
    // シフト外の出勤か
    let note = '';
    if (type === T.IN && !todayShiftOf_(staff.id, workDate).length) note = 'シフト外';

    appendRow_(SH.LOG, {
      '打刻日時': now, '勤務日': workDate, '従業員番号': staff.id, '氏名': staff.name, '種別': type, '確認方法': v.method,
      '緯度': loc && loc.lat != null ? loc.lat : '', '経度': loc && loc.lng != null ? loc.lng : '', '精度(m)': loc && loc.acc != null ? Math.round(loc.acc) : '',
      '距離(m)': v.distance != null ? Math.round(v.distance) : '', 'IP': (loc && loc.ip) || '', '端末': v.deviceName || '', '備考': note, '店舗': store.name, '無効': '',
    });
    SpreadsheetApp.flush();
    return Object.assign({ ok: true }, statusOf_(staff), { punched: type, at: fmtTime_(now), method: v.method, punchedStore: store.name, offShift: note === 'シフト外' });
  } finally { lock.releaseLock(); }
}

/** 店舗端末 → 店舗IP → GPS の順で確認 */
function verifyLocation_(store, loc, device) {
  if (device) return { ok: true, method: '店舗端末', deviceName: device.name };
  if (!getCompany_().checkLocation) return { ok: true, method: '確認なし' };
  loc = loc || {};
  if (loc.ip && store.ips.indexOf(loc.ip) >= 0) return { ok: true, method: '店舗Wi-Fi' };
  if (loc.lat != null && loc.lng != null && store.lat != null && store.lng != null) {
    const d = distanceM_(store.lat, store.lng, Number(loc.lat), Number(loc.lng));
    const tolerance = store.radius + Math.min(Number(loc.acc) || 0, 100);
    if (d <= tolerance) return { ok: true, method: 'GPS', distance: d };
    return { ok: false, message: store.name + 'から約' + Math.round(d) + 'm離れているため打刻できません。お店のWi-Fiに接続するか、店内の端末で打刻してください。' };
  }
  if (store.lat == null && store.ips.length === 0) return { ok: false, message: store.name + 'の位置がまだ設定されていません。管理者に連絡してください。' };
  return { ok: false, message: '位置情報を取得できませんでした。位置情報の利用を許可するか、お店のWi-Fiに接続してください。' };
}
function distanceM_(lat1, lng1, lat2, lng2) {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* ============================== 状態 ============================== */

/** 1人分の打刻を勤務セッションにまとめる（第1期と同じ。店舗を追加） */
function buildSessions_(logs) {
  const L = logs.slice().sort((a, b) => a.time - b.time);
  const out = [];
  let cur = null;
  L.forEach(l => {
    if (l.type === T.IN) {
      if (cur) { cur.issues.push('退勤打刻なし'); out.push(cur); }
      cur = { workDate: l.workDate || jstDate_(l.time), store: l.store || '', in: l.time, out: null, breaks: [], openBreak: null, issues: [], open: false, offShift: l.note === 'シフト外', rows: [l.row] };
    } else if (!cur) {
      out.push({ workDate: l.workDate || jstDate_(l.time), store: l.store || '', in: null, out: null, breaks: [], openBreak: null, issues: [l.type + 'のみ（出勤打刻なし）'], open: false, rows: [l.row] });
    } else if (l.type === T.BS) {
      cur.rows.push(l.row);
      if (cur.openBreak) cur.issues.push('休憩開始が重複'); else cur.openBreak = l.time;
    } else if (l.type === T.BE) {
      cur.rows.push(l.row);
      if (cur.openBreak) { cur.breaks.push([cur.openBreak, l.time]); cur.openBreak = null; } else cur.issues.push('休憩開始なしで休憩終了');
    } else if (l.type === T.OUT) {
      cur.rows.push(l.row);
      cur.out = l.time;
      if (cur.openBreak) { cur.breaks.push([cur.openBreak, l.time]); cur.openBreak = null; cur.issues.push('休憩終了打刻なし'); }
      out.push(cur); cur = null;
    }
  });
  if (cur) { cur.open = true; out.push(cur); }
  return out;
}

function stateFrom_(logs, now) {
  const ss = buildSessions_(logs);
  const last = ss[ss.length - 1];
  if (last && last.open && last.in && (now - last.in) < OPEN_SESSION_MAX_HOURS * 3600000) {
    return { state: last.openBreak ? 'break' : 'working', workDate: last.workDate, store: last.store, in: fmtTime_(last.in), breakStart: last.openBreak ? fmtTime_(last.openBreak) : null, breakMin: breakMinutes_(last) };
  }
  return { state: 'off', workDate: null, store: null };
}
function breakMinutes_(s) { return s.breaks.reduce((a, b) => a + Math.floor((b[1] - b[0]) / 60000), 0); }

/**
 * 1勤務の時間計算（分単位）。worked / brk / night / ot(1日 otMin 超) / nightOt / issues
 */
function calcSession_(s, otMin, now, rules) {
  rules = rules || { break6: 45, break8: 60 };
  const r = { worked: 0, brk: 0, night: 0, ot: 0, nightOt: 0, issues: s.issues.slice() };
  if (!s.in) return r;
  if (!s.out) {
    const stillOpen = s.open && now && (now - s.in) < OPEN_SESSION_MAX_HOURS * 3600000;
    const msg = stillOpen ? '勤務中' : '退勤打刻なし'; if (r.issues.indexOf(msg) < 0) r.issues.push(msg);
    return r;
  }
  const toMin = d => Math.floor(d.getTime() / 60000);
  const inM = toMin(s.in), outM = toMin(s.out);
  if (outM <= inM) { r.issues.push('退勤が出勤より前'); return r; }
  const brks = s.breaks.map(b => [toMin(b[0]), toMin(b[1])]);
  for (let m = inM; m < outM; m++) {
    if (brks.some(b => m >= b[0] && m < b[1])) { r.brk++; continue; }
    r.worked++;
    const lm = ((m + JST_OFFSET_MIN) % 1440 + 1440) % 1440;
    const isNight = lm >= NIGHT_START || lm < NIGHT_END;
    if (isNight) r.night++;
    if (r.worked > otMin) { r.ot++; if (isNight) r.nightOt++; }
  }
  if (r.worked > 480 && r.brk < rules.break8) r.issues.push('休憩不足（8h超は' + rules.break8 + '分）');
  else if (r.worked > 360 && r.brk < rules.break6) r.issues.push('休憩不足（6h超は' + rules.break6 + '分）');
  return r;
}

/** 本人の画面に返す状態 */
function statusOf_(staff) {
  const now = new Date();
  const logs = logsOf_(staff.id);
  const st = stateFrom_(logs, now);
  const today = jstDate_(now);
  const showDate = st.state !== 'off' ? st.workDate : today;
  const todayLogs = logs.filter(l => (l.workDate || jstDate_(l.time)) === showDate).sort((a, b) => a.time - b.time).map(l => ({ type: l.type, time: fmtTime_(l.time), store: l.store }));

  const ym = today.slice(0, 7);
  const rules = getCompany_();
  let worked = 0, ot = 0, night = 0, days = 0;
  const sessions = buildSessions_(logs);
  sessions.filter(s => s.workDate.slice(0, 7) === ym).forEach(s => {
    const c = calcSession_(s, 480, now, rules);
    if (c.worked > 0) { worked += c.worked; days++; }
    ot += c.ot; night += c.night;
  });
  // 退勤忘れ（直近 14 日で退勤のないセッション）
  const missing = sessions.filter(s => s.in && !s.out && !(s.open && (now - s.in) < OPEN_SESSION_MAX_HOURS * 3600000)).slice(-3)
    .map(s => ({ date: s.workDate, in: fmtTime_(s.in), store: s.store }));
  const pending = readTable_(SH.REQUEST).filter(r => String(r['従業員番号']).trim() === staff.id && String(r['状態']) === '申請中').map(reqPublic_);

  return { state: st.state, stateLabel: STATE_LABEL[st.state], workDate: showDate, store: st.store, inAt: st.in || null, breakStart: st.breakStart || null, breakMin: st.breakMin || 0,
    today: todayLogs, month: { days: days, worked: h_(worked), ot: h_(ot), night: h_(night) }, missing: missing, pending: pending, now: fmtTime_(now), todayDate: today };
}

/** 本人の直近の打刻履歴（セッション単位） */
function myPunches_(staff, limitDays) {
  const now = new Date();
  const rules = getCompany_();
  return buildSessions_(logsOf_(staff.id)).slice(-(limitDays || 14)).reverse().map(s => {
    const c = calcSession_(s, 480, now, rules);
    const open = c.issues.indexOf('勤務中') >= 0;
    return { date: s.workDate, store: s.store, in: s.in ? fmtTime_(s.in) : '', out: s.out ? fmtTime_(s.out) : '', brk: c.brk, worked: h_(c.worked), open: open, issues: c.issues.filter(x => x !== '勤務中') };
  });
}

/* ============================== 修正申請・修正 ============================== */

function reqPublic_(r) {
  let content = {};
  try { content = JSON.parse(String(r['内容'] || '{}')); } catch (e) { content = { text: String(r['内容'] || '') }; }
  return { id: String(r['申請ID']), kind: String(r['種別']), staffId: String(r['従業員番号']).trim(), name: String(r['氏名']), date: normDate_(r['日付']), content: content, reason: String(r['理由'] || ''), status: String(r['状態']), at: r['申請日時'] instanceof Date ? fmtDateTime_(r['申請日時']) : String(r['申請日時'] || ''), by: String(r['処理者'] || ''), _row: r._row };
}

/** 本人：打刻修正の申請（出勤・退勤のどちらか／両方） */
function requestFix_(staff, date, inTime, outTime, reason) {
  date = normDate_(date);
  if (!date) throwErr_('日付が不正です');
  if (!inTime && !outTime) throwErr_('時刻を入れてください');
  const id = 'R' + uuid_().slice(0, 8);
  appendRow_(SH.REQUEST, { '申請ID': id, '種別': '打刻修正', '従業員番号': staff.id, '氏名': staff.name, '日付': date, '内容': JSON.stringify({ in: normTime_(inTime) || '', out: normTime_(outTime) || '' }), '理由': String(reason || ''), '状態': '申請中', '申請日時': new Date() });
  return { id: id };
}

/**
 * 管理者：打刻を直す。指定した種別（出勤/退勤）の既存行を無効にして新しい行を追加する。
 * @param o {staffId, date, in?, out?, reason, requestId?}
 */
function applyFix_(admin, o) {
  const staff = staffById_(o.staffId); if (!staff) throwErr_('従業員が見つかりません');
  if (!allowStore_(admin, staff.home) && !staff.stores.some(s => allowStore_(admin, s))) throwErr_('担当外の店舗です', 'FORBIDDEN');
  const date = normDate_(o.date); if (!date) throwErr_('日付が不正です');
  if (isClosed_(date.slice(0, 7))) throwErr_(date.slice(0, 7) + ' は締め済みのため修正できません');
  const lock = LockService.getScriptLock(); if (!lock.tryLock(15000)) throwErr_('混み合っています');
  try {
    const sh = sheet_(SH.LOG), head = headers_(sh), cV = head.indexOf('無効') + 1;
    const logs = logsOf_(staff.id, 0).filter(l => l.workDate === date);
    const session = buildSessions_(logs).find(s => s.in) || { store: staff.home };
    const put = (type, hhmm) => {
      const t = normTime_(hhmm); if (!t) return;
      logs.filter(l => l.type === type).forEach(l => sh.getRange(l.row, cV).setValue(true));
      // 退勤が出勤より早い時刻なら翌日扱い
      let dt = new Date(date + 'T' + t + ':00+09:00');
      if (type === T.OUT && session.in && dt < session.in) dt = new Date(dt.getTime() + 86400000);
      appendRow_(SH.LOG, { '打刻日時': dt, '勤務日': date, '従業員番号': staff.id, '氏名': staff.name, '種別': type, '確認方法': '修正', '備考': (o.reason || '') + (o.requestId ? '（申請 ' + o.requestId + '）' : ''), '店舗': session.store || staff.home, '無効': '' });
    };
    put(T.IN, o.in); put(T.OUT, o.out);
    if (o.requestId) decideRequest_(admin, o.requestId, true, true);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  return { ok: true };
}

/** 申請の承認・却下。打刻修正の承認は applyFix_ 経由で呼ぶ */
function decideRequest_(admin, requestId, approve, alreadyApplied) {
  const r = readTable_(SH.REQUEST).find(x => String(x['申請ID']) === String(requestId));
  if (!r) throwErr_('申請が見つかりません');
  const req = reqPublic_(r);
  if (req.status !== '申請中') throwErr_('処理済みの申請です');
  if (approve && req.kind === '打刻修正' && !alreadyApplied) {
    return applyFix_(admin, { staffId: req.staffId, date: req.date, in: req.content.in, out: req.content.out, reason: req.reason, requestId: req.id });
  }
  if (approve && req.kind === '有給') approveLeave_(admin, req);
  updateRow_(SH.REQUEST, r._row, { '状態': approve ? '承認' : '却下', '処理者': admin.name, '処理日時': new Date() });
  return { ok: true };
}

/* ============================== 要対応（シフト vs 実績） ============================== */

/** その月の「要対応」一覧。処理済み（確認済）は除く */
function flags_(ym, storeFilter) {
  const now = new Date();
  const rules = getCompany_();
  const shifts = getShifts_(ym);
  const acked = {}, pendingReq = {};
  readTable_(SH.REQUEST).forEach(r => {
    const k = String(r['従業員番号']).trim() + '|' + normDate_(r['日付']);
    if (String(r['種別']) === '勤怠確認' && String(r['状態']) === '承認') acked[k] = true;
    if (String(r['種別']) === '打刻修正' && String(r['状態']) === '申請中') pendingReq[k] = reqPublic_(r);
  });
  const out = [];
  activeStaff_().forEach(staff => {
    if (storeFilter && storeFilter !== '全店' && staff.stores.indexOf(storeFilter) < 0) return;
    const sessions = buildSessions_(logsOf_(staff.id, 0)).filter(s => s.workDate.slice(0, 7) === ym);
    const byDate = {};
    sessions.forEach(s => { (byDate[s.workDate] = byDate[s.workDate] || []).push(s); });
    const myShifts = shifts.filter(x => x.staffId === staff.id);
    const dates = {};
    Object.keys(byDate).forEach(d => dates[d] = 1); myShifts.forEach(x => dates[x.date] = 1);
    Object.keys(dates).sort().forEach(date => {
      const key = staff.id + '|' + date;
      if (acked[key]) return;
      const ss = byDate[date] || [], sh = myShifts.filter(x => x.date === date && x.kind !== '有給');
      const issues = [];
      let inT = '', outT = '';
      ss.forEach(s => {
        const c = calcSession_(s, 480, now, rules);
        c.issues.filter(x => x !== '勤務中').forEach(x => issues.push({ kind: x, sev: x.indexOf('退勤打刻なし') >= 0 || x.indexOf('出勤打刻なし') >= 0 ? 'ng' : 'wa' }));
        if (s.in) inT = fmtTime_(s.in); if (s.out) outT = fmtTime_(s.out);
        if (c.ot >= 60) issues.push({ kind: '残業 ' + h_(c.ot) + 'h', sev: 'ok' });
      });
      if (ss.length && !sh.length) issues.push({ kind: 'シフト外の出勤', sev: 'wa' });
      if (sh.length && !ss.length && date < jstDate_(now)) issues.push({ kind: '出勤なし（欠勤?）', sev: 'wa' });
      if (sh.length && ss.length && ss[0].in) {
        const late = Math.floor((ss[0].in - new Date(date + 'T' + sh[0].s + ':00+09:00')) / 60000);
        if (late >= 10) issues.push({ kind: '遅刻 ' + late + '分', sev: 'wa' });
        if (ss[ss.length - 1].out) { const early = Math.floor((new Date(date + 'T' + sh[sh.length - 1].e + ':00+09:00') - ss[ss.length - 1].out) / 60000); if (early >= 30) issues.push({ kind: '早退 ' + early + '分', sev: 'wa' }); }
      }
      if (!issues.length || issues.every(i => i.sev === 'ok')) return;
      out.push({ id: key, staffId: staff.id, name: staff.name, date: date, store: (ss[0] && ss[0].store) || (sh[0] && sh[0].store) || staff.home,
        plan: sh.length ? sh.map(x => x.pat + ' ' + x.s + '-' + x.e + ' ' + x.store).join(' / ') : '（シフトなし）', in: inT, out: outT,
        issues: issues.filter(i => i.sev !== 'ok').map(i => i.kind), sev: issues.some(i => i.sev === 'ng') ? 'ng' : 'wa', request: pendingReq[key] || null });
    });
  });
  return out;
}

/** 「問題なし」：確認済みとして記録 */
function ackFlag_(admin, staffId, date) {
  const s = staffById_(staffId); if (!s) throwErr_('従業員が見つかりません');
  appendRow_(SH.REQUEST, { '申請ID': 'A' + uuid_().slice(0, 8), '種別': '勤怠確認', '従業員番号': s.id, '氏名': s.name, '日付': normDate_(date), '内容': '', '理由': '', '状態': '承認', '申請日時': new Date(), '処理者': admin.name, '処理日時': new Date() });
}

/* ============================== 月締め ============================== */

function isClosed_(ym) { return readTable_(SH.CLOSE).some(r => String(r['対象月']).trim() === ym); }
function closeMonth_(admin, ym) {
  if (!isHR_(admin)) throwErr_('月締めは人事のみ行えます', 'FORBIDDEN');
  if (isClosed_(ym)) throwErr_(ym + ' は締め済みです');
  const open = flags_(ym, '全店');
  if (open.length) throwErr_('未処理が ' + open.length + ' 件あります。すべて処理してから締めてください');
  const result = computePayroll_(ym);
  writePayrollSheet_(ym, result);
  appendRow_(SH.CLOSE, { '対象月': ym, '締め日時': new Date(), '締め者': admin.name });
  return result;
}

/** 管理者用：全員の月次 */
function monthSummary_(ym, storeFilter) {
  const now = new Date(), rules = getCompany_();
  const shifts = getShifts_(ym);
  return activeStaff_().filter(s => !isBackOffice_(s) && (!storeFilter || storeFilter === '全店' || s.stores.indexOf(storeFilter) >= 0)).map(staff => {
    let worked = 0, ot = 0, night = 0, days = 0;
    buildSessions_(logsOf_(staff.id, 0)).filter(s => s.workDate.slice(0, 7) === ym).forEach(s => { const c = calcSession_(s, 480, now, rules); if (c.worked > 0) days++; worked += c.worked; ot += c.ot; night += c.night; });
    const planned = shifts.filter(x => x.staffId === staff.id && x.kind !== '有給').reduce((a, x) => a + x.hours, 0);
    return { id: staff.id, name: staff.name, home: staff.home, days: days, worked: h_(worked), ot: h_(ot), night: h_(night), planned: round2_(planned), diff: round2_(worked / 60 - planned) };
  });
}

/** 打刻ログ（管理者用） */
function logList_(from, to, storeFilter) {
  return readLogs_(0).filter(l => { const d = l.workDate || jstDate_(l.time); return d >= from && d <= to && (!storeFilter || storeFilter === '全店' || l.store === storeFilter); })
    .sort((a, b) => b.time - a.time).slice(0, 500)
    .map(l => ({ at: fmtDateTime_(l.time), date: l.workDate, id: l.id, name: l.name, type: l.type, store: l.store, method: l.method, note: l.note }));
}
/* ===== gas/Auth.gs ===== */
/**
 * MMC 勤怠 v2 — 認証
 *  - 従業員番号 + PIN（PIN はハッシュで保存。管理者にも見えない）
 *  - 初回は管理者が発行した「初期コード」で本人が PIN を決める
 *  - スマホはセッショントークン（180日）。店内端末は端末トークン + 名前 + PIN
 *  - 権限：一般 / 店長 / 人事
 */

const SESSION_DAYS = 180;
const ROLES = ['一般', '店長', '人事', 'オーナー'];   // オーナー＝人事の権限、ただしシフト・給与の対象外
function isHR_(s) { return s.role === '人事' || s.role === 'オーナー'; }
function isBackOffice_(s) { return s.role === 'オーナー'; }

function pinHash_(staffId, pin) {
  const raw = 'mmc-kintai|' + String(staffId) + '|' + String(pin);
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

function validPin_(pin) { return /^\d{4,6}$/.test(String(pin || '')); }

/** ログイン（PIN 設定済みの人） */
function authStaff_(id, pin) {
  id = String(id || '').trim();
  checkLock_('s' + id);
  const s = getStaff_().find(x => x.id === id && x.active);
  if (!s || !s.pinHash || s.pinHash !== pinHash_(id, String(pin || '').trim())) {
    lockFail_('s' + id);
    if (s && !s.pinHash) throw Object.assign(new Error('PIN がまだ設定されていません。管理者から受け取った初期コードで設定してください'), { code: 'PIN_SETUP' });
    throw new Error('従業員番号またはPINが違います');
  }
  clearFail_('s' + id);
  return s;
}

/** 初回：初期コードを確認して本人が PIN を設定 */
function setupPin_(id, code, pin) {
  id = String(id || '').trim();
  checkLock_('c' + id);
  const s = getStaff_().find(x => x.id === id && x.active);
  if (!s || !s.initCode || s.initCode !== String(code || '').trim()) { lockFail_('c' + id); throw new Error('初期コードが違います'); }
  if (!validPin_(pin)) throw new Error('PIN は 4〜6 桁の数字にしてください');
  updateRow_(SH.STAFF, s._row, { 'PINハッシュ': pinHash_(id, pin), '初期コード': '' });
  clearFail_('c' + id); clearCache_();
  return getStaff_().find(x => x.id === id);
}

function changePin_(staff, oldPin, newPin) {
  if (staff.pinHash !== pinHash_(staff.id, String(oldPin || '').trim())) throw new Error('今の PIN が違います');
  if (!validPin_(newPin)) throw new Error('PIN は 4〜6 桁の数字にしてください');
  updateRow_(SH.STAFF, staff._row, { 'PINハッシュ': pinHash_(staff.id, newPin) });
  clearCache_();
}

/** 管理者：初期コードを発行（PIN はリセットされる） */
function issueInitCode_(staffId) {
  const s = getStaff_().find(x => x.id === String(staffId).trim());
  if (!s) throwErr_('従業員が見つかりません');
  const code = String(Math.floor(1000 + Math.random() * 9000));
  updateRow_(SH.STAFF, s._row, { '初期コード': code, 'PINハッシュ': '' });
  clearCache_();
  return code;
}

/* ---------- セッション（スマホ） ---------- */

function newSession_(staffId) {
  const tok = uuid_();
  PropertiesService.getScriptProperties().setProperty('S_' + tok, JSON.stringify({ id: staffId, t: Date.now() }));
  return tok;
}
function dropSession_(tok) { if (tok) PropertiesService.getScriptProperties().deleteProperty('S_' + tok); }

function sessionStaff_(tok) {
  const props = PropertiesService.getScriptProperties();
  const authErr = () => Object.assign(new Error('ログインの有効期限が切れました。もう一度ログインしてください'), { code: 'AUTH' });
  if (!tok) throw authErr();
  const raw = props.getProperty('S_' + tok);
  if (!raw) throw authErr();
  const o = JSON.parse(raw);
  const s = getStaff_().find(x => x.id === o.id && x.active);
  if (!s || Date.now() - o.t > SESSION_DAYS * 86400000) { props.deleteProperty('S_' + tok); throw authErr(); }
  return s;
}

/** 古いセッションの掃除（毎晩） */
function purgeSessions_() {
  const props = PropertiesService.getScriptProperties();
  const all = props.getProperties();
  Object.keys(all).forEach(k => {
    if (k.indexOf('S_') !== 0) return;
    try { const o = JSON.parse(all[k]); if (Date.now() - o.t > SESSION_DAYS * 86400000) props.deleteProperty(k); } catch (e) { props.deleteProperty(k); }
  });
}

/* ---------- 権限 ---------- */

/** 店長・人事のみ。店長は担当店舗（主所属）だけ */
function requireAdmin_(tok) {
  const s = sessionStaff_(tok);
  if (ROLES.indexOf(s.role) < 1) throw Object.assign(new Error('管理者の権限がありません'), { code: 'FORBIDDEN' });
  return s;
}
function requireHR_(tok) {
  const s = sessionStaff_(tok);
  if (!isHR_(s)) throw Object.assign(new Error('人事の権限が必要です'), { code: 'FORBIDDEN' });
  return s;
}
/** 店長が見てよい店舗か */
function allowStore_(admin, storeName) {
  if (isHR_(admin)) return true;
  if (!storeName || storeName === '全店') return false;
  return admin.stores.indexOf(storeName) >= 0;
}
/** 管理者が扱える店舗名の一覧（人事は全店） */
function adminStores_(admin) {
  const all = getStores_().map(s => s.name);
  return isHR_(admin) ? all : all.filter(n => admin.stores.indexOf(n) >= 0);
}

/* ---------- 店舗端末 ---------- */

function getDevice_(tok) {
  if (!tok) return null;
  const r = readTable_(SH.DEVICE).find(v => String(v['端末トークン']) === String(tok) && (truthy_(v['有効']) || v['有効'] === ''));
  return r ? { token: String(r['端末トークン']), name: String(r['端末名']), store: String(r['店舗'] || '').trim(), _row: r._row } : null;
}
function requireDevice_(tok) {
  const d = getDevice_(tok);
  if (!d) throw Object.assign(new Error('この端末は店舗端末として登録されていません'), { code: 'DEVICE' });
  return d;
}
/** 端末登録：管理者ログイン（店長/人事）または設定シートの管理者パスワード */
function registerDevice_(req) {
  let ok = false;
  if (req.token) { try { requireAdmin_(req.token); ok = true; } catch (e) { ok = false; } }
  if (!ok) { checkLock_('admin'); const real = getCompany_().adminPw; if (!real || String(req.admin || '') !== real) { lockFail_('admin'); throw new Error('管理者パスワードが違います'); } clearFail_('admin'); }
  const store = requireStore_(req.store);
  const tok = uuid_();
  const name = String(req.name || (store.name + '端末')).slice(0, 40);
  appendRow_(SH.DEVICE, { '端末トークン': tok, '端末名': name, '登録日時': new Date(), '有効': true, '店舗': store.name });
  return { token: tok, name: name, store: store.name };
}
function unregisterDevice_(tok) { const d = getDevice_(tok); if (d) updateRow_(SH.DEVICE, d._row, { '有効': false }); }

/* ---------- 連続失敗ロック ---------- */

function checkLock_(key) {
  const n = Number(CacheService.getScriptCache().get('F_' + key) || 0);
  if (n >= 5) throw new Error('入力ミスが続いたため15分間ロックされています');
}
function lockFail_(key) {
  const c = CacheService.getScriptCache();
  c.put('F_' + key, String(Number(c.get('F_' + key) || 0) + 1), 900);
}
function clearFail_(key) { CacheService.getScriptCache().remove('F_' + key); }
/* ===== gas/Config.gs ===== */
/**
 * MMC 勤怠 v2 — 設定の読み書き（会社共通・店舗・パターン・必要人数・会社休日）
 * 読み取りは 60 秒キャッシュ。書き込み後は clearCache_() を呼ぶ。
 */

function readConfigMap_() {
  const m = {};
  try { readTable_(SH.CONFIG).forEach(r => { m[String(r['項目']).trim()] = r['値']; }); } catch (e) { /* 初回 */ }
  return m;
}

/** 会社共通の設定 */
function getCompany_() {
  return cached_('company', () => {
    const m = readConfigMap_();
    const num = (k, d) => { const v = Number(m[k]); return (m[k] === '' || m[k] == null || isNaN(v)) ? d : v; };
    return {
      deadlineDay: num('希望締切日', 15),
      publishDay: num('公開予定日', 25),
      weekStart: String(m['週起算曜日'] || '月'),
      otRate: num('残業割増', 1.25),
      nightRate: num('深夜割増', 0.25),
      nightOtRate: num('深夜残業割増', 1.5),
      over60Rate: num('60h超割増', 0.25),
      break6: num('休憩6h超(分)', 45),
      break8: num('休憩8h超(分)', 60),
      rounding: String(m['換算時給の端数'] || '切り上げ'),
      forgotMin: num('退勤忘れ通知(分)', 60),
      checkLocation: String(m['位置確認'] || 'ON').toUpperCase() !== 'OFF',
      adminPw: String(m['管理者パスワード'] || '').trim(),
      geminiModel: String(m['GEMINIモデル'] || 'gemini-2.5-flash'),
    };
  });
}

function setConfig_(key, value) {
  const sh = sheet_(SH.CONFIG);
  const vals = sh.getDataRange().getValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim() === key) { sh.getRange(i + 1, 2).setValue(value); clearCache_(); return; }
  }
  sh.appendRow([key, value]);
  clearCache_();
}

/** 「設定」に貼られた API キーをスクリプトプロパティへ移す（シートには残さない） */
function absorbGeminiKey_() {
  const m = readConfigMap_();
  const k = String(m['GEMINI_API_KEY'] || '').trim();
  if (k) {
    PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', k);
    setConfig_('GEMINI_API_KEY', '（保存済み・変更するときはここに貼り直す）');
  }
}
function geminiKey_() { return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || ''; }

/* ============================== 店舗 ============================== */

function getStores_() {
  return cached_('stores', () => readTable_(SH.STORE).filter(r => truthy_(r['有効']) || r['有効'] === '').map(r => ({
    id: String(r['店舗ID'] || '').trim() || String(r['店舗名']).trim(),
    name: String(r['店舗名']).trim(),
    short: String(r['略称'] || String(r['店舗名']).slice(0, 1)),
    lat: r['緯度'] === '' ? null : Number(r['緯度']),
    lng: r['経度'] === '' ? null : Number(r['経度']),
    radius: Number(r['許可半径(m)']) || 150,
    ips: String(r['店舗IP(カンマ区切り)'] || '').split(',').map(x => x.trim()).filter(Boolean),
    open: normTime_(r['営業開始']) || '',
    close: normTime_(r['営業終了']) || '',
    closed: String(r['定休曜日(カンマ区切り)'] || '').split(/[,、]/).map(x => WD_JA.indexOf(x.trim())).filter(x => x >= 0),
    annualOff: Number(r['年間休日']) || 0,
    monthlyH: Number(r['月平均所定時間']) || 0,
    leaveDays: Number(r['有給付与日数']) || 0,
    _row: r._row,
  })));
}
function storeByName_(name) { return getStores_().find(s => s.name === String(name || '').trim()) || null; }
function requireStore_(name) { const s = storeByName_(name); if (!s) throwErr_('店舗「' + name + '」がありません'); return s; }

/* ============================== シフトパターン ============================== */

function getPatterns_() {
  return cached_('patterns', () => readTable_(SH.PATTERN)
    .filter(r => String(r['名称']).trim() && (truthy_(r['有効']) || r['有効'] === ''))
    .map(r => ({
      id: String(r['パターンID'] || r['名称']).trim(),
      name: String(r['名称']).trim(),
      store: String(r['店舗'] || '共通').trim(),
      s: normTime_(r['開始']), e: normTime_(r['終了']),
      brk: Number(r['休憩(分)']) || 0,
      color: String(r['色'] || '#1c1c1c').trim(),
      kind: String(r['種別'] || '勤務').trim(),   // 勤務 / 有給
      order: Number(r['表示順']) || 99,
    })).sort((a, b) => a.order - b.order));
}
function patternByName_(name) { return getPatterns_().find(p => p.name === String(name || '').trim()) || null; }
function patternHours_(p) { const a = minsOf_(p.s), b = minsOf_(p.e); if (a == null || b == null) return 0; return Math.max(0, (b >= a ? b - a : b + 1440 - a) - (p.brk || 0)) / 60; }

/* ============================== 必要人数・会社休日 ============================== */

/** { 店舗名: [月,火,水,木,金,土,日] } */
function getNeed_() {
  return cached_('need', () => {
    const m = {};
    readTable_(SH.NEED).forEach(r => { m[String(r['店舗']).trim()] = ['月', '火', '水', '木', '金', '土', '日'].map(d => Number(r[d]) || 0); });
    return m;
  });
}
function needOn_(storeName, dateStr) { const arr = getNeed_()[storeName]; if (!arr) return 0; return arr[(dow_(dateStr) + 6) % 7] || 0; }

/** [{date, store:'全店'|店舗名, name}] */
function getHolidays_() {
  return cached_('holidays', () => readTable_(SH.HOLIDAY).map(r => ({ date: normDate_(r['日付']), store: String(r['店舗'] || '全店').trim() || '全店', name: String(r['名称'] || '') })).filter(h => h.date));
}
function isCompanyHoliday_(storeName, dateStr) { return getHolidays_().some(h => h.date === dateStr && (h.store === '全店' || h.store === storeName)); }
function isStoreClosed_(store, dateStr) { return store.closed.indexOf(dow_(dateStr)) >= 0 || isCompanyHoliday_(store.name, dateStr); }

/** 画面用：公開していい設定だけをまとめて返す */
function publicConfig_() {
  const c = getCompany_();
  return {
    deadlineDay: c.deadlineDay, publishDay: c.publishDay, weekStart: c.weekStart, checkLocation: c.checkLocation,
    stores: getStores_().map(s => ({ name: s.name, short: s.short, open: s.open, close: s.close, closed: s.closed, monthlyH: s.monthlyH })),
    patterns: getPatterns_().map(p => ({ name: p.name, store: p.store, s: p.s, e: p.e, brk: p.brk, color: p.color, kind: p.kind })),
    need: getNeed_(),
    holidays: getHolidays_(),
  };
}

/* ============================== 設定の保存（管理者） ============================== */

function saveCompany_(obj) {
  const map = { deadlineDay: '希望締切日', publishDay: '公開予定日', weekStart: '週起算曜日', otRate: '残業割増', nightRate: '深夜割増', nightOtRate: '深夜残業割増', over60Rate: '60h超割増', break6: '休憩6h超(分)', break8: '休憩8h超(分)', rounding: '換算時給の端数', forgotMin: '退勤忘れ通知(分)', checkLocation: '位置確認', geminiModel: 'GEMINIモデル' };
  Object.keys(obj).forEach(k => {
    if (!map[k]) return;
    let v = obj[k];
    if (k === 'checkLocation') v = v ? 'ON' : 'OFF';
    setConfig_(map[k], v);
  });
  if (obj.geminiKey) { PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', String(obj.geminiKey).trim()); }
}

function saveStore_(s) {
  const row = {
    '店舗ID': s.id || s.name, '店舗名': s.name, '略称': s.short || s.name.slice(0, 1),
    '緯度': s.lat == null ? '' : s.lat, '経度': s.lng == null ? '' : s.lng, '許可半径(m)': s.radius || 150,
    '店舗IP(カンマ区切り)': (s.ips || []).join(','), '営業開始': s.open || '', '営業終了': s.close || '',
    '定休曜日(カンマ区切り)': (s.closed || []).map(i => WD_JA[i]).join(','),
    '年間休日': s.annualOff || 0, '月平均所定時間': s.monthlyH || 0, '有給付与日数': s.leaveDays || 0, '有効': s.active !== false,
  };
  const cur = storeByName_(s.originalName || s.name);
  if (cur) updateRow_(SH.STORE, cur._row, row); else appendRow_(SH.STORE, row);
  if (!getNeed_()[s.name]) appendRow_(SH.NEED, { '店舗': s.name, '月': 2, '火': 2, '水': 2, '木': 2, '金': 2, '土': 2, '日': 2 });
  clearCache_();
}

function savePatterns_(list) {
  const sh = sheet_(SH.PATTERN);
  const have = readTable_(SH.PATTERN);
  list.forEach((p, i) => {
    const row = { 'パターンID': p.id || ('p_' + Utilities.getUuid().slice(0, 8)), '名称': p.name, '店舗': p.store || '共通', '開始': p.s, '終了': p.e, '休憩(分)': Number(p.brk) || 0, '色': p.color || '#1c1c1c', '種別': p.kind || '勤務', '表示順': i + 1, '有効': p.active !== false };
    const cur = have.find(r => String(r['パターンID']).trim() === String(p.id).trim()) || have.find(r => String(r['名称']).trim() === p.name);
    if (cur) updateRow_(SH.PATTERN, cur._row, row); else appendRow_(SH.PATTERN, row);
  });
  void sh;
  clearCache_();
}

function saveNeed_(storeName, arr) {
  const cur = readTable_(SH.NEED).find(r => String(r['店舗']).trim() === storeName);
  const row = { '店舗': storeName };
  ['月', '火', '水', '木', '金', '土', '日'].forEach((d, i) => { row[d] = Number(arr[i]) || 0; });
  if (cur) updateRow_(SH.NEED, cur._row, row); else appendRow_(SH.NEED, row);
  clearCache_();
}

function saveHolidays_(list) {
  const sh = sheet_(SH.HOLIDAY);
  if (sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  list.forEach(h => appendRow_(SH.HOLIDAY, { '日付': normDate_(h.date), '店舗': h.store || '全店', '名称': h.name || '' }));
  clearCache_();
}
/* ===== gas/Leave.gs ===== */
/**
 * MMC 勤怠 v2 — 有給
 *  - 毎年 6/1 に主所属店舗の付与日数を付与（店舗 21 / 焙煎所 16 など。店舗シートで設定）
 *  - 途中入社は 6/1 までの残り月数で按分・四捨五入（法定最低日数を下回るときは法定日数に引き上げて印を付ける）
 *  - 付与から 2 年で失効。古い分から使う
 *  - 使用 = 確定シフトの「有給」パターンの日数
 */

const FY_START = '06-01';
const LEGAL_MIN = { 6: 10, 18: 11, 30: 12, 42: 14, 54: 16, 66: 18, 78: 20 }; // 勤続月数 → 法定付与（週5日）

function fiscalStart_(dateStr) { const y = Number(dateStr.slice(0, 4)); return (dateStr.slice(5) >= FY_START ? y : y - 1) + '-' + FY_START; }
function addYears_(dateStr, n) { return (Number(dateStr.slice(0, 4)) + n) + dateStr.slice(4); }
function monthsBetween_(a, b) { const [ay, am] = a.split('-').map(Number), [by, bm] = b.split('-').map(Number); return (by - ay) * 12 + (bm - am); }

function getGrants_(staffId) {
  return readTable_(SH.LEAVE).filter(r => String(r['従業員番号']).trim() === staffId).map(r => ({ grant: normDate_(r['付与日']), days: Number(r['付与日数']) || 0, expire: normDate_(r['失効日']), memo: String(r['メモ'] || ''), _row: r._row })).sort((a, b) => a.grant.localeCompare(b.grant));
}

/** 付与日数の計算（純粋関数） */
function grantDaysFor_(staff, storeDays, fyStart) {
  if (!staff.joined || staff.joined < fyStart) return { days: storeDays, memo: '' };
  // 入社年度：6/1 までの残り月数で按分
  const months = Math.max(0, 12 - monthsBetween_(fyStart, staff.joined));
  let days = Math.round(storeDays * months / 12);
  const tenure = monthsBetween_(staff.joined, addYears_(fyStart, 1));
  let legal = 0; Object.keys(LEGAL_MIN).map(Number).sort((a, b) => a - b).forEach(mn => { if (tenure >= mn) legal = LEGAL_MIN[mn]; });
  let memo = '按分 ' + months + '/12';
  if (legal > days) { days = legal; memo += '→法定 ' + legal + '日に引き上げ'; }
  return { days: days, memo: memo };
}

/** 毎年 6/1（nightlyJobs から毎日呼ばれても二重付与しない） */
function grantAnnual_() {
  const today = jstDate_(new Date());
  const fy = fiscalStart_(today);
  activeStaff_().forEach(s => {
    if (isBackOffice_(s)) return;
    if (getGrants_(s.id).some(g => g.grant === fy)) return;
    if (s.joined && s.joined > today) return;
    const st = storeByName_(s.home); const base = st ? st.leaveDays : 0; if (!base) return;
    const g = grantDaysFor_(s, base, fy);
    appendRow_(SH.LEAVE, { '従業員番号': s.id, '氏名': s.name, '付与日': fy, '付与日数': g.days, '失効日': addYears_(fy, 2), 'メモ': g.memo });
  });
}

/** 残日数（FIFO 消化） */
function leaveBalance_(staffId, asOf) {
  asOf = asOf || jstDate_(new Date());
  const grants = getGrants_(staffId);
  const used = readTable_(SH.SHIFT).map(shiftFromRow_).filter(x => x.staffId === staffId && x.kind === '有給' && x.state === '確定').map(x => x.date).sort();
  const lots = grants.map(g => ({ grant: g.grant, expire: g.expire, days: g.days, left: g.days }));
  used.forEach(d => { const lot = lots.find(l => l.left > 0 && l.grant <= d && l.expire > d); if (lot) lot.left--; });
  const fy = fiscalStart_(asOf);
  const thisFy = grants.find(g => g.grant === fy);
  const usedThisFy = used.filter(d => d >= fy && d < addYears_(fy, 1)).length;
  const valid = lots.filter(l => l.expire > asOf);
  return { left: valid.reduce((a, l) => a + l.left, 0), usedThisFy: usedThisFy, grantThisFy: thisFy ? thisFy.days : 0, lots: valid.map(l => ({ grant: l.grant, expire: l.expire, left: l.left })), mustTake5: !!thisFy && thisFy.days >= 10 };
}

/** 管理者：有給申請の承認 → シフトに「有給」を入れる */
function approveLeave_(admin, req) {
  const staff = staffById_(req.staffId); if (!staff) throwErr_('従業員が見つかりません');
  const paid = getPatterns_().find(p => p.kind === '有給'); if (!paid) throwErr_('「有給」のパターンがありません');
  const b = leaveBalance_(staff.id); if (b.left <= 0) throwErr_(staff.name + ' の有給の残日数がありません');
  saveShifts_(admin, req.date.slice(0, 7), [{ date: req.date, staffId: staff.id, store: staff.home, pat: paid.name, reason: '有給承認', origin: '有給申請' }]);
}

/** 管理者：全員の有給状況 */
function leaveSummary_(storeFilter) {
  return activeStaff_().filter(s => !isBackOffice_(s) && (!storeFilter || storeFilter === '全店' || s.stores.indexOf(storeFilter) >= 0)).map(s => Object.assign({ id: s.id, name: s.name, home: s.home }, leaveBalance_(s.id)));
}
function leaveRequests_() {
  return readTable_(SH.REQUEST).filter(r => String(r['種別']) === '有給' && String(r['状態']) === '申請中').map(reqPublic_);
}
/* ===== gas/Main.gs ===== */
/**
 * MMC 勤怠 v2 — API 入口
 *
 * POST { action, ... } → { ok:true, ... } | { ok:false, error, code }
 *   code: AUTH（ログインし直し）/ DEVICE（端末未登録）/ FORBIDDEN（権限なし）/ PIN_SETUP（PIN 未設定）
 *
 * スタッフ端は token（ログインで発行）、店内端末は device（端末トークン）＋ id ＋ pin、
 * 管理端は 店長／人事 の token を使う。
 */

function doGet() { return json_({ ok: true, app: 'MMC勤怠 v2', time: new Date().toISOString() }); }

function doPost(e) {
  let res;
  try {
    const req = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    res = route_(req);
    if (res && res.ok === undefined) res.ok = true;
  } catch (err) {
    res = { ok: false, error: String((err && err.message) || err), code: (err && err.code) || '' };
  }
  return json_(res);
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function route_(req) {
  const a = String(req.action || '');
  const thisYm = jstDate_(new Date()).slice(0, 7);
  const ym = /^\d{4}-\d{2}$/.test(String(req.ym || '')) ? req.ym : thisYm;

  switch (a) {
    /* ---------- 共通 ---------- */
    case 'info': {
      const dev = getDevice_(req.device);
      return { config: publicConfig_(), device: dev ? { name: dev.name, store: dev.store } : null };
    }

    /* ---------- スタッフ端 ---------- */
    case 'login': {
      const s = authStaff_(req.id, req.pin);
      return { token: newSession_(s.id), staff: staffPublic_(s), config: publicConfig_() };
    }
    case 'setupPin': {
      const s = setupPin_(req.id, req.code, req.pin);
      return { token: newSession_(s.id), staff: staffPublic_(s), config: publicConfig_() };
    }
    case 'logout': dropSession_(req.token); return {};
    case 'changePin': { const s = sessionStaff_(req.token); changePin_(s, req.oldPin, req.newPin); return {}; }
    case 'me': {
      const s = sessionStaff_(req.token);
      const today = jstDate_(new Date());
      return { staff: staffPublic_(s), config: publicConfig_(), status: statusOf_(s), todayShifts: todayShiftOf_(s.id, today).map(x => ({ store: x.store, pat: x.pat, s: x.s, e: x.e, brk: x.brk, kind: x.kind, color: x.color })), leave: leaveBalance_(s.id) };
    }
    case 'punch': { const s = sessionStaff_(req.token); return doPunch_(s, req.type, req.store, req.loc || {}, null); }
    case 'myMonth': { const s = sessionStaff_(req.token); return myMonth_(s, ym); }
    case 'dayAll': { sessionStaff_(req.token); return dayAll_(req.date); }
    case 'hope.get': {
      const s = sessionStaff_(req.token); const h = getHopes_(ym);
      const mine = {}; Object.keys(h.byKey).forEach(k => { if (k.indexOf(s.id + '|') === 0) mine[k.split('|')[1]] = h.byKey[k]; });
      return { ym: ym, days: mine, submittedAt: h.submitted[s.id] || '', deadline: jstDate_(hopeDeadline_(ym)), closed: new Date() > hopeDeadline_(ym), leave: leaveBalance_(s.id) };
    }
    case 'hope.save': { const s = sessionStaff_(req.token); return saveHope_(s, ym, req.days || {}, null); }
    case 'request.fix': { const s = sessionStaff_(req.token); return requestFix_(s, req.date, req.in, req.out, req.reason); }
    case 'myPunches': { const s = sessionStaff_(req.token); return { list: myPunches_(s, req.days || 14) }; }
    case 'myRequests': { const s = sessionStaff_(req.token); return { list: readTable_(SH.REQUEST).filter(r => String(r['従業員番号']).trim() === s.id && String(r['種別']) !== '勤怠確認').map(reqPublic_).reverse().slice(0, 20) }; }

    /* ---------- 店内端末 ---------- */
    case 'staffList': { const d = requireDevice_(req.device); return { staff: staffForDevice_(d), store: d.store, config: publicConfig_() }; }
    case 'kioskStatus': { const d = requireDevice_(req.device); const s = authStaff_(req.id, req.pin); const today = jstDate_(new Date()); return Object.assign({ status: statusOf_(s), name: s.name, todayShifts: todayShiftOf_(s.id, today).map(x => ({ store: x.store, pat: x.pat, s: x.s, e: x.e, color: x.color })) }); }
    case 'kioskPunch': { const d = requireDevice_(req.device); const s = authStaff_(req.id, req.pin); return doPunch_(s, req.type, d.store, {}, d); }
    case 'kioskSetupPin': { requireDevice_(req.device); const s = setupPin_(req.id, req.code, req.pin); return { name: s.name }; }
    case 'registerDevice': return registerDevice_(req);
    case 'unregisterDevice': unregisterDevice_(req.device); return {};

    /* ---------- 管理端 ---------- */
    case 'admin.me': { const ad = requireAdmin_(req.token); return { admin: staffPublic_(ad), stores: adminStores_(ad), config: publicConfig_() }; }
    case 'admin.inbox': { const ad = requireAdmin_(req.token); return inbox_(ad, req.store, ym); }
    case 'admin.shifts': {
      const ad = requireAdmin_(req.token); const st = req.store || (isHR_(ad) ? '全店' : ad.home);
      if (!allowStore_(ad, st) && st !== '全店') throwErr_('担当外の店舗です', 'FORBIDDEN');
      const h = getHopes_(ym);
      return { ym: ym, store: st, shifts: getShifts_(ym).map(x => { const o = Object.assign({}, x); delete o._row; return o; }), hopes: h.byKey, submitted: h.submitted, staff: activeStaff_().filter(x => !isBackOffice_(x)).map(staffPublic_), publish: publishInfo_(ym), closed: isClosed_(ym), check: checkMonth_(ym, st), changes: changes_(ym), deadline: jstDate_(hopeDeadline_(ym)) };
    }
    case 'admin.shifts.save': { const ad = requireAdmin_(req.token); return saveShifts_(ad, ym, req.items || [], req.opts || {}); }
    case 'admin.shifts.check': { const ad = requireAdmin_(req.token); return checkMonth_(ym, req.store || (isHR_(ad) ? '全店' : ad.home)); }
    case 'admin.shifts.publish': { const ad = requireAdmin_(req.token); return publishMonth_(ad, ym); }
    case 'admin.shifts.candidates': { const ad = requireAdmin_(req.token); if (!allowStore_(ad, req.store)) throwErr_('担当外の店舗です', 'FORBIDDEN'); return { list: candidates_(req.date, req.store) }; }
    case 'admin.shifts.ai': { const ad = requireAdmin_(req.token); return aiDraft_(ad, ym, req.store); }
    case 'admin.hope.proxy': { const ad = requireAdmin_(req.token); const s = staffById_(req.staffId); if (!s) throwErr_('従業員が見つかりません'); return saveHope_(s, ym, req.days || {}, ad); }
    case 'admin.att.flags': { const ad = requireAdmin_(req.token); return { ym: ym, closed: isClosed_(ym), list: flags_(ym, req.store || (isHR_(ad) ? '全店' : ad.home)) }; }
    case 'admin.att.ack': { const ad = requireAdmin_(req.token); ackFlag_(ad, req.staffId, req.date); return {}; }
    case 'admin.att.fix': { const ad = requireAdmin_(req.token); return applyFix_(ad, req); }
    case 'admin.att.close': { const ad = requireAdmin_(req.token); return closeMonth_(ad, ym); }
    case 'admin.att.month': { const ad = requireAdmin_(req.token); return { ym: ym, list: monthSummary_(ym, req.store || (isHR_(ad) ? '全店' : ad.home)) }; }
    case 'admin.att.log': { const ad = requireAdmin_(req.token); return { list: logList_(normDate_(req.from) || ym + '-01', normDate_(req.to) || ym + '-' + pad2_(daysInMonth_(ym)), req.store || (isHR_(ad) ? '全店' : ad.home)) }; }
    case 'admin.requests': { requireAdmin_(req.token); return { list: readTable_(SH.REQUEST).filter(r => String(r['状態']) === '申請中').map(reqPublic_) }; }
    case 'admin.requests.decide': { const ad = requireAdmin_(req.token); return decideRequest_(ad, req.id, !!req.approve, false); }
    case 'admin.payroll': { requireHR_(req.token); return computePayroll_(ym); }
    case 'admin.leave': { const ad = requireAdmin_(req.token); return { list: leaveSummary_(req.store || (isHR_(ad) ? '全店' : ad.home)), requests: leaveRequests_() }; }
    case 'admin.leave.grant': { requireHR_(req.token); grantAnnual_(); return {}; }
    case 'admin.staff': { const ad = requireAdmin_(req.token); return { list: activeStaff_().concat(getStaff_().filter(s => !s.active)).map(staffAdmin_) }; }
    case 'admin.staff.save': { const ad = requireAdmin_(req.token); return saveStaff_(ad, req.staff || {}); }
    case 'admin.staff.issueCode': { requireHR_(req.token); return { code: issueInitCode_(req.staffId) }; }
    case 'admin.settings': { requireHR_(req.token); const c = getCompany_(); delete c.adminPw; return { company: c, stores: getStores_().map(s => { const o = Object.assign({}, s); delete o._row; return o; }), patterns: getPatterns_(), need: getNeed_(), holidays: getHolidays_(), devices: readTable_(SH.DEVICE).filter(r => truthy_(r['有効']) || r['有効'] === '').map(r => ({ name: String(r['端末名']), store: String(r['店舗'] || ''), at: r['登録日時'] instanceof Date ? jstDate_(r['登録日時']) : '' })), geminiKeySet: !!geminiKey_() }; }
    case 'admin.settings.company': { requireHR_(req.token); saveCompany_(req.company || {}); return {}; }
    case 'admin.settings.store': { requireHR_(req.token); saveStore_(req.store || {}); if (req.need) saveNeed_(req.store.name, req.need); return {}; }
    case 'admin.settings.patterns': { requireHR_(req.token); savePatterns_(req.patterns || []); return {}; }
    case 'admin.settings.holidays': { requireHR_(req.token); saveHolidays_(req.holidays || []); return {}; }
    case 'admin.store.setLocation': {
      const ad = requireAdmin_(req.token); const st = requireStore_(req.store); if (!allowStore_(ad, st.name)) throwErr_('担当外の店舗です', 'FORBIDDEN');
      const upd = {}; if (req.lat != null && req.lng != null) { upd['緯度'] = Number(req.lat); upd['経度'] = Number(req.lng); }
      if (req.ip && st.ips.indexOf(req.ip) < 0) upd['店舗IP(カンマ区切り)'] = st.ips.concat([req.ip]).join(',');
      updateRow_(SH.STORE, st._row, upd); clearCache_(); return {};
    }
    default: throwErr_('不明な操作です: ' + a);
  }
}

/** 管理端トップ「やること」と「本日の出勤」 */
function inbox_(admin, storeFilter, ym) {
  const st = storeFilter || (isHR_(admin) ? '全店' : admin.home);
  const today = jstDate_(new Date()), now = new Date();
  const stores = getStores_().filter(S => (st === '全店' || S.name === st) && allowStore_(admin, S.name));
  // 本日の出勤：店舗ごと＋イベント
  const todayShifts = getShifts_(today.slice(0, 7)).filter(x => x.date === today && x.kind !== '有給');
  const states = {};
  activeStaff_().forEach(s => { const stt = stateFrom_(logsOf_(s.id), now); states[s.id] = stt; });
  const frames = stores.map(S => ({ name: S.name, need: isStoreClosed_(S, today) ? 0 : needOn_(S.name, today), closed: isStoreClosed_(S, today),
    members: todayShifts.filter(x => x.store === S.name && x.pat !== 'イベント').map(x => memberRow_(x, states[x.staffId])) }));
  const ev = todayShifts.filter(x => x.pat === 'イベント' && stores.some(S => S.name === x.store));
  if (ev.length) frames.push({ name: 'イベント', need: null, members: ev.map(x => memberRow_(x, states[x.staffId])) });

  // やること
  const tasks = [];
  const nextYm = (() => { const [y, m] = today.slice(0, 7).split('-').map(Number); return m === 12 ? (y + 1) + '-01' : y + '-' + pad2_(m + 1); })();
  const chk = checkMonth_(nextYm, st);
  if (chk.stats.unsubmitted.length) tasks.push({ kind: 'hope', n: chk.stats.unsubmitted.length, title: '希望シフト 未提出', sub: chk.stats.unsubmitted.join('、') + ' ・ ' + nextYm + ' ・ 締切 ' + jstDate_(hopeDeadline_(nextYm)), ym: nextYm });
  readTable_(SH.REQUEST).filter(r => String(r['状態']) === '申請中').map(reqPublic_).forEach(r => {
    const s = staffById_(r.staffId); if (!s || !(st === '全店' || s.stores.indexOf(st) >= 0)) return;
    tasks.push({ kind: r.kind === '打刻修正' ? 'fix' : 'leave', n: 1, title: r.kind === '打刻修正' ? '打刻修正の申請' : '有給の申請', sub: r.name + ' ・ ' + r.date + (r.kind === '打刻修正' ? ' ' + (r.content.in ? '出勤 ' + r.content.in + ' ' : '') + (r.content.out ? '退勤 ' + r.content.out : '') + ' ・ 理由：' + r.reason : ' ・ ' + r.reason), request: r });
  });
  const fl = flags_(today.slice(0, 7), st).filter(f => f.sev === 'ng' && !f.request);   // 本人から申請が来ている分は「申請」として出す
  fl.forEach(f => tasks.push({ kind: 'miss', n: 1, title: f.issues.join('・'), sub: f.name + ' ・ ' + f.date + ' ' + f.plan + (f.in ? '（出勤 ' + f.in + '）' : ''), flag: f }));
  if (!isPublished_(nextYm)) tasks.push({ kind: 'draft', n: 1, title: nextYm.replace('-', '年') + '月シフト 下書き', sub: '確定できない問題 ' + chk.block.length + '件 ・ ' + (chk.warn.map(w => w.t).join(' ・ ') || '注意なし') + ' ・ 公開予定 ' + getCompany_().publishDay + '日', ym: nextYm });
  const over = chk.warn.find(w => w.key === 'over40');
  if (over) tasks.push({ kind: 'ot', n: 1, title: '週40時間を超える見込み', sub: over.s.replace(' ＝ 残業代が発生します', ''), ym: nextYm });
  return { today: today, frames: frames, tasks: tasks, store: st };
}
function memberRow_(x, stt) {
  const s = staffById_(x.staffId) || { name: x.staffId };
  return { staffId: x.staffId, name: s.name, pat: x.pat, s: x.s, e: x.e, color: x.color, state: stt ? stt.state : 'off', inAt: stt && stt.in || null };
}
/* ===== gas/Monthly.gs ===== */
/**
 * MMC 勤怠 v2 — 月次集計シート（第1期の「yyyy-mm」シートを踏襲）と夜間ジョブ
 */

function buildThisMonth() { const d = jstDate_(new Date()); buildMonthlySheet(Number(d.slice(0, 4)), Number(d.slice(5, 7))); }
function buildLastMonth() { const d = jstDate_(new Date()); let y = Number(d.slice(0, 4)), m = Number(d.slice(5, 7)) - 1; if (m === 0) { y--; m = 12; } buildMonthlySheet(y, m); }
function buildPromptMonth() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('月を指定して集計', '例: 2026-10', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const m = String(r.getResponseText()).trim().match(/^(\d{4})-(\d{1,2})$/);
  if (!m) { ui.alert('yyyy-mm の形式で入力してください'); return; }
  buildMonthlySheet(Number(m[1]), Number(m[2]));
}

function buildMonthlySheet(year, month) {
  const ym = year + '-' + pad2_(month);
  const company = getCompany_();
  const staff = getStaff_();
  const now = new Date();
  const summary = [], detail = [], flagged = [];
  staff.filter(s => s.active).forEach(s => {
    const sessions = buildSessions_(logsOf_(s.id, 0)).filter(x => x.workDate.slice(0, 7) === ym);
    let tw = 0, tb = 0, tn = 0, to = 0, tno = 0, days = 0, issueCount = 0;
    sessions.forEach(x => {
      const c = calcSession_(x, 480, now, company);
      if (c.worked > 0) days++;
      tw += c.worked; tb += c.brk; tn += c.night; to += c.ot; tno += c.nightOt;
      const real = c.issues.filter(i => i !== '勤務中');
      if (real.length) issueCount++;
      detail.push([x.workDate, s.id, s.name, x.store, x.in ? fmtTime_(x.in) : '', x.out ? (jstDate_(x.out) !== x.workDate ? '翌' : '') + fmtTime_(x.out) : '', c.brk, h_(c.worked), h_(c.ot), h_(c.night), h_(c.nightOt), c.issues.join('・')]);
      if (real.length) flagged.push(detail.length - 1);
    });
    summary.push([s.id, s.name, s.home, days, h_(tw), h_(to), h_(tn), h_(tno), h_(tb), issueCount ? issueCount + '件' : '']);
  });
  detail.sort((a, b) => (a[1] + a[0]).localeCompare(b[1] + b[0]));

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(ym) || ss.insertSheet(ym, ss.getSheets().length);
  sh.clear();
  sh.getRange(1, 1).setValue(year + '年' + month + '月 勤怠集計').setFontSize(14).setFontWeight('bold');
  sh.getRange(2, 1).setValue('更新: ' + fmtDateTime_(now) + '　※時間は10進数（7.5 = 7時間30分）／残業 = 1日8時間超／深夜 = 22:00〜5:00').setFontColor('#777777');
  const sumHead = ['従業員番号', '氏名', '主所属', '出勤日数', '実働(h)', '残業(h)', '深夜(h)', '深夜残業(h)', '休憩(h)', '要確認'];
  let row = 4;
  sh.getRange(row, 1, 1, sumHead.length).setValues([sumHead]).setFontWeight('bold').setBackground('#1c1c1c').setFontColor('#ffffff');
  if (summary.length) { sh.getRange(row + 1, 1, summary.length, sumHead.length).setValues(summary); sh.getRange(row + 1, 5, summary.length, 5).setNumberFormat('0.00'); }
  row = row + summary.length + 3;
  const detHead = ['勤務日', '従業員番号', '氏名', '店舗', '出勤', '退勤', '休憩(分)', '実働(h)', '残業(h)', '深夜(h)', '深夜残業(h)', '要確認'];
  sh.getRange(row, 1, 1, detHead.length).setValues([detHead]).setFontWeight('bold').setBackground('#e6e6e6');
  if (detail.length) {
    sh.getRange(row + 1, 1, detail.length, 3).setNumberFormat('@');
    sh.getRange(row + 1, 1, detail.length, detHead.length).setValues(detail);
    sh.getRange(row + 1, 8, detail.length, 4).setNumberFormat('0.00');
    flagged.forEach(i => sh.getRange(row + 1 + i, 1, 1, detHead.length).setBackground('#f6e7e7'));
  }
  sh.autoResizeColumns(1, detHead.length);
  return { ym: ym, staff: summary.length, rows: detail.length };
}

/** 毎晩 3:00 */
function nightlyJobs() {
  absorbGeminiKey_();
  purgeSessions_();
  grantAnnual_();
}
/* ===== gas/Payroll.gs ===== */
/**
 * MMC 勤怠 v2 — 人件費
 *
 * 1日 8h 超（日次残業）＋ 週 40h 超（週次残業。日次で数えた分は除く）＋ 深夜 22:00〜5:00 ＋ 月 60h 超。
 * 換算時給：正社員＝月給 ÷ 主所属店舗の月平均所定労働時間（端数は設定）／アルバイト＝時給。
 *   正社員   残業代 = 残業h × 時給 × 残業割増 + 深夜h × 時給 × 深夜割増 + 60h超h × 時給 × 60h超割増
 *   アルバイト 給料 = 実働h × 時給 + 残業h × 時給 × (残業割増−1) + 深夜h × 時給 × 深夜割増 + 60h超h × 時給 × 60h超割増 + 有給分
 * 2か所で働いた日も 1人として合算する。深夜残業は「その日の残業のうち深夜の分」で、1.5倍になる。
 */

function hourlyRate_(staff, company) {
  if (staff.type === '正社員') {
    const st = storeByName_(staff.home);
    const h = st && st.monthlyH ? st.monthlyH : 170;
    const raw = staff.monthly / h;
    return company.rounding === '四捨五入' ? Math.round(raw) : company.rounding === '切り捨て' ? Math.floor(raw) : Math.ceil(raw);
  }
  return staff.hourly;
}

/** 1人・1か月の時間集計（純粋関数：sessions は calcSession_ 済みの日別配列） */
function aggregateMonth_(dayRows, weekStartDow) {
  // dayRows: [{date, worked, night, brk}] 分単位（同じ日は合算済み）
  const byDate = {};
  dayRows.forEach(r => { const o = byDate[r.date] = byDate[r.date] || { date: r.date, worked: 0, night: 0, brk: 0 }; o.worked += r.worked; o.night += r.night; o.brk += r.brk; });
  const days = Object.keys(byDate).sort().map(k => byDate[k]);
  let worked = 0, night = 0, dailyOt = 0, nightOt = 0, attended = 0;
  const weeks = {};
  days.forEach(d => {
    const ot = Math.max(0, d.worked - 480);
    d.ot = ot; d.nightOt = Math.min(d.night, ot);
    worked += d.worked; night += d.night; dailyOt += ot; nightOt += d.nightOt;
    if (d.worked > 0) attended++;
    // 週キー：週起算日からの週番号
    const dw = dow_(d.date); const back = (dw - weekStartDow + 7) % 7;
    const [y, m, dd] = d.date.split('-').map(Number);
    const wkStart = new Date(Date.UTC(y, m - 1, dd - back)).toISOString().slice(0, 10);
    weeks[wkStart] = (weeks[wkStart] || 0) + Math.min(d.worked, 480);
  });
  let weeklyOt = 0;
  Object.keys(weeks).forEach(k => { weeklyOt += Math.max(0, weeks[k] - 2400); });
  const totalOt = dailyOt + weeklyOt;
  const over60 = Math.max(0, totalOt - 3600);
  return { days: days, attended: attended, worked: worked, night: night, dailyOt: dailyOt, weeklyOt: weeklyOt, ot: totalOt, nightOt: nightOt, over60: over60 };
}

/** 金額計算（純粋関数） */
function payOf_(staff, agg, rate, company, leaveDays, leaveHours) {
  const H = m => m / 60;
  const ot = H(agg.ot), night = H(agg.night), over60 = H(agg.over60), worked = H(agg.worked);
  let otPay = 0, salary = 0, leavePay = 0;
  if (staff.type === '正社員') {
    otPay = ot * rate * company.otRate + night * rate * company.nightRate + over60 * rate * company.over60Rate;
  } else {
    salary = worked * rate + ot * rate * (company.otRate - 1) + night * rate * company.nightRate + over60 * rate * company.over60Rate;
    leavePay = (leaveDays || 0) * (leaveHours || 0) * rate;
    salary += leavePay;
  }
  const transport = staff.trKind === '月額' ? staff.trAmt : staff.trAmt * (agg.attended + (leaveDays || 0));
  return { otPay: Math.round(otPay), salary: Math.round(salary), leavePay: Math.round(leavePay), transport: Math.round(transport) };
}

function computePayroll_(ym) {
  const company = getCompany_(), now = new Date();
  const weekStartDow = WD_JA.indexOf(company.weekStart) >= 0 ? WD_JA.indexOf(company.weekStart) : 1;
  const shifts = getShifts_(ym);
  const paidPat = getPatterns_().find(p => p.kind === '有給');
  const leaveHours = paidPat ? patternHours_(paidPat) : 8;
  const rows = activeStaff_().filter(s => !isBackOffice_(s)).map(staff => {
    const sessions = buildSessions_(logsOf_(staff.id, 0)).filter(s => s.workDate.slice(0, 7) === ym);
    const detail = [];
    const dayRows = sessions.map(s => { const c = calcSession_(s, 480, now, company); detail.push({ date: s.workDate, store: s.store, in: s.in ? fmtTime_(s.in) : '', out: s.out ? fmtTime_(s.out) : '', brk: c.brk, worked: h_(c.worked), night: h_(c.night), issues: c.issues.filter(x => x !== '勤務中') }); return { date: s.workDate, worked: c.worked, night: c.night, brk: c.brk }; });
    const agg = aggregateMonth_(dayRows, weekStartDow);
    const leaveDays = shifts.filter(x => x.staffId === staff.id && x.kind === '有給' && x.state === '確定').length;
    const rate = hourlyRate_(staff, company);
    const pay = payOf_(staff, agg, rate, company, leaveDays, leaveHours);
    return Object.assign({ id: staff.id, name: staff.name, type: staff.type, home: staff.home, rate: rate, monthly: staff.monthly, hourly: staff.hourly, trKind: staff.trKind, trAmt: staff.trAmt,
      days: agg.attended, worked: h_(agg.worked), ot: h_(agg.ot), dailyOt: h_(agg.dailyOt), weeklyOt: h_(agg.weeklyOt), night: h_(agg.night), nightOt: h_(agg.nightOt), over60: h_(agg.over60), leaveDays: leaveDays, detail: detail }, pay);
  });
  const totals = rows.reduce((a, r) => { a.otPay += r.otPay; a.salary += r.salary; a.transport += r.transport; return a; }, { otPay: 0, salary: 0, transport: 0 });
  const byStore = {};
  rows.forEach(r => { byStore[r.home] = (byStore[r.home] || 0) + r.otPay + r.salary + r.transport; });
  const [y, m] = ym.split('-').map(Number);
  const payYm = m === 12 ? (y + 1) + '-01' : y + '-' + pad2_(m + 1);
  return { ym: ym, payYm: payYm, closed: isClosed_(ym), rates: { ot: company.otRate, night: company.nightRate, nightOt: company.nightOtRate, over60: company.over60Rate, rounding: company.rounding }, staff: rows, totals: totals, byStore: byStore };
}

/** 締め時に「人件費_yyyy-mm」シートへ書く（税理士の表と同じ列） */
function writePayrollSheet_(ym, res) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = '人件費_' + ym;
  const sh = ss.getSheetByName(name) || ss.insertSheet(name, ss.getSheets().length);
  sh.clear();
  const [y, m] = ym.split('-').map(Number), [py, pm] = res.payYm.split('-').map(Number);
  sh.getRange(1, 1).setValue(y + '年' + m + '月分 人件費（締め：' + fmtDateTime_(new Date()) + '）').setFontSize(13).setFontWeight('bold');
  const head = ['氏名', '雇用区分', '主所属', '勤務月', '支払月', '残業代(深夜含む)', '給料(アルバイト)', '交通費', '換算時給', '出勤日数', '実働h', '残業h', '深夜h', '深夜残業h', '60h超h', '有給日数'];
  sh.getRange(3, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#1c1c1c').setFontColor('#ffffff');
  const rows = res.staff.map(r => [r.name, r.type, r.home, y + '年' + m + '月', py + '年' + pm + '月', r.type === '正社員' ? r.otPay : '', r.type === '正社員' ? '' : r.salary, r.transport, r.rate, r.days, r.worked, r.ot, r.night, r.nightOt, r.over60, r.leaveDays]);
  if (rows.length) { sh.getRange(4, 1, rows.length, head.length).setValues(rows); sh.getRange(4, 6, rows.length, 4).setNumberFormat('#,##0'); }
  sh.getRange(5 + rows.length, 1).setValue('※ 源泉徴収と支払額は税理士が計算。割増：残業 ×' + res.rates.ot + '、深夜 +' + res.rates.night + '、60h超 +' + res.rates.over60 + '、換算時給は' + res.rates.rounding).setFontColor('#595959');
  sh.autoResizeColumns(1, head.length);
}
/* ===== gas/Sheets.gs ===== */
/**
 * MMC 勤怠 v2 — シート定義・初期設定・第1期からの移行
 *
 * すべてのデータは Google スプレッドシートに置く。シート名と列はここだけで定義し、
 * 他のファイルは SH / COL を通じて参照する（列の追加・並び替えに強くするため）。
 */

const SH = {
  CONFIG:   '設定',        // 会社共通の設定（項目 / 値）
  STORE:    '店舗',        // 拠点（店舗・焙煎所・…）
  STAFF:    '従業員',
  PATTERN:  'シフトパターン',
  NEED:     '必要人数',
  HOLIDAY:  '会社休日',
  HOPE:     '希望シフト',
  SHIFT:    'シフト',
  PUBLISH:  'シフト公開',
  CHANGE:   '変更履歴',
  LOG:      '打刻ログ',
  REQUEST:  '申請',
  LEAVE:    '有給台帳',
  CLOSE:    '月締め',
  DEVICE:   '店舗端末',
};

/** 各シートの列（順番がそのまま列順。既存シートに無い列は setup() が右端に追加する） */
const COL = {
  STORE:   ['店舗ID', '店舗名', '略称', '緯度', '経度', '許可半径(m)', '店舗IP(カンマ区切り)', '営業開始', '営業終了', '定休曜日(カンマ区切り)', '年間休日', '月平均所定時間', '有給付与日数', '有効'],
  STAFF:   ['従業員番号', '氏名', 'PIN(4〜6桁)', '雇用区分', '在籍', 'メモ',
            'PINハッシュ', '初期コード', '権限', '主所属', '所属店舗(カンマ区切り)', '月給', '時給', '交通費区分', '交通費額', '入社日', '表示順', 'いつもの出勤(JSON)'],
  PATTERN: ['パターンID', '名称', '店舗', '開始', '終了', '休憩(分)', '色', '種別', '表示順', '有効'],
  NEED:    ['店舗', '月', '火', '水', '木', '金', '土', '日'],
  HOLIDAY: ['日付', '店舗', '名称'],
  HOPE:    ['対象月', '日付', '従業員番号', '種別', 'パターン', '開始', '終了', 'メモ', '提出日時', '入力者'],
  SHIFT:   ['シフトID', '日付', '従業員番号', '店舗', 'パターン', '開始', '終了', '休憩(分)', '状態', '作成元', '変更理由', '更新者', '更新日時'],
  PUBLISH: ['対象月', '状態', '確定日時', '確定者'],
  CHANGE:  ['日時', '対象月', '日付', '従業員番号', '氏名', '変更前', '変更後', '理由', '操作者'],
  LOG:     ['打刻日時', '勤務日', '従業員番号', '氏名', '種別', '確認方法', '緯度', '経度', '精度(m)', '距離(m)', 'IP', '端末', '備考',
            '店舗', '無効'],
  REQUEST: ['申請ID', '種別', '従業員番号', '氏名', '日付', '内容', '理由', '状態', '申請日時', '処理者', '処理日時'],
  LEAVE:   ['従業員番号', '氏名', '付与日', '付与日数', '失効日', 'メモ'],
  CLOSE:   ['対象月', '締め日時', '締め者'],
  DEVICE:  ['端末トークン', '端末名', '登録日時', '有効', '店舗'],
};

/** 会社共通の設定（無いものだけ追加される） */
const CONFIG_DEFAULTS = [
  ['希望締切日', 15],
  ['公開予定日', 25],
  ['週起算曜日', '月'],
  ['残業割増', 1.25],
  ['深夜割増', 0.25],
  ['深夜残業割増', 1.5],
  ['60h超割増', 0.25],
  ['休憩6h超(分)', 45],
  ['休憩8h超(分)', 60],
  ['換算時給の端数', '切り上げ'],
  ['退勤忘れ通知(分)', 60],
  ['位置確認', 'ON'],
  ['管理者パスワード', ''],          // 店舗端末の登録にだけ使う
  ['GEMINI_API_KEY', ''],           // ここに貼ると次回アクセス時にスクリプトプロパティへ移して空にする
  ['GEMINIモデル', 'gemini-2.5-flash'],
];

/* ============================== 初期設定 ============================== */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('勤怠')
    .addItem('今月の集計を更新', 'buildThisMonth')
    .addItem('先月の集計を作成', 'buildLastMonth')
    .addItem('月を指定して集計…', 'buildPromptMonth')
    .addSeparator()
    .addItem('初期設定 / 列の追加（何度実行してもOK）', 'setup')
    .addToUi();
}

/**
 * 初回・更新時に実行する。
 *  - 無いシートを作り、無い列を右端に追加する（既存データは消さない）
 *  - 第1期の設定（店舗名・座標・IP）を「店舗」シートへ移す
 *  - 第1期の PIN 平文をハッシュへ移す
 *  - トリガーを作り直す
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('Asia/Tokyo');

  const cfgSh = ensureSheet_(ss, SH.CONFIG, ['項目', '値']);
  const existing = cfgSh.getDataRange().getValues().map(r => String(r[0]));
  CONFIG_DEFAULTS.forEach(r => { if (existing.indexOf(r[0]) < 0) cfgSh.appendRow(r); });

  Object.keys(COL).forEach(k => ensureSheet_(ss, SH[k], COL[k]));

  // テキスト列（先頭の 0 を保持）
  textCols_(ss, SH.STAFF, ['従業員番号', 'PIN(4〜6桁)', '初期コード', '主所属', '入社日']);
  textCols_(ss, SH.LOG, ['勤務日', '従業員番号']);
  sheet_(SH.LOG).getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  textCols_(ss, SH.HOPE, ['対象月', '日付', '従業員番号']);
  textCols_(ss, SH.SHIFT, ['日付', '従業員番号']);
  textCols_(ss, SH.HOLIDAY, ['日付']);
  textCols_(ss, SH.LEAVE, ['従業員番号', '付与日', '失効日']);
  textCols_(ss, SH.REQUEST, ['従業員番号', '日付']);

  migrateV1_();
  seedDefaults_();

  if (!getCompany_().adminPw) setConfig_('管理者パスワード', Math.random().toString(36).slice(2, 10));

  ScriptApp.getProjectTriggers().forEach(t => {
    if (['buildThisMonth', 'buildLastMonth', 'nightlyJobs'].indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('buildThisMonth').timeBased().everyDays(1).atHour(4).inTimezone('Asia/Tokyo').create();
  ScriptApp.newTrigger('buildLastMonth').timeBased().onMonthDay(1).atHour(5).inTimezone('Asia/Tokyo').create();
  ScriptApp.newTrigger('nightlyJobs').timeBased().everyDays(1).atHour(3).inTimezone('Asia/Tokyo').create();

  const def = ss.getSheetByName('シート1') || ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(def);

  clearCache_();
  Logger.log('初期設定が完了しました。「店舗」「従業員」「シフトパターン」を確認してください。');
}

/** 第1期の「設定」にあった店舗情報を「店舗」シートへ、PIN 平文をハッシュへ */
function migrateV1_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfg = readConfigMap_();
  const storeSh = sheet_(SH.STORE);
  if (storeSh.getLastRow() < 2) {
    const name = String(cfg['店舗名'] || '店舗');
    storeSh.appendRow(['shop', name, name.slice(0, 1), cfg['店舗緯度'] || '', cfg['店舗経度'] || '', cfg['許可半径(m)'] || 150,
      cfg['店舗IP(カンマ区切り)'] || '', '11:00', '18:00', '', 110, 170.0, 21, true]);
  }
  // PIN 平文 → ハッシュ
  const sh = sheet_(SH.STAFF);
  const head = headers_(sh);
  const cPin = head.indexOf('PIN(4〜6桁)'), cHash = head.indexOf('PINハッシュ');
  if (cPin >= 0 && cHash >= 0 && sh.getLastRow() >= 2) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues();
    vals.forEach((r, i) => {
      const pin = String(r[cPin] || '').trim();
      if (pin && !String(r[cHash] || '').trim()) {
        sh.getRange(i + 2, cHash + 1).setValue(pinHash_(String(r[0]).trim(), pin));
        sh.getRange(i + 2, cPin + 1).setValue('');
      }
    });
  }
  // 第1期の店舗端末に店舗列が無ければ最初の店舗にする
  const dev = sheet_(SH.DEVICE);
  const dh = headers_(dev), cStore = dh.indexOf('店舗');
  if (cStore >= 0 && dev.getLastRow() >= 2) {
    const first = getStores_()[0];
    const vals = dev.getRange(2, cStore + 1, dev.getLastRow() - 1, 1).getValues();
    vals.forEach((r, i) => { if (!String(r[0]).trim() && first) dev.getRange(i + 2, cStore + 1).setValue(first.name); });
  }
}

/** パターン・必要人数が空なら MMC の初期値を入れる */
function seedDefaults_() {
  const pat = sheet_(SH.PATTERN);
  const stores = getStores_();
  const main = stores[0] ? stores[0].name : '店舗';
  if (pat.getLastRow() < 2) {
    [
      ['p_open', 'オーラス', main, '09:30', '18:30', 60, '#1c1c1c', '勤務', 1, true],
      ['p_mid', '中番', main, '12:30', '18:00', 0, '#3d6a8f', '勤務', 2, true],
      ['p_prep', '仕込み', main, '08:00', '12:00', 0, '#d9a441', '勤務', 3, true],
      ['p_event', 'イベント', '共通', '09:00', '20:00', 60, '#8e3b6b', '勤務', 5, true],
      ['p_paid', '有給', '共通', '11:30', '19:30', 60, '#4f8a5b', '有給', 9, true],
    ].forEach(r => pat.appendRow(r));
  }
  const need = sheet_(SH.NEED);
  if (need.getLastRow() < 2) stores.forEach(s => need.appendRow([s.name, 2, 2, 2, 2, 2, 3, 3]));
  const pub = sheet_(SH.PUBLISH);
  void pub;
}

/* ============================== 低レベルアクセス ============================== */

function sheet_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('シート「' + name + '」がありません。メニュー「勤怠 → 初期設定」を実行してください');
  return sh;
}

/** シートが無ければ作り、無い列は右端に追加する */
function ensureSheet_(ss, name, headers) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#e6e6e6');
    sh.setFrozenRows(1);
    return sh;
  }
  const have = headers_(sh);
  const missing = headers.filter(h => have.indexOf(h) < 0);
  if (missing.length) {
    sh.getRange(1, have.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold').setBackground('#e6e6e6');
  }
  return sh;
}

function textCols_(ss, name, cols) {
  const sh = ss.getSheetByName(name); if (!sh) return;
  const head = headers_(sh);
  cols.forEach(c => { const i = head.indexOf(c); if (i >= 0) sh.getRange(1, i + 1, sh.getMaxRows(), 1).setNumberFormat('@'); });
}

function headers_(sh) {
  const lc = sh.getLastColumn();
  if (lc < 1) return [];
  return sh.getRange(1, 1, 1, lc).getValues()[0].map(v => String(v).trim());
}

/** シート全体をオブジェクト配列で読む（ヘッダー名 → 値）。_row に行番号（1始まり）を入れる */
function readTable_(name) {
  const sh = sheet_(name);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const head = headers_(sh);
  const vals = sh.getRange(2, 1, last - 1, head.length).getValues();
  const out = [];
  vals.forEach((r, i) => {
    if (r.every(v => v === '' || v == null)) return;
    const o = { _row: i + 2 };
    head.forEach((h, j) => { o[h] = r[j]; });
    out.push(o);
  });
  return out;
}

/** 文字として保存したい列（「001」が 1 に、「09:30」が時刻になるのを防ぐ） */
const TEXT_HEADERS = ['従業員番号', 'PIN(4〜6桁)', '初期コード', '主所属', '入社日', '勤務日', '対象月', '日付', '付与日', '失効日', '開始', '終了', '営業開始', '営業終了', '店舗ID', '所属店舗(カンマ区切り)', '定休曜日(カンマ区切り)', '店舗IP(カンマ区切り)', 'PINハッシュ', '端末トークン', 'シフトID', '申請ID'];

/** オブジェクトをヘッダー順の行にして追加（appendRow は "001" を数値にしてしまうので setValues で書く） */
function appendRow_(name, obj) {
  const sh = sheet_(name);
  const head = headers_(sh);
  const row = sh.getLastRow() + 1;
  head.forEach((h, i) => { if (TEXT_HEADERS.indexOf(h) >= 0) sh.getRange(row, i + 1).setNumberFormat('@'); });
  sh.getRange(row, 1, 1, head.length).setValues([head.map(h => (obj[h] === undefined || obj[h] === null) ? '' : obj[h])]);
}

/** 指定行の一部の列を更新 */
function updateRow_(name, row, obj) {
  const sh = sheet_(name);
  const head = headers_(sh);
  Object.keys(obj).forEach(h => {
    const i = head.indexOf(h);
    if (i < 0) return;
    const cell = sh.getRange(row, i + 1);
    if (TEXT_HEADERS.indexOf(h) >= 0) cell.setNumberFormat('@');
    cell.setValue(obj[h]);
  });
}

function deleteRows_(name, rows) {
  const sh = sheet_(name);
  rows.slice().sort((a, b) => b - a).forEach(r => sh.deleteRow(r));
}

/* ============================== キャッシュ ============================== */

const CACHE_SEC = 60;
function cached_(key, fn) {
  const c = CacheService.getScriptCache();
  const hit = c.get('C_' + key);
  if (hit) return JSON.parse(hit);
  const v = fn();
  try { c.put('C_' + key, JSON.stringify(v), CACHE_SEC); } catch (e) { /* 100KB 超は入れない */ }
  return v;
}
function clearCache_() {
  CacheService.getScriptCache().removeAll(['C_company', 'C_stores', 'C_patterns', 'C_need', 'C_holidays', 'C_staff']);
}

/* ============================== 小道具 ============================== */

const JST_OFFSET_MIN = 540;
function jstDate_(d) { return new Date(d.getTime() + JST_OFFSET_MIN * 60000).toISOString().slice(0, 10); }
function fmtTime_(d) { return new Date(d.getTime() + JST_OFFSET_MIN * 60000).toISOString().slice(11, 16); }
function fmtDateTime_(d) { return jstDate_(d) + ' ' + fmtTime_(d); }
function pad2_(n) { return (n < 10 ? '0' : '') + n; }
function round2_(x) { return Math.round(x * 100) / 100; }
function h_(min) { return round2_(min / 60); }
function normDate_(v) {
  if (!v) return '';
  if (v instanceof Date) return jstDate_(v);
  const m = String(v).trim().match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  return m ? m[1] + '-' + pad2_(Number(m[2])) + '-' + pad2_(Number(m[3])) : '';
}
function normTime_(v) {
  if (v instanceof Date) return fmtTime_(v);
  const m = String(v == null ? '' : v).trim().match(/^(\d{1,2}):(\d{2})/);
  return m ? pad2_(Number(m[1])) + ':' + m[2] : '';
}
function minsOf_(hhmm) { const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})$/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; }
function ymOf_(dateStr) { return String(dateStr).slice(0, 7); }
function daysInMonth_(ym) { const [y, m] = ym.split('-').map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
function dow_(dateStr) { const [y, m, d] = dateStr.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); } // 0=日
const WD_JA = ['日', '月', '火', '水', '木', '金', '土'];
function truthy_(v) { return v === true || String(v).toUpperCase() === 'TRUE' || v === 1 || String(v) === '1'; }
function nowJst_() { return new Date(); }
function uuid_() { return Utilities.getUuid(); }
function throwErr_(msg, code) { const e = new Error(msg); if (code) e.code = code; throw e; }
/* ===== gas/Shift.gs ===== */
/**
 * MMC 勤怠 v2 — 希望シフト・シフト作成・確定前チェック・公開・候補
 *
 * 状態：希望（スタッフが出す）→ 下書き（管理者が組む）→ 確定（公開。スタッフに見える）
 * 確定後の変更は理由を記録し「変更履歴」に残す。
 */

const HOPE_KINDS = ['休み', 'パターン', '時間', '有給', '出勤'];

/* ============================== 希望 ============================== */

/** 希望の締切（対象月の前月 締切日 23:59 JST） */
function hopeDeadline_(ym) {
  const [y, m] = ym.split('-').map(Number);
  const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
  const d = Math.min(getCompany_().deadlineDay, daysInMonth_(py + '-' + pad2_(pm)));
  return new Date(py + '-' + pad2_(pm) + '-' + pad2_(d) + 'T23:59:59+09:00');
}

/** { byKey: {'id|date': {kind,pat,s,e,memo}}, submitted: {id: '提出日時'} } */
function getHopes_(ym) {
  const byKey = {}, submitted = {};
  readTable_(SH.HOPE).forEach(r => {
    if (String(r['対象月']).trim() !== ym) return;
    const id = String(r['従業員番号']).trim();
    const kind = String(r['種別']).trim();
    if (kind === '提出') { submitted[id] = r['提出日時'] instanceof Date ? fmtDateTime_(r['提出日時']) : String(r['提出日時'] || ''); return; }
    const date = normDate_(r['日付']); if (!date) return;
    byKey[id + '|' + date] = { kind: kind, pat: String(r['パターン'] || ''), s: normTime_(r['開始']), e: normTime_(r['終了']), memo: String(r['メモ'] || ''), by: String(r['入力者'] || '') };
    if (!submitted[id] && r['提出日時']) submitted[id] = r['提出日時'] instanceof Date ? fmtDateTime_(r['提出日時']) : String(r['提出日時']);
  });
  return { byKey: byKey, submitted: submitted };
}

/**
 * 希望を提出（その人・その月の既存行を置き換える）
 * @param days { 'yyyy-mm-dd': {kind, pat?, s?, e?, memo?} }  入っていない日は「休み」として扱う（行は作らない）
 * @param byAdmin 管理者の代理入力なら管理者
 */
function saveHope_(staff, ym, days, byAdmin) {
  if (!/^\d{4}-\d{2}$/.test(ym)) throwErr_('対象月が不正です');
  if (!byAdmin && new Date() > hopeDeadline_(ym)) throwErr_('希望の締切（' + jstDate_(hopeDeadline_(ym)) + '）を過ぎています。管理者に連絡してください');
  const lock = LockService.getScriptLock(); if (!lock.tryLock(15000)) throwErr_('混み合っています');
  try {
    const rows = readTable_(SH.HOPE).filter(r => String(r['対象月']).trim() === ym && String(r['従業員番号']).trim() === staff.id).map(r => r._row);
    deleteRows_(SH.HOPE, rows);
    const now = new Date(), who = byAdmin ? byAdmin.name + '（代理）' : '本人';
    const leaveDates = [];
    Object.keys(days || {}).sort().forEach(date => {
      const d = normDate_(date); if (!d || d.slice(0, 7) !== ym) return;
      const h = days[date] || {}; const kind = HOPE_KINDS.indexOf(h.kind) >= 0 ? h.kind : 'パターン';
      if (kind === 'パターン' && !patternByName_(h.pat)) return;
      appendRow_(SH.HOPE, { '対象月': ym, '日付': d, '従業員番号': staff.id, '種別': kind, 'パターン': h.pat || '', '開始': h.s || '', '終了': h.e || '', 'メモ': String(h.memo || '').slice(0, 100), '提出日時': now, '入力者': who });
      if (kind === '有給') leaveDates.push(d);
    });
    appendRow_(SH.HOPE, { '対象月': ym, '日付': '', '従業員番号': staff.id, '種別': '提出', '提出日時': now, '入力者': who });
    syncLeaveRequests_(staff, ym, leaveDates);
  } finally { lock.releaseLock(); }
  return { submittedAt: fmtDateTime_(new Date()) };
}

/** 希望で選んだ「有給」を申請行にする（取り消された分は取り下げ） */
function syncLeaveRequests_(staff, ym, dates) {
  const reqs = readTable_(SH.REQUEST).filter(r => String(r['種別']) === '有給' && String(r['従業員番号']).trim() === staff.id && normDate_(r['日付']).slice(0, 7) === ym);
  dates.forEach(d => { if (!reqs.some(r => normDate_(r['日付']) === d && String(r['状態']) !== '却下')) appendRow_(SH.REQUEST, { '申請ID': 'L' + uuid_().slice(0, 8), '種別': '有給', '従業員番号': staff.id, '氏名': staff.name, '日付': d, '内容': '', '理由': '希望提出から', '状態': '申請中', '申請日時': new Date() }); });
  reqs.forEach(r => { if (String(r['状態']) === '申請中' && dates.indexOf(normDate_(r['日付'])) < 0) updateRow_(SH.REQUEST, r._row, { '状態': '却下', '処理者': '本人（取り下げ）', '処理日時': new Date() }); });
}

/* ============================== シフト ============================== */

function shiftFromRow_(r) {
  const pat = patternByName_(r['パターン']);
  const s = normTime_(r['開始']) || (pat && pat.s) || '', e = normTime_(r['終了']) || (pat && pat.e) || '';
  const brk = r['休憩(分)'] === '' ? (pat ? pat.brk : 0) : Number(r['休憩(分)']) || 0;
  const hours = patternHours_({ s: s, e: e, brk: brk });
  return {
    id: String(r['シフトID']), date: normDate_(r['日付']), staffId: String(r['従業員番号']).trim(), store: String(r['店舗']).trim(),
    pat: String(r['パターン']).trim(), s: s, e: e, brk: brk, hours: hours, kind: pat ? pat.kind : '勤務', color: pat ? pat.color : '#1c1c1c',
    state: String(r['状態'] || '下書き').trim(), origin: String(r['作成元'] || ''), reason: String(r['変更理由'] || ''), by: String(r['更新者'] || ''),
    at: r['更新日時'] instanceof Date ? fmtDateTime_(r['更新日時']) : String(r['更新日時'] || ''),
    custom: !!(pat && (s !== pat.s || e !== pat.e)), changed: !!String(r['変更理由'] || '').trim(), _row: r._row,
  };
}
function getShifts_(ym, storeFilter) {
  return readTable_(SH.SHIFT).map(shiftFromRow_).filter(x => x.date.slice(0, 7) === ym && (!storeFilter || storeFilter === '全店' || x.store === storeFilter));
}
function publishInfo_(ym) {
  const r = readTable_(SH.PUBLISH).find(x => String(x['対象月']).trim() === ym);
  return r ? { published: String(r['状態']) === '確定', at: r['確定日時'] instanceof Date ? fmtDateTime_(r['確定日時']) : String(r['確定日時'] || ''), by: String(r['確定者'] || '') } : { published: false, at: '', by: '' };
}
function isPublished_(ym) { return publishInfo_(ym).published; }

/** 週ごとの予定時間（週起算日から） */
function weekHoursOf_(shifts, ym, weekStart) {
  const n = daysInMonth_(ym), ws = WD_JA.indexOf(weekStart || '月'); if (ws < 0) return [];
  const out = []; let wk = 0;
  for (let d = 1; d <= n; d++) {
    const date = ym + '-' + pad2_(d);
    if (dow_(date) === ws && d > 1) { out.push(wk); wk = 0; }
    shifts.filter(x => x.date === date && x.kind !== '有給').forEach(x => { wk += x.hours; });
  }
  out.push(wk); return out;
}
function todayShiftOf_(staffId, date) { return getShifts_(date.slice(0, 7)).filter(x => x.staffId === staffId && x.date === date); }

/**
 * 管理者：シフトの保存（複数まとめて）
 * items: [{id?, date, staffId, store, pat, s?, e?, brk?, remove?, reason?}]
 * opts : {sameWeekday:true} → 同じ曜日の空いている日（希望休を除く）にも同じ内容を入れる
 */
function saveShifts_(admin, ym, items, opts) {
  opts = opts || {};
  if (isClosed_(ym)) throwErr_(ym + ' は締め済みです');
  const published = isPublished_(ym);
  const lock = LockService.getScriptLock(); if (!lock.tryLock(20000)) throwErr_('混み合っています');
  try {
    const hopes = getHopes_(ym).byKey;
    let all = getShifts_(ym);
    const now = new Date();
    const results = [];
    const write = it => {
      const staff = staffById_(it.staffId); if (!staff) throwErr_('従業員が見つかりません: ' + it.staffId);
      const date = normDate_(it.date); if (!date || date.slice(0, 7) !== ym) throwErr_('日付が不正です');
      const store = it.store ? requireStore_(it.store) : requireStore_(staff.home);
      if (!allowStore_(admin, store.name)) throwErr_(store.name + ' は担当外の店舗です', 'FORBIDDEN');
      if (staff.stores.indexOf(store.name) < 0) throwErr_(staff.name + ' は ' + store.name + ' に所属していません');
      let cur = it.id ? all.find(x => x.id === String(it.id)) : all.find(x => x.staffId === staff.id && x.date === date && x.store === store.name) || all.find(x => x.staffId === staff.id && x.date === date);
      const before = cur ? cur.pat + (cur.custom ? '(' + cur.s + '-' + cur.e + ')' : '') : '休み';
      if (it.remove || !it.pat) {
        if (cur) { deleteRows_(SH.SHIFT, [cur._row]); all = all.filter(x => x.id !== cur.id); if (published) logChange_(ym, date, staff, before, '休み', it.reason, admin); results.push({ date: date, staffId: staff.id, removed: true }); }
        return;
      }
      const pat = patternByName_(it.pat); if (!pat) throwErr_('パターンがありません: ' + it.pat);
      if (pat.store !== '共通' && pat.store !== store.name) throwErr_('「' + pat.name + '」は ' + store.name + ' では使えません');
      const s = normTime_(it.s) || pat.s, e = normTime_(it.e) || pat.e, brk = it.brk == null || it.brk === '' ? pat.brk : Number(it.brk) || 0;
      const row = { '日付': date, '従業員番号': staff.id, '店舗': store.name, 'パターン': pat.name, '開始': s === pat.s ? '' : s, '終了': e === pat.e ? '' : e, '休憩(分)': brk === pat.brk ? '' : brk,
        '状態': published ? '確定' : '下書き', '作成元': it.origin || '手動', '変更理由': published ? String(it.reason || '店都合') : '', '更新者': admin.name, '更新日時': now };
      const after = pat.name + ((s !== pat.s || e !== pat.e) ? '(' + s + '-' + e + ')' : '');
      if (cur) { updateRow_(SH.SHIFT, cur._row, row); Object.assign(cur, shiftFromRow_(Object.assign({ 'シフトID': cur.id, _row: cur._row }, row))); }
      else { row['シフトID'] = 'S' + uuid_().slice(0, 8); appendRow_(SH.SHIFT, row); all.push(shiftFromRow_(Object.assign({ _row: 0 }, row))); }
      if (published && before !== after) logChange_(ym, date, staff, before, after, it.reason, admin);
      results.push({ date: date, staffId: staff.id, pat: pat.name });
      if (opts.sameWeekday && !published) {
        const w = dow_(date), n = daysInMonth_(ym);
        for (let d = 1; d <= n; d++) {
          const dd = ym + '-' + pad2_(d);
          if (dd === date || dow_(dd) !== w) continue;
          const h = hopes[staff.id + '|' + dd]; if (h && h.kind === '休み') continue;
          if (isStoreClosed_(store, dd)) continue;
          if (all.some(x => x.staffId === staff.id && x.date === dd)) continue;
          const r2 = Object.assign({}, row, { '日付': dd, 'シフトID': 'S' + uuid_().slice(0, 8), '作成元': '曜日コピー' });
          appendRow_(SH.SHIFT, r2); all.push(shiftFromRow_(Object.assign({ _row: 0 }, r2)));
          results.push({ date: dd, staffId: staff.id, pat: pat.name });
        }
      }
    };
    (items || []).forEach(write);
    SpreadsheetApp.flush();
    return { saved: results.length, results: results };
  } finally { lock.releaseLock(); }
}

function logChange_(ym, date, staff, before, after, reason, admin) {
  appendRow_(SH.CHANGE, { '日時': new Date(), '対象月': ym, '日付': date, '従業員番号': staff.id, '氏名': staff.name, '変更前': before, '変更後': after, '理由': String(reason || '店都合'), '操作者': admin.name });
}
function changes_(ym) {
  return readTable_(SH.CHANGE).filter(r => String(r['対象月']).trim() === ym).map(r => ({ at: r['日時'] instanceof Date ? fmtDateTime_(r['日時']) : String(r['日時']), date: normDate_(r['日付']), staffId: String(r['従業員番号']).trim(), name: String(r['氏名']), before: String(r['変更前']), after: String(r['変更後']), reason: String(r['理由']), by: String(r['操作者']) })).reverse();
}

/* ============================== 確定前チェック ============================== */

/**
 * block: 確定できない（希望休に入っている／定休日・会社休日に入っている／有給の残が足りない）
 * warn : 注意（人手不足／週40h超／6連勤以上／休憩不足のパターン／希望未提出）
 */
function checkMonth_(ym, storeFilter) {
  const shifts = getShifts_(ym), hopes = getHopes_(ym), company = getCompany_();
  const staff = activeStaff_(), stores = getStores_().filter(s => !storeFilter || storeFilter === '全店' || s.name === storeFilter);
  const block = [], warn = [], ok = [];
  const nameOf = id => (staffById_(id) || { name: id }).name;

  const offBad = shifts.filter(x => (hopes.byKey[x.staffId + '|' + x.date] || {}).kind === '休み' && x.kind !== '有給');
  if (offBad.length) block.push({ key: 'hopeoff', t: '希望休の日に入っている ' + offBad.length + '件', s: offBad.map(x => nameOf(x.staffId) + ' ' + x.date.slice(5).replace('-', '/')).join('、'), cells: offBad.map(x => x.staffId + '|' + x.date) });
  else ok.push('希望休はすべて守られています');

  const closedBad = shifts.filter(x => { const st = storeByName_(x.store); return st && x.kind !== '有給' && isStoreClosed_(st, x.date); });
  if (closedBad.length) block.push({ key: 'closed', t: '定休日・会社休日に入っている ' + closedBad.length + '件', s: closedBad.map(x => nameOf(x.staffId) + ' ' + x.date.slice(5).replace('-', '/') + ' ' + x.store).join('、'), cells: closedBad.map(x => x.staffId + '|' + x.date) });

  const leaveBad = [];
  staff.forEach(st => { const n = shifts.filter(x => x.staffId === st.id && x.kind === '有給').length; if (n) { const b = leaveBalance_(st.id); if (b.left < n) leaveBad.push(st.name + '（残 ' + b.left + '日・予定 ' + n + '日）'); } });
  if (leaveBad.length) block.push({ key: 'leave', t: '有給の残日数が足りない ' + leaveBad.length + '人', s: leaveBad.join('、') }); else ok.push('有給の残日数 OK');

  const short = [];
  const n = daysInMonth_(ym);
  stores.forEach(S => { for (let d = 1; d <= n; d++) { const date = ym + '-' + pad2_(d); if (isStoreClosed_(S, date)) continue; const need = needOn_(S.name, date); const c = shifts.filter(x => x.store === S.name && x.date === date && x.kind !== '有給').length; if (c < need) short.push({ store: S.name, date: date, c: c, need: need }); } });
  if (short.length) warn.push({ key: 'short', t: '人手不足 ' + short.length + '件', s: short.map(x => x.store + ' ' + x.date.slice(5).replace('-', '/') + '（' + x.c + '/' + x.need + '）').join('、'), items: short }); else ok.push('必要人数を満たしています');

  const over = [];
  staff.forEach(st => { const wh = weekHoursOf_(shifts.filter(x => x.staffId === st.id), ym, company.weekStart); const mx = Math.max.apply(null, wh.concat([0])); if (mx > 40) over.push(st.name + '（' + round2_(mx) + 'h）'); });
  if (over.length) warn.push({ key: 'over40', t: '週40時間を超える人 ' + over.length + '人', s: over.join('、') + ' ＝ 残業代が発生します' }); else ok.push('週40時間以内です');

  const streak = [];
  staff.forEach(st => { let run = 0, mx = 0; for (let d = 1; d <= n; d++) { const date = ym + '-' + pad2_(d); if (shifts.some(x => x.staffId === st.id && x.date === date && x.kind !== '有給')) { run++; mx = Math.max(mx, run); } else run = 0; } if (mx >= 6) streak.push(st.name + '（' + mx + '連勤）'); });
  if (streak.length) warn.push({ key: 'streak', t: '6日以上の連勤 ' + streak.length + '人', s: streak.join('、') });

  const brkBad = shifts.filter(x => x.kind !== '有給' && ((x.hours > 8 && x.brk < company.break8) || (x.hours > 6 && x.brk < company.break6)));
  if (brkBad.length) warn.push({ key: 'break', t: '休憩が足りないシフト ' + brkBad.length + '件', s: brkBad.slice(0, 8).map(x => nameOf(x.staffId) + ' ' + x.date.slice(5).replace('-', '/') + ' ' + x.pat).join('、') }); else ok.push('休憩ルール（6h超' + company.break6 + '分・8h超' + company.break8 + '分）OK');

  const unsub = staff.filter(st => !isBackOffice_(st) && !hopes.submitted[st.id]).map(st => st.name);
  if (unsub.length) warn.push({ key: 'unsubmitted', t: '希望が未提出 ' + unsub.length + '人', s: unsub.join('、') });

  // 希望叶え率：希望（休み以外）がある日にその通りのパターンで入っている割合
  let want = 0, met = 0;
  Object.keys(hopes.byKey).forEach(k => { const h = hopes.byKey[k]; if (h.kind === '休み') { want++; if (!shifts.some(x => x.staffId + '|' + x.date === k && x.kind !== '有給')) met++; return; } if (h.kind === 'パターン') { want++; if (shifts.some(x => x.staffId + '|' + x.date === k && x.pat === h.pat)) met++; } });
  return { block: block, warn: warn, ok: ok, stats: { submitted: Object.keys(hopes.submitted).length, total: staff.filter(st => !isBackOffice_(st)).length, unsubmitted: unsub, fulfil: want ? Math.round(met / want * 100) : null } };
}

/* ============================== 公開（確定） ============================== */

function publishMonth_(admin, ym) {
  if (isClosed_(ym)) throwErr_(ym + ' は締め済みです');
  const chk = checkMonth_(ym, isHR_(admin) ? '全店' : admin.home);
  if (chk.block.length) throwErr_('確定できない問題があります：' + chk.block.map(b => b.t).join('、'));
  const lock = LockService.getScriptLock(); if (!lock.tryLock(20000)) throwErr_('混み合っています');
  try {
    const sh = sheet_(SH.SHIFT), head = headers_(sh), cS = head.indexOf('状態') + 1;
    getShifts_(ym).forEach(x => { if (x.state !== '確定') sh.getRange(x._row, cS).setValue('確定'); });
    const cur = readTable_(SH.PUBLISH).find(r => String(r['対象月']).trim() === ym);
    const row = { '対象月': ym, '状態': '確定', '確定日時': new Date(), '確定者': admin.name };
    if (cur) updateRow_(SH.PUBLISH, cur._row, row); else appendRow_(SH.PUBLISH, row);
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  return { ok: true, warn: chk.warn };
}

/* ============================== 候補（人手不足の日） ============================== */

function candidates_(date, storeName) {
  date = normDate_(date); const ym = date.slice(0, 7);
  const store = requireStore_(storeName), shifts = getShifts_(ym), hopes = getHopes_(ym).byKey, company = getCompany_();
  const defPat = getPatterns_().find(p => p.kind === '勤務' && p.store === store.name) || getPatterns_().find(p => p.kind === '勤務');
  return activeStaff_().filter(s => !isBackOffice_(s) && s.stores.indexOf(store.name) >= 0 && !shifts.some(x => x.staffId === s.id && x.date === date)).map(s => {
    const h = hopes[s.id + '|' + date] || null;
    const wh = weekHoursOf_(shifts.filter(x => x.staffId === s.id), ym, company.weekStart);
    const score = !h ? 1 : h.kind === '休み' ? 0 : h.kind === 'パターン' ? 3 : 2;
    return { id: s.id, name: s.name, type: s.type, hope: h, weekMax: round2_(Math.max.apply(null, wh.concat([0]))), monthHours: round2_(shifts.filter(x => x.staffId === s.id && x.kind !== '有給').reduce((a, x) => a + x.hours, 0)), suggest: (h && h.pat) || (defPat ? defPat.name : ''), score: score };
  }).sort((a, b) => b.score - a.score || a.weekMax - b.weekMax);
}

/* ============================== スタッフ向け ============================== */

/** 本人に見せる月（確定のみ。未確定なら published:false） */
function myMonth_(staff, ym) {
  const info = publishInfo_(ym);
  if (!info.published) return { ym: ym, published: false, publishDay: getCompany_().publishDay, shifts: [] };
  const mine = getShifts_(ym).filter(x => x.staffId === staff.id).map(x => ({ id: x.id, date: x.date, store: x.store, pat: x.pat, s: x.s, e: x.e, brk: x.brk, hours: x.hours, kind: x.kind, color: x.color, changed: x.changed, reason: x.reason }));
  return { ym: ym, published: true, at: info.at, shifts: mine };
}
/** 全員のある日（確定のみ） */
function dayAll_(date) {
  date = normDate_(date);
  if (!isPublished_(date.slice(0, 7))) return { date: date, published: false, shifts: [] };
  return { date: date, published: true, shifts: getShifts_(date.slice(0, 7)).filter(x => x.date === date).map(x => ({ staffId: x.staffId, name: (staffById_(x.staffId) || {}).name, store: x.store, pat: x.pat, s: x.s, e: x.e, kind: x.kind, color: x.color })) };
}
/* ===== gas/Staff.gs ===== */
/**
 * MMC 勤怠 v2 — 従業員
 */

function getStaff_() {
  return cached_('staff', () => readTable_(SH.STAFF)
    .filter(r => String(r['従業員番号']).trim() && String(r['氏名']).trim())
    .map(r => {
      let defaults = {};
      try { defaults = JSON.parse(String(r['いつもの出勤(JSON)'] || '{}')) || {}; } catch (e) { defaults = {}; }
      const stores = String(r['所属店舗(カンマ区切り)'] || '').split(/[,、]/).map(x => x.trim()).filter(Boolean);
      const home = String(r['主所属'] || stores[0] || '').trim();
      if (home && stores.indexOf(home) < 0) stores.unshift(home);
      return {
        id: String(r['従業員番号']).trim(),
        name: String(r['氏名']).trim(),
        pinHash: String(r['PINハッシュ'] || '').trim(),
        initCode: String(r['初期コード'] || '').trim(),
        type: String(r['雇用区分'] || 'アルバイト').trim(),
        role: ROLES.indexOf(String(r['権限']).trim()) >= 0 ? String(r['権限']).trim() : '一般',
        home: home,
        stores: stores,
        monthly: Number(r['月給']) || 0,
        hourly: Number(r['時給']) || 0,
        trKind: String(r['交通費区分'] || '日額').trim(),
        trAmt: Number(r['交通費額']) || 0,
        joined: normDate_(r['入社日']),
        active: !(r['在籍'] === false || String(r['在籍']).toUpperCase() === 'FALSE' || String(r['在籍']).trim() === '退職'),
        order: Number(r['表示順']) || 999,
        defaults: defaults,   // { "1": "中番", "3": "中番" }  曜日(0=日) → パターン名
        memo: String(r['メモ'] || ''),
        _row: r._row,
      };
    }).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)));
}
function staffById_(id) { return getStaff_().find(s => s.id === String(id || '').trim()) || null; }
function activeStaff_() { return getStaff_().filter(s => s.active); }

/** 本人・スタッフ画面に返してよい形 */
function staffPublic_(s) {
  return { id: s.id, name: s.name, type: s.type, role: s.role, home: s.home, stores: s.stores, defaults: s.defaults, joined: s.joined };
}
/** 管理画面用（給与・PIN状態を含む。PIN そのものは返さない） */
function staffAdmin_(s) {
  return Object.assign(staffPublic_(s), { monthly: s.monthly, hourly: s.hourly, trKind: s.trKind, trAmt: s.trAmt, active: s.active, order: s.order, memo: s.memo, pinSet: !!s.pinHash, initCode: s.initCode || '' });
}

/** 店舗端末用：この店舗に所属する在籍者 */
function staffForDevice_(device) {
  const now = new Date(), today = jstDate_(now);
  const all = readLogs_(3000);
  const shifts = getShifts_(today.slice(0, 7)).filter(x => x.date === today && x.kind !== '有給');
  return activeStaff_().filter(s => !isBackOffice_(s) && (!device.store || s.stores.indexOf(device.store) >= 0)).map(s => {
    const logs = all.filter(l => l.id === s.id);
    const st = stateFrom_(logs, now);
    const done = st.state === 'off' && logs.some(l => l.type === T.OUT && (l.workDate || jstDate_(l.time)) === today);
    const sh = shifts.filter(x => x.staffId === s.id);
    return { id: s.id, name: s.name, pinSet: !!s.pinHash, state: done ? 'done' : st.state, inAt: st.in || null, shift: sh.length ? { pat: sh[0].pat, s: sh[0].s, e: sh[0].e, store: sh[0].store } : null };
  }).sort((a, b) => (b.shift ? 1 : 0) - (a.shift ? 1 : 0));
}

/** 管理者：追加・更新 */
function saveStaff_(admin, o) {
  if (!isHR_(admin)) throwErr_('従業員の編集は人事のみ行えます', 'FORBIDDEN');
  const id = String(o.id || '').trim();
  if (!id || !String(o.name || '').trim()) throwErr_('従業員番号と氏名は必須です');
  const stores = (o.stores || []).map(x => String(x).trim()).filter(Boolean);
  stores.forEach(requireStore_);
  const home = String(o.home || stores[0] || '').trim();
  const row = {
    '従業員番号': id, '氏名': String(o.name).trim(), '雇用区分': o.type || 'アルバイト', '在籍': o.active !== false, 'メモ': o.memo || '',
    '権限': ROLES.indexOf(o.role) >= 0 ? o.role : '一般', '主所属': home, '所属店舗(カンマ区切り)': stores.join(','),
    '月給': Number(o.monthly) || 0, '時給': Number(o.hourly) || 0, '交通費区分': o.trKind || '日額', '交通費額': Number(o.trAmt) || 0,
    '入社日': normDate_(o.joined), '表示順': Number(o.order) || 999, 'いつもの出勤(JSON)': JSON.stringify(o.defaults || {}),
  };
  const cur = staffById_(id);
  let initCode = '';
  if (cur) updateRow_(SH.STAFF, cur._row, row);
  else { initCode = String(Math.floor(1000 + Math.random() * 9000)); row['初期コード'] = initCode; appendRow_(SH.STAFF, row); }
  clearCache_();
  return { staff: staffAdmin_(staffById_(id)), initCode: initCode };
}
/* ===== ブラウザ内デモ用のデータ（GAS のコードをそのまま動かし、Sheet の代わりにメモリに入れる） =====
 * 日時は 2026-10-19 14:10（JST）に固定。
 */
(function seed() {
  setNow('2026-10-19T14:10:00+09:00');
  setup();
  saveStore_({ originalName: '店舗', name: '店舗', short: '店', closed: [], annualOff: 110, monthlyH: 170, leaveDays: 21, lat: 35.6963, lng: 139.793, radius: 150, ips: ['1.2.3.4'], open: '11:00', close: '18:00' });
  saveStore_({ name: '焙煎所', short: '焙', closed: [0, 6], annualOff: 115, monthlyH: 166.7, leaveDays: 16, lat: 35.7, lng: 139.8, radius: 150, ips: [], open: '10:30', close: '18:30' });
  savePatterns_([
    { id: 'p_open', name: 'オーラス', store: '店舗', s: '09:30', e: '18:30', brk: 60, color: '#1c1c1c', kind: '勤務' },
    { id: 'p_mid', name: '中番', store: '店舗', s: '12:30', e: '18:00', brk: 0, color: '#3d6a8f', kind: '勤務' },
    { id: 'p_prep', name: '仕込み', store: '店舗', s: '08:00', e: '12:00', brk: 0, color: '#d9a441', kind: '勤務' },
    { id: 'p_roast', name: '焙煎所', store: '焙煎所', s: '10:30', e: '18:30', brk: 60, color: '#7a4b2a', kind: '勤務' },
    { id: 'p_event', name: 'イベント', store: '共通', s: '09:00', e: '20:00', brk: 60, color: '#8e3b6b', kind: '勤務' },
    { id: 'p_paid', name: '有給', store: '共通', s: '11:30', e: '19:30', brk: 60, color: '#4f8a5b', kind: '有給' },
  ]);
  saveNeed_('店舗', [3, 3, 3, 3, 3, 4, 4]); saveNeed_('焙煎所', [1, 1, 1, 1, 1, 0, 0]);
  saveHolidays_([{ date: '2026-12-28', store: '全店', name: '年末年始' }, { date: '2026-12-29', store: '全店', name: '年末年始' }, { date: '2026-12-30', store: '全店', name: '年末年始' }, { date: '2026-12-31', store: '全店', name: '年末年始' }, { date: '2027-01-01', store: '全店', name: '年末年始' }, { date: '2027-01-02', store: '全店', name: '年末年始' }]);

  const root = { role: 'オーナー', name: 'seed' };
  const people = [
    { id: '001', name: '阿部 由佳', type: '正社員', role: '一般', home: '店舗', stores: ['店舗'], monthly: 280000, trKind: '月額', trAmt: 12000, joined: '2024-04-01', off: [2, 5] },
    { id: '002', name: '森原 脩一朗', type: '正社員', role: '店長', home: '店舗', stores: ['店舗', '焙煎所'], monthly: 300000, trKind: '月額', trAmt: 12000, joined: '2024-04-01', off: [1, 4] },
    { id: '003', name: '池田 大輝', type: '正社員', role: '一般', home: '焙煎所', stores: ['焙煎所', '店舗'], monthly: 290000, trKind: '月額', trAmt: 15000, joined: '2024-04-01', off: [0, 6] },
    { id: '004', name: '田中 隆生', type: 'アルバイト', role: '一般', home: '店舗', stores: ['店舗'], hourly: 1200, trKind: '日額', trAmt: 900, joined: '2025-04-01', defaults: { 1: '中番', 3: '中番', 5: 'オーラス' } },
    { id: '005', name: '齊藤 領香', type: 'アルバイト', role: '一般', home: '店舗', stores: ['店舗'], hourly: 1200, trKind: '日額', trAmt: 900, joined: '2025-04-01', defaults: { 2: '中番', 4: '中番', 0: 'オーラス' } },
    { id: '006', name: '福 佳代', type: 'アルバイト', role: '一般', home: '店舗', stores: ['店舗'], hourly: 1150, trKind: '日額', trAmt: 900, joined: '2026-10-01', defaults: { 6: '中番', 0: '中番' } },
    { id: '007', name: '関口 拓実', type: 'アルバイト', role: '一般', home: '店舗', stores: ['店舗', '焙煎所'], hourly: 1250, trKind: '日額', trAmt: 900, joined: '2025-06-01', defaults: { 2: '仕込み', 4: '仕込み', 6: '中番' } },
    { id: '008', name: '那須井 大輝', type: 'アルバイト', role: '一般', home: '店舗', stores: ['店舗'], hourly: 1150, trKind: '日額', trAmt: 900, joined: '2025-04-01', defaults: { 1: '仕込み', 5: '中番', 6: 'オーラス' } },
    { id: '009', name: '趙 乾英博', type: '正社員', role: 'オーナー', home: '店舗', stores: ['店舗', '焙煎所'], monthly: 0, trKind: '月額', trAmt: 0, joined: '2023-01-01', off: [] },
  ];
  people.forEach((p, i) => { saveStaff_(root, Object.assign({ order: i + 1 }, p)); });
  people.forEach(p => { if (p.id === '006') { updateRow_(SH.STAFF, staffById_('006')._row, { '初期コード': '4821', 'PINハッシュ': '' }); clearCache_(); } else setupPin_(p.id, issueInitCode_(p.id), '1234'); });
  const HR = staffById_('009');
  appendRow_(SH.DEVICE, { '端末トークン': 'demo-device', '端末名': 'レジ横 PC', '登録日時': new Date(), '有効': true, '店舗': '店舗' });

  // 有給の付与（6/1 時点で）
  setNow('2026-06-01T03:00:00+09:00'); grantAnnual_(); setNow('2026-10-19T14:10:00+09:00');

  /* ---------- シフト生成 ---------- */
  let seedN = 7; const rnd = () => { seedN = (seedN * 9301 + 49297) % 233280; return seedN / 233280; };
  function gen(ym, withHopes) {
    seedN = Number(ym.replace('-', ''));
    const n = daysInMonth_(ym), items = [], hopes = {};
    people.forEach(p => {
      hopes[p.id] = {};
      for (let d = 1; d <= n; d++) {
        const date = ym + '-' + pad2_(d), w = dow_(date);
        if (isCompanyHoliday_(p.home, date)) continue;
        let pat = null, store = p.home;
        if (p.type === '正社員') {
          if (p.role === '人事') continue;
          if (p.off.indexOf(w) >= 0) { hopes[p.id][date] = { kind: '休み' }; continue; }
          pat = p.home === '焙煎所' ? '焙煎所' : (rnd() < .1 ? 'イベント' : 'オーラス');
          if (pat === '焙煎所' && (w === 0 || w === 6)) { pat = 'オーラス'; store = '店舗'; }
        } else {
          const dp = p.defaults[w];
          let hp = null;
          if (dp) hp = rnd() < .15 ? { kind: '休み' } : (rnd() < .1 ? { kind: '時間', s: '13:00', e: '18:00' } : { kind: 'パターン', pat: dp });
          else if (rnd() < .08) hp = { kind: 'パターン', pat: '中番' };
          if (hp) hopes[p.id][date] = hp;
          if (hp && hp.kind !== '休み') { pat = hp.pat || '中番'; if (rnd() < .12) pat = pat === '中番' ? 'オーラス' : '中番'; }
          else if (!hp && rnd() < .06) pat = '中番';
          if (p.stores.indexOf('焙煎所') >= 0 && pat && w > 0 && w < 6 && rnd() < .25) { pat = '焙煎所'; store = '焙煎所'; }
        }
        if (pat) items.push({ date, staffId: p.id, store, pat });
      }
    });
    if (withHopes) people.forEach(p => { if (Object.keys(hopes[p.id]).length) saveHope_(staffById_(p.id), ym, hopes[p.id], HR); });
    saveShifts_(HR, ym, items, {});
  }
  // 10月：確定（希望は締切後なので代理で入れる）
  setNow('2026-09-10T10:00:00+09:00'); gen('2026-10', true); setNow('2026-10-19T14:10:00+09:00');
  // デモで必ず入れる日の「希望休」は外す（確定できなくなるため）
  const keep = ['007|2026-10-19', '001|2026-10-19', '003|2026-10-19', '002|2026-10-19', '005|2026-10-19', '004|2026-10-19', '008|2026-10-19', '007|2026-10-22', '007|2026-10-24', '007|2026-10-16'];
  readTable_(SH.HOPE).filter(r => String(r['対象月']) === '2026-10' && String(r['種別']) === '休み' && keep.indexOf(String(r['従業員番号']).trim() + '|' + normDate_(r['日付'])) >= 0).map(r => r._row).sort((a, b) => b - a).forEach(r => sheet_(SH.HOPE).deleteRow(r));
  saveShifts_(HR, '2026-10', [
    { date: '2026-10-19', staffId: '007', store: '店舗', pat: '中番' }, { date: '2026-10-19', staffId: '001', store: '店舗', pat: 'イベント' }, { date: '2026-10-19', staffId: '003', store: '焙煎所', pat: '焙煎所' },
    { date: '2026-10-19', staffId: '002', store: '店舗', pat: 'オーラス' }, { date: '2026-10-19', staffId: '005', store: '店舗', pat: '中番' }, { date: '2026-10-19', staffId: '004', store: '店舗', pat: '中番' }, { date: '2026-10-19', staffId: '008', store: '店舗', pat: 'オーラス' },
    { date: '2026-10-22', staffId: '007', store: '店舗', pat: '仕込み' }, { date: '2026-10-16', staffId: '007', store: '店舗', pat: '中番' }, { date: '2026-10-24', staffId: '007', store: '焙煎所', pat: '焙煎所', remove: true }, { date: '2026-10-24', staffId: '007', store: '店舗', pat: '中番' },
  ]);
  publishMonth_(HR, '2026-10');
  // 11月：下書き。希望は 10/15 締切前に提出済み（福 佳代だけ未提出）
  setNow('2026-10-10T10:00:00+09:00'); gen('2026-11', true);
  readTable_(SH.HOPE).filter(r => String(r['対象月']) === '2026-11' && String(r['従業員番号']) === '006').map(r => r._row).sort((a, b) => b - a).forEach(r => sheet_(SH.HOPE).deleteRow(r));
  setNow('2026-10-19T14:10:00+09:00');
  saveHope_(staffById_('007'), '2026-11', Object.assign({}, (() => { const h = getHopes_('2026-11').byKey, o = {}; Object.keys(h).forEach(k => { if (k.indexOf('007|') === 0) o[k.split('|')[1]] = h[k]; }); return o; })(), { '2026-11-07': { kind: '休み' } }), HR);
  saveShifts_(HR, '2026-11', [{ date: '2026-11-07', staffId: '007', store: '店舗', pat: '中番' }, { date: '2026-11-11', staffId: '002', store: '店舗', pat: 'イベント' }, { date: '2026-11-11', staffId: '004', store: '店舗', pat: '', remove: true }, { date: '2026-11-11', staffId: '005', store: '店舗', pat: '', remove: true }]);

  /* ---------- 打刻 ---------- */
  const dev = { token: 'demo-device', name: 'レジ横 PC', store: '店舗' };
  function punchAt(id, iso, type, store) { setNow(iso); const s = staffById_(id); const st = storeByName_(store || s.home); doPunch_(s, type, st.name, { ip: st.ips[0] || '', lat: st.lat, lng: st.lng, acc: 10 }, type === '出勤' && store === '店舗' ? dev : null); }
  const shifts = getShifts_('2026-10');
  const jitter = () => Math.floor(rnd() * 8) - 4;
  const addMin = (hhmm, m) => { const t = minsOf_(hhmm) + m; return pad2_(Math.floor(t / 60)) + ':' + pad2_(((t % 60) + 60) % 60); };
  for (let d = 1; d <= 18; d++) {
    const date = '2026-10-' + pad2_(d);
    shifts.filter(x => x.date === date && x.kind !== '有給').forEach(x => {
      if (x.staffId === '004' && date === '2026-10-05') { punchAt(x.staffId, date + 'T12:25:00+09:00', '出勤', x.store); return; }                 // 退勤打刻なし
      if (x.staffId === '007' && date === '2026-10-16') { punchAt(x.staffId, date + 'T12:31:00+09:00', '出勤', x.store); return; }                 // 退勤打刻なし → 本人が申請
      const late = (x.staffId === '003' && date === '2026-10-02') ? 12 : jitter();
      punchAt(x.staffId, date + 'T' + addMin(x.s, late) + ':00+09:00', '出勤', x.store);
      if (x.hours >= 6) { punchAt(x.staffId, date + 'T' + addMin(x.s, 180) + ':00+09:00', '休憩開始', x.store); punchAt(x.staffId, date + 'T' + addMin(x.s, 180 + Math.max(45, x.brk)) + ':00+09:00', '休憩終了', x.store); }
      const extra = (x.staffId === '001' && date === '2026-10-12') ? 160 : jitter();
      punchAt(x.staffId, date + 'T' + addMin(x.e, extra) + ':00+09:00', '退勤', x.store);
    });
    if (d === 9) { punchAt('007', '2026-10-09T09:30:00+09:00', '出勤', '店舗'); punchAt('007', '2026-10-09T14:00:00+09:00', '退勤', '店舗'); } // シフト外の出勤
  }
  setNow('2026-10-17T10:00:00+09:00'); requestFix_(staffById_('007'), '2026-10-16', '', '18:00', '打刻忘れ');
  // 今日 10/19
  punchAt('001', '2026-10-19T08:55:00+09:00', '出勤', '店舗'); punchAt('002', '2026-10-19T09:28:00+09:00', '出勤', '店舗'); punchAt('003', '2026-10-19T10:31:00+09:00', '出勤', '焙煎所');
  punchAt('005', '2026-10-19T12:27:00+09:00', '出勤', '店舗'); punchAt('007', '2026-10-19T12:28:00+09:00', '出勤', '店舗');
  setNow('2026-10-19T14:10:00+09:00');
  clearCache_();

  window.__mockRoute = function (req) {
    try { const r = route_(req); if (r && r.ok === undefined) r.ok = true; return r; }
    catch (e) { return { ok: false, error: String(e && e.message || e), code: (e && e.code) || '' }; }
  };
})();
})();
