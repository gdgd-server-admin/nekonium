import MastodonAPI from 'lib/MastodonAPI';
export default class TimeLine {
  constructor(name,uri){
    this.name = name;
    this.uri = uri;
    this.data = [];
    this.loaded = false;

    this.MastodonAPI = new MastodonAPI();
  }

  setTimeLine(json){

    // 整形するんだったらこの辺なんじゃないかな

    this.data = json;
  }

  loadTimeLine(base_url,access_token){

    if(this.uri != "" && !this.loaded){
      console.log("TLのデータを取得する");
      this.MastodonAPI.getTimeLine(base_url,this.uri,access_token)
      .then(result => {
        console.log("データを取得した");

        this.setTimeLine(result); // 直接代入してはいけない
        this.loaded = true;
      });
    }
  }
}
