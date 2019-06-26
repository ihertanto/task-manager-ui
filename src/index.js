const path = require('path')
const express = require('express')
const session = require('express-session')
const hbs = require('hbs')
const bodyParser = require('body-parser')
const userAPI = require('./utils/user')
const taskAPI = require('./utils/task')

const {PORT, NODE_ENV, SESS_NAME, SESS_LIFETIME, SESS_SECRET} = process.env

const IN_PROD = NODE_ENV === 'production'

const app = express()

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: parseInt(SESS_LIFETIME),
        sameSite: true,
        secure: IN_PROD,
    }
}))

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname,'../public')
const viewsPath = path.join(__dirname,'../templates/views')
const partialPath = path.join(__dirname,'../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
 
// parse application/json
app.use(bodyParser.json())

const redirectLogin = (req, res, next) => {    
    if (!req.session.token) {
        res.redirect('/login')
    } else {
        req.user = req.session.user
        req.token = req.session.token
        next()
    }
}

const redirectHome = (req, res, next) => {
    if (req.session.token) {
        res.redirect('/home')
    } else {
        next()
    }
}

app.get('/', (req, res) => {
    const { token, user } = req.session
    const body_content = ''
    res.render('default', {
        head_title: 'Home',
        body_title: 'Home',
        body_content,
        name: 'Indra H',
        token
    })

})

app.get('/home', redirectLogin, (req, res) => {    
    const body_content = `
        <ul>
            <li>Name: ${req.user.name}</li>
            <li>Email: ${req.user.email}</li>
            <li>Age: ${req.user.age}</li>
        </ul>
        <hr />
        Update user profile
        <form method='post' action='/users/update'>
            <input name='name' placeholder='New Name' /> <br />
            <input type='password' name='password' placeholder='New Password' /> <br />
            <input type='number' name='age' placeholder='New Age' min='1' /> <br />
            <input type='submit' value='Update Profile' />
        </form>
        <hr />
        Delete user profile
        <form method='post' action='/users/delete'>
            <input name='confirm' placeholder='Type anything to confirm' required /> <br />
            <input type='submit' value='Delete Profile' />
        </form>`
    
    res.render('default', {
        head_title: 'Home',
        body_title: 'Home',
        body_content,
        name: 'Indra H',
        token: req.token
    })
})


app.get('/login', redirectHome, (req, res) => {
   const body_content = `
        <form method='post' action='/login'>
            <input type='email' name='email' placeholder='Email' required />
            <input type='password' name='password' placeholder='Password' required />
            <input type='submit' />
        </form>`

    res.render('default', {
        head_title: 'Login',
        body_title: 'Login',
        body_content,
        name: 'Indra H'
    })
})


app.get('/register', redirectHome, (req, res) => {
    const body_content = `
        <form method='post' action='/register'>
            <input name='name' placeholder='Name' required /> <br />
            <input type='email' name='email' placeholder='Email' required /> <br />
            <input type='password' name='password' placeholder='Password' required /> <br />
            <input type='number' name='age' placeholder='Age' min='1' /> <br />
            <input type='submit' />
        </form>`
    res.render('default', {
        head_title: 'Register',
        body_title: 'Register',
        body_content,
        name: 'Indra H'
    })
})

app.post('/login', redirectHome, (req, res) => {
    const { email, password } = req.body
    if (email && password) {
        userAPI.login(req.body, (error, returnData) => {
            if (error) {
                return res.send(`
                    <h1>Error Login</h1>
                    <script>alert('${error}')</script>
                    <a href='/login'>Back to Login</a>
                `)
            }
            req.session.user = returnData.user
            req.session.token = returnData.token
            res.redirect('/home')
        })
    } else {
        res.redirect('/login')
    }
})

app.post('/register', redirectHome, (req, res) => {
    const userObject = userAPI.cleanUserObject(req.body)

    userAPI.register(userObject, (error, returnData) => {
        if (error) {
            return res.send(`
                <h1>Error Register</h1>
                <script>alert('${error}')</script>
                <a href='/register'>Back to Register</a>
            `)
        }
        req.session.user = returnData.user
        req.session.token = returnData.token
        res.redirect('/home')
    })
})

app.post('/logout', redirectLogin, (req, res) => {
    userAPI.logout(req.session.token, (error, returnData) => {
        if (error) {
            return res.send(`
                <h1>Error Logout</h1>
                <script>alert('${error}')</script>
            `)
        }
        req.session.destroy(err => {
            if (err) {
                return res.send(`
                    <h1>Error Logout</h1>
                    <script>alert('${err}')</script>
                `)
            }
        })
        res.redirect('/login')
    })
})

app.post('/users/update', (req, res) => {
    if (req.body.name==='' && req.body.password==='' && req.body.age ==='' ) {
        return res.send(`
                <h1>Error Update</h1>
                <script>alert('Nothing to update')</script>
                <a href='/register'>Back to Home</a>
            `)
    }

    const userObject = userAPI.cleanUserObject(req.body)
    
    userAPI.updateProfile(req.session.token, userObject, (error, returnData) => {
        if (error) {
            return res.send(`
                <h1>Error Update</h1>
                <script>alert('${error}')</script>
                <a href='/register'>Back to Home</a>
            `)
        }
        req.session.user = returnData
        res.redirect('/home')
    })
})

app.post('/users/delete', redirectLogin, (req, res) => {
    userAPI.deleteProfile(req.session.token, (error, returnData) => {
        if (error) {
            return res.send(`
                <h1>Error Delete</h1>
                <script>alert('${error}')</script>
            `)
        }
        req.session.destroy()
        res.redirect('/login')
    })
})

app.get('/tasks', redirectLogin, (req, res) => {
    taskAPI.getTasks(req.token, (error, returnData) => {
        if (error) {
            return res.send(`
                <h1>Error Get Task</h1>
                <script>alert('${error}')</script>
            `)
        }
        res.render('tasks', {
            head_title: 'View Tasks',
            body_title: 'View Tasks',
            tasks: JSON.parse(returnData),
            name: 'Indra H',
            token: req.token
        })
    })
})

app.post('/tasks', redirectLogin, (req, res) => {
    const requestData = {
        description: req.body.description,
        completed: (req.body.completed === 'on')
    }
    taskAPI.createTask(req.token, requestData, (error, returnData) => {
        if (error) {
            return res.send(`
                <h1>Error Update Task</h1>
                <script>alert('${error}')</script>
            `)
        }
        res.redirect('/tasks')
    })
})

app.get('/tasks/delete/:id', redirectLogin, (req, res) => {
    const id = req.params.id
    taskAPI.deleteTask(req.token, id, (error, returnData) => {
        if (error) {
            return res.send(`
                <h1>Error Delete Task</h1>
                <script>alert('${error}')</script>
            `)
        }
        res.redirect('/tasks')
    })
})

app.get('/tasks/edit/:id', redirectLogin, (req, res) => {
    const id = req.params.id
    taskAPI.getTask(req.token, id, (error, returnData) => {
        if (error) {
            return res.send(`
                <h1>Error Get Edit Task</h1>
                <script>alert('${error}')</script>
            `)
        }
        const task = JSON.parse(returnData)
        const checked = task.completed ? 'checked' : ''
        const body_content = `
            <p>Edit Task!</p>
            <form method='post' action='/tasks/edit/${id}'>
                <table>
                    <tr>
                        <td>Description</td>
                        <td><input type='text' name='description' placeholder='Description' Value='${task.description}' required /> </td>
                    </tr>
                    <tr>
                        <td>Completed Status</td>
                        <td> <input type='checkbox' name='completed' placeholder="Completed" ${checked} /></td>
                    </tr>
                </table>                
               <br />
                <input type='submit' value='Submit' />
            </form>`
        res.render('default', {
            head_title: 'Edit Task',
            body_title: 'Edit Task',
            body_content,
            name: 'Indra H'
        })
    })
})

app.post('/tasks/edit/:id', redirectLogin, (req, res) => {
    const requestData = {
        description: req.body.description,
        completed: (req.body.completed === 'on')
    }
    taskAPI.updateTask(req.token, req.params.id, requestData, (error, returnData) => {
        if (error) {
            return res.send(`
                <h1>Error Update Task</h1>
                <script>alert('${error}')</script>
            `)
        }
        res.redirect('/tasks')
    })
})

// 404 Catch
app.get('/*', (req, res) => {
    res.render('404', {
        head_title: '404',
        body_title: '404',
        name: 'Indra H',
        errorMessage: 'Page not found!'
    })
})

app.listen(PORT, () => {
    console.log('server is up on port ' + PORT)
})