import ConfigFile from 'lib/ConfigFile';
import MastodonAPI from 'lib/MastodonAPI';

var accelerometer = require("Accelerometer");

export default class ShakeNyaan {
  constructor(){
    let cfg = new ConfigFile();
    cfg.loadConfigFromFile();

    if(cfg.account.access_token != "" && cfg.settings.shake){
      console.log("ふったらにゃーんするしくみを初期化");

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
                  cfg.settings.shake_text,
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
    }
  }

  stopNyaan(){
    accelerometer.stop();
    console.log("加速度センサーを停止");
  }

  startNyaan(){
    accelerometer.start();
    console.log("加速度センサーを開始");
  }
}
