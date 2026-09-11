/*
 * user.js  ---- head で user_id / ユーザープロパティを積む  [サーバー注入ポイント]
 *
 * 本番ECでは、ログイン済みかどうか・会員ID・会員ランクはサーバー(会員DB)が認証後に確定し、
 * サーバーサイドテンプレートで <head> の GTM スニペットより前に埋め込みます。
 *
 *   <script>
 *     window.dataLayer = window.dataLayer || [];
 *     window.dataLayer.push({ user_id: 'U123', user_properties: { login_state: 'logged_in', membership_rank: 'ゴールド' } });
 *   </script>
 *   <!-- ここから GTM スニペット -->
 *
 * このデモにはサーバーが無いので、localStorage(store.js の代役)から読んで同じ形で push します。
 * GTM より前に同期実行することで、page_view を含む「このページの全イベント」より先に
 * user_id が確定します(GTM の GA4 設定タグは Container Loaded 時点の dataLayer を読むため)。
 *
 * ※ store.js / datalayer.js はまだ読み込まれていないので、ここでは依存せず素の JS で書く。
 */
(function () {
  window.dataLayer = window.dataLayer || [];
  var user = null;
  try { user = JSON.parse(localStorage.getItem('unilo_user')); } catch (e) {}
  var loggedIn = !!(user && user.logged_in);
  // ゲスト時は user_id を null で送る(undefined だと JSON から消え、GTM のデータレイヤー変数に
  // 前の値が残置されることがある)。GTM の GA4 設定タグ側で null/空のときは user_id を送らない設定にする。
  window.dataLayer.push({
    user_id: loggedIn ? user.user_id : null,
    user_properties: {
      login_state: loggedIn ? 'logged_in' : 'guest',
      membership_rank: loggedIn ? user.membership_rank : 'none'
    }
  });
})();
