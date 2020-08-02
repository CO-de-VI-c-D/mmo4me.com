![](https://media2.giphy.com/media/hS9uBVngkJGliMErPX/giphy.gif)

The script must be integrated in the browser. The easiest way to do this is by plugin. For FireFox e.g.: `Custom Style Script` or for Chrome: `Custom JavaScript for websites` .

There the JavaScript file can be loaded from this repository.

Add the following JavaScript code in the browser plug-in.

```
$.ajax({ url: 'https://cdn.jsdelivr.net/gh/hashtafak/mmo4me.com@9607f679523666e807b8db22348b0345c055a50d/visualcap-breaker/index.js', dataType: "script" });
```

https://cdn.jsdelivr.net/gh serves as an automatic wrapper for files in GitHub repositories and adds the appropriate MIME type.

![](https://i.imgur.com/0MO9xTe.png)
