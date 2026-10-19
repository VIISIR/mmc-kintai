/* MMC 勤怠 v2 — 店内端末（PC / iPad）：名前 → PIN → 打刻。初回は初期コードで PIN を設定。 */
(() => {
  const M = window.MMC, { api, esc, $, $$, chip, toast, busy, sheet, nowHM, todayStr, mins, hm, WD, dow } = M;
  const S = { device: M.LS.get('mmc_device'), list: [], store: '', tab: 'grid', staff: null, pin: '', step: 0, status: null, timer: null, config: null };
  if (M.MOCK && !S.device) S.device = { token: 'demo-device', name: 'レジ横 PC', store: '店舗' };

  setInterval(() => { $('#clock').textContent = nowHM(); const d = todayStr(); $('#kdate').textContent = d.replace(/-/g, '.') + '（' + WD[dow(d)] + '）'; }, 1000);
  function resetTimer() { clearTimeout(S.timer); S.timer = setTimeout(() => { S.tab = 'grid'; S.pin = ''; S.staff = null; sheet(null); grid(); }, 30000); }

  /* ---------- 起動 ---------- */
  async function boot() {
    if (!S.device) return setupView();
    busy('読み込み中…');
    try { await grid(); busy(false); }
    catch (e) { busy(false); if (e.code === 'DEVICE') { M.LS.del('mmc_device'); S.device = null; return setupView(e.message); } $('#body').innerHTML = `<div class="card"><b>接続できませんでした</b><p class="muted">${esc(e.message)}</p><button class="primary" id="retry">再読み込み</button></div>`; $('#retry').onclick = boot; }
  }

  /** 端末登録（店長／人事のログイン、または設定シートの管理者パスワード） */
  async function setupView(msg) {
    let stores = [];
    try { const r = await api('info', {}); S.config = r.config; stores = r.config.stores; M.setConfig(r.config); } catch (e) { stores = []; }
    $('#kstore').textContent = '店内端末の登録';
    $('#body').innerHTML = `<div class="card" style="max-width:520px;margin:0 auto">
      ${msg ? `<div class="small err" style="margin-bottom:10px">${esc(msg)}</div>` : ''}
      <div class="h2">この端末を店内端末として登録</div>
      <div class="small muted">登録すると、この端末では名前＋PIN だけで打刻できます（位置確認なし）。店長か人事のログインで登録してください。</div>
      <label class="f">店舗</label><select class="inp w" id="dstore">${stores.map(s => `<option>${esc(s.name)}</option>`).join('')}</select>
      <label class="f">端末名</label><input class="inp w" id="dname" value="レジ横 PC">
      <label class="f">管理者の従業員番号</label><input class="inp w" id="aid" inputmode="numeric">
      <label class="f">管理者の PIN</label><input class="inp w" id="apin" type="password" inputmode="numeric">
      <div class="lbl" style="margin-top:10px">または「設定」シートの管理者パスワード</div><input class="inp w" id="apw" type="password">
      <button class="primary" id="reg" style="margin-top:16px">登録する</button></div>`;
    $('#reg').onclick = async () => {
      busy('登録中…');
      try {
        let token = null;
        if ($('#aid').value.trim()) token = (await api('login', { id: $('#aid').value.trim(), pin: $('#apin').value.trim() })).token;
        const r = await api('registerDevice', { token, admin: $('#apw').value, store: $('#dstore').value, name: $('#dname').value });
        if (token) { try { await api('logout', { token }); } catch (e) {} }
        S.device = { token: r.token, name: r.name, store: r.store }; M.LS.set('mmc_device', S.device);
        busy(false); toast('登録しました'); boot();
      } catch (e) { busy(false); toast(e.message, true); }
    };
  }

  /* ---------- 名前の一覧 ---------- */
  async function grid() {
    clearTimeout(S.timer);
    const r = await api('staffList', { device: S.device.token });
    S.list = r.staff; S.store = r.store; S.config = r.config; M.setConfig(r.config);
    $('#kstore').textContent = (S.store || '') + ' ・ 打刻';
    $('#body').innerHTML = `<div class="h2">名前をタップ（クリック） <span class="r">${esc(S.store)} ・ ${esc(S.device.name)} ・ 今日のシフトがある人が先に並びます</span></div>
      <div class="k-grid">${S.list.map(s => `<button data-k="${esc(s.id)}">${esc(s.name)}${s.state === 'working' ? '<span class="state work">勤務中' + (s.inAt ? ' <span class="tnum" style="font-weight:400">' + esc(s.inAt) + '</span>' : '') + '</span>' : s.state === 'break' ? '<span class="state brk">休憩中</span>' : s.state === 'done' ? '<span class="st-none">退勤済</span>' : s.shift ? `<span class="st-none">${esc(s.shift.pat)} ${esc(s.shift.s)}〜</span>` : '<span class="st-none">シフトなし</span>'}${s.pinSet ? '' : '<span class="badge wa">PIN 未設定</span>'}</button>`).join('')}</div>
      <div class="note" style="text-align:center;margin-top:30px"><a href="#" id="adm" style="color:var(--sub)">管理者メニュー</a>${M.MOCK ? '　｜　デモ：PIN は 1234（福 佳代 は初期コード 4821 で初回設定）' : ''}</div>`;
    $$('[data-k]').forEach(b => b.onclick = () => { S.staff = S.list.find(x => x.id === b.dataset.k); S.pin = ''; S.step = 0; S.tab = 'pin'; pinView(); });
    $('#adm').onclick = e => { e.preventDefault(); adminMenu(); };
    S.tab = 'grid';
    clearTimeout(S.autoRefresh); S.autoRefresh = setTimeout(() => { if (S.tab === 'grid') grid().catch(() => {}); }, 60000);
  }

  /* ---------- PIN ---------- */
  function pinView() {
    resetTimer();
    const s = S.staff, setup = !s.pinSet;
    const title = setup ? (S.step === 0 ? '管理者から受け取った初期コードを入力' : S.step === 1 ? '自分の PIN を決めてください（4〜6桁）' : 'もう一度 PIN を入力') : 'PIN を入力';
    $('#body').innerHTML = `<div style="text-align:center;max-width:420px;margin:0 auto"><div class="h2" style="font-size:22px">${esc(s.name)}${setup ? ' <span class="badge wa">初回設定</span>' : ''}</div><div class="muted small">${title}</div>
      <div class="dots">${[0, 1, 2, 3, 4, 5].slice(0, Math.max(4, S.pin.length)).map(i => `<i class="${S.pin.length > i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '戻る', '0', 'OK'].map(k => `<button data-pin="${k}" ${k === 'OK' ? 'style="background:var(--ink);color:#fff"' : ''}>${k}</button>`).join('')}</div>
      <div class="muted small" style="margin-top:12px">PC ではキーボードの数字・Enter・Backspace・Esc でも操作できます</div></div>`;
    $$('[data-pin]').forEach(b => b.onclick = () => key(b.dataset.pin));
  }
  async function key(v) {
    if (S.tab !== 'pin') return;
    resetTimer();
    if (v === '戻る' || v === 'Escape') { S.tab = 'grid'; return grid(); }
    if (v === '←') { S.pin = S.pin.slice(0, -1); return pinView(); }
    if (v === 'OK') return submitPin();
    if (S.pin.length < 6) S.pin += v;
    pinView();
    if (S.pin.length >= 4 && !S.staff.pinSet && S.step === 0) submitPin(); // 初期コードは4桁
  }
  async function submitPin() {
    const s = S.staff;
    if (S.pin.length < 4) return toast('4桁以上入力してください', true);
    if (!s.pinSet) {
      if (S.step === 0) { S.code = S.pin; S.pin = ''; S.step = 1; return pinView(); }
      if (S.step === 1) { S.newPin = S.pin; S.pin = ''; S.step = 2; return pinView(); }
      if (S.pin !== S.newPin) { toast('PIN が一致しません。もう一度', true); S.pin = ''; S.step = 1; return pinView(); }
      busy('設定中…');
      try { await api('kioskSetupPin', { device: S.device.token, id: s.id, code: S.code, pin: S.newPin }); s.pinSet = true; S.pin = S.newPin; busy(false); toast('PIN を設定しました。次回からこの PIN で打刻できます'); }
      catch (e) { busy(false); toast(e.message, true); S.pin = ''; S.step = 0; return pinView(); }
    }
    busy('確認中…');
    try { const r = await api('kioskStatus', { device: S.device.token, id: s.id, pin: S.pin }); S.status = r; busy(false); S.tab = 'punch'; punchView(); }
    catch (e) { busy(false); toast(e.message, true); S.pin = ''; pinView(); }
  }
  window.addEventListener('keydown', e => { if (S.tab !== 'pin') return; if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('←'); else if (e.key === 'Escape') key('Escape'); else if (e.key === 'Enter') key('OK'); });

  /* ---------- 打刻 ---------- */
  function punchView() {
    resetTimer();
    const s = S.staff, r = S.status, st = r.status, sh = r.todayShifts.filter(x => x.pat !== '有給');
    const worked = st.inAt ? mins(nowHM()) - mins(st.inAt) - (st.breakMin || 0) : 0;
    let btns = '';
    if (st.state === 'off') btns = st.today.some(t => t.type === '退勤') ? `<div class="card">${st.today.map(t => `<div class="kv"><span>${esc(t.type)}</span><b class="tnum">${esc(t.time)}</b></div>`).join('')}</div><div class="hint">お疲れさまでした</div><button class="big secondary" data-kp="出勤">もう一度 出勤する</button>` : `<button class="big" data-kp="出勤">出勤<small>${esc(S.store)}${sh.length ? '' : ' ・ シフト外'}</small></button>`;
    else if (st.state === 'working') btns = `<button class="big" data-kp="休憩開始">休憩に入る</button><button class="big secondary" data-kp="退勤">退勤する</button><div class="hint">${sh.length ? `退勤予定 ${esc(sh[sh.length - 1].e)}` : 'シフトのない日の勤務です'}</div>`;
    else btns = `<button class="big" data-kp="休憩終了">休憩から戻る</button><div class="hint">休憩中は退勤できません</div>`;
    $('#body').innerHTML = `<div class="k-punch"><div>
        <div class="h2" style="font-size:22px">${esc(s.name)}</div>
        <div style="margin-bottom:8px">${st.state === 'working' ? '<span class="state work">勤務中</span>' : st.state === 'break' ? '<span class="state brk">休憩中</span>' : st.today.some(t => t.type === '退勤') ? '<span class="state">退勤済</span>' : '<span class="state">勤務外</span>'} ${st.inAt ? `<span class="small muted tnum">出勤 ${esc(st.inAt)}${st.state === 'working' ? ' ・ ' + hm(Math.max(0, worked)) + ' 経過' : ''}</span>` : ''}</div>
        <div class="card"><div class="h2">今日のシフト</div>${sh.length ? sh.map(x => `<div style="display:flex;gap:10px;align-items:center;margin-bottom:4px">${chip(x.pat, 'fixed', x.store)}<b class="tnum" style="font-size:18px">${esc(x.s)}〜${esc(x.e)}</b><span class="muted">${esc(x.store)}</span></div>`).join('') : '<span class="muted">なし</span>'}</div>
        <div class="muted small">30秒で名前の一覧に戻ります</div>
      </div><div>${btns}<button class="ghost" style="width:100%;margin-top:12px" id="back">名前の一覧に戻る</button></div></div>`;
    $$('[data-kp]').forEach(b => b.onclick = () => doPunch(b.dataset.kp));
    $('#back').onclick = () => { S.tab = 'grid'; grid(); };
  }
  async function doPunch(type) {
    busy('打刻中…');
    try {
      const r = await api('kioskPunch', { device: S.device.token, id: S.staff.id, pin: S.pin, type });
      busy(false); toast(`${type}を記録しました（${r.at}）`);
      S.status = { status: r, todayShifts: S.status.todayShifts }; punchView();
      if (type === '退勤') setTimeout(() => { if (S.tab === 'punch') { S.tab = 'grid'; grid(); } }, 4000);
    } catch (e) { busy(false); toast(e.message, true); }
  }

  /* ---------- 管理者メニュー ---------- */
  function adminMenu() {
    clearTimeout(S.timer);
    sheet(`<div class="h2">管理者メニュー</div><div class="small muted">この端末：${esc(S.device.name)}（${esc(S.store)}）</div>
      <label class="f">管理者の従業員番号</label><input class="inp w" id="mid" inputmode="numeric"><label class="f">PIN</label><input class="inp w" id="mpin" type="password" inputmode="numeric">
      <div class="grid2" style="margin-top:14px"><button class="ghost" id="setloc">現在地をこの店舗の位置として保存</button><button class="ghost" id="unreg">端末の登録を解除</button></div>
      <div class="note">「現在地を保存」は店内で押してください。GPS の座標とお店の Wi-Fi の IP を、スマホ打刻の判定に使います。</div>
      <div style="text-align:center;margin-top:8px"><button class="ghost sm" id="mclose">閉じる</button></div>`);
    $('#mclose').onclick = () => sheet(null);
    const login = async () => (await api('login', { id: $('#mid').value.trim(), pin: $('#mpin').value.trim() })).token;
    $('#setloc').onclick = async () => {
      busy('現在地を取得中…');
      try { const token = await login(); const loc = await M.getLoc(true); if (!loc.lat && !loc.ip) throw new Error('位置も IP も取得できませんでした');
        await api('admin.store.setLocation', { token, store: S.store, lat: loc.lat, lng: loc.lng, ip: loc.ip }); busy(false); sheet(null); toast('保存しました' + (loc.acc ? `（誤差 約${Math.round(loc.acc)}m）` : '')); }
      catch (e) { busy(false); toast(e.message, true); }
    };
    $('#unreg').onclick = async () => { if (!confirm('この端末の登録を解除しますか？')) return; try { await api('unregisterDevice', { device: S.device.token }); } catch (e) {} M.LS.del('mmc_device'); S.device = null; sheet(null); boot(); };
  }

  M.ready.then(boot);
})();
