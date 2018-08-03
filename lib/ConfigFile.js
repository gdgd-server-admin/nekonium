export default class ConfigFile {
  constructor(){
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
  }

  loadConfigFromFile(){

    console.log("設定をファイルから読み込む");

    const FileSystem = require("FuseJS/FileSystem");
    let path = FileSystem.dataDirectory + "/" + "config.json";
    if(FileSystem.existsSync(path)){
      let config =  FileSystem.readTextFromFileSync(path);

      let json = JSON.parse(config);

      if(json.account != undefined){
        this.account = json.account;
      }
      if(json.settings != undefined){
        this.settings = json.settings;
      }

      console.log("OK");
    }
  }

  saveConfigToFile(){

    console.log("ファイルに書き込む");

    let conf = {};
    conf.account = this.account;
    conf.settings = this.settings;

    const FileSystem = require("FuseJS/FileSystem");
    let path = FileSystem.dataDirectory + "/" + "config.json";
    let target = JSON.stringify(conf);

    FileSystem.writeTextToFileSync(path, target);
  }
}
