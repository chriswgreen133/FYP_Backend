
const express = require('express')
const parser = require('body-parser')
//const cors = require('cors')

const userManagementRoutes = require('./routes/user_management.js')
const dashboardRoutes = require('./routes/dashboard.js')
const superAdminRoutes = require("./routes/superAdmin")
const chatRequestRoutes = require("./routes/chats")
const feedbackRequestRoutes = require("./routes/appReview")
const grammerRequestRoutes = require("./routes/grammer")

const app = express();

//app.use(parser.urlencoded({extended:true})) //This statement parses the form data and automatically uses next
//app.use(cors());
app.use(parser.json())
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/user_management', userManagementRoutes)

app.use('/dashboard', dashboardRoutes)

app.use('/superAdmin', superAdminRoutes)

app.use('/chat', chatRequestRoutes)

app.use('/mainReview', feedbackRequestRoutes)

app.use('/grammer', grammerRequestRoutes)

//When all middlewares start with same routes then we do this, only the routes starting
//with the admin will enter this method
//We can aslo use same routes/paths for 2 different middlewares if one is get and other is post

//app.use(shopRoutes)

app.use((req, res, next) => {
    res.status(404).send('<h1>404 Page Not Found</h1>')
    //res.status(404).sendFile(path.join(__dirname, 'views', 'error.html')) //If you create a error html file
})// Default path is '/'

/*
app.use('/',(req, res, next) => {
    //This middleware runs for all other routes
    res.send("<h1>Hello Saad Here</h1>")
})
*/

app.listen(8080)