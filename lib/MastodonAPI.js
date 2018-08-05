import ConfigFile from 'lib/ConfigFile';

export default class MastodonAPI {
  constructor(){
    this.ConfigFile = new ConfigFile();
  }

  postToot(obj){
    console.log("not implement");
  }

  getTimeLine(base_url,uri,token){
    return new Promise((resolve,reject) => {
      var url = base_url + uri;
      var options = {
        method: "GET",
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };

      fetch(url,options)
      .then(response => {
        return response.json();
      })
      .then(json => {
        resolve(json);
      })
    });
  }

  login(base_url){
    return new Promise((resolve,reject) => {

      const REDIRECT_URI = "nekonium://oauth.callback/";
      const InterApp = require("FuseJS/InterApp");

      console.log(base_url + " にログインする");

      // ClientIDを取得
      var url = base_url + "api/v1/apps";
      var options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_name: "nekonium",
          redirect_uris: REDIRECT_URI,
          scopes: "write read follow"
        })
      };
      var client_id = "";
      var client_secret = "";

      fetch(url, options)
      .then(response => {
        return response.json();
      })
      .then(json => {

        this.ConfigFile.loadConfigFromFile();
        this.ConfigFile.account.client_id = json.client_id;
        this.ConfigFile.account.client_secret = json.client_secret;
        this.ConfigFile.saveConfigToFile();


        console.log("ClientID saved.");

        let authUri = base_url + "oauth/authorize"
          + "?redirect_uri=" + encodeURIComponent(REDIRECT_URI)
          + "&client_id=" + this.ConfigFile.account.client_id
          + "&scope=read+write+follow"
          + "&response_type=code";

        // InterAppにUriを受け取ったときに「1回だけ反応」してもらう。
        // on(EventName,func())だと多重で反応するようになる
        InterApp.once('receivedUri', uri => {

          this.ConfigFile.loadConfigFromFile();
          this.ConfigFile.account.auth_token = uri.replace('nekonium://oauth.callback/?code=',"").split('&')[0];
          this.ConfigFile.saveConfigToFile();

          // アクセストークンを取得する
          let url = base_url + "oauth/token";
          let options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              client_id: this.ConfigFile.account.client_id,
              client_secret: this.ConfigFile.account.client_secret,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code',
              code: this.ConfigFile.account.auth_token
            })
          };
          fetch(url, options)
          .then(response => {
            return response.json();
          })
          .then(json => {
            if(json.access_token != undefined){
              // アクセストークンが取得できた
              this.ConfigFile.loadConfigFromFile();
              this.ConfigFile.account.access_token = json.access_token;
              this.ConfigFile.account.base_url = base_url;
              this.ConfigFile.saveConfigToFile();
              console.log("Access Token saved.");
              resolve(json.access_token);
            }else{
              reject("access_token not found");
            }
          });

        });
        // ブラウザを開いて認証する
        InterApp.launchUri(authUri);
      });

    });
  }

  favoriteStatus(args){
    console.log("ふぁぼる！");
    console.log(JSON.stringify(args.data));
  }

  boostStatus(args){
    console.log("かくさんする！");
    console.log(JSON.stringify(args.data.tags));
  }

  postStatus(base_url,access_token,status,in_reply_to_id,media_ids,sensitive,spoiler_text,visiblity){

    var body = {
      'status': status,
      'visiblity': visiblity
    };
    if(in_reply_to_id != ""){
      body.in_reply_to_id = in_reply_to_id;
    }
    if(media_ids.length > 0){
      body.media_ids = media_ids;
    }
    if(sensitive){
      body.sensitive = "true";
    }
    if(spoiler_text != ""){
      body.spoiler_text = spoiler_text;
    }

    console.log("これから投稿する");
    const url = encodeURI(base_url +"api/v1/statuses");
    const auth = 'Bearer ' + access_token;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": auth
      },
      body: JSON.stringify(body)
    }

    fetch(url, options)
    .then(result => {
      console.log("投稿しました！");
    });
  }
}
