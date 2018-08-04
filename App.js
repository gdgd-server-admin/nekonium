import MastodonAPI from 'lib/MastodonAPI';
import PleromaAPI from 'lib/PleromaAPI';
import TimeLine from 'lib/TimeLine';
import ConfigFile from 'lib/ConfigFile';


export default class App {
  constructor(){
    this.MastodonAPI = new MastodonAPI();
    this.PleromaAPI = new PleromaAPI();
    this.ConfigFile = new ConfigFile();

    this.loaded = "";

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

    // this.loadConfigFromFile();
    this.ConfigFile.loadConfigFromFile();
    console.log("読み終わった");
    this.loaded = "loaded";
  }

  async loginButtonClicked(args){
    await this.MastodonAPI.login(this.ConfigFile.account.base_url);

    // アクセストークンを設定ファイルから読み込む
    this.loadConfigFromFile();
  }

  tlPanelActivated(args){

    console.log("見えるようになったＴＬを更新する");
    args.data.loadTimeLine(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token);

  }

  replyTo(args){
    console.log("リプライを送る！");
    console.log(JSON.stringify(args.data));
  }
}
