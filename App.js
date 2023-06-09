import MastodonAPI from 'lib/MastodonAPI';
import PleromaAPI from 'lib/PleromaAPI';
import TimeLine from 'lib/TimeLine';
import ConfigFile from 'lib/ConfigFile';
import Color from 'lib/Color';
import Compose from 'lib/Compose';
import Helper from 'lib/Helper';
import PushNotification from 'lib/PushNotification';
import ShakeNyaan from 'lib/ShakeNyaan';
import SearchResult from 'lib/SearchResult';

export default class App {
  constructor(){
    this.MastodonAPI = new MastodonAPI();
    this.PleromaAPI = new PleromaAPI();
    this.ConfigFile = new ConfigFile();
    this.Color = new Color();
    this.Helper = new Helper();

    this.loaded = "";

    this.Compose = new Compose(); // 投稿内容

    this.socket = null;
    this.notify = null; // 通知用WebSocket

    this.query = ''; // 検索クエリ
    this.profile = null; // プロフィール情報
    this.usertl = []; // ユーザーＴＬ
    this.relationships = null;
    this.current_page = 0;

    this.nyaan = 0;
    this.shakecount = 0;
    this.lastshake = 0;

    this.timelines = [
      new TimeLine('ホーム', 'api/v1/timelines/home','api/v1/streaming/?stream=user&access_token=')
    ]; // タイムライン
    this.fix_tl_length = 1; // 既知のTLの数（ＴＬを閉じるボタンの表示に使う）

    this.setting_open = false; // 設定画面の表示
    this.chat_open = false; // チャット画面の表示

    this.image_url = ""; // imageviewerで開くURL

    this.ConfigFile.loadConfigFromFile();
    console.log("読み終わった");

    // 設定ファイルのmigrateを行う
    this.ConfigFile.migrateConfig();

    // migrate後に再読み込みする
    this.ConfigFile.loadConfigFromFile();

    this.loadTimelineConfig();
    this.loaded = "loaded";

    this.Color.toggleColor(this.ConfigFile.settings.nightmode);

    this.swipeActive = false;

    if(this.ConfigFile.account.access_token == ""){
      this.reloadConfig();
    }else{
      if(this.ConfigFile.settings.localnotify){
        this.PushNotification = new PushNotification();
      }
      this.ShakeNyaan = new ShakeNyaan();
      if(this.ConfigFile.settings.shake){
        this.ShakeNyaan.startNyaan();
      }
    }
  }

  async loginButtonClicked(args){
    await this.MastodonAPI.login(this.ConfigFile.account.base_url);

    // アクセストークンを設定ファイルから読み込む
    this.loadConfigFromFile();
  }

  tlPanelActivated(args){

    console.log("見えるようになったＴＬを更新する");
    args.data.loadTimeLine(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token);

    console.log("すでにソケットがオープンな場合は1回クローズする");
    if(this.socket != null){
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.close();
      // this.socket = null;
    }

    console.log("WebSocketをつなぎに行く");

    if(args.data.streaminguri != ""){
      let url = this.ConfigFile.account.base_url.replace("http","ws") + args.data.streaminguri + this.ConfigFile.account.access_token;
      this.socket = new WebSocket(url);

      this.socket.onopen = (() => {

        console.log("ソケットオープン");

  		});
      this.socket.onerror = ((error) => {
        try {
          this.socket.close();
        } catch (e) {

        } finally {

        }
        console.log("エラーによりソケットクローズ");
      });
      this.socket.onmessage = ((e) => {
        var recvdata = JSON.parse(e.data);
        try {
          if(recvdata.event == "update"){

            var payload = JSON.parse(recvdata.payload);

            const helper = new Helper();
            const cfg = new ConfigFile();
            cfg.loadConfigFromFile();

            console.log("ストリーミングＡＰＩでデータを受信");

            payload.kind = helper.makeKind(payload);
            payload.created_at = helper.formatTimestamp(payload.created_at);
            payload.account.note = helper.convertHTMLToPlain(payload.account.note);

            var tags = [];
            switch(payload.kind){
            case 'toot':
              payload.dist_content = helper.makeDistContent(payload.content,payload.emojis);
              payload.content = helper.convertHTMLToPlain(payload.content);
              tags = helper.makeTagFromContent(cfg.account.base_url,payload.content);
              if(tags.length > 0 && payload.tags.length == 0){
                // tagsが実装されていないので補完する
                payload.tags = tags;
              }
              break;
            case 'reblogedtoot':
              payload.reblog.dist_content = helper.makeDistContent(payload.reblog.content,payload.reblog.emojis);
              payload.reblog.content = helper.convertHTMLToPlain(payload.reblog.content);
              payload.reblog.created_at = helper.formatTimestamp(payload.reblog.created_at);
              payload.reblog.account.note = helper.convertHTMLToPlain(payload.reblog.account.note);
              tags = helper.makeTagFromContent(cfg.account.base_url,payload.reblog.content);
              if(tags.length > 0 && payload.reblog.tags.length == 0){
                // tagsが実装されていないので補完する
                payload.reblog.tags = tags;
              }
              break;
            }

            console.log("受け取ったデータをTLに反映する");
            args.data.appendToot(payload);
            console.log("受け取ったデータを追加した");

          }
        } catch (err) {
          console.log(JSON.stringify(err));
        } finally {

        }
      });
    }
  }

