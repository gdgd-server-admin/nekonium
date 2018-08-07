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

    this.nyaan = 0;
    this.shakecount = 0;
    this.lastshake = 0;

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

    this.swipeActive = false;

    this.MainViewActivated();
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
    this.Compose.status = "@" + args.data.account.acct;
    this.Compose.in_reply_to_id = args.data.id;
    this.Compose.visiblity = args.data.visibility;
    this.swipeActive = true;
  }

  clearReplyId(args){
    this.Compose.in_reply_to_id = "";
  }

  favoriteStatus(args){
    console.log(args.data.favourited);
    this.MastodonAPI.favoriteStatus(
      this.ConfigFile.account.base_url,
      this.ConfigFile.account.access_token,
      args.data.id,
      args.data.favourited
    )
    .then(result => {
      let faved = args.data.favourited;
      args.data.favourited = !faved;
      var deviceToast = require("deviceToast");
      console.log("ふぁぼったことをトーストで出す");
      if(args.data.favourited){
        deviceToast.ToastIt("ふぁぼった！");
      }else{
        deviceToast.ToastIt("ふぁぼやめた！");
      }
    });
  }

  boostStatus(args){
    console.log(args.data.favourited);
    this.MastodonAPI.boostStatus(
      this.ConfigFile.account.base_url,
      this.ConfigFile.account.access_token,
      args.data.id,
      args.data.reblogged
    )
    .then(result => {
      let faved = args.data.reblogged;
      args.data.reblogged = !faved;
      var deviceToast = require("deviceToast");
      console.log("かくさんしたことをトーストで出す");
      if(args.data.favourited){
        deviceToast.ToastIt("かっくさーん！");
      }else{
        deviceToast.ToastIt("かくさんやめ！");
      }
    });
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
    let media_ids = [];
    this.Compose.media_attachment.forEach(media => {
      media_ids.push(media.id);
    })
    this.MastodonAPI.postStatus(
      this.ConfigFile.account.base_url,
      this.ConfigFile.account.access_token,
      this.Compose.status,
      this.Compose.in_reply_to_id,
      media_ids,
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

  uploadFile(args){
    const CameraRoll = require('FuseJS/CameraRoll');
    CameraRoll.getImage()
    .then(image => {
      this.MastodonAPI.uploadFile(
        this.ConfigFile.account.base_url,
        this.ConfigFile.account.access_token,
        image.path
      )
      .then(result => {
        console.log("ファイルをアップロードした");
        console.log(this.Compose.media_attachment.length);
        this.Compose.media_attachment.push(JSON.parse(result));
      });
    });
  }

  removeFile(args){
    if(args.sender == "firstMediaPanel"){
      this.Compose.media_attachment.splice(0,1);
    }
    if(args.sender == "secondMediaPanel"){
      this.Compose.media_attachment.splice(1,1);
    }
    if(args.sender == "thirdMediaPanel"){
      this.Compose.media_attachment.splice(2,1);
    }
    if(args.sender == "fourthMediaPanel"){
      this.Compose.media_attachment.splice(3,1);
    }
  }

  MainViewActivated(){
    if(this.ConfigFile.access_token != ""){
      console.log("ふったらにゃーんするしくみを初期化");

      var accelerometer = require("Accelerometer");

      console.log("加速度センサーを初期化");

      accelerometer.on("update", function(x, y, z) {
        if(Math.abs(x) > 15){
          this.nyaan ++;

          if(this.nyaan == 5){
            // 500ミリ秒以内にこのルートに入ったらカウント
            let now = new Date();
            if(now - this.lastshake < 500){
              this.shakecount ++;
              console.log("shakecount: " + this.shakecount);
              if(this.shakecount == 5){
                // にゃーんする時が来た！

                accelerometer.stop();

                let cfg = new ConfigFile();
                cfg.loadConfigFromFile();
                let mstdn = new MastodonAPI();
                mstdn.postStatus(
                  cfg.account.base_url,
                  cfg.account.access_token,
                  "にゃーん",
                  "",
                  [],
                  false,
                  "",
                  "public"
                );

                this.shakecount = 0; // にゃーんしたのでカウンタをリセットする

                setTimeout(() => {
                  console.log("加速度センサーを再開");
                  accelerometer.start();
                },30000);
              }
            }else{
              this.shakecount = 0; // これはシェイクではないのでカウンタをリセット
            }
            this.lastshake = now;
          }
        }else{
          // シェイクしてる途中に制止することがあるので必ず０になる
          this.nyaan = 0;
        }
      });

      accelerometer.start();

    }
  }
}
