import MastodonAPI from 'lib/MastodonAPI';
import PleromaAPI from 'lib/PleromaAPI';

export default class App {
  constructor(){
    this.configLoaded = "";
    this.account = { // アカウント情報
      'base_url': 'https://pleroma.gdgd.jp.net/',
      'access_token': '',
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
        'data': [1,2,3]
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

    this.MastodonAPI = new MastodonAPI();
    this.PleromaAPI = new PleromaAPI();

    this.loadConfigFromFile()
    .then(result => {
      console.log("読み込み終わった");
      this.configLoaded = "loaded";
    });
  }

  async loginButtonClicked(args){
    await this.MastodonAPI.login(this.account.base_url);

    // アクセストークンを設定ファイルから読み込む
    this.loadConfigFromFile();
  }

  loadConfigFromFile(){
    return new Promise((resolve,reject) => {
      console.log("設定をファイルから読み込む");
      let config = this.MastodonAPI.loadConfigFromFile();
      if(config != undefined){
        this.account.access_token = config.account.access_token;
        this.account.base_url = config.account.base_url;
        resolve(config);
      }else{
        reject(0);
      }
    });
  }
}
