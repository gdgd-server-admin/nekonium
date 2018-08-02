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
    this.timelines = [ // タイムライン
      {
        'name': 'ほーむ',
        'data': []
      },
      {
        'name': 'つうち',
        'data': []
      },
      {
        'name': 'ろーかる',
        'data': []
      },
      {
        'name': 'たぐ',
        'data': []
      },
      {
        'name': 'ぱぶりっく',
        'data': []
      },
    ];
    this.compose = {}; // トゥート内容
    this.query = ''; // 検索クエリ
    this.profile = {}; // プロフィール情報
    this.current_page = 0;
  }

  testaction(args){
    var nm = this.settings.nightmode;
    this.settings.nightmode = !nm;
  }
}
