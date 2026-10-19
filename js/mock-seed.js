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