  tlPanelPulled(args){

    console.log("見えてるＴＬをリロードする");
    args.data.loadTimeLine(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token,true);
    console.log("リロード完了")

  }

  replyTo(args){
    console.log("リプライを送る！");
    if(args.data.status != undefined){
      this.Compose.status = "@" + args.data.status.account.acct;
      this.Compose.in_reply_to_id = args.data.status.id;
      this.Compose.visiblity = args.data.status.visibility;
    }else{
      this.Compose.status = "@" + args.data.account.acct;
      this.Compose.in_reply_to_id = args.data.id;
      this.Compose.visiblity = args.data.visibility;
    }

    this.swipeActive = true;
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
      console.log("ふぁぼったことをトーストで出す");
      var deviceToast = require("deviceToast");
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

      console.log("かくさんしたことをトーストで出す");
      var deviceToast = require("deviceToast");
      if(args.data.reblogged){
        deviceToast.ToastIt("かっくさーん！");
      }else{
        deviceToast.ToastIt("かくさんやめ！");
      }
    });
  }

  showUrl(args){
    console.log("添付メディアを開く");

    if(this.ConfigFile.settings.toot.imageviewer){

      if(args.data.type == "image"){
        this.image_url = args.data.url;
      }

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

  async loadTimelineConfig(){

    await this.timelines.splice(1,this.timelines.length - 1);

    if(this.ConfigFile.settings.timeline.favorite){
      console.log("お気に入りを追加");
      this.timelines.push(new TimeLine('お気に入り', 'api/v1/favourites'));
    }
    if(this.ConfigFile.settings.timeline.notification){
      console.log("通知を追加");
      this.timelines.push(new TimeLine('通知', 'api/v1/notifications'));
    }
    if(this.ConfigFile.settings.timeline.local){
      console.log("ローカルを追加");
      this.timelines.push(new TimeLine('ローカル', 'api/v1/timelines/public?local=true','api/v1/streaming/?stream=public:local&access_token='));
    }
    if(this.ConfigFile.settings.timeline.public){
      console.log("連合を追加");
      this.timelines.push(new TimeLine('連合', 'api/v1/timelines/public?limit=30','api/v1/streaming/?stream=public&access_token='));
    }
    if(this.ConfigFile.settings.timeline.default_tag){
      console.log("デフォルトのタグを追加");
      this.timelines.push(new TimeLine(this.ConfigFile.settings.default_tag, 'api/v1/timelines/tag/' + this.ConfigFile.settings.default_tag.replace("#","")));
    }

    this.fix_tl_length = this.timelines.length;
    this.current_page = 0;
  }

  async tagLinkClicked(args){
    await this.timelines.push(new TimeLine('#' + args.data.name, 'api/v1/timelines/tag/' + args.data.name));
    this.current_page = this.timelines.length - 1;
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

  toggleSettingPanel(args){
    console.log("設定画面の表示を切り替え");
    let sp = this.setting_open;
    this.setting_open = !sp;
  }

  reloadConfig(){
    setTimeout((()=>{
      console.log("設定をリロードする");
      let cfg = new ConfigFile();
      cfg.loadConfigFromFile();
      if(cfg.account.access_token == ""){
        this.reloadConfig();
      }else{
        setTimeout((()=>{
          this.ConfigFile.loadConfigFromFile();
        }),1000);
      }
    }),1000);
  }

  configChanged(args){
    setTimeout((()=>{
      this.ConfigFile.saveConfigToFile();
      this.Color.toggleColor(this.ConfigFile.settings.nightmode);
      // 一回ふったらにゃーんする機能を無効化する
      this.ShakeNyaan.stopNyaan();
      if(this.ConfigFile.settings.shake){
        this.ShakeNyaan.startNyaan();
      }
      this.loadTimelineConfig();
    }),1000);
  }

  doLogout(){
    setTimeout((()=>{
      this.ConfigFile.account.base_url = "";
      this.ConfigFile.account.access_token = "";

      this.ConfigFile.saveConfigToFile();

      this.reloadConfig();
      this.setting_open = false;
    }),1000);
  }

  clearImageUrl(){
    this.image_url = "";
  }

  setMyInfo(){
    this.MastodonAPI.verifyCredentials(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token)
    .then(result => {
      this.setting_open = false;
      this.profile = result;
    });
  }
  setUserInfo(args){
    var userid = args.data.account.id;
    if(args.data.reblog != undefined){
      userid = args.data.reblog.account.id;
    }
    this.MastodonAPI.getRelationship(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token,userid)
    .then(result => {
      console.log(JSON.stringify(result));
      var prof = args.data.account;
      if(args.data.reblog != undefined){
        prof = args.data.reblog.account;
      }
      this.relationships = result;
      this.profile = prof;
    });
    const utl = 'api/v1/accounts/' + userid + '/statuses';
    this.MastodonAPI.getTimeLine(this.ConfigFile.account.base_url,utl,this.ConfigFile.account.access_token)
    .then(result => {
      result.forEach(toot => {
        toot.created_at = this.Helper.formatTimestamp(toot.created_at);
        toot.account.note = this.Helper.convertHTMLToPlain(toot.account.note);

        if(toot.content != undefined){
          toot.dist_content = this.Helper.makeDistContent(toot.content,toot.emojis);
          toot.content = this.Helper.convertHTMLToPlain(toot.content);
          let tags = this.Helper.makeTagFromContent(this.ConfigFile.account.base_url,toot.content);
          if(tags.length > 0 && toot.tags.length == 0){
            // tagsが実装されていないので補完する
            toot.tags = tags;
          }
        }


        if(toot.reblog != undefined){
          toot.reblog.created_at = this.Helper.formatTimestamp(toot.reblog.created_at);
          toot.reblog.dist_content = this.Helper.makeDistContent(toot.reblog.content,toot.reblog.emojis);
          toot.reblog.content = this.Helper.convertHTMLToPlain(toot.reblog.content);
          toot.reblog.account.note = this.Helper.convertHTMLToPlain(toot.reblog.account.note);
          let tags = this.Helper.makeTagFromContent(this.ConfigFile.account.base_url,toot.reblog.content);
          if(tags.length > 0 && toot.reblog.tags.length == 0){
            // tagsが実装されていないので補完する
            toot.reblog.tags = tags;
          }
        }
        /*
        if(toot.status != undefined){
          toot.status.content = this.Helper.convertHTMLToPlain(toot.status.content);
          toot.status.created_at = this.Helper.formatTimestamp(toot.status.created_at);
          toot.status.account.note = this.Helper.convertHTMLToPlain(toot.status.account.note);
          toot.status.content = this.Helper.stripTagFromContent(toot.status.content,toot.status.tags);
        }
        */
      });
      this.usertl = result;
    });
  }
  clearUserInfo(){
    this.profile = null;
    this.relationships = null;
    this.usertl = [];
  }

  followUser(args){
    // followするとRelationshipsが返ってくるのでそれを反映する
    let action_name = (this.relationships.following) ? "unfollow" : "follow";
    console.log(action_name + "する！");
    this.MastodonAPI.accountAction(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token,this.profile.id,action_name)
    .then(result => {
      let msg = (result.following) ? "フォローした！" : "フォローやめた！";
      var deviceToast = require("deviceToast");
      deviceToast.ToastIt(msg);
      this.relationships = result;
    });
  }
  muteUser(args){
    // muteするとRelationshipsが返ってくるのでそれを反映する
    let action_name = (this.relationships.muting) ? "unmute" : "mute";
    console.log(action_name + "する！");
    this.MastodonAPI.accountAction(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token,this.profile.id,action_name)
    .then(result => {
      let msg = (result.muting) ? "ミュートした！" : "ミュートやめた！";
      var deviceToast = require("deviceToast");
      deviceToast.ToastIt(msg);
      this.relationships = result;
    });
  }
  blockUser(args){
    // blockするとRelationshipsが返ってくるのでそれを反映する
    let action_name = (this.relationships.blocking) ? "unblock" : "block";
    console.log(action_name + "する！");
    this.MastodonAPI.accountAction(this.ConfigFile.account.base_url,this.ConfigFile.account.access_token,this.profile.id,action_name)
    .then(result => {
      let msg = (result.blocking) ? "ブロックした！" : "ブロックやめた！";
      var deviceToast = require("deviceToast");
      deviceToast.ToastIt(msg);
      this.relationships = result;
    });
  }

  async doSearch(){
    console.log("「" + this.query + "」について検索する！");
    await this.timelines.push(new SearchResult(this.query, 'api/v1/search?resolve=true&q=' + this.query));
    await console.log(this.timelines.length);
    this.current_page = this.timelines.length - 1;
    this.query = '';
  }

  async closeTL(){
    await this.timelines.splice(this.current_page,1);
    if(this.current_page > this.timelines.length - 1){
      this.current_page --;
    }
  }

  makeComposeFromClipboard(){
    this.Compose.makeComposeFromClipboard();
    this.swipeActive = true;
  }

  extLinkClicked(args){
    const InterApp = require("FuseJS/InterApp");
    InterApp.launchUri(args.data.href);
  }

  addReply(args){
    this.Compose.status = args.data.name;
    this.swipeActive = true;
  }
}
