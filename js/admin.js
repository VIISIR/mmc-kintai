/* MMC 勤怠 v2 — 管理端（店長／人事）：やること・シフト・勤怠・人件費・有給・従業員・設定 */
(() => {
  const M = window.MMC, { api, esc, $, $$, chip, hopeChip, toast, busy, modal, pop, pad2, dim, dow, ymAdd, todayStr, ymJa, mdJa, WD } = M;
  const S = { token: M.LS.get('mmc_admin_token'), admin: null, stores: [], config: null, store: '全店', tab: 'home', ym: ymAdd(todayStr().slice(0, 7), 1), attYm: todayStr().slice(0, 7), attTab: 'todo', setTab: 'company', setStore: null, hl: null, data: null };
  const NAV = [['home', 'やること', 'inbox'], ['shift', 'シフト', 'grid'], ['att', '勤怠', 'clock'], ['cost', '人件費', 'yen'], ['leave', '有給', 'leaf'], ['staff', '従業員', 'users'], ['set', '設定', 'gear']];
  const isHR = () => S.admin && (S.admin.role === '人事' || S.admin.role === 'オーナー');
  const yen = n => '¥' + Math.round(Number(n) || 0).toLocaleString();
  const storeArg = () => S.store;

  /* ---------- 起動・ログイン ---------- */
  async function boot() {
    if (!S.token) return loginView();
    busy('読み込み中…');
    try { const r = await api('admin.me', { token: S.token }); S.admin = r.admin; S.stores = r.stores; S.config = r.config; M.setConfig(r.config); if (!isHR()) S.store = S.admin.home; busy(false); render(); }
    catch (e) { busy(false); M.LS.del('mmc_admin_token'); S.token = null; loginView(e.message); }
  }
  function loginView(msg) {
    $('#app').innerHTML = `<div class="login"><div class="logo" style="margin-bottom:20px"><img src="img/mmc-mark-reversed.svg" alt="MMC" style="filter:invert(1)"><span style="color:var(--ink)">ADMIN</span></div>
      <div class="card">${msg ? `<div class="small err" style="margin-bottom:8px">${esc(msg)}</div>` : ''}<div class="h2">管理者ログイン</div><div class="small muted">店長・人事の従業員番号と PIN</div>
      <label class="f">従業員番号</label><input class="inp w" id="lid" inputmode="numeric"><label class="f">PIN</label><input class="inp w" id="lpin" type="password" inputmode="numeric">
      <button class="primary" id="go" style="margin-top:16px">ログイン</button></div>${M.MOCK ? '<p class="note" style="text-align:center">デモ：人事 009 ／ 店長 002 ／ PIN 1234</p>' : ''}</div>`;
    const go = async () => { busy('ログイン中…'); try { const r = await api('login', { id: $('#lid').value.trim(), pin: $('#lpin').value.trim() }); if (r.staff.role === '一般') throw new Error('管理者の権限がありません'); S.token = r.token; M.LS.set('mmc_admin_token', S.token); busy(false); boot(); } catch (e) { busy(false); toast(e.message, true); } };
    $('#go').onclick = go; $('#lpin').onkeydown = e => { if (e.key === 'Enter') go(); };
  }
  function guard(e) { if (e.code === 'AUTH') { M.LS.del('mmc_admin_token'); S.token = null; loginView(e.message); return; } toast(e.message, true); }

  /* ---------- 骨格 ---------- */
  function render() {
    const nav = NAV.filter(([k]) => k !== 'cost' && k !== 'set' || isHR());
    $('#app').innerHTML = `<div class="desk"><aside class="side"><div class="logo"><img src="${M.LOGO}" alt="MMC"><span>ADMIN</span></div>
      <div class="store"><select id="storeSel">${(isHR() ? ['全店'] : []).concat(S.stores).map(n => `<option ${S.store === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}${isHR() ? '<option value="__add">＋ 店舗を追加…</option>' : ''}</select><span>▾</span></div>
      <div class="pline"></div><nav>${nav.map(([k, l, i]) => `<button data-a="${k}" class="${S.tab === k ? 'on' : ''}">${M.ICON[i]}<span>${l}</span><i class="n hidden" id="n-${k}"></i></button>`).join('')}</nav>
      <div class="foot">${esc(S.admin.name)}<br>${esc(S.admin.role)} ・ ${esc(isHR() ? '全店' : S.admin.home)}<br><a id="logout">ログアウト</a>${M.MOCK ? '<br><a href="index.html?mock">スタッフ画面</a> ・ <a href="kiosk.html?mock">店内端末</a>' : ''}</div></aside>
      <section class="main" id="main"></section></div>`;
    $$('[data-a]').forEach(b => b.onclick = () => { S.tab = b.dataset.a; S.hl = null; render(); });
    $('#storeSel').onchange = e => { if (e.target.value === '__add') { e.target.value = S.store; return addStore(); } S.store = e.target.value; render(); };
    $('#logout').onclick = async () => { try { await api('logout', { token: S.token }); } catch (e) {} M.LS.del('mmc_admin_token'); S.token = null; loginView(); };
    ({ home: homeView, shift: shiftView, att: attView, cost: costView, leave: leaveView, staff: staffView, set: setView })[S.tab]();
  }
  function top(title, right, ymKey) {
    const ym = ymKey ? S[ymKey] : null;
    return `<div class="topbar"><h1>${esc(title)}<small>${esc(S.store)}</small></h1>${ym ? `<div class="month"><button data-ym="-1">‹</button><span class="tnum">${esc(ymJa(ym))}</span><button data-ym="1">›</button></div>` : ''}<div class="sp"></div>${right || ''}</div>`;
  }
  function bindYm(key, fn) { $$('[data-ym]').forEach(b => b.onclick = () => { S[key] = ymAdd(S[key], Number(b.dataset.ym)); fn(); }); }
  function loading(title) { $('#main').innerHTML = top(title) + '<div class="content"><div class="muted small">読み込み中…</div></div>'; }

  /* ---------- やること ---------- */
  async function homeView() {
    loading('やること');
    let r; try { r = await api('admin.inbox', { token: S.token, store: storeArg() }); } catch (e) { return guard(e); }
    const stOf = m => m.state === 'working' ? `<span class="state work">勤務中 <span class="tnum" style="font-weight:400">${esc(m.inAt || '')}</span></span>` : m.state === 'break' ? '<span class="state brk">休憩中</span>' : '<span class="state dim">未出勤</span>';
    const frames = r.frames.map(f => `<div class="card"><div class="h2">${esc(f.name)} <span class="r">${f.members.length}人${f.need != null ? ' / 必要 ' + f.need + '人' : ''}${f.closed ? ' ・ 定休' : ''}</span></div>
      ${f.members.length ? `<ul class="list">${f.members.map(m => `<li><span>${esc(m.name)} <span class="muted small tnum">${esc(m.s)}〜${esc(m.e)}</span></span>${stOf(m)}</li>`).join('')}</ul>` : '<div class="muted small">出勤者なし</div>'}${f.need != null && f.members.length < f.need ? '<div class="lbl err">人手不足</div>' : ''}</div>`).join('');
    const tasks = r.tasks.map((t, i) => {
      let acts = '';
      if (t.kind === 'hope') acts = `<button class="btn" data-act="proxy" data-i="${i}">代わりに入力</button>`;
      if (t.kind === 'fix') acts = `<button class="btn dark" data-act="approve" data-i="${i}">承認</button><button class="btn" data-act="reject" data-i="${i}">却下</button>`;
      if (t.kind === 'leave') acts = `<button class="btn dark" data-act="approve" data-i="${i}">承認</button><button class="btn" data-act="reject" data-i="${i}">却下</button>`;
      if (t.kind === 'miss') acts = `<button class="btn dark" data-act="edit" data-i="${i}" data-pop-anchor>時刻を入れる</button>`;
      if (t.kind === 'draft' || t.kind === 'ot') acts = `<button class="btn dark" data-act="shift" data-i="${i}">シフトを開く</button>`;
      return `<div class="task ${t.kind === 'miss' ? 'ng' : ''}"><div class="n">${t.n}</div><div class="t"><b>${esc(t.title)}</b><span>${esc(t.sub)}</span></div><div class="a">${acts}</div></div>`;
    }).join('');
    $('#main').innerHTML = top('やること', `<span class="muted small">${esc(r.today.replace(/-/g, '.'))}（${WD[dow(r.today)]}）</span>`) + `<div class="content" style="max-width:980px">
      <div class="h2">本日の出勤 <span class="r">${esc(mdJa(r.today))}</span></div><div class="now">${frames}</div>
      <div class="h2">処理が必要なもの <span class="r">${r.tasks.length}件 ・ 全部処理するとここは空になります</span></div>${tasks || '<div class="muted" style="padding:30px 0;text-align:center">今日やることはありません</div>'}</div>`;
    $$('[data-act]').forEach(b => b.onclick = async () => {
      const t = r.tasks[Number(b.dataset.i)], a = b.dataset.act;
      try {
        if (a === 'shift') { S.ym = t.ym; S.tab = 'shift'; return render(); }
        if (a === 'proxy') { S.ym = t.ym; S.tab = 'shift'; return render(); }
        if (a === 'approve' || a === 'reject') { busy('処理中…'); await api('admin.requests.decide', { token: S.token, id: t.request.id, approve: a === 'approve' }); busy(false); toast(a === 'approve' ? '承認しました' : '却下しました'); return homeView(); }
        if (a === 'edit') return fixPop(t.flag, b, homeView);
      } catch (e) { busy(false); guard(e); }
    });
  }
  function fixPop(f, anchor, after) {
    pop(`<h3>${esc(f.name)} ・ ${esc(mdJa(f.date))} の時刻</h3><div class="small muted">${esc(f.plan)}</div>
      <div class="lbl">出勤</div><div class="times">${M.timeSel('fi', f.in || '09:00')}</div><div class="lbl">退勤</div><div class="times">${M.timeSel('fo', f.out || '18:00')}</div>
      <div class="lbl">理由</div><div class="opt" id="fr">${['本人確認済', '打刻忘れ', 'その他'].map((r, i) => `<button class="${i === 0 ? 'on' : ''}">${r}</button>`).join('')}</div>
      <div class="grid2"><button class="ghost" id="fc">閉じる</button><button class="btn dark" style="justify-content:center" id="fs">保存</button></div>`, anchor);
    $$('#fr button').forEach(b => b.onclick = () => { M.selectAll('#fr button', 'on'); b.classList.add('on'); });
    $('#fc').onclick = () => pop(null);
    $('#fs').onclick = async () => { busy('保存中…'); try { await api('admin.att.fix', { token: S.token, staffId: f.staffId, date: f.date, in: f.in ? M.timeVal('fi') : (M.timeVal('fi') !== (f.in || '') ? M.timeVal('fi') : ''), out: M.timeVal('fo'), reason: $('#fr .on').textContent }); busy(false); pop(null); toast('修正しました（元の打刻は打刻ログに残ります）'); after(); } catch (e) { busy(false); guard(e); } };
  }

  /* ---------- シフト ---------- */
  async function shiftView() {
    loading('シフト');
    let r; try { r = await api('admin.shifts', { token: S.token, ym: S.ym, store: storeArg() }); } catch (e) { return guard(e); }
    S.data = r;
    const ym = S.ym, n = dim(ym), isAll = S.store === '全店';
    const stores = (S.config.stores || []).filter(s => isAll ? S.stores.indexOf(s.name) >= 0 : s.name === S.store);
    const staff = r.staff.filter(s => isAll ? s.stores.some(x => S.stores.indexOf(x) >= 0) : s.stores.indexOf(S.store) >= 0);
    const shiftsOf = (id, d) => r.shifts.filter(x => x.staffId === id && x.date === d);
    const closedOn = (storeName, d) => { const st = M.STORES[storeName]; return !!st && (st.closed.indexOf(dow(d)) >= 0 || (S.config.holidays || []).some(h => h.date === d && (h.store === '全店' || h.store === storeName))); };
    const dates = Array.from({ length: n }, (_, i) => ym + '-' + pad2(i + 1));
    const head = `<th class="nmc">スタッフ</th>${dates.map(d => { const w = dow(d); const hol = (S.config.holidays || []).some(h => h.date === d && h.store === '全店'); return `<th class="${hol ? 'hol' : (w === 0 || w === 6) ? 'we' : ''}">${Number(d.slice(8))}<br><span style="font-size:10px">${WD[w]}</span></th>`; }).join('')}<th>合計</th>`;
    const weekStart = WD.indexOf(S.config.weekStart || '月');
    let body = '';
    staff.forEach(s => {
      let tot = 0, wk = 0, wkMax = 0, tds = '';
      dates.forEach(d => {
        if (dow(d) === weekStart && d !== dates[0]) { wkMax = Math.max(wkMax, wk); wk = 0; }
        const sh = shiftsOf(s.id, d), hp = r.hopes[s.id + '|' + d];
        sh.forEach(x => { if (x.kind !== '有給') { tot += x.hours; wk += x.hours; } });
        const vis = sh.filter(x => isAll || x.store === S.store || x.kind === '有給');
        let inner = '', cls = '';
        if (sh.length) {
          inner = vis.map(x => chip(x.pat, x.state === '確定' ? 'fixed' : 'draft', x.store, x.changed ? '<span class="chg">変</span>' : '')).join('') + (vis.length < sh.length ? `<span class="sub">${esc(sh.filter(x => vis.indexOf(x) < 0).map(x => x.store).join('/'))}</span>` : '');
          if (vis.some(x => x.custom)) inner += `<span class="sub">${esc(vis.filter(x => x.custom).map(x => x.s + '-' + x.e).join(' '))}</span>`;
          if (hp && hp.kind === '休み' && sh.some(x => x.kind !== '有給')) cls = 'ng';
          else if (hp && hp.kind === 'パターン' && !sh.some(x => x.pat === hp.pat)) inner += `<span class="sub">希望 ${esc(hp.pat)}</span>`;
          else if (hp && hp.kind === '時間') inner += `<span class="sub">希望 ${esc(hp.s.replace(':00', '') + '-' + hp.e.replace(':00', ''))}</span>`;
        } else if (hp) inner = hopeChip(hp);
        const allClosed = s.stores.every(st => closedOn(st, d));
        tds += `<td><div class="cell ${cls} ${S.hl === s.id + '|' + d ? 'hl' : ''} ${allClosed && !sh.length ? 'closed' : ''}" data-k="${esc(s.id)}|${d}" data-pop-anchor title="${cls ? '希望休の日に入っています' : ''}">${inner}</div></td>`;
      });
      wkMax = Math.max(wkMax, wk);
      body += `<tr><td class="nmc">${esc(s.name)}<small>${esc(s.type)} ・ ${esc(s.stores.join('/'))}</small></td>${tds}<td class="tot tnum ${wkMax > 40 ? 'over' : ''}">${tot.toFixed(1)}h${wkMax > 40 ? `<br>週${wkMax.toFixed(0)}h` : ''}</td></tr>`;
    });
    if (!staff.length) body += `<tr><td colspan="${n + 2}" class="muted" style="padding:30px;text-align:left">「${esc(S.store)}」に所属するスタッフがいません。従業員 → 所属店舗を追加してください。</td></tr>`;
    stores.forEach(st => {
      const need = (S.config.need || {})[st.name] || [0, 0, 0, 0, 0, 0, 0];
      body += `<tr class="cnt"><td class="nmc" style="background:#faf8f4">${esc(st.name)} 人数/必要</td>${dates.map(d => { const closed = closedOn(st.name, d); const nd = closed ? 0 : need[(dow(d) + 6) % 7] || 0; const c = r.shifts.filter(x => x.store === st.name && x.date === d && x.kind !== '有給').length; return `<td class="tnum ${c < nd ? 'short' : ''}" ${c < nd ? `data-short="${esc(st.name)}|${d}" data-pop-anchor title="クリックで候補"` : ''}>${closed ? '—' : c + '/' + nd}</td>`; }).join('')}<td></td></tr>`;
    });
    const chk = r.check, pub = r.publish.published;
    $('#main').innerHTML = top('シフト', `
        ${r.closed ? '<span class="badge ok">締め済</span>' : pub ? '<span class="badge ok">確定済 ・ スタッフに公開中</span>' : '<span class="badge wa">下書き ・ スタッフには見えません</span>'}
        ${pub && r.changes.length ? `<button class="btn" id="chg">変更履歴 ${r.changes.length}</button>` : ''}
        <button class="btn" id="proxy">希望を代わりに入力</button>
        ${pub || r.closed ? '' : `<button class="btn" id="ai">✦ AIで下書き</button>`}
        <button class="btn" onclick="window.print()">印刷</button>
        ${pub || r.closed ? '' : `<button class="btn dark" id="pubBtn">チェックして確定 ${chk.block.length ? `<span style="background:#fff;color:var(--error);padding:0 6px;font-family:var(--en)">${chk.block.length}</span>` : ''}</button>`}`, 'ym') + `
      <div class="content">
        <div class="legend" style="margin-bottom:8px">${M.legend(Object.keys(M.PAT).filter(p => isAll || M.PAT[p].store === '共通' || M.PAT[p].store === S.store))}</div>
        <div class="legend" style="margin-bottom:10px"><span class="chip hope" style="--c:#3d6a8f">中番</span>希望　<span class="chip draft" style="--cs:rgba(61,106,143,.3)">中番</span>下書き　<span class="chip fixed" style="--c:#3d6a8f;--fg:#fff">中番</span>確定　<span class="chip fixed" style="--c:#3d6a8f;--fg:#fff">中番<span class="locm">焙</span></span>別の店舗　<span class="chip fixed" style="--c:#3d6a8f;--fg:#fff">中番<span class="chg">変</span></span>確定後に変更　｜ 赤い角＝希望休に入っている　赤い数字＝人手不足（クリックで候補）　斜線＝定休日</div>
        <div class="gridwrap"><table class="sg"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>
        <div class="note">希望提出 ${chk.stats.submitted}/${chk.stats.total}人${chk.stats.unsubmitted.length ? '（未提出：' + esc(chk.stats.unsubmitted.join('、')) + '）' : ''}　希望叶え率 ${chk.stats.fulfil == null ? '—' : chk.stats.fulfil + '%'}　希望締切 ${esc(r.deadline)}　${chk.block.length ? `<span class="err">確定できない問題 ${chk.block.length}件</span>` : pub ? '' : '確定できます'}　注意 ${chk.warn.length}件</div>
      </div>`;
    bindYm('ym', shiftView);
    $$('.cell').forEach(c => c.onclick = () => cellPop(c));
    $$('[data-short]').forEach(td => td.onclick = () => candPop(td));
    const b = $('#pubBtn'); if (b) b.onclick = confirmModal;
    const ai = $('#ai'); if (ai) ai.onclick = aiModal;
    const ch = $('#chg'); if (ch) ch.onclick = () => modal(`<h3>確定後の変更履歴（${esc(ymJa(ym))}）</h3><table class="tb" style="margin-top:10px"><tr><th class="l">日付</th><th class="l">スタッフ</th><th class="l">変更前 → 後</th><th class="l">理由</th><th class="l">操作者・日時</th></tr>${r.changes.map(c => `<tr><td class="l tnum">${esc(c.date.slice(5).replace('-', '/'))}</td><td class="l">${esc(c.name)}</td><td class="l">${esc(c.before)} → ${esc(c.after)}</td><td class="l">${esc(c.reason)}</td><td class="l small">${esc(c.by)} ${esc(c.at)}</td></tr>`).join('')}</table><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn" onclick="MMC.modal(null)">閉じる</button></div>`);
    $('#proxy').onclick = proxyModal;
    if (S.hl) { const el = document.querySelector(`.cell[data-k="${S.hl}"]`); if (el) el.scrollIntoView({ block: 'center', inline: 'center' }); S.hl = null; }
  }
  function cellPop(el) {
    const [id, d] = el.dataset.k.split('|'); const r = S.data, s = r.staff.find(x => x.id === id), pub = r.publish.published;
    if (r.closed) return toast('締め済みの月です');
    const cur = r.shifts.filter(x => x.staffId === id && x.date === d), hp = r.hopes[id + '|' + d];
    const sh = cur[0] || null;
    const stores = s.stores.filter(x => S.stores.indexOf(x) >= 0);
    let loc = (sh && sh.store) || (stores.indexOf(s.home) >= 0 ? s.home : stores[0]);
    let patSel = sh ? sh.pat : undefined;
    const draw = () => {
      const pats = Object.keys(M.PAT).filter(p => M.PAT[p].store === '共通' || M.PAT[p].store === loc);
      pop(`<h3>${esc(s.name)} ・ ${esc(mdJa(d))}</h3>
        <div class="small muted" style="margin-bottom:8px">希望：${hp ? (hp.kind === '休み' ? '<b class="err">休み</b>' : esc(hp.kind === 'パターン' ? hp.pat : hp.kind === '時間' ? hp.s + '-' + hp.e : hp.kind)) : '提出なし'}${hp && hp.memo ? '（' + esc(hp.memo) + '）' : ''}${cur.length > 1 ? ' ｜ この日は ' + cur.length + ' 件' : ''}</div>
        ${pub ? '<div class="badge wa" style="margin-bottom:8px">確定済：変更は理由を記録し、本人に「変更あり」と表示</div>' : ''}
        <div class="lbl">店舗</div><div class="opt" id="cpLoc">${stores.map(l => `<button data-l="${esc(l)}" class="${loc === l ? 'on' : ''}">${esc(l)}</button>`).join('')}</div>
        <div class="lbl">パターン</div><div class="opt" id="cpPat">${pats.map(p => `<button data-p="${esc(p)}" class="${patSel === p ? 'on' : ''}">${esc(p)}<small>${esc(M.PAT[p].s)}-${esc(M.PAT[p].e)}</small></button>`).join('')}<button data-p="" class="${patSel === '' ? 'on' : ''}">休み</button></div>
        <label class="chk"><input type="checkbox" id="cust" ${sh && sh.custom ? 'checked' : ''}> 時間を変える（この日だけ）</label>
        <div id="custBox" style="display:${sh && sh.custom ? 'block' : 'none'}"><div class="times">${M.timeSel('cs', sh ? sh.s : '10:00')} 〜 ${M.timeSel('ce', sh ? sh.e : '16:00')}</div></div>
        ${pub ? `<div class="lbl">理由</div><div class="opt" id="cpR">${['交代', '体調不良', '店都合', '本人希望'].map((x, i) => `<button class="${i === 0 ? 'on' : ''}">${x}</button>`).join('')}</div>` : `<label class="chk"><input type="checkbox" id="sameWd"> ${esc(ymJa(S.ym))}の同じ曜日（${WD[dow(d)]}）の空いている日にも入れる（希望休・定休日は除く）</label>`}
        <div class="grid2"><button class="ghost" id="cpC">閉じる</button><button class="btn dark" style="justify-content:center" id="cpS">${pub ? '変更を保存' : '保存（下書き）'}</button></div>`, el);
      $$('#cpLoc button').forEach(b => b.onclick = () => { loc = b.dataset.l; draw(); });
      $$('#cpPat button').forEach(b => b.onclick = () => { M.selectAll('#cpPat button', 'on'); b.classList.add('on'); patSel = b.dataset.p; });
      $$('#cpR button').forEach(b => b.onclick = () => { M.selectAll('#cpR button', 'on'); b.classList.add('on'); });
      $('#cust').onchange = e => { $('#custBox').style.display = e.target.checked ? 'block' : 'none'; };
      $('#cpC').onclick = () => pop(null);
      $('#cpS').onclick = async () => {
        const p = patSel === undefined ? (sh ? sh.pat : '') : patSel;
        const item = { id: sh ? sh.id : undefined, date: d, staffId: id, store: loc, pat: p, remove: !p, reason: pub ? $('#cpR .on').textContent : '' };
        if ($('#cust').checked && p) { item.s = M.timeVal('cs'); item.e = M.timeVal('ce'); }
        busy('保存中…');
        try { await api('admin.shifts.save', { token: S.token, ym: S.ym, items: [item], opts: { sameWeekday: !pub && $('#sameWd') && $('#sameWd').checked } }); busy(false); pop(null); shiftView(); } catch (e) { busy(false); guard(e); }
      };
    };
    draw();
  }
  async function candPop(td) {
    const [store, d] = td.dataset.short.split('|');
    busy('候補を探しています…');
    let r; try { r = await api('admin.shifts.candidates', { token: S.token, date: d, store }); busy(false); } catch (e) { busy(false); return guard(e); }
    pop(`<h3>${esc(store)} ${esc(mdJa(d))} の候補</h3><div class="small muted" style="margin-bottom:6px">希望がある人 → 時間が少ない人 の順</div>
      ${r.list.map(c => `<div class="cand"><div>${esc(c.name)}<small>${c.hope ? (c.hope.kind === '休み' ? '<span class="err">希望休</span>' : '希望 ' + esc(c.hope.kind === 'パターン' ? c.hope.pat : c.hope.kind === '時間' ? c.hope.s + '-' + c.hope.e : c.hope.kind)) : '希望なし'} ・ 週最大 ${c.weekMax}h ・ 月 ${c.monthHours}h ・ ${esc(c.type)}</small></div>${c.hope && c.hope.kind === '休み' ? '<span class="muted small">—</span>' : `<button class="btn" data-cand="${esc(c.id)}" data-pat="${esc(c.suggest)}">${esc(c.suggest)} で入れる</button>`}</div>`).join('') || '<div class="muted">候補がいません</div>'}
      <div style="margin-top:10px"><button class="ghost" id="cc">閉じる</button></div>`, td);
    $('#cc').onclick = () => pop(null);
    $$('[data-cand]').forEach(b => b.onclick = async () => { busy('保存中…'); try { await api('admin.shifts.save', { token: S.token, ym: S.ym, items: [{ date: d, staffId: b.dataset.cand, store, pat: b.dataset.pat, reason: '店都合' }] }); busy(false); pop(null); shiftView(); } catch (e) { busy(false); guard(e); } });
  }
  async function confirmModal() {
    busy('チェック中…');
    let chk; try { chk = await api('admin.shifts.check', { token: S.token, ym: S.ym, store: storeArg() }); busy(false); } catch (e) { busy(false); return guard(e); }
    modal(`<h3>${esc(ymJa(S.ym))}のシフトを確定する前に</h3><div class="muted small" style="margin-bottom:10px">問題があると確定できません。注意は確認のうえ確定できます。</div>
      ${chk.block.map(b => `<div class="ck ng"><i>!</i><div><b>${esc(b.t)}</b><div class="small muted">${esc(b.s)}</div></div>${b.cells ? `<button class="ghost sm act" data-go="${esc(b.cells[0])}">修正へ</button>` : ''}</div>`).join('')}
      ${chk.warn.map(b => `<div class="ck wa"><i>?</i><div><b>${esc(b.t)}</b><div class="small muted">${esc(b.s)}</div></div></div>`).join('')}
      ${chk.ok.map(t => `<div class="ck ok"><i>✓</i><div>${esc(t)}</div></div>`).join('')}
      <div class="small muted" style="margin-top:12px">確定するとスタッフの画面に表示されます。確定後の変更は理由付きで記録され、本人に「変更あり」と表示されます。</div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px"><button class="btn" id="mc">戻る</button><button class="btn dark" id="mr" ${chk.block.length ? 'disabled' : ''}>確定して公開する</button></div>`);
    $('#mc').onclick = () => modal(null);
    $$('[data-go]').forEach(b => b.onclick = () => { modal(null); S.hl = b.dataset.go; shiftView(); });
    $('#mr').onclick = async () => { busy('確定中…'); try { await api('admin.shifts.publish', { token: S.token, ym: S.ym }); busy(false); modal(null); toast(ymJa(S.ym) + 'のシフトを確定して公開しました'); shiftView(); } catch (e) { busy(false); guard(e); } };
  }
  function aiModal() {
    modal(`<h3>AIで下書きを作る（${esc(ymJa(S.ym))} ・ ${esc(S.store)}）</h3><div class="muted small" style="margin-bottom:12px">今ある下書きは残し、空いている日だけ埋めます。結果はルールで検証してから下書きに入ります。</div>
      ${['希望休は必ず休みにする', '正社員：週5日・1日8時間・週40時間以内', '各店舗の必要人数を満たす（定休日は除く）', 'アルバイトで不足時間帯を補う（希望のパターン優先）', '希望叶え率を上げ、時間を均等にする'].map((t, i) => `<div class="ck ok"><i>${i + 1}</i><div>${t}</div></div>`).join('')}
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px"><button class="btn" id="mc">やめる</button><button class="btn dark" id="mr">✦ 空いている日を埋める</button></div>`);
    $('#mc').onclick = () => modal(null);
    $('#mr').onclick = async () => { busy('AI が作成中…（1分ほどかかることがあります）'); try { const r = await api('admin.shifts.ai', { token: S.token, ym: S.ym, store: storeArg() }); busy(false); modal(null); toast(`下書き ${r.added}件を追加しました` + (r.skipped.length ? `（除外 ${r.skipped.length}件：${r.skipped.slice(0, 3).map(x => x.why).join('・')}）` : '')); shiftView(); } catch (e) { busy(false); guard(e); } };
  }
  /** 希望の代理入力：スタッフを選んで、日付をクリックして 休み／パターン を入れる */
  function proxyModal() {
    const r = S.data; let sid = r.staff[0] && r.staff[0].id; let days = {};
    const load = () => { days = {}; Object.keys(r.hopes).forEach(k => { if (k.indexOf(sid + '|') === 0) days[k.split('|')[1]] = r.hopes[k]; }); };
    load();
    const draw = () => {
      const s = r.staff.find(x => x.id === sid);
      modal(`<h3>希望を代わりに入力（${esc(ymJa(S.ym))}）</h3><div class="small muted">締切後や、スタッフから口頭で聞いた希望を入れるときに。</div>
        <select class="inp" id="pxS" style="margin:10px 0">${r.staff.map(x => `<option value="${esc(x.id)}" ${x.id === sid ? 'selected' : ''}>${esc(x.name)}${r.submitted[x.id] ? '（提出済）' : '（未提出）'}</option>`).join('')}</select>
        <div class="small muted">日付をクリック：なし → 休み → ${esc(Object.keys(M.PAT).filter(p => M.PAT[p].kind === '勤務' && (M.PAT[p].store === '共通' || s.stores.indexOf(M.PAT[p].store) >= 0) && p !== 'イベント').join(' → '))} → なし</div>
        <div style="max-width:420px;margin-top:8px">${M.calendar(S.ym, { cellHtml: ds => hopeChip(days[ds]) })}</div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px"><button class="btn" id="mc">やめる</button><button class="btn dark" id="mr">この内容で保存</button></div>`);
      $('#pxS').onchange = e => { sid = e.target.value; load(); draw(); };
      const cycle = ['OFF'].concat(Object.keys(M.PAT).filter(p => M.PAT[p].kind === '勤務' && (M.PAT[p].store === '共通' || s.stores.indexOf(M.PAT[p].store) >= 0) && p !== 'イベント'));
      $$('#modal [data-cd]').forEach(c => c.onclick = () => { const ds = c.dataset.cd, h = days[ds]; const cur = !h ? -1 : h.kind === '休み' ? 0 : cycle.indexOf(h.pat); const nx = cur + 1; if (nx >= cycle.length) delete days[ds]; else days[ds] = nx === 0 ? { kind: '休み' } : { kind: 'パターン', pat: cycle[nx] }; draw(); });
      $('#mc').onclick = () => modal(null);
      $('#mr').onclick = async () => { busy('保存中…'); try { await api('admin.hope.proxy', { token: S.token, ym: S.ym, staffId: sid, days }); busy(false); modal(null); toast('保存しました'); shiftView(); } catch (e) { busy(false); guard(e); } };
    };
    draw();
  }

  /* ---------- 勤怠 ---------- */
  async function attView() {
    loading('勤怠');
    let r; try { r = await api('admin.att.flags', { token: S.token, ym: S.attYm, store: storeArg() }); } catch (e) { return guard(e); }
    let main = '';
    if (S.attTab === 'todo') {
      main = `<table class="tb"><tr><th class="l">日付</th><th class="l">氏名</th><th class="l">シフト</th><th>出勤</th><th>退勤</th><th class="l">内容</th><th class="l">処理</th></tr>
        ${r.list.map((f, i) => `<tr><td class="l tnum">${esc(f.date.slice(5).replace('-', '/'))}</td><td class="l">${esc(f.name)}</td><td class="l">${esc(f.plan)}</td><td class="tnum">${esc(f.in || '—')}</td><td class="tnum">${esc(f.out || '—')}</td><td class="l"><span class="badge ${f.sev}">${esc(f.issues.join('・'))}</span></td>
          <td class="l">${f.request ? `<span class="small muted">本人の申請：${esc((f.request.content.in ? '出勤 ' + f.request.content.in + ' ' : '') + (f.request.content.out ? '退勤 ' + f.request.content.out : ''))}（${esc(f.request.reason)}）</span><br><button class="btn dark" data-req="${esc(f.request.id)}" data-ap="1">承認</button> <button class="btn" data-req="${esc(f.request.id)}" data-ap="">却下</button>` : f.sev === 'ng' ? `<button class="btn dark" data-fx="${i}" data-pop-anchor>時刻を入れる</button>` : `<button class="btn dark" data-ok="${i}">問題なし</button> <button class="btn" data-fx="${i}" data-pop-anchor>時刻を直す</button>`}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">未処理はありません</td></tr>'}</table>
        <div class="note">未処理が 0 件になると「締める」が押せます（人事）。締めると数字は固定され、人件費シートに書き出されます。修正は元の打刻を残したまま追記されます。</div>`;
    } else if (S.attTab === 'month') {
      const m = await api('admin.att.month', { token: S.token, ym: S.attYm, store: storeArg() }).catch(guard);
      main = `<table class="tb"><tr><th class="l">氏名</th><th class="l">主所属</th><th>出勤</th><th>実働h</th><th>残業h</th><th>深夜h</th><th>シフト予定h</th><th>差</th></tr>${(m ? m.list : []).map(x => `<tr><td class="l">${esc(x.name)}</td><td class="l">${esc(x.home)}</td><td class="tnum">${x.days}日</td><td class="tnum">${x.worked.toFixed(1)}</td><td class="tnum">${x.ot.toFixed(1)}</td><td class="tnum">${x.night.toFixed(1)}</td><td class="tnum">${x.planned.toFixed(1)}</td><td class="tnum ${Math.abs(x.diff) >= 2 ? 'err' : ''}">${x.diff > 0 ? '+' : ''}${x.diff.toFixed(1)}</td></tr>`).join('')}</table>`;
    } else {
      const l = await api('admin.att.log', { token: S.token, ym: S.attYm, store: storeArg() }).catch(guard);
      main = `<table class="tb"><tr><th class="l">日時</th><th class="l">氏名</th><th class="l">種別</th><th class="l">店舗</th><th class="l">確認方法</th><th class="l">備考</th></tr>${(l ? l.list : []).map(x => `<tr><td class="l tnum">${esc(x.at)}</td><td class="l">${esc(x.name)}</td><td class="l">${esc(x.type)}</td><td class="l">${esc(x.store)}</td><td class="l">${esc(x.method)}</td><td class="l">${esc(x.note)}</td></tr>`).join('')}</table>`;
    }
    $('#main').innerHTML = top('勤怠', r.closed ? '<span class="badge ok">締め済 ・ 人件費に反映</span>' : isHR() ? `<button class="btn dark" id="closeBtn" ${r.list.length ? 'disabled' : ''}>${esc(ymJa(S.attYm))}を締める</button>` : '', 'attYm') + `<div class="content">
      <div class="kpis"><div class="kpi ${r.list.length ? 'ng' : ''}"><span>未処理</span><b>${r.list.length}件</b></div><div class="kpi"><span>月</span><b style="font-size:16px">${esc(ymJa(S.attYm))}</b></div><div class="kpi"><span>状態</span><b style="font-size:16px">${r.closed ? '締め済' : '未締め'}</b></div><div class="kpi"><span>対象</span><b style="font-size:16px">${esc(S.store)}</b></div></div>
      <div class="tabs">${[['todo', `要対応 ${r.list.length}`], ['month', '全員の月次'], ['log', '打刻ログ']].map(([k, l]) => `<button data-at="${k}" class="${S.attTab === k ? 'on' : ''}">${l}</button>`).join('')}</div>${main}</div>`;
    bindYm('attYm', attView);
    $$('[data-at]').forEach(b => b.onclick = () => { S.attTab = b.dataset.at; attView(); });
    $$('[data-ok]').forEach(b => b.onclick = async () => { const f = r.list[Number(b.dataset.ok)]; busy('処理中…'); try { await api('admin.att.ack', { token: S.token, staffId: f.staffId, date: f.date }); busy(false); toast('確認済にしました'); attView(); } catch (e) { busy(false); guard(e); } });
    $$('[data-fx]').forEach(b => b.onclick = () => fixPop(r.list[Number(b.dataset.fx)], b, attView));
    $$('[data-req]').forEach(b => b.onclick = async () => { busy('処理中…'); try { await api('admin.requests.decide', { token: S.token, id: b.dataset.req, approve: !!b.dataset.ap }); busy(false); toast(b.dataset.ap ? '承認しました' : '却下しました'); attView(); } catch (e) { busy(false); guard(e); } });
    const cb = $('#closeBtn'); if (cb) cb.onclick = async () => { if (!confirm(ymJa(S.attYm) + 'を締めます。締めると勤怠の修正ができなくなります。よろしいですか？')) return; busy('締め処理中…'); try { await api('admin.att.close', { token: S.token, ym: S.attYm }); busy(false); toast('締めました。人件費ページで確認できます'); attView(); } catch (e) { busy(false); guard(e); } };
  }

  /* ---------- 人件費 ---------- */
  async function costView() {
    loading('人件費');
    let r; try { r = await api('admin.payroll', { token: S.token, ym: S.attYm }); } catch (e) { return guard(e); }
    const vis = r.staff.filter(s => S.store === '全店' || s.home === S.store);
    const full = vis.filter(s => s.type === '正社員'), part = vis.filter(s => s.type !== '正社員');
    const [y, m] = r.ym.split('-').map(Number), [py, pm] = r.payYm.split('-').map(Number);
    const row = (s, amount) => `<tr><td class="l">${esc(s.name)}<span class="muted small"> ${esc(s.home)}</span></td><td class="l">${y}年${m}月</td><td class="l">${py}年${pm}月</td><td class="tnum strong">${yen(amount)}</td><td class="tnum">${yen(s.transport)}</td><td><button class="ghost sm" data-copy="${esc([s.name, y + '年' + m + '月', py + '年' + pm + '月', Math.round(amount), s.transport].join('\t'))}">コピー</button> <button class="ghost sm" data-detail="${esc(s.id)}">明細</button></td></tr>
      <tr class="detail hidden" data-for="${esc(s.id)}"><td colspan="6" class="l muted small">${s.type === '正社員' ? `月給 ${yen(s.monthly)} ÷ ${M.STORES[s.home] ? M.STORES[s.home].monthlyH : '—'}h ＝ 換算時給 ${yen(s.rate)}（${esc(r.rates.rounding)}）　｜ ` : `時給 ${yen(s.rate)} × 実働 ${s.worked}h　｜ `}出勤 ${s.days}日 ・ 実働 ${s.worked}h ・ 残業 ${s.ot}h（日次 ${s.dailyOt} ＋ 週次 ${s.weeklyOt}）・ 深夜 ${s.night}h ・ 深夜残業 ${s.nightOt}h ・ 60h超 ${s.over60}h ・ 有給 ${s.leaveDays}日${s.leavePay ? '（' + yen(s.leavePay) + '）' : ''}
        <div style="margin-top:6px">${s.detail.map(d => `<span class="tnum">${esc(d.date.slice(5).replace('-', '/'))} ${esc(d.in)}-${esc(d.out || '—')} ${d.worked}h${d.issues.length ? ' <span class="err">' + esc(d.issues.join('・')) + '</span>' : ''}</span>`).join(' ／ ')}</div></td></tr>`;
    const sumOt = full.reduce((a, s) => a + s.otPay, 0), sumPt = part.reduce((a, s) => a + s.salary, 0), sumTr = vis.reduce((a, s) => a + s.transport, 0);
    $('#main').innerHTML = top('人件費', r.closed ? '<span class="badge ok">締め済 ・ 確定値</span>' : '<span class="badge wa">未締め ・ 勤怠を締めると確定します</span>', 'attYm') + `<div class="content" style="max-width:1000px">
      <div class="kpis"><div class="kpi"><span>正社員 残業代 合計</span><b>${yen(sumOt)}</b></div><div class="kpi"><span>アルバイト 給料 合計</span><b>${yen(sumPt)}</b></div><div class="kpi"><span>交通費 合計</span><b>${yen(sumTr)}</b></div><div class="kpi"><span>店舗別（主所属）</span><b style="font-size:13px;line-height:1.8">${Object.keys(r.byStore).map(k => esc(k) + ' ' + yen(r.byStore[k])).join('<br>')}</b></div></div>
      <div class="h2">正社員 <span class="r">税理士の表と同じ列：氏名・勤務月・支払月・残業代(深夜含む)・交通費</span></div>
      <table class="tb" style="margin-bottom:18px"><tr><th class="l">氏名</th><th class="l">勤務月</th><th class="l">支払月</th><th>残業代(深夜含む)</th><th>交通費</th><th></th></tr>${full.map(s => row(s, s.otPay)).join('') || '<tr><td colspan="6" class="muted">該当なし</td></tr>'}</table>
      <div class="h2">アルバイト <span class="r">氏名・勤務月・支払月・給料・交通費</span></div>
      <table class="tb"><tr><th class="l">氏名</th><th class="l">勤務月</th><th class="l">支払月</th><th>給料</th><th>交通費</th><th></th></tr>${part.map(s => row(s, s.salary)).join('') || '<tr><td colspan="6" class="muted">該当なし</td></tr>'}</table>
      <div class="note">源泉徴収と支払額は税理士が計算します。換算時給＝月給÷主所属店舗の月平均所定労働時間（${esc(r.rates.rounding)}）。割増：残業 ×${r.rates.ot}、深夜 +${r.rates.night}、月60h超 +${r.rates.over60}（会社共通の設定）。残業＝1日8h超＋週40h超（日次分は除く）。2か所で働いた日も1人分として合算。</div></div>`;
    bindYm('attYm', costView);
    $$('[data-copy]').forEach(b => b.onclick = () => { const t = b.dataset.copy; try { navigator.clipboard.writeText(t); } catch (e) {} toast('コピーしました：' + t.replace(/\t/g, ' | ')); });
    $$('[data-detail]').forEach(b => b.onclick = () => { const d = document.querySelector(`.detail[data-for="${b.dataset.detail}"]`); d.classList.toggle('hidden'); });
  }

  /* ---------- 有給 ---------- */
  async function leaveView() {
    loading('有給');
    let r; try { r = await api('admin.leave', { token: S.token, store: storeArg() }); } catch (e) { return guard(e); }
    $('#main').innerHTML = top('有給', isHR() ? '<button class="btn" id="grant">今年度の付与を実行</button>' : '') + `<div class="content">
      ${r.requests.map(q => `<div class="task"><div class="n">1</div><div class="t"><b>有給の申請</b><span>${esc(q.name)} ・ ${esc(mdJa(q.date))} ・ ${esc(q.reason)}</span></div><div class="a"><button class="btn dark" data-dec="${esc(q.id)}" data-ap="1">承認</button><button class="btn" data-dec="${esc(q.id)}" data-ap="">却下</button></div></div>`).join('')}
      <table class="tb" style="margin-top:14px"><tr><th class="l">氏名</th><th class="l">主所属</th><th>今年度付与</th><th>取得</th><th>残日数</th><th class="l">年5日取得</th><th class="l">期限</th></tr>
        ${r.list.map(s => `<tr><td class="l">${esc(s.name)}</td><td class="l">${esc(s.home)}</td><td class="tnum">${s.grantThisFy}日</td><td class="tnum">${s.usedThisFy}日</td><td class="tnum strong">${s.left}日</td><td class="l">${s.mustTake5 ? (s.usedThisFy >= 5 ? '<span class="badge ok">達成</span>' : `<span class="badge wa">あと${5 - s.usedThisFy}日</span>`) : '<span class="muted small">対象外</span>'}</td><td class="l small">${s.lots.map(l => esc(l.expire.replace(/-/g, '/')) + ' まで ' + l.left + '日').join('・') || '—'}</td></tr>`).join('')}</table>
      <div class="note">毎年6月1日付与（主所属店舗の「有給付与日数」）。途中入社は月数で按分・四捨五入（法定最低日数を下回るときは引き上げ）。付与から2年で失効、古い分から消化。スタッフは希望提出の画面から有給を申請し、承認するとシフトに「有給」として入ります。</div></div>`;
    $$('[data-dec]').forEach(b => b.onclick = async () => { busy('処理中…'); try { await api('admin.requests.decide', { token: S.token, id: b.dataset.dec, approve: !!b.dataset.ap }); busy(false); toast(b.dataset.ap ? '承認しました。シフトに「有給」として入ります' : '却下しました'); leaveView(); } catch (e) { busy(false); guard(e); } });
    const g = $('#grant'); if (g) g.onclick = async () => { busy('付与中…'); try { await api('admin.leave.grant', { token: S.token }); busy(false); toast('付与しました（付与済みの人はそのまま）'); leaveView(); } catch (e) { busy(false); guard(e); } };
  }

  /* ---------- 従業員 ---------- */
  async function staffView() {
    loading('従業員');
    let r; try { r = await api('admin.staff', { token: S.token }); } catch (e) { return guard(e); }
    const list = r.list.filter(s => S.store === '全店' || s.stores.indexOf(S.store) >= 0);
    $('#main').innerHTML = top('従業員', isHR() ? '<button class="btn dark" id="add">＋ 追加</button>' : '') + `<div class="content"><div style="overflow:auto"><table class="tb"><tr><th class="l">番号</th><th class="l">氏名</th><th class="l">雇用区分</th><th class="l">主所属</th><th class="l">所属店舗</th><th class="l">いつもの出勤</th><th>給与</th><th>交通費</th><th class="l">権限</th><th class="l">PIN</th><th></th></tr>
      ${list.map(s => `<tr style="${s.active ? '' : 'opacity:.5'}"><td class="tnum">${esc(s.id)}</td><td class="l">${esc(s.name)}${s.active ? '' : '<span class="badge" style="margin-left:6px">退職</span>'}</td><td class="l">${esc(s.type)}</td><td class="l">${esc(s.home)}</td><td class="l">${esc(s.stores.join(' / '))}</td><td class="l small">${Object.keys(s.defaults || {}).sort().map(w => WD[w] + s.defaults[w]).join(' ') || '—'}</td><td class="tnum">${s.type === '正社員' ? '月給 ' + yen(s.monthly) : '時給 ' + yen(s.hourly)}</td><td class="tnum">${esc(s.trKind)} ${yen(s.trAmt)}</td><td class="l">${esc(s.role)}</td><td class="l">${s.pinSet ? '<span class="badge ok">設定済</span>' : `<span class="badge wa">未設定</span>${s.initCode ? ` <span class="small muted">初期コード <b class="tnum">${esc(s.initCode)}</b></span>` : ''}`}</td>
        <td>${isHR() ? `<button class="ghost sm" data-edit="${esc(s.id)}">編集</button> <button class="ghost sm" data-code="${esc(s.id)}">${s.pinSet ? 'PIN リセット' : '初期コード再発行'}</button>` : ''}</td></tr>`).join('')}</table></div>
      <div class="note">PIN は本人が店内端末またはスマホで初回に設定します（管理者は初期コードを渡すだけで、PIN 自体は見えません）。忘れたら「PIN リセット」→ 新しい初期コードを渡す。<br>権限：一般（自分の画面のみ）／店長（担当店舗のシフト・勤怠）／人事（全店＋人件費・設定、本人もシフトに入る）／オーナー（人事と同じ権限で、シフト・給与・有給の対象外）。所属店舗は複数選べ、主所属で所定労働時間と有給日数が決まります。</div></div>`;
    const a = $('#add'); if (a) a.onclick = () => staffModal(null);
    $$('[data-edit]').forEach(b => b.onclick = () => staffModal(r.list.find(s => s.id === b.dataset.edit)));
    $$('[data-code]').forEach(b => b.onclick = async () => { if (!confirm('初期コードを発行します。今の PIN は使えなくなります。よろしいですか？')) return; busy('発行中…'); try { const c = await api('admin.staff.issueCode', { token: S.token, staffId: b.dataset.code }); busy(false); alert('初期コード：' + c.code + '\n本人に伝えてください。本人が店内端末かスマホで新しい PIN を設定します。'); staffView(); } catch (e) { busy(false); guard(e); } });
  }
  function staffModal(s) {
    s = s || { id: '', name: '', type: 'アルバイト', role: '一般', home: S.stores[0], stores: [S.stores[0]], monthly: 0, hourly: 0, trKind: '日額', trAmt: 0, joined: '', order: 99, defaults: {}, active: true, memo: '' };
    const pats = Object.keys(M.PAT).filter(p => M.PAT[p].kind === '勤務' && p !== 'イベント');
    modal(`<h3>${s.id ? '従業員を編集' : '従業員を追加'}</h3>
      <div class="formrow"><b>従業員番号</b><input class="inp" id="sId" value="${esc(s.id)}" ${s.id ? 'readonly' : ''} placeholder="例：010"></div>
      <div class="formrow"><b>氏名</b><input class="inp w" id="sName" value="${esc(s.name)}"></div>
      <div class="formrow"><b>雇用区分</b><select class="inp" id="sType">${['正社員', 'アルバイト'].map(t => `<option ${s.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="formrow"><b>権限</b><select class="inp" id="sRole">${['一般', '店長', '人事', 'オーナー'].map(t => `<option ${s.role === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="formrow"><b>所属店舗</b><div>${S.stores.map(n => `<label class="chk"><input type="checkbox" data-st="${esc(n)}" ${s.stores.indexOf(n) >= 0 ? 'checked' : ''}> ${esc(n)}</label>`).join('')}</div></div>
      <div class="formrow"><b>主所属</b><select class="inp" id="sHome">${S.stores.map(n => `<option ${s.home === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>
      <div class="formrow"><b>月給（正社員）</b><input class="inp" id="sMonthly" type="number" value="${s.monthly || ''}"></div>
      <div class="formrow"><b>時給（アルバイト）</b><input class="inp" id="sHourly" type="number" value="${s.hourly || ''}"></div>
      <div class="formrow"><b>交通費</b><div><select class="inp" id="sTrKind">${['日額', '月額'].map(t => `<option ${s.trKind === t ? 'selected' : ''}>${t}</option>`).join('')}</select> <input class="inp" id="sTrAmt" type="number" value="${s.trAmt || ''}" style="width:120px"> 円</div></div>
      <div class="formrow"><b>入社日</b><input class="inp" id="sJoined" type="date" value="${esc(s.joined)}"></div>
      <div class="formrow"><b>いつもの出勤</b><div class="small">${WD.map((w, i) => `${w} <select class="inp" data-def="${i}" style="padding:4px 6px;font-size:13px"><option value="">—</option>${pats.map(p => `<option ${(s.defaults || {})[i] === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>`).join(' ')}<div class="muted">希望提出の画面に最初から入ります</div></div></div>
      <div class="formrow"><b>表示順</b><input class="inp" id="sOrder" type="number" value="${s.order || 99}" style="width:80px"></div>
      <div class="formrow" style="border:none"><b>在籍</b><label class="chk"><input type="checkbox" id="sActive" ${s.active ? 'checked' : ''}> 在籍中（外すと退職扱い・過去の記録は残る）</label></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px"><button class="btn" id="mc">やめる</button><button class="btn dark" id="mr">保存</button></div>`);
    $('#mc').onclick = () => modal(null);
    $('#mr').onclick = async () => {
      const defaults = {}; $$('[data-def]').forEach(sel => { if (sel.value) defaults[sel.dataset.def] = sel.value; });
      const o = { id: $('#sId').value.trim(), name: $('#sName').value.trim(), type: $('#sType').value, role: $('#sRole').value, stores: $$('[data-st]').filter(c => c.checked).map(c => c.dataset.st), home: $('#sHome').value, monthly: Number($('#sMonthly').value) || 0, hourly: Number($('#sHourly').value) || 0, trKind: $('#sTrKind').value, trAmt: Number($('#sTrAmt').value) || 0, joined: $('#sJoined').value, order: Number($('#sOrder').value) || 99, defaults, active: $('#sActive').checked, memo: s.memo };
      busy('保存中…');
      try { const r = await api('admin.staff.save', { token: S.token, staff: o }); busy(false); modal(null); if (r.initCode) alert('登録しました。初期コード：' + r.initCode + '\n本人に伝えてください。本人が店内端末かスマホで PIN を設定します。'); else toast('保存しました'); staffView(); } catch (e) { busy(false); guard(e); }
    };
  }

  /* ---------- 設定 ---------- */
  async function setView() {
    loading('設定');
    let r; try { r = await api('admin.settings', { token: S.token }); } catch (e) { return guard(e); }
    if (!S.setStore || !r.stores.some(s => s.name === S.setStore)) S.setStore = r.stores[0] && r.stores[0].name;
    const c = r.company;
    let main = '';
    if (S.setTab === 'company') {
      main = `<div class="sect">SCHEDULE</div>
        <div class="formrow"><b>希望の提出締切</b><div>毎月 <input class="inp" id="cDeadline" type="number" value="${c.deadlineDay}" style="width:70px"> 日（翌月分）　公開予定日 <input class="inp" id="cPublish" type="number" value="${c.publishDay}" style="width:70px"> 日</div></div>
        <div class="formrow"><b>週の起算日</b><select class="inp" id="cWeek">${WD.map(w => `<option ${c.weekStart === w ? 'selected' : ''}>${w}</option>`).join('')}</select></div>
        <div class="sect">PAYROLL</div>
        <div class="formrow"><b>割増率</b><div>残業 ×<input class="inp" id="cOt" type="number" step="0.01" value="${c.otRate}" style="width:80px">　深夜 +<input class="inp" id="cNight" type="number" step="0.01" value="${c.nightRate}" style="width:80px">　月60h超 +<input class="inp" id="cOver" type="number" step="0.01" value="${c.over60Rate}" style="width:80px">　<span class="muted small">法改正時はここだけ直せば全店に反映</span></div></div>
        <div class="formrow"><b>休憩ルール</b><div>6h超 <input class="inp" id="cB6" type="number" value="${c.break6}" style="width:70px">分 ・ 8h超 <input class="inp" id="cB8" type="number" value="${c.break8}" style="width:70px">分（労基法34条）</div></div>
        <div class="formrow"><b>換算時給の端数</b><select class="inp" id="cRound">${['切り上げ', '四捨五入', '切り捨て'].map(x => `<option ${c.rounding === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
        <div class="sect">PUNCH</div>
        <div class="formrow"><b>位置確認</b><label class="chk"><input type="checkbox" id="cCheck" ${c.checkLocation ? 'checked' : ''}> スマホ打刻で店舗の Wi-Fi か GPS を確認する（店内端末は常に不要）</label></div>
        <div class="sect">AI</div>
        <div class="formrow"><b>Gemini API Key</b><div><input class="inp w" id="cKey" type="password" placeholder="${r.geminiKeySet ? '保存済み（変更するときだけ貼る）' : 'ここに貼り付け → 保存後は表示されません'}"><div class="lbl">モデル <input class="inp" id="cModel" value="${esc(c.geminiModel)}" style="width:240px"></div></div></div>
        <div class="formrow" style="border:none"><b>店内端末</b><div class="small">${r.devices.map(d => `${esc(d.name)}（${esc(d.store)} ・ ${esc(d.at)}）`).join('<br>') || '未登録'}<div class="muted">登録は店内端末の画面（kiosk.html）の「管理者メニュー」から</div></div></div>
        <div style="margin-top:14px"><button class="btn dark" id="saveCompany">保存</button></div>`;
    } else if (S.setTab === 'store') {
      const st = r.stores.find(s => s.name === S.setStore); const need = r.need[st.name] || [0, 0, 0, 0, 0, 0, 0];
      main = `<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><span class="muted small">店舗を選ぶ</span>${r.stores.map(s => `<button class="ghost sm ${S.setStore === s.name ? 'on' : ''}" data-ss="${esc(s.name)}">${esc(s.name)}</button>`).join('')}</div>
        <div class="sect">STORE</div>
        <div class="formrow"><b>店舗名 ・ 略称</b><div><input class="inp" id="stName" value="${esc(st.name)}"> <input class="inp" id="stShort" value="${esc(st.short)}" style="width:60px" maxlength="2"></div></div>
        <div class="formrow"><b>営業時間</b><div><input class="inp" id="stOpen" value="${esc(st.open)}" style="width:90px" placeholder="11:00"> 〜 <input class="inp" id="stClose" value="${esc(st.close)}" style="width:90px" placeholder="18:00"></div></div>
        <div class="formrow"><b>定休日</b><div>${WD.map((w, i) => `<label class="chk" style="display:inline-flex;margin-right:10px"><input type="checkbox" data-closed="${i}" ${st.closed.indexOf(i) >= 0 ? 'checked' : ''}> ${w}</label>`).join('')}</div></div>
        <div class="formrow"><b>年間休日 ・ 所定</b><div>年間休日 <input class="inp" id="stOff" type="number" value="${st.annualOff}" style="width:80px"> 日 → 月平均所定 <input class="inp" id="stH" type="number" step="0.1" value="${st.monthlyH}" style="width:90px"> h　<span class="muted small">（365−休日）×8÷12</span></div></div>
        <div class="formrow"><b>有給付与日数</b><div><input class="inp" id="stLeave" type="number" value="${st.leaveDays}" style="width:80px"> 日／年（6/1 付与）</div></div>
        <div class="formrow"><b>位置</b><div class="small">緯度 ${st.lat == null ? '未設定' : st.lat} ・ 経度 ${st.lng == null ? '未設定' : st.lng} ・ 許可半径 <input class="inp" id="stRadius" type="number" value="${st.radius}" style="width:80px">m ・ 店舗IP ${esc(st.ips.join(', ') || '未設定')}<div class="muted">座標と IP は店内端末の「管理者メニュー → 現在地を保存」で入ります</div></div></div>
        <div class="sect">REQUIRED STAFF</div>
        <div class="formrow"><b>必要人数（曜日別）</b><div>${['月', '火', '水', '木', '金', '土', '日'].map((w, i) => `${w} <input class="inp" data-need="${i}" type="number" value="${need[i]}" style="width:56px;padding:4px 6px">`).join('　')}</div></div>
        <div style="margin-top:14px"><button class="btn dark" id="saveStore">保存</button></div>`;
    } else if (S.setTab === 'pattern') {
      const SW = ['#1c1c1c', '#595959', '#3d6a8f', '#4f8a5b', '#7a4b2a', '#d9a441', '#c0612b', '#8e3b6b', '#5b5ea6', '#2f8a8a'];
      S.pats = S.pats || r.patterns.map(p => Object.assign({}, p));
      main = `<div class="muted small">左から：希望・下書き・確定　色は自由に設定　「共通」は全店で使えます</div>
        <div style="overflow:auto;margin-top:8px"><table class="tb"><tr><th class="l">表示</th><th class="l">名称</th><th class="l">店舗</th><th>開始</th><th>終了</th><th>休憩</th><th class="l">種別</th><th class="l">色</th><th></th></tr>
        ${S.pats.map((p, i) => `<tr><td class="l">${chip(p.name, 'hope')} ${chip(p.name, 'draft')} ${chip(p.name, 'fixed')}</td><td class="l"><input class="inp" data-pf="name" data-i="${i}" value="${esc(p.name)}" style="width:110px;padding:4px 6px"></td><td class="l"><select class="inp" data-pf="store" data-i="${i}" style="padding:4px 6px">${['共通'].concat(r.stores.map(s => s.name)).map(n => `<option ${p.store === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></td><td><input class="inp" data-pf="s" data-i="${i}" value="${esc(p.s)}" style="width:80px;padding:4px 6px"></td><td><input class="inp" data-pf="e" data-i="${i}" value="${esc(p.e)}" style="width:80px;padding:4px 6px"></td><td><input class="inp" data-pf="brk" data-i="${i}" type="number" value="${p.brk}" style="width:70px;padding:4px 6px"></td><td class="l"><select class="inp" data-pf="kind" data-i="${i}" style="padding:4px 6px">${['勤務', '有給'].map(k => `<option ${p.kind === k ? 'selected' : ''}>${k}</option>`).join('')}</select></td>
          <td class="l"><div style="display:flex;gap:6px;align-items:center"><div class="swatches">${SW.map(c => `<button data-pc="${c}" data-i="${i}" class="${p.color === c ? 'on' : ''}" style="--c:${c}"></button>`).join('')}</div><input type="color" data-pcol="${i}" value="${esc(p.color)}"></div></td><td><button class="ghost sm" data-pdel="${i}">削除</button></td></tr>`).join('')}</table></div>
        <div style="margin-top:10px;display:flex;gap:10px"><button class="ghost sm" id="padd">＋ パターンを追加</button><button class="btn dark" id="savePat">保存</button></div>`;
    } else {
      S.hols = S.hols || r.holidays.map(h => Object.assign({}, h));
      main = `<div class="muted small">会社休日（年末年始・GW など）。全店か店舗ごとに設定できます。定休日は「店舗ごと」で。</div>
        <table class="tb" style="margin-top:8px"><tr><th class="l">日付</th><th class="l">店舗</th><th class="l">名称</th><th></th></tr>${S.hols.map((h, i) => `<tr><td class="l"><input class="inp" type="date" data-hf="date" data-i="${i}" value="${esc(h.date)}" style="padding:4px 6px"></td><td class="l"><select class="inp" data-hf="store" data-i="${i}" style="padding:4px 6px">${['全店'].concat(r.stores.map(s => s.name)).map(n => `<option ${h.store === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></td><td class="l"><input class="inp" data-hf="name" data-i="${i}" value="${esc(h.name)}" style="padding:4px 6px"></td><td><button class="ghost sm" data-hdel="${i}">削除</button></td></tr>`).join('')}</table>
        <div style="margin-top:10px;display:flex;gap:10px"><button class="ghost sm" id="hadd">＋ 追加</button><button class="btn dark" id="saveHol">保存</button></div>`;
    }
    $('#main').innerHTML = top('設定') + `<div class="content" style="max-width:980px"><div class="tabs">${[['company', '会社共通'], ['store', '店舗ごと'], ['pattern', 'シフトパターン'], ['holiday', '会社休日']].map(([k, l]) => `<button data-st2="${k}" class="${S.setTab === k ? 'on' : ''}">${l}</button>`).join('')}</div>${main}</div>`;
    $$('[data-st2]').forEach(b => b.onclick = () => { S.setTab = b.dataset.st2; setView(); });
    $$('[data-ss]').forEach(b => b.onclick = () => { S.setStore = b.dataset.ss; setView(); });
    const sc = $('#saveCompany'); if (sc) sc.onclick = async () => { busy('保存中…'); try { await api('admin.settings.company', { token: S.token, company: { deadlineDay: Number($('#cDeadline').value), publishDay: Number($('#cPublish').value), weekStart: $('#cWeek').value, otRate: Number($('#cOt').value), nightRate: Number($('#cNight').value), over60Rate: Number($('#cOver').value), break6: Number($('#cB6').value), break8: Number($('#cB8').value), rounding: $('#cRound').value, checkLocation: $('#cCheck').checked, geminiModel: $('#cModel').value.trim(), geminiKey: $('#cKey').value.trim() || undefined } }); busy(false); toast('保存しました'); setView(); } catch (e) { busy(false); guard(e); } };
    const ss = $('#saveStore'); if (ss) ss.onclick = async () => { const st = r.stores.find(s => s.name === S.setStore); busy('保存中…'); try { await api('admin.settings.store', { token: S.token, store: { originalName: st.name, id: st.id, name: $('#stName').value.trim(), short: $('#stShort').value.trim(), open: $('#stOpen').value.trim(), close: $('#stClose').value.trim(), closed: $$('[data-closed]').filter(c => c.checked).map(c => Number(c.dataset.closed)), annualOff: Number($('#stOff').value), monthlyH: Number($('#stH').value), leaveDays: Number($('#stLeave').value), radius: Number($('#stRadius').value), lat: st.lat, lng: st.lng, ips: st.ips }, need: $$('[data-need]').map(i => Number(i.value) || 0) }); busy(false); toast('保存しました'); S.setStore = $('#stName').value.trim(); boot(); } catch (e) { busy(false); guard(e); } };
    $$('[data-pf]').forEach(i => i.onchange = () => { S.pats[Number(i.dataset.i)][i.dataset.pf] = i.dataset.pf === 'brk' ? Number(i.value) : i.value; });
    $$('[data-pc]').forEach(b => b.onclick = () => { S.pats[Number(b.dataset.i)].color = b.dataset.pc; setView(); });
    $$('[data-pcol]').forEach(i => i.onchange = () => { S.pats[Number(i.dataset.pcol)].color = i.value; setView(); });
    $$('[data-pdel]').forEach(b => b.onclick = () => { if (confirm('このパターンを削除（無効に）しますか？')) { S.pats[Number(b.dataset.pdel)].active = false; S.pats = S.pats.filter(p => p.active !== false); setView(); } });
    const pa = $('#padd'); if (pa) pa.onclick = () => { S.pats.push({ name: '新パターン', store: '共通', s: '10:00', e: '18:00', brk: 60, color: '#595959', kind: '勤務' }); setView(); };
    const sp = $('#savePat'); if (sp) sp.onclick = async () => { busy('保存中…'); try { await api('admin.settings.patterns', { token: S.token, patterns: S.pats }); busy(false); toast('保存しました'); S.pats = null; boot(); } catch (e) { busy(false); guard(e); } };
    $$('[data-hf]').forEach(i => i.onchange = () => { S.hols[Number(i.dataset.i)][i.dataset.hf] = i.value; });
    $$('[data-hdel]').forEach(b => b.onclick = () => { S.hols.splice(Number(b.dataset.hdel), 1); setView(); });
    const ha = $('#hadd'); if (ha) ha.onclick = () => { S.hols.push({ date: '', store: '全店', name: '' }); setView(); };
    const sh = $('#saveHol'); if (sh) sh.onclick = async () => { busy('保存中…'); try { await api('admin.settings.holidays', { token: S.token, holidays: S.hols.filter(h => h.date) }); busy(false); toast('保存しました'); S.hols = null; boot(); } catch (e) { busy(false); guard(e); } };
  }
  function addStore() {
    modal(`<h3>店舗を追加</h3><div class="muted small" style="margin-bottom:10px">追加した店舗は、スタッフ・シフト・勤怠・人件費・設定すべてで切り替えられます。</div>
      <div class="formrow"><b>店舗名 ・ 略称</b><div><input class="inp" id="nsName" placeholder="例：二号店"> <input class="inp" id="nsShort" style="width:60px" maxlength="2" placeholder="二"></div></div>
      <div class="formrow"><b>営業時間</b><div><input class="inp" id="nsOpen" value="11:00" style="width:90px"> 〜 <input class="inp" id="nsClose" value="19:00" style="width:90px"></div></div>
      <div class="formrow"><b>定休日</b><div>${WD.map((w, i) => `<label class="chk" style="display:inline-flex;margin-right:10px"><input type="checkbox" data-nclosed="${i}"> ${w}</label>`).join('')}</div></div>
      <div class="formrow"><b>年間休日</b><div><input class="inp" id="nsOff" type="number" value="110" style="width:80px"> 日 → 月平均所定 <span id="nsH" class="tnum">170.0</span> h</div></div>
      <div class="formrow"><b>有給付与日数</b><div><input class="inp" id="nsLeave" type="number" value="21" style="width:80px"> 日／年</div></div>
      <div class="formrow" style="border:none"><b>この後やること</b><div class="small muted">1. 従業員で所属店舗を追加　2. 店長を指定　3. 店内端末（PC）を登録（管理者メニュー）　4. 現地で位置を保存　5. シフトパターンに店舗名で追加</div></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px"><button class="btn" id="mc">やめる</button><button class="btn dark" id="mr">追加する</button></div>`);
    $('#nsOff').oninput = () => { $('#nsH').textContent = ((365 - Number($('#nsOff').value || 0)) * 8 / 12).toFixed(1); };
    $('#mc').onclick = () => modal(null);
    $('#mr').onclick = async () => { const name = $('#nsName').value.trim(); if (!name) return toast('店舗名を入れてください', true); busy('追加中…'); try { await api('admin.settings.store', { token: S.token, store: { name, short: $('#nsShort').value.trim() || name.slice(0, 1), open: $('#nsOpen').value, close: $('#nsClose').value, closed: $$('[data-nclosed]').filter(c => c.checked).map(c => Number(c.dataset.nclosed)), annualOff: Number($('#nsOff').value), monthlyH: Number($('#nsH').textContent), leaveDays: Number($('#nsLeave').value), radius: 150, ips: [] }, need: [2, 2, 2, 2, 2, 2, 2] }); busy(false); modal(null); toast(`「${name}」を追加しました。従業員に所属を追加してください`); S.store = name; boot(); } catch (e) { busy(false); guard(e); } };
  }

  M.ready.then(boot);
})();
