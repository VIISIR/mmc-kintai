/* MMC 勤怠 v2 — 3つの画面（スタッフ / 店内端末 / 管理）で共通に使う部品 */
window.MMC = (() => {
  const CFG = window.MMC_CONFIG || {};
  const MOCK = /[?&]mock/.test(location.search) || !CFG.API_URL || /PASTE_/.test(CFG.API_URL);

  /* ---------- API ---------- */
  async function api(action, data) {
    const req = Object.assign({ action: action }, data || {});
    let j;
    if (MOCK) {
      await ready;
      if (!window.__mockRoute) throw new Error('デモ用バックエンドが読み込めませんでした');
      j = JSON.parse(JSON.stringify(window.__mockRoute(JSON.parse(JSON.stringify(req)))));
    } else {
      const res = await fetch(CFG.API_URL, { method: 'POST', body: JSON.stringify(req) });
      j = await res.json();
    }
    if (!j.ok) { const e = new Error(j.error || 'エラーが発生しました'); e.code = j.code; throw e; }
    return j;
  }
  // デモ用バックエンド（GAS のコードをブラウザで動かしたもの）を必要なときだけ読み込む
  const ready = new Promise(res => {
    if (!MOCK) return res();
    const s = document.createElement('script'); s.src = 'js/mock-backend.js'; s.onload = () => res(); s.onerror = () => res();
    document.head.appendChild(s);
  });

  /* ---------- 保存 ---------- */
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  /* ---------- 文字・日付 ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const WD = ['日', '月', '火', '水', '木', '金', '土'];
  const pad2 = n => (n < 10 ? '0' : '') + n;
  const dim = ym => { const [y, m] = ym.split('-').map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); };
  const dow = d => { const [y, m, dd] = d.split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd)).getUTCDay(); };
  const ymAdd = (ym, n) => { let [y, m] = ym.split('-').map(Number); m += n; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return y + '-' + pad2(m); };
  const jst = (d) => new Date((d || new Date()).getTime() + 9 * 3600000);
  const todayStr = () => jst().toISOString().slice(0, 10);
  const nowHM = () => jst().toISOString().slice(11, 16);
  const mins = t => { const m = String(t || '').match(/^(\d{1,2}):(\d{2})$/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
  const hm = min => `${Math.floor(min / 60)}h${pad2(min % 60)}m`;
  const ymJa = ym => { const [y, m] = ym.split('-').map(Number); return y + '年' + m + '月'; };
  const mdJa = d => { const [, m, dd] = d.split('-').map(Number); return m + '/' + dd + '（' + WD[dow(d)] + '）'; };

  /* ---------- 色・チップ ---------- */
  function fgOf(hex) { const n = parseInt(String(hex || '#1c1c1c').slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; const L = x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }; return (.2126 * L(r) + .7152 * L(g) + .0722 * L(b)) > .32 ? '#1c1c1c' : '#ffffff'; }
  function soft(hex) { const n = parseInt(String(hex || '#1c1c1c').slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},.3)`; }
  const cvars = c => `--c:${c};--fg:${fgOf(c)};--cs:${soft(c)}`;
  const PAT = {};       // name → {s,e,brk,color,kind,store}
  const STORES = {};    // name → {short,...}
  function setConfig(cfg) {
    Object.keys(PAT).forEach(k => delete PAT[k]); Object.keys(STORES).forEach(k => delete STORES[k]);
    (cfg.patterns || []).forEach(p => { PAT[p.name] = p; });
    (cfg.stores || []).forEach(s => { STORES[s.name] = s; });
  }
  const colorOf = pat => (PAT[pat] && PAT[pat].color) || '#a5a5a5';
  /** state: fixed / draft / hope */
  function chip(pat, state, loc, extra) {
    if (!pat) return '';
    const p = PAT[pat]; const d = p && p.store !== '共通' ? p.store : '';
    const mark = loc && d && loc !== d ? `<span class="locm">${esc((STORES[loc] || {}).short || loc[0])}</span>` : '';
    return `<span class="chip ${state || 'fixed'}" style="${cvars(colorOf(pat))}">${esc(pat)}${mark}${extra || ''}</span>`;
  }
  function hopeChip(h) {
    if (!h) return '';
    if (h.kind === '休み') return '<span class="chip hope off">休み</span>';
    if (h.kind === '有給') return chip('有給', 'hope');
    if (h.kind === 'パターン') return chip(h.pat, 'hope');
    if (h.kind === '出勤') return '<span class="chip hope" style="--c:#1c1c1c">出勤</span>';
    return `<span class="chip hope" style="--c:#1c1c1c">${esc(String(h.s || '').replace(':00', '') + '-' + String(h.e || '').replace(':00', ''))}</span>`;
  }
  const legend = names => `<span class="legend">${(names || Object.keys(PAT)).map(n => `<span><i style="background:${esc(colorOf(n))}"></i>${esc(n)}</span>`).join('')}</span>`;

  /* ---------- UI 部品 ---------- */
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  function toast(msg, isErr) { const t = $('#toast'); if (!t) return alert(msg); t.textContent = msg; t.className = 'toast show' + (isErr ? ' err' : ''); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), isErr ? 5000 : 2800); }
  function busy(msg) { const b = $('#busy'); if (!b) return; if (msg === false) { b.classList.remove('show'); return; } b.innerHTML = `<div class="spinner"></div><div>${esc(msg || '通信中…')}</div>`; b.classList.add('show'); }
  function sheet(html) { const s = $('#sheet'), sc = $('#scrim'); if (html == null) { s.classList.remove('show'); sc && sc.classList.remove('show'); return; } s.innerHTML = html; s.classList.add('show'); sc && sc.classList.add('show'); s.scrollTop = 0; }
  function modal(html) { const m = $('#modal'); if (html == null) { m.classList.remove('show'); return; } m.querySelector('.box').innerHTML = html; m.classList.add('show'); }
  function pop(html, anchor, w) { const p = $('#pop'); if (html == null) { p.classList.remove('show'); return; } p.innerHTML = html; p.style.width = (w || 350) + 'px'; const r = anchor.getBoundingClientRect(); p.classList.add('show'); const ph = p.offsetHeight, pw = p.offsetWidth; p.style.left = Math.max(12, Math.min(window.innerWidth - pw - 12, r.left)) + 'px'; p.style.top = (r.bottom + 6 + ph > window.innerHeight ? Math.max(12, r.top - ph - 6) : r.bottom + 6) + 'px'; }
  document.addEventListener('mousedown', e => { const p = $('#pop'); if (p && p.classList.contains('show') && !p.contains(e.target) && !e.target.closest('[data-pop-anchor]')) p.classList.remove('show'); });
  document.addEventListener('click', e => { if (e.target.id === 'scrim') sheet(null); if (e.target.id === 'modal') modal(null); });
  function timeSel(id, hhmm, hs) { const [h, m] = String(hhmm || '09:00').split(':'); hs = hs || Array.from({ length: 24 }, (_, i) => i); const ms = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']; if (m && ms.indexOf(m) < 0) ms.push(m); ms.sort(); return `<select class="inp" id="${id}h">${hs.map(x => `<option ${Number(x) === Number(h) ? 'selected' : ''}>${pad2(x)}</option>`).join('')}</select>:<select class="inp" id="${id}m">${ms.map(x => `<option ${x === m ? 'selected' : ''}>${x}</option>`).join('')}</select>`; }
  const timeVal = id => $('#' + id + 'h').value + ':' + $('#' + id + 'm').value;
  function selectAll(sel, cls) { $$(sel).forEach(x => x.classList.remove(cls)); }
  function confirmSheet(title, body, okLabel) { return new Promise(res => { sheet(`<div class="h2">${esc(title)}</div>${body || ''}<div class="grid2" style="margin-top:12px"><button class="ghost" id="shNo">やめる</button><button class="primary" style="margin:0;padding:12px" id="shYes">${esc(okLabel || 'OK')}</button></div>`); $('#shNo').onclick = () => { sheet(null); res(false); }; $('#shYes').onclick = () => { sheet(null); res(true); }; }); }

  /** 月カレンダー。cellHtml(dateStr, d) がセルの中身（日付の下）を返す */
  function calendar(ym, o) {
    o = o || {};
    const n = dim(ym), first = dow(ym + '-01'), today = todayStr();
    let h = WD.map(w => `<div class="wd">${w}</div>`).join('');
    for (let i = 0; i < first; i++) h += '<div class="c empty"></div>';
    for (let d = 1; d <= n; d++) {
      const ds = ym + '-' + pad2(d);
      const cls = [o.selected === ds ? 'sel' : '', o.isHoliday && o.isHoliday(ds) ? 'hol' : '', o.inRange && o.inRange(ds) ? 'inrange' : '', ds === today ? 'today' : ''].join(' ');
      h += `<div class="c ${cls}" data-cd="${ds}"><span class="tnum">${d}</span>${o.cellHtml ? o.cellHtml(ds, d) : ''}</div>`;
    }
    return `<div class="cal">${h}</div>`;
  }

  /* ---------- 位置情報 ---------- */
  function getIP() { return Promise.race([fetch('https://api.ipify.org?format=json').then(r => r.json()).then(j => j.ip).catch(() => null), new Promise(r => setTimeout(() => r(null), 4000))]); }
  function getGeo() { return new Promise(res => { if (!navigator.geolocation) return res(null); navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }), () => res(null), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }); }); }
  async function getLoc(needGeo) { if (MOCK) return { ip: '1.2.3.4' }; const [ip, geo] = await Promise.all([getIP(), needGeo ? getGeo() : Promise.resolve(null)]); return Object.assign({ ip: ip }, geo || {}); }

  const ICON = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    shift: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    hope: '<svg viewBox="0 0 24 24"><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13 7l4 4"/></svg>',
    me: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    inbox: '<svg viewBox="0 0 24 24"><path d="M4 13l2-8h12l2 8v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5h4"/></svg>',
    yen: '<svg viewBox="0 0 24 24"><path d="M6 4l6 8 6-8M12 12v8M8 13h8M8 16h8"/></svg>',
    leaf: '<svg viewBox="0 0 24 24"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19l8-8"/></svg>',
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c1-3.5 3.8-5 7-5s6 1.5 7 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.4 0 4.2 1.2 5 4"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
  };
  const LOGO = 'img/mmc-mark-reversed.svg';

  return { MOCK, api, ready, LS, esc, WD, pad2, dim, dow, ymAdd, todayStr, nowHM, mins, hm, ymJa, mdJa, fgOf, soft, cvars, PAT, STORES, setConfig, colorOf, chip, hopeChip, legend, $, $$, toast, busy, sheet, modal, pop, timeSel, timeVal, selectAll, confirmSheet, calendar, getLoc, ICON, LOGO };
})();
