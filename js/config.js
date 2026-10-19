/* ===== ここだけ書き換える =====
 * GAS をウェブアプリとしてデプロイしたときの URL（https://script.google.com/macros/s/……/exec）
 * 空のまま、または ?mock を付けて開くと、ブラウザ内のデモ用バックエンドで動く（データは保存されない）。
 */
window.MMC_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbx-3fsRubAJo7QYgSi51qOReo644eSouaq2DOG7cKCJypF2EFJwlwJ0c58j7N-08yrC/exec',
};
