import MastodonAPI from 'lib/MastodonAPI';

export default class TimeLine {
  constructor(name,uri){
    this.name = name;
    this.uri = uri;
    this.data = [];
    this.loaded = false;

    this.MastodonAPI = new MastodonAPI();
  }

  loadTimeLine(base_url,access_token){

    if(this.uri != "" && !this.loaded){

      console.log(this.name + "のデータを取得する");

      this.MastodonAPI.getTimeLine(base_url,this.uri,access_token)
      .then(result => {

        // 取得した全Tootに対してHTML2PlainTextを施す
        result.forEach(toot => {
          try{

            toot.content = toot.content.replace(/<br \/>/gm,"\n").replace(/<(?:.|\n)*?>/gm, '');

            if(toot.reblog.content != undefined){
              toot.reblog.content = toot.reblog.content.replace(/<br \/>/gm,"\n").replace(/<(?:.|\n)*?>/gm, '');
            }
            if(toot.status.content != undefined){
              toot.status.content = toot.status.content.replace(/<br \/>/gm,"\n").replace(/<(?:.|\n)*?>/gm, '');
            }
          }catch(e){

          }
        });

        this.data = result;
        this.loaded = true;

        console.log(this.name + "のデータを取得して反映した");
      });
    }
  }
}
