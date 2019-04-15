const {
    app,
    BrowserWindow,
    ipcMain 
} = require('electron');
const { autoUpdater } = require('electron-updater');
const uploadUrl = 'http://192.168.1.105:90/downLoad/';

let webContents;
let win;

let createWindow = () => {
     win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: 'img/favicon.ico',
        webPreferences: {
          webSecurity:false // 允许跨域请求
        }
    });

    webContents = win.webContents;

   win.loadURL(`file://${__dirname}/index.html`);//加载本地地址

    webContents.openDevTools();
    updateHandle()
};
app.on('ready',createWindow);
function updateHandle() {
  let message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新',
  };
  const os = require('os');
 
  autoUpdater.setFeedURL(uploadUrl);
  autoUpdater.on('error', function (error) {
    sendUpdateMessage(message.error)
  });
  autoUpdater.on('checking-for-update', function () {
    sendUpdateMessage(message.checking)
  });
  autoUpdater.on('update-available', function (info) {
    sendUpdateMessage(message.updateAva)
  });
  autoUpdater.on('update-not-available', function (info) {
    sendUpdateMessage(message.updateNotAva)
  });
 
  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    win.webContents.send('downloadProgress', progressObj)
  })
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
 
    ipcMain.on('isUpdateNow', (e, arg) => {
      console.log(arguments);
      console.log("开始更新");
      //some code here to handle event
      autoUpdater.quitAndInstall();
    });
 
    win.webContents.send('isUpdateNow')
  });
 
  ipcMain.on("checkForUpdate",()=>{
      //执行自动更新检查
     autoUpdater.checkForUpdates();
  })
}
 
// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(text) {
  win.webContents.send('message', text)
}

