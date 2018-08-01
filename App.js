export default class App {
  constructor(){
    this.account = { // アカウント情報
      'base_url': 'https://pleroma.gdgd.jp.net/',
      'access_token': 'tokentoken',
    };
    this.settings = { // 各種設定
      'nightmode': false,
      'localnotify': false,
      'imageviewer': false,
      'pleromachat': false,
      'default_tag': '#ねこにうむ',
      'shake': false,
      'shake_text': 'にゃーん',
    };
    this.timelines = { // タイムライン
      'home': [],
      'notice': [],
      'local': [],
      'tag': [],
      'public': [],
      'search': [],
    };
    this.compose = {}; // トゥート内容
    this.query = ''; // 検索クエリ
    this.profile = {}; // プロフィール情報
  }
}
