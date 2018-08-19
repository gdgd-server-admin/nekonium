using Uno;
using Uno.Compiler.ExportTargetInterop;
using Android.Base.Wrappers;
using Fuse;
using Fuse.Scripting;
using Fuse.Resources;
using Uno.Platform;
using Uno.Threading;
using Uno.UX;

[ForeignInclude(Language.Java, "android.content.Context")]
[ForeignInclude(Language.Java, "android.content.ClipboardManager")]
[ForeignInclude(Language.Java, "android.content.ClipData")]
[ForeignInclude(Language.Java, "android.content.ClipDescription")]
[ForeignInclude(Language.Java, "android.os.Looper")]
[ForeignInclude(Language.Java, "com.fuse.Activity")]
public class Clipboard
{
    [Foreign(Language.Java)]
    public static extern(ANDROID) void SetString(string text)
    @{
        if (Looper.myLooper() == null)
        {
            Looper.prepare();
        }
        Context context = com.fuse.Activity.getRootActivity();
        ClipboardManager clipboard = (ClipboardManager)context.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = ClipData.newPlainText("app_clipbard", text);
        clipboard.setPrimaryClip(clip);
    @}

    [Foreign(Language.Java)]
    public static extern(ANDROID) string GetString()
    @{
        if (Looper.myLooper() == null)
        {
            Looper.prepare();
        }
        Context context = com.fuse.Activity.getRootActivity();
        ClipboardManager clipboard = (ClipboardManager)context.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = clipboard.getPrimaryClip();
        ClipDescription desc = clip.getDescription();
        if(desc != null){
          for(int i = 0;i < desc.getMimeTypeCount(); i++){
            if(desc.compareMimeTypes(desc.getMimeType(i),"text/plain") == true){
              if(clip.getItemCount() > 0){
                return clip.getItemAt(0).getText().toString();
              }
            }
          }
        }
        return "";
    @}

    public static extern(!ANDROID) void SetString(string text)
    {

    }

    public static extern(!ANDROID) string GetString()
    {
      return "";
    }
}


[UXGlobalModule]
public class ClipboardManager : NativeModule
{

    static readonly ClipboardManager _instance;

    public ClipboardManager()
    {
        if (_instance != null) return;
        _instance = this;
        Resource.SetGlobalKey(this, "ClipboardManager");
        AddMember(new NativeFunction("setText", (NativeCallback)SetText));
        AddMember(new NativePromise<string, Fuse.Scripting.Object>("getText", GetText,Converter));
    }

    public object SetText(Context c, object[] args)
    {
        Clipboard.SetString(args[0].ToString());
        return null;
    }

    static string GetText(object[] args)
    {
      return Clipboard.GetString();
    }

    static Fuse.Scripting.Object Converter(Context context, string str)
	{
		var wrapperObject = context.NewObject();
		wrapperObject["status"] = str;
		return wrapperObject;
	}
}
