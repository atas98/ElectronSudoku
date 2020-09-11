const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const OPTIONS = require('./configuration.json');
const subprocess = require('./server/server_start')

let window = null;

// Wait until the app is ready
app.once('ready', async () => {

    // Run python server
    try {
        await subprocess.start(OPTIONS.PYTHON_PATH, OPTIONS.PORT);
    } catch (err) {
        console.log(`Error: ${err}`)
        app.quit()
    }

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
        resizable: OPTIONS.RESIZABLE,
        fullscreenable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });

    if (OPTIONS.DEVTOOLS) {
        window.webContents.openDevTools()
    }
    
    // Load a URL in the window to the local index.html path
    window.loadURL(url.format({
        pathname: path.join(__dirname, './public/index.html'),
        protocol: 'file:',
        slashes: true
    }));
  
    
    // Show window when page is ready
    window.once('ready-to-show', () => {
        window.show()
    });

    // Close app when all windows were closed
    app.on('window-all-closed', () => {
        subprocess.stop();
        app.quit();
    });
});