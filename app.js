const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const OPTIONS = require('./settings.json');
const subprocess = require('./server/server_start')
const init_logic = require('./server/logic')

let window = null;

// Wait until the app is ready
app.once('ready', () => {

    // Run python server
    let py_cli = subprocess.start("python", OPTIONS.PORT);

    // Create a new window
    window = new BrowserWindow({
        // Set the initial width
        width: 1024,
        // Set the initial height
        height: 600,
        // Set the default background color of the window to match the CSS
        // background color of the page, this prevents any white flickering
        backgroundColor: "#E8C39C",
        // Don't show the window until it's ready, this prevents any white flickering
        show: false,
        frame: false,
        resizable: false, //! changeTHIS
        fullscreenable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    window.webContents.openDevTools() //! deleteTHIS

    // Load a URL in the window to the local index.html path
    window.loadURL(url.format({
        pathname: path.join(__dirname, './public/index.html'),
        protocol: 'file:',
        slashes: true
    }));


    // Append logic
    // FIXME: do stuff only when server is ready
    // Use sync signal with interval on app run
    init_logic(window);
       

    // Show window when page is ready
    window.once('ready-to-show', () => {
        window.show()
    });


    app.on('window-all-closed', () => {
        py_cli.kill()
        app.quit()
    });
});