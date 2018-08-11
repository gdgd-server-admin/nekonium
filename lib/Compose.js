export default class Compose {
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
