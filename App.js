import MastodonAPI from 'lib/MastodonAPI';
import PleromaAPI from 'lib/PleromaAPI';
import TimeLine from 'lib/TimeLine';
import ConfigFile from 'lib/ConfigFile';

class Compose {
  constructor(){
    this.status = "";
    this.in_reply_to_id = "";
    this.media_ids = [];
    this.sensitive = false;
    this.spoiler_text = "";
    this.visiblity = "public";

    this.media_attachment = [];
    this.visiblity_label = {
      "public": "公開",
      "unlisted": "未収蔵",
      "private": "身内",
      "direct": "直通"
    };
  }

  toggleSensitive(){
    let s = this.sensitive;
    this.sensitive = !s;
  }

  toggleVisiblity(){
    switch(this.visiblity){
      case "public":
        this.visiblity = "unlisted";
        break;
      case "unlisted":
        this.visiblity = "private";
        break;
      case "private":
        this.visiblity = "direct";
        break;
      case "direct":
        this.visiblity = "public";
        break;

    }
  }
}

export default class App {
  constructor(){
    this.MastodonAPI = new MastodonAPI();
    this.PleromaAPI = new PleromaAPI();
    this.ConfigFile = new ConfigFile();

    this.loaded = "";

    this.Compose = new Compose(); // 投稿内容


    this.query = ''; // 検索クエリ
    this.profile = {}; // プロフィール情報
    this.current_page = 0;

    this.timelines = [ // タイムライン
      new TimeLine('ほーむ', 'api/v1/timelines/home'),
      new TimeLine('つうち', 'api/v1/notifications'),
      new TimeLine('ろーかる', 'api/v1/timelines/public?local=true'),
      new TimeLine('ぷぶりっく', 'api/v1/timelines/public?limit=40'),
    ];

    this.ConfigFile.loadConfigFromFile();
    console.log("読み終わった");

    this.loadTagConfig();
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

  tlPanelPulled(args){

    console.log("見えてるＴＬをリロードする");
    args.data.loadTimeLine(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token,true);
    console.log("リロード完了")

  }

  replyTo(args){
    console.log("リプライを送る！");
    console.log(JSON.stringify(args.data));
  }

  showUrl(args){
    console.log("添付メディアを開く");

    if(this.ConfigFile.imageviewer){

    }else{
      const InterApp = require("FuseJS/InterApp");
      InterApp.launchUri(args.data.url);
    }
  }

  doCompose(args){
    this.MastodonAPI.postStatus(
      this.ConfigFile.account.base_url,
      this.ConfigFile.account.access_token,
      this.Compose.status,
      this.Compose.in_reply_to_id,
      this.Compose.media_ids,
      this.Compose.sensitive,
      this.Compose.spoiler_text,
      this.Compose.visiblity
    );
    this.Compose = new Compose();
  }

  async loadTagConfig(){
    console.log("設定に書かれたタグのＴＬをリストに追加する");

    await this.timelines.push(new TimeLine(this.ConfigFile.settings.default_tag, 'api/v1/timelines/tag/' + this.ConfigFile.settings.default_tag.replace("#","")));

  }
}
