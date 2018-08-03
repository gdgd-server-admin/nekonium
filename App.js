import MastodonAPI from 'lib/MastodonAPI';
import PleromaAPI from 'lib/PleromaAPI';
import TimeLine from 'lib/TimeLine';


export default class App {
  constructor(){
    this.MastodonAPI = new MastodonAPI();
    this.PleromaAPI = new PleromaAPI();

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
      new TimeLine('ほーむ', 'api/v1/timelines/home'),
      new TimeLine('つうち', 'api/v1/notifications'),
      new TimeLine('ろーかる', 'api/v1/timelines/public?local=true'),
      new TimeLine('たぐ', 'api/v1/timelines/tag/ねこにうむ'),
      new TimeLine('ぷぶりっく', 'api/v1/timelines/public?limit=40'),
    ];
    this.compose = {}; // トゥート内容
    this.query = ''; // 検索クエリ
    this.profile = {}; // プロフィール情報
    this.current_page = 0;

    this.loadConfigFromFile()
    .then(result => {
      console.log("読み込み終わった");
      this.configLoaded = "loaded";
      resolve(0);
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

  tlPanelActivated(args){
    let i = this.timelines.findIndex((elm,ind,arr) => {
      return elm.name == args.data.name;
    });

    this.timelines[i].loadTimeLine(this.account.base_url,this.account.access_token);

  }
}
