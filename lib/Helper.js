var moment = require("Bundles/moment-with-locales");
moment.locale("ja");

export default class Helper{
  constructor(){

  }

  convertHTMLToPlain(html){
    return html.replace(/<br \/>/gm,"\n")
      .replace(/<br>/gm,"\n")
      .replace(/<br\/>/gm,"\n")
      .replace(/<(?:.|\n)*?>/gm, '')
      .replace(/&gt;/gm,">")
      .replace(/&lt;/gm,"<")
      .replace(/&apos;/gm,"'")
      .replace(/&quot;/,"\"")
      .replace(/&amp;/gm,"&");
  }

  makeFetchOption(request_method,access_token = "",content_type = "",body = undefined){

    var options = {
      method: request_method,
      headers: {}
    };
    if(access_token != ""){
      const auth = 'Bearer ' + access_token;
      options.headers["Authorization"] = auth;
    }
    if(content_type != ""){
      options.headers["Content-Type"] = content_type;
    }
    if(body != undefined){
      options.body = JSON.stringify(body);
    }

    return options;
  }

  formatTimestamp(stamp){
    return moment(stamp).format('L LT');
  }
}
