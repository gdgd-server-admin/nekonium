export default class MastodonAPI {
  constructor(){

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

  loadConfigFromFile(){
    const FileSystem = require("FuseJS/FileSystem");
    let path = FileSystem.dataDirectory + "/" + "config.json";
    if(FileSystem.existsSync(path)){
      let config =  FileSystem.readTextFromFileSync(path);
      return JSON.parse(config);
    }else{
      return undefined;
    }
  }
  login(base_url){
    return new Promise((resolve,reject) => {

      const REDIRECT_URI = "nekonium://oauth.callback/";
      const InterApp = require("FuseJS/InterApp");
      const FileSystem = require("FuseJS/FileSystem");

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
        let config = {
          'account': {
            'client_id': json.client_id,
            'client_secret': json.client_secret
          }
        }

        let path = FileSystem.dataDirectory + "/" + "config.json";
        FileSystem.writeTextToFileSync(path, JSON.stringify(config));

        console.log("ClientID saved.");

        let authUri = base_url + "oauth/authorize"
          + "?redirect_uri=" + encodeURIComponent(REDIRECT_URI)
          + "&client_id=" + config.account.client_id
          + "&scope=read+write+follow"
          + "&response_type=code";

        // InterAppにUriを受け取ったときに「1回だけ反応」してもらう。
        // on(EventName,func())だと多重で反応するようになる
        InterApp.once('receivedUri', uri => {

          if(FileSystem.existsSync(path)){
    				let config =  FileSystem.readTextFromFileSync(path);
    				config = JSON.parse(config);
            config.account.auth_token = uri.replace('nekonium://oauth.callback/?code=',"").split('&')[0];
            FileSystem.writeTextToFileSync(path, JSON.stringify(config));

            // アクセストークンを取得する
            let url = base_url + "oauth/token";
            let options = {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
      				body: JSON.stringify({
      					client_id: config.account.client_id,
      					client_secret: config.account.client_secret,
      					redirect_uri: REDIRECT_URI,
      					grant_type: 'authorization_code',
      					code: config.account.auth_token
      				})
      			};
            fetch(url, options)
            .then(response => {
              return response.json();
            })
            .then(json => {
              if(json.access_token != undefined){
                // アクセストークンが取得できた
                let config =  FileSystem.readTextFromFileSync(path);
        				config = JSON.parse(config);
                config.account.access_token = json.access_token;
                config.account.base_url = base_url;
                FileSystem.writeTextToFileSync(path, JSON.stringify(config));
                console.log("Access Token saved.");
                resolve(json.access_token);
              }else{
                reject("access_token not found");
              }
            });
    			}
        });
        // ブラウザを開いて認証する
        InterApp.launchUri(authUri);
      });

    });
  }
}
