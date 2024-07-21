import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const App=express();

// Setting the view engine to EJS
// App.set('view engine', 'ejs');

// Getting the current directory path for relative paths in views folder
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// App.set('Views', path.join(__dirname,'Views'));


// App.use('/views',express.static(path.join(__dirname,'/views')));
App.use(express.static("public"))


App.get('/', (req, res) => {
    res.render('index.ejs');
})

export default App;