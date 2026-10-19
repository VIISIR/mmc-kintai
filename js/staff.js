/* MMC 勤怠 v2 — スタッフ端（スマホ）：ホーム・シフト・希望・マイページ */
(() => {
  const M = window.MMC, { api, esc, $, $$, chip, hopeChip, toast, busy, sheet, pad2, dim, dow, ymAdd, todayStr, nowHM, mins, hm, ymJa, mdJa, WD } = M;
  const S = { token: M.LS.get('mmc_token'), me: null, tab: 'home', ym: todayStr().slice(0, 7), shiftMode: 'me', sel: todayStr(), day: todayStr(), hopeYm: ymAdd(todayStr().slice(0, 7), 1), hope: null, hopeDays: {}, hopeRange: null, punchStore: null };

  /* ---------- 起動・ログイン ---------- */
  async function boot() {
    if (!S.token) return loginView();
    busy('読み込み中…');
    try { S.me = await api('me', { token: S.token }); M.setConfig(S.me.config); busy(false); render(); }
    catch (e) { busy(false); if (e.code === 'AUTH' || e.code === 'PIN_SETUP') { M.LS.del('mmc_token'); S.token = null; loginView(); toast(e.message, true); } else errorView(e); }
  }
  function errorView(e) { $('#body').innerHTML = `<div class="card"><b>接続できませんでした</b><p class="muted">${esc(e.message)}</p><button class="primary" id="retry">再読み込み</button></div>`; $('#retry').onclick = boot; $('#tabs').innerHTML = ''; }

  function loginView(setupMode) {
    $('#who').textContent = ''; $('#tabs').innerHTML = '';
    $('#body').innerHTML = `
      <div class="card" style="margin-top:24px">
        <div class="h2" style="font-size:18px">${setupMode ? '初回：PIN を決める' : 'ログイン'}</div>
        <label class="f">従業員番号</label><input class="inp w" id="lid" inputmode="numeric" autocomplete="username">
        ${setupMode ? `<label class="f">初期コード（管理者から受け取った4桁）</label><input class="inp w" id="lcode" inputmode="numeric">
          <label class="f">自分で決める PIN（4〜6桁）</label><input class="inp w" id="lpin" type="password" inputmode="numeric">
          <label class="f">もう一度</label><input class="inp w" id="lpin2" type="password" inputmode="numeric">`
        : `<label class="f">PIN</label><input class="inp w" id="lpin" type="password" inputmode="numeric" autocomplete="current-password">`}
        <button class="primary" id="go" style="margin-top:18px">${setupMode ? 'PIN を設定してログイン' : 'ログイン'}</button>
        <p class="muted small" style="margin:12px 0 0">${setupMode ? 'PIN は管理者にも見えません。忘れたら管理者に「PIN リセット」を頼んでください。' : '一度ログインすると、このスマホでは次回から入力不要です。'}</p>
      </div>
      <div style="text-align:center"><button class="ghost sm" id="sw">${setupMode ? 'ログインへ戻る' : '初めての方（初期コードで PIN を設定）'}</button></div>
      ${M.MOCK ? '<p class="note" style="text-align:center">デモ：番号 007 ／ PIN 1234（初回設定は 006 ／ 初期コード 4821）</p>' : ''}`;
    $('#sw').onclick = () => loginView(!setupMode);
    $('#go').onclick = async () => {
      const id = $('#lid').value.trim(), pin = $('#lpin').value.trim();
      if (!id || !pin) return toast('入力してください', true);
      if (setupMode && pin !== $('#lpin2').value.trim()) return toast('PIN が一致しません', true);
      busy(setupMode ? '設定中…' : 'ログイン中…');
      try {
        const r = setupMode ? await api('setupPin', { id, code: $('#lcode').value.trim(), pin }) : await api('login', { id, pin });
        S.token = r.token; M.LS.set('mmc_token', S.token); busy(false); boot();
      } catch (e) { busy(false); if (e.code === 'PIN_SETUP') { loginView(true); } toast(e.message, true); }
    };
  }
  async function logout() { if (!await M.confirmSheet('ログアウトしますか？', '', 'ログアウト')) return; try { await api('logout', { token: S.token }); } catch (e) {} M.LS.del('mmc_token'); S.token = null; loginView(); }
  async function refresh() { S.me = await api('me', { token: S.token }); M.setConfig(S.me.config); }
  function authGuard(e) { if (e.code === 'AUTH') { M.LS.del('mmc_token'); S.token = null; loginView(); } toast(e.message, true); }

  /* ---------- 画面骨格 ---------- */
  function render() {
    const me = S.me, st = me.status;
    $('#who').textContent = me.staff.name;
    const dots = { home: st.missing.length && !st.pending.some(p => p.kind === '打刻修正'), shift: hasUnackedChange(), hope: !hopeSubmittedCache(), me: false };
    $('#tabs').innerHTML = [['home', 'ホーム'], ['shift', 'シフト'], ['hope', '希望'], ['me', 'マイページ']].map(([k, l]) => `<button data-t="${k}" class="${S.tab === k ? 'on' : ''}">${M.ICON[k]}${l}${dots[k] ? '<i class="dot"></i>' : ''}</button>`).join('');
    $$('#tabs button').forEach(b => b.onclick = () => { S.tab = b.dataset.t; sheet(null); render(); });
    ({ home: homeView, shift: shiftView, hope: hopeView, me: meView })[S.tab]();
    window.scrollTo(0, 0);
  }
  function hasUnackedChange() { const k = M.LS.get('mmc_chg_ack') || {}; const c = S.chgCount || {}; return Object.keys(c).some(ym => c[ym] > (k[ym] || 0)); }
  function hopeSubmittedCache() { return (M.LS.get('mmc_hope_sub') || {})[S.hopeYm]; }

  /* ---------- ホーム ---------- */
  let clockTimer = null;
  function homeView() {
    const me = S.me, st = me.status, staff = me.staff;
    const shifts = me.todayShifts.filter(x => x.kind !== '有給');
    const paid = me.todayShifts.find(x => x.kind === '有給');
    const multi = staff.stores.length > 1;
    if (!S.punchStore) S.punchStore = (shifts[0] && shifts[0].store) || st.store || staff.home;
    const worked = st.inAt ? mins(nowHM()) - mins(st.inAt) - (st.breakMin || 0) : 0;
    const endAt = shifts.length ? shifts[shifts.length - 1].e : null;
    let stateHtml = '', buttons = '';
    const locSeg = multi && st.state === 'off' ? `<div class="lbl">打刻する店舗</div><div class="segm" style="margin-bottom:6px">${staff.stores.map(l => `<button data-loc="${esc(l)}" class="${S.punchStore === l ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>` : '';
    if (st.state === 'off') {
      const done = st.today.some(t => t.type === '退勤');
      stateHtml = `<span class="state">${done ? '退勤済' : '勤務外'}</span>`;
      buttons = done ? `<div class="card" style="margin-top:12px">${st.today.map(t => `<div class="kv"><span>${esc(t.type)}</span><b class="tnum">${esc(t.time)}</b></div>`).join('')}</div><div class="hint">お疲れさまでした（もう一度出勤もできます）</div><button class="big secondary" data-p="出勤">もう一度 出勤する</button>`
        : `${locSeg}<button class="big" data-p="出勤">出勤<small>${esc(S.punchStore)}${shifts.length ? '' : ' ・ シフト外の出勤として記録'}</small></button><div class="hint">${shifts.length ? `シフト ${esc(shifts[0].s)}〜 ・ 今 ${nowHM()}` : 'シフトのない日の出勤は管理者に通知されます'}</div>`;
    } else if (st.state === 'working') {
      stateHtml = `<span class="state work">勤務中</span><div class="small muted tnum">出勤 ${esc(st.inAt)} ${esc(st.store || '')}<br>${hm(Math.max(0, worked))} 経過</div>`;
      const left = endAt ? mins(endAt) - mins(nowHM()) : null;
      buttons = `<button class="big" data-p="休憩開始">休憩に入る</button><button class="big secondary" data-p="退勤">退勤する</button>
        <div class="hint">${(!st.breakMin && worked >= 240) ? '4時間を超えました。休憩を取ってください' : left != null ? (left > 0 ? `退勤予定 ${esc(endAt)}（あと ${hm(left)}）` : `退勤予定 ${esc(endAt)} を過ぎています`) : 'シフトのない日の勤務です'}</div>`;
    } else {
      stateHtml = `<span class="state brk">休憩中</span><div class="small muted tnum">${esc(st.breakStart || '')}〜</div>`;
      buttons = `<button class="big" data-p="休憩終了">休憩から戻る</button><div class="hint">休憩中は退勤できません（戻ってから退勤）</div>`;
    }
    const d = todayStr();
    $('#body').innerHTML = `
      <div class="muted small en" style="letter-spacing:.16em">${d.replace(/-/g, '.')} ${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dow(d)]}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin:2px 0 12px;gap:10px"><div class="clock tnum" id="clock">${nowHM()}</div><div style="text-align:right;line-height:1.5">${stateHtml}</div></div>
      <div class="card">
        <div class="h2">今日のシフト</div>
        ${shifts.length ? shifts.map(x => `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:4px">${chip(x.pat, 'fixed', x.store)}<b class="tnum" style="font-size:18px">${esc(x.s)}〜${esc(x.e)}</b><span class="muted">${esc(x.pat === 'イベント' ? 'イベント' : x.store)}</span></div>`).join('') : paid ? `<div>${chip('有給', 'fixed')} <span class="muted">有給休暇</span></div>` : '<div class="muted">今日のシフトはありません</div>'}
        ${buttons}
      </div>
      ${st.missing.map(m => { const pend = st.pending.find(p => p.kind === '打刻修正' && p.date === m.date); return pend
        ? `<div class="card"><div class="h2" style="margin-bottom:4px">${esc(mdJa(m.date))} 退勤 ${esc(pend.content.out || '')} <span class="badge wa">承認待ち</span></div><div class="small muted">管理者が承認すると勤怠に反映されます。</div></div>`
        : `<div class="card alert"><div class="h2" style="margin-bottom:4px">${esc(mdJa(m.date))} 退勤の打刻がありません</div><div class="small muted">出勤 ${esc(m.in)}（${esc(m.store)}）。退勤時刻を入れて申請すると、管理者が確認して承認します。</div><button class="primary" style="margin-top:10px" data-fix="${esc(m.date)}" data-in="${esc(m.in)}">時刻を入れて申請する</button></div>`; }).join('')}
      <div class="card"><div class="h2">今月 <span class="r">${esc(ymJa(d.slice(0, 7)))}</span></div>
        <div class="stat"><div><b class="tnum">${st.month.days}</b><span>出勤日数</span></div><div><b class="tnum">${st.month.worked.toFixed(1)}</b><span>実働 h</span></div><div><b class="tnum">${st.month.ot.toFixed(1)}</b><span>残業 h</span></div><div><b class="tnum">${me.leave.left}</b><span>有給 残</span></div></div></div>
      <div class="card" id="nextCard"><div class="h2">次のシフト</div><div class="muted small">読み込み中…</div></div>`;
    $$('[data-p]').forEach(b => b.onclick = () => punch(b.dataset.p, shifts));
    $$('[data-loc]').forEach(b => b.onclick = () => { S.punchStore = b.dataset.loc; homeView(); });
    $$('[data-fix]').forEach(b => b.onclick = () => fixSheet(b.dataset.fix, b.dataset.in));
    clearInterval(clockTimer); clockTimer = setInterval(() => { const c = $('#clock'); if (c) c.textContent = nowHM(); }, 1000);
    loadNext();
  }
  async function loadNext() {
    try {
      const d = todayStr(); const ym = d.slice(0, 7);
      let list = [];
      for (const m of [ym, ymAdd(ym, 1)]) { const r = await api('myMonth', { token: S.token, ym: m }); if (r.published) list = list.concat(r.shifts.filter(x => x.date > d)); if (list.length >= 3) break; }
      const el = $('#nextCard'); if (!el) return;
      el.innerHTML = `<div class="h2">次のシフト</div>${list.length ? `<ul class="list">${list.slice(0, 3).map(x => `<li class="daylist"><span class="d"><b class="tnum">${Number(x.date.slice(8))}</b> ${WD[dow(x.date)]}</span><span style="flex:1">${chip(x.pat, 'fixed', x.store)}</span><span class="tnum muted small">${esc(x.s)}〜${esc(x.e)} ${esc(x.store)}</span></li>`).join('')}</ul>` : '<div class="muted small">確定したシフトはまだありません</div>'}`;
    } catch (e) { /* 表示だけ */ }
  }
  async function punch(type, shifts) {
    const st = S.me.status;
    if (type === '出勤' && !shifts.length && !st.today.some(t => t.type === '退勤')) {
      if (!await M.confirmSheet('シフトのない日の出勤', `<div class="small muted">${esc(S.punchStore)}で出勤を記録し、管理者に「シフト外の出勤」として通知します。</div>`, '出勤する')) return;
    }
    if (type === '退勤') {
      const worked = mins(nowHM()) - mins(st.inAt) - (st.breakMin || 0);
      const endAt = shifts.length ? shifts[shifts.length - 1].e : null; const early = endAt ? mins(endAt) - mins(nowHM()) : 0;
      const ok = await M.confirmSheet('退勤しますか？', `<div class="kv"><span>出勤</span><b class="tnum">${esc(st.inAt)}</b></div><div class="kv"><span>退勤</span><b class="tnum">${nowHM()}</b></div><div class="kv"><span>休憩</span><b class="tnum">${st.breakMin || 0}分</b></div><div class="kv"><span>実働</span><b class="tnum">${hm(Math.max(0, worked))}</b></div>${early > 0 ? `<div class="small err" style="margin:8px 0">シフト終了（${esc(endAt)}）より ${hm(early)} 早い退勤です。間違いなければそのまま退勤してください。</div>` : ''}`, '退勤する');
      if (!ok) return;
    }
    busy(S.me.config.checkLocation ? '位置を確認しています…' : '打刻中…');
    try {
      const loc = await M.getLoc(S.me.config.checkLocation);
      busy('打刻中…');
      const r = await api('punch', { token: S.token, type, store: S.punchStore, loc });
      busy(false); toast(`${type}を記録しました（${r.punchedStore} ・ ${r.at}${r.offShift ? ' ・ シフト外' : ''}）`);
      await refresh(); render();
    } catch (e) { busy(false); authGuard(e); }
  }
  function fixSheet(date, inAt) {
    sheet(`<div class="h2">${esc(mdJa(date))} 退勤時刻</div><div class="small muted">出勤打刻 ${esc(inAt)}</div>
      <div class="lbl">退勤した時刻</div><div class="times">${M.timeSel('fx', '18:00')}</div>
      <div class="lbl">理由</div><div class="opt" id="fxr">${['打刻忘れ', '残業', '早退', 'その他'].map((r, i) => `<button class="${i === 0 ? 'on' : ''}">${r}</button>`).join('')}</div>
      <div class="grid2"><button class="ghost" id="fxNo">やめる</button><button class="primary" style="margin:0;padding:12px" id="fxYes">申請する</button></div>`);
    $$('#fxr button').forEach(b => b.onclick = () => { M.selectAll('#fxr button', 'on'); b.classList.add('on'); });
    $('#fxNo').onclick = () => sheet(null);
    $('#fxYes').onclick = async () => { busy('申請中…'); try { await api('request.fix', { token: S.token, date, out: M.timeVal('fx'), reason: $('#fxr .on').textContent }); busy(false); sheet(null); toast('申請しました。管理者の承認をお待ちください'); await refresh(); render(); } catch (e) { busy(false); authGuard(e); } };
  }

  /* ---------- シフト ---------- */
  async function shiftView() {
    const body = $('#body');
    body.innerHTML = `<div class="segm"><button data-m="me" class="${S.shiftMode === 'me' ? 'on' : ''}">自分</button><button data-m="all" class="${S.shiftMode === 'all' ? 'on' : ''}">全員</button></div><div id="shiftBody"><div class="muted small">読み込み中…</div></div>`;
    $$('[data-m]').forEach(b => b.onclick = () => { S.shiftMode = b.dataset.m; shiftView(); });
    try { if (S.shiftMode === 'me') await myShiftView(); else await allShiftView(); } catch (e) { authGuard(e); }
  }
  async function myShiftView() {
    const r = await api('myMonth', { token: S.token, ym: S.ym });
    const el = $('#shiftBody'); if (!el) return;
    const nav = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><button class="ghost sm" data-mm="-1">‹</button><b>${esc(ymJa(S.ym))} ${r.published ? '<span class="badge ok">確定</span>' : '<span class="badge wa">作成中</span>'}</b><button class="ghost sm" data-mm="1">›</button></div>`;
    if (!r.published) {
      el.innerHTML = nav + `<div class="card" style="text-align:center;padding:40px 16px"><div class="h2">${esc(ymJa(S.ym))}のシフトは作成中です</div><div class="small muted">管理者が確定すると、ここに表示されます。<br>公開予定日は ${r.publishDay} 日です。</div></div>`;
    } else {
      const by = {}; r.shifts.forEach(x => (by[x.date] = by[x.date] || []).push(x));
      const changed = r.shifts.filter(x => x.changed).length;
      S.chgCount = Object.assign(S.chgCount || {}, { [S.ym]: changed });
      const ack = (M.LS.get('mmc_chg_ack') || {})[S.ym] || 0;
      let days = 0, total = 0; r.shifts.forEach(x => { if (x.kind !== '有給') { days++; total += x.hours; } });
      if (!S.sel.startsWith(S.ym)) S.sel = S.ym + '-01';
      const sel = by[S.sel] || [];
      el.innerHTML = nav + (changed > ack ? `<div class="card alert"><div class="h2" style="margin:0 0 6px">変更が ${changed}件あります</div><div class="small muted">「変」の付いた日が確定後に変更されました。</div><button class="ghost sm" id="ack" style="margin-top:8px">確認しました</button></div>` : '') +
        `<div class="card" style="padding:12px">${M.calendar(S.ym, { selected: S.sel, isHoliday: ds => isHoliday(ds), cellHtml: ds => (by[ds] || []).map(x => chip(x.pat, 'fixed', x.store, x.changed ? '<span class="chg">変</span>' : '')).join('') })}<div class="lbl" style="margin-top:8px">日付をタップすると下に詳細</div></div>
        <div class="card"><div class="h2">${esc(mdJa(S.sel))}${sel.some(x => x.changed) ? ' <span class="badge wa">変更あり</span>' : ''}</div>
          ${sel.length ? sel.map(x => `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px">${chip(x.pat, 'fixed', x.store)}<b class="tnum" style="font-size:18px">${esc(x.s)}〜${esc(x.e)}</b><span class="muted">${esc(x.pat === 'イベント' ? 'イベント' : x.store)}${x.brk ? ' ・ 休憩 ' + x.brk + '分' : ''}</span>${x.changed && x.reason ? `<span class="small muted">変更理由：${esc(x.reason)}</span>` : ''}</div>`).join('') : '<div class="muted">休み</div>'}
          <button class="ghost sm" style="margin-top:10px" id="allday">この日の全員を見る</button></div>
        <div class="card"><div class="stat"><div><b class="tnum">${days}</b><span>出勤予定</span></div><div><b class="tnum">${total.toFixed(1)}</b><span>予定時間 h</span></div><div><b class="tnum">${S.me.leave.left}</b><span>有給 残</span></div></div></div>`;
      $$('[data-cd]').forEach(c => c.onclick = () => { S.sel = c.dataset.cd; myShiftView(); });
      $('#allday').onclick = () => { S.day = S.sel; S.shiftMode = 'all'; shiftView(); };
      const ak = $('#ack'); if (ak) ak.onclick = () => { const k = M.LS.get('mmc_chg_ack') || {}; k[S.ym] = changed; M.LS.set('mmc_chg_ack', k); render(); };
    }
    $$('[data-mm]').forEach(b => b.onclick = () => { S.ym = ymAdd(S.ym, Number(b.dataset.mm)); S.sel = S.ym + '-01'; myShiftView(); });
  }
  function isHoliday(ds) { return (S.me.config.holidays || []).some(h => h.date === ds && (h.store === '全店' || h.store === S.me.staff.home)); }
  async function allShiftView() {
    const r = await api('dayAll', { token: S.token, date: S.day });
    const el = $('#shiftBody'); if (!el) return;
    const base = new Date(S.day + 'T00:00:00Z');
    const strip = Array.from({ length: 7 }, (_, i) => { const d = new Date(base.getTime() + (i - 3) * 86400000).toISOString().slice(0, 10); return `<button data-sd="${d}" class="${d === S.day ? 'on' : ''}">${Number(d.slice(8))}<br>${WD[dow(d)]}</button>`; }).join('');
    const H0 = 8, H1 = 22, span = (H1 - H0) * 60;
    const rows = r.shifts.map(x => { const l = Math.max(0, (mins(x.s) - H0 * 60) / span * 100), w = Math.min(100 - l, (mins(x.e) - mins(x.s)) / span * 100); return `<div class="row"><div class="nm">${esc(String(x.name || '').split(' ')[0])}</div><div class="track"><div class="bar" style="left:${l}%;width:${w}%;${M.cvars(M.colorOf(x.pat))}">${esc(x.pat)}${x.pat !== 'イベント' && M.PAT[x.pat] && M.PAT[x.pat].store !== '共通' && M.PAT[x.pat].store !== x.store ? ' (' + esc(x.store) + ')' : ''} ${esc(x.s)}-${esc(x.e)}</div></div></div>`; }).join('');
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b>${esc(mdJa(S.day))}</b><button class="ghost sm" data-sd="${todayStr()}">今日</button></div><div class="strip">${strip}</div>
      <div class="card">${r.published ? `<div class="gantt"><div class="hrs"><span></span>${Array.from({ length: 14 }, (_, i) => `<span>${H0 + i}</span>`).join('')}</div>${rows || '<div class="muted" style="padding:16px 0;text-align:center">この日の出勤者はいません</div>'}</div><div class="pline"></div>${M.legend()}` : '<div class="muted" style="text-align:center;padding:20px 0">この月のシフトはまだ確定していません</div>'}</div>`;
    $$('[data-sd]').forEach(b => b.onclick = () => { S.day = b.dataset.sd; allShiftView(); });
  }

  /* ---------- 希望 ---------- */
  async function hopeView() {
    const body = $('#body');
    body.innerHTML = '<div class="muted small">読み込み中…</div>';
    try {
      const r = await api('hope.get', { token: S.token, ym: S.hopeYm });
      S.hope = r;
      if (!S.hopeDaysYm || S.hopeDaysYm !== S.hopeYm) { S.hopeDays = Object.keys(r.days).length ? Object.assign({}, r.days) : prefill(S.hopeYm); S.hopeDaysYm = S.hopeYm; }
      const sub = M.LS.get('mmc_hope_sub') || {}; sub[S.hopeYm] = !!r.submittedAt; M.LS.set('mmc_hope_sub', sub);
      drawHope();
    } catch (e) { authGuard(e); }
  }
  function prefill(ym) {
    const out = {}, def = S.me.staff.defaults || {}, n = dim(ym);
    for (let d = 1; d <= n; d++) { const ds = ym + '-' + pad2(d); const p = def[String(dow(ds))]; if (p && M.PAT[p] && !isHoliday(ds)) out[ds] = { kind: 'パターン', pat: p }; }
    return out;
  }
  function drawHope() {
    const r = S.hope, staff = S.me.staff, days = S.hopeDays;
    const thisYm = todayStr().slice(0, 7);
    const months = [ymAdd(thisYm, 1), ymAdd(thisYm, 2)];
    let work = 0; Object.keys(days).forEach(d => { if (days[d].kind !== '休み') work++; });
    const defTxt = staff.type === '正社員' ? '週5日（休み希望だけ入力）' : Object.keys(staff.defaults || {}).sort().map(w => WD[w] + ' ' + staff.defaults[w]).join('・') || '未設定';
    const left = Math.max(0, Math.ceil((new Date(r.deadline + 'T23:59:59+09:00') - new Date()) / 86400000));
    $('#body').innerHTML = `
      <div class="segm">${months.map(m => `<button data-hm="${m}" class="${S.hopeYm === m ? 'on' : ''}">${esc(ymJa(m))}分</button>`).join('')}</div>
      <div class="banner"><div><div class="small" style="opacity:.7">${esc(ymJa(S.hopeYm))}分の希望</div><b>${r.closed ? '締切済' : r.submittedAt ? '提出済' : '未提出'}</b>${r.submittedAt ? `<div class="small" style="opacity:.7">${esc(r.submittedAt)}${r.closed ? '' : ' ・ 締切まで修正できます'}</div>` : ''}</div><div style="text-align:right"><div class="small" style="opacity:.7">締切 ${esc(r.deadline.slice(5).replace('-', '/'))}</div><b class="tnum">${r.closed ? '—' : 'あと' + left + '日'}</b></div></div>
      ${r.closed ? '<div class="card"><div class="small muted">締切を過ぎています。変更があれば管理者に連絡してください。</div></div>' : `
      <div class="card"><div class="h2">いつもの出勤 <span class="r">${esc(defTxt)}</span></div>
        <div class="small muted">いつもの曜日が入っています。変わる日だけタップして直してください。<b>入力のない日は「休み」として提出されます。</b></div>
        <div class="grid2" style="margin-top:10px"><button class="ghost" id="reset">いつも通りに戻す</button><button class="ghost ${S.hopeRange ? 'on' : ''}" id="range">${S.hopeRange ? 'まとめて選ぶ：中止' : 'まとめて選ぶ'}</button></div>
        ${S.hopeRange ? `<div class="lbl" style="margin-top:8px">${S.hopeRange.start ? esc(mdJa(S.hopeRange.start)) + ' から…最後の日をタップ' : '最初の日をタップしてください'}（連休などに）</div>` : ''}</div>`}
      <div class="card" style="padding:12px">${M.calendar(S.hopeYm, { selected: S.hopeSel, isHoliday: isHoliday, inRange: ds => S.hopeRange && S.hopeRange.start && ds >= S.hopeRange.start, cellHtml: ds => isHoliday(ds) ? '<span class="chip rest" style="font-size:9px">会社休日</span>' : hopeChip(days[ds]) })}
        <div class="lbl" style="margin-top:10px">出勤希望 ${work}日　点線＝希望（確定ではありません）</div></div>
      ${r.closed ? '' : `<button class="primary" id="submit">${r.submittedAt ? '修正を提出する' : 'この内容で提出する'}</button>`}`;
    $$('[data-hm]').forEach(b => b.onclick = () => { S.hopeYm = b.dataset.hm; S.hopeRange = null; S.hopeSel = null; hopeView(); });
    if (r.closed) return;
    $$('[data-cd]').forEach(c => c.onclick = () => {
      const d = c.dataset.cd; if (isHoliday(d)) return toast('会社休日です');
      if (S.hopeRange) { if (!S.hopeRange.start) { S.hopeRange.start = d; drawHope(); return; } const a = S.hopeRange.start < d ? S.hopeRange.start : d, b = S.hopeRange.start < d ? d : S.hopeRange.start; S.hopeRange = null; drawHope(); hopeSheet(a, b); return; }
      S.hopeSel = d; drawHope(); hopeSheet(d, d);
    });
    $('#reset').onclick = () => { S.hopeDays = prefill(S.hopeYm); drawHope(); };
    $('#range').onclick = () => { S.hopeRange = S.hopeRange ? null : { start: null }; drawHope(); };
    $('#submit').onclick = async () => {
      busy('提出中…');
      try { await api('hope.save', { token: S.token, ym: S.hopeYm, days: S.hopeDays }); busy(false); toast(esc(ymJa(S.hopeYm)) + '分の希望を提出しました'); await refresh(); hopeView(); render(); }
      catch (e) { busy(false); authGuard(e); }
    };
  }
  function hopeSheet(a, b) {
    const staff = S.me.staff, def = (staff.defaults || {})[String(dow(a))], h = (a === b ? S.hopeDays[a] : null) || {};
    const full = staff.type === '正社員';
    const pats = Object.keys(M.PAT).filter(p => M.PAT[p].kind === '勤務' && p !== 'イベント' && (M.PAT[p].store === '共通' || staff.stores.indexOf(M.PAT[p].store) >= 0));
    const cur = h.kind === '休み' ? 'off' : h.kind === '有給' ? 'paid' : h.kind === '時間' ? 'time' : h.kind === '出勤' ? 'work' : h.kind === 'パターン' ? (h.pat === def ? 'def' : 'pat:' + h.pat) : '';
    const dates = []; for (let d = new Date(a + 'T00:00:00Z'); d.toISOString().slice(0, 10) <= b; d = new Date(d.getTime() + 86400000)) dates.push(d.toISOString().slice(0, 10));
    sheet(`<div class="h2">${a === b ? esc(mdJa(a)) : esc(mdJa(a)) + ' 〜 ' + esc(mdJa(b)) + '（' + dates.length + '日間）'}</div>
      <div class="opt" id="hopeOpt">
        ${a === b && def ? `<button data-k="def" class="${cur === 'def' ? 'on' : ''}">いつも通り<small>${esc(def)} ${esc(M.PAT[def].s)}-${esc(M.PAT[def].e)}</small></button>` : ''}
        ${full ? `<button data-k="work" class="${cur === 'work' ? 'on' : ''}">出勤</button>` : ''}
        <button data-k="off" class="${cur === 'off' ? 'on' : ''}">休み</button>
        ${full ? '' : pats.filter(p => p !== def).map(p => `<button data-k="pat:${esc(p)}" class="${cur === 'pat:' + p ? 'on' : ''}">${esc(p)}<small>${esc(M.PAT[p].s)}-${esc(M.PAT[p].e)}</small></button>`).join('')}
        ${full ? '' : `<button data-k="time" class="${cur === 'time' ? 'on' : ''}">時間指定</button>`}
        <button data-k="paid" class="${cur === 'paid' ? 'on' : ''}">有給<small>残${S.me.leave.left}日</small></button>
      </div>
      <div id="timeBox" style="display:${cur === 'time' ? 'block' : 'none'}"><div class="times">${M.timeSel('hs', h.s || '13:00')}〜${M.timeSel('he', h.e || '18:00')}</div></div>
      <label class="f">メモ（任意）</label><input class="inp w" id="hmemo" value="${esc(h.memo || '')}" placeholder="例：午後から可">
      <div class="grid2" style="margin-top:12px"><button class="ghost" id="hNo">閉じる</button><button class="primary" style="margin:0;padding:12px" id="hOk">決定</button></div>`);
    let v = cur ? (cur === 'def' ? 'DEF' : cur === 'off' ? { kind: '休み' } : cur === 'paid' ? { kind: '有給' } : cur === 'time' ? 'TIME' : cur === 'work' ? { kind: '出勤' } : { kind: 'パターン', pat: cur.slice(4) }) : null;
    $$('#hopeOpt button').forEach(bt => bt.onclick = () => { M.selectAll('#hopeOpt button', 'on'); bt.classList.add('on'); const k = bt.dataset.k; $('#timeBox').style.display = k === 'time' ? 'block' : 'none'; v = k === 'def' ? 'DEF' : k === 'off' ? { kind: '休み' } : k === 'paid' ? { kind: '有給' } : k === 'time' ? 'TIME' : k === 'work' ? { kind: '出勤' } : { kind: 'パターン', pat: k.slice(4) }; });
    $('#hNo').onclick = () => { sheet(null); S.hopeSel = null; drawHope(); };
    $('#hOk').onclick = () => {
      if (v) { const memo = $('#hmemo').value.trim(); dates.forEach(ds => { if (isHoliday(ds)) return; const dd = (staff.defaults || {})[String(dow(ds))];
        if (v === 'DEF') { if (dd) S.hopeDays[ds] = { kind: 'パターン', pat: dd, memo }; else delete S.hopeDays[ds]; }
        else if (v === 'TIME') S.hopeDays[ds] = { kind: '時間', s: M.timeVal('hs'), e: M.timeVal('he'), memo };
        else S.hopeDays[ds] = Object.assign({}, v, { memo }); }); }
      sheet(null); S.hopeSel = null; drawHope();
    };
  }

  /* ---------- マイページ ---------- */
  async function meView() {
    const me = S.me, st = me.status, lv = me.leave;
    $('#body').innerHTML = `
      <div class="card"><div style="font-size:22px;font-weight:700">${esc(me.staff.name)}</div><div class="muted small">${esc(me.staff.type)} ・ ${esc(me.staff.stores.join(' / '))}</div></div>
      <div class="card"><div class="h2">有給休暇</div>
        <div class="stat"><div><b class="tnum">${lv.left}</b><span>残日数</span></div><div><b class="tnum">${lv.usedThisFy}</b><span>今年度取得</span></div><div><b class="tnum">${lv.grantThisFy}</b><span>今年度付与</span></div></div>
        <div class="lbl" style="margin-top:8px">${lv.lots.map(l => esc(l.expire.replace(/-/g, '/')) + ' まで ' + l.left + '日').join(' ・ ') || '付与はまだありません'}　｜ 希望提出で「有給」を選ぶと申請になります</div></div>
      <div class="card"><div class="h2">今月の勤務 <span class="r">${esc(ymJa(todayStr().slice(0, 7)))}</span></div>
        <div class="kv"><span>出勤日数</span><b class="tnum">${st.month.days}日</b></div><div class="kv"><span>実働</span><b class="tnum">${st.month.worked.toFixed(1)}h</b></div><div class="kv"><span>残業</span><b class="tnum">${st.month.ot.toFixed(1)}h</b></div><div class="kv"><span>深夜</span><b class="tnum">${st.month.night.toFixed(1)}h</b></div></div>
      <div class="card" id="punches"><div class="h2">打刻履歴 <span class="r">自分で確認できます</span></div><div class="muted small">読み込み中…</div></div>
      <div class="card" id="reqs"><div class="h2">申請の履歴</div><div class="muted small">読み込み中…</div></div>
      <div class="grid2"><button class="ghost" id="pin">PIN を変更</button><button class="ghost" id="logout">ログアウト</button></div>
      ${me.staff.role !== '一般' ? '<div class="note" style="text-align:center"><a href="admin.html' + (M.MOCK ? '?mock' : '') + '">管理画面へ</a></div>' : ''}`;
    $('#logout').onclick = logout;
    $('#pin').onclick = pinSheet;
    try {
      const p = await api('myPunches', { token: S.token, days: 14 });
      const el = $('#punches'); if (el) el.innerHTML = `<div class="h2">打刻履歴 <span class="r">直近 14 回</span></div>${p.list.length ? `<ul class="list">${p.list.map(x => `<li><span class="tnum small">${esc(x.date.slice(5).replace('-', '/'))} <span class="muted">${esc(x.store)}</span></span><span class="tnum small">${esc(x.in || '—')} → ${x.out ? esc(x.out) : x.open ? '勤務中' : '<span class="err">退勤なし</span>'}${x.brk ? `（休憩 ${x.brk}分）` : ''}${x.issues.length ? ` <span class="err">${esc(x.issues.join('・'))}</span>` : ''}</span></li>`).join('')}</ul>` : '<div class="muted small">まだありません</div>'}`;
      const q = await api('myRequests', { token: S.token });
      const el2 = $('#reqs'); if (el2) el2.innerHTML = `<div class="h2">申請の履歴</div>${q.list.length ? `<ul class="list">${q.list.map(x => `<li><span>${esc(x.date.slice(5).replace('-', '/'))} ${esc(x.kind)}${x.kind === '打刻修正' ? ' ' + esc((x.content.in ? '出勤 ' + x.content.in + ' ' : '') + (x.content.out ? '退勤 ' + x.content.out : '')) : ''}</span><span class="badge ${x.status === '承認' ? 'ok' : x.status === '却下' ? 'ng' : 'wa'}">${esc(x.status === '申請中' ? '承認待ち' : x.status)}</span></li>`).join('')}</ul>` : '<div class="muted small">まだありません</div>'}`;
    } catch (e) { /* 表示だけ */ }
  }
  function pinSheet() {
    sheet(`<div class="h2">PIN を変更</div><label class="f">今の PIN</label><input class="inp w" id="p0" type="password" inputmode="numeric"><label class="f">新しい PIN（4〜6桁）</label><input class="inp w" id="p1" type="password" inputmode="numeric"><label class="f">もう一度</label><input class="inp w" id="p2" type="password" inputmode="numeric">
      <div class="grid2" style="margin-top:14px"><button class="ghost" id="pNo">やめる</button><button class="primary" style="margin:0;padding:12px" id="pOk">変更する</button></div>`);
    $('#pNo').onclick = () => sheet(null);
    $('#pOk').onclick = async () => { if ($('#p1').value !== $('#p2').value) return toast('新しい PIN が一致しません', true); busy('変更中…'); try { await api('changePin', { token: S.token, oldPin: $('#p0').value, newPin: $('#p1').value }); busy(false); sheet(null); toast('PIN を変更しました'); } catch (e) { busy(false); toast(e.message, true); } };
  }

  M.ready.then(boot);
})();
