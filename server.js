import express from 'express'
import { loggerService } from './services/logger.service.js'
import { bugService } from './services/bug.service.js'
import cookieParser from 'cookie-parser'
import { createPdf } from './services/PDFService.js'
import { userService } from './services/userService.js'

const app = express()
const PORT = 3030


app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug', (req, res) => {
    const filterBy = req.query
    console.log(filterBy)
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => loggerService.error('Cant load bugs' + err))
})

app.get('/api/labels', (req, res) => {
    bugService.queryLabels()
        .then(labels => res.send(labels))
        .catch(err => loggerService.error('Cant load labels' + err))
})

app.get('/api/bug/pdf', (req, res) => {
    bugService.query()
        .then(bugs => {
            createPdf('data/Bugs.pdf', bugs)
            res.send('pdf read ar data/Bugs.pdf')
        })
        .catch(err => loggerService.error('Cant create pdf' + err))
})

app.post('/api/bug', (req, res) => {
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot add bug')

    const { title, description, severity, labels } = req.body
    const bugToSave = { title, description, severity: +severity, labels }
    bugService.save(bugToSave, loggedInUser)
        .then(bug => res.send(bug))
        .catch(err => loggerService.error('Cant save bug' + err))
})

app.put('/api/bug', (req, res) => {
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot edit bug')

    const { _id, title, description, severity } = req.body
    const bugToSave = { _id, title, description, severity: +severity }
    bugService.save(bugToSave, loggedInUser)
        .then(bug => res.send(bug))
        .catch(err => {
            res.status(401).send('Cannot edit bug ' + err)
            loggerService.error('Cant save bug ' + err)
        })
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.getById(bugId)
        .then(bug => {
            let visitedBugs = req.cookies.visitedBugs || []
            if (visitedBugs.length === 3) return res.status(401).send('Wait for a bit')
            if (!visitedBugs.some(visitedBugId => visitedBugId === bugId)) {
                visitedBugs.push(bugId)
                res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 7 })
            }
            return bug
        })
        .then(bug => res.send(bug))
        .catch(err => loggerService.error('Cant get bug' + err))
})

app.delete('/api/bug/:bugId', (req, res) => {
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot remove bug')

    const { bugId } = req.params
    bugService.remove(bugId, loggedInUser)
        .then(() => res.send(`Bug ${bugId} removed`))
        .catch(err => loggerService.error('Cant remove bug' + err))
})

// USER

app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => {
            res.send(users)
        }).catch(err => loggerService.error('Cant load users' + err))
})

app.delete('/api/user/:userId', (req, res) => {
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot remove user')

    const { userId } = req.params
    console.log(userId)
    userService.remove(userId, loggedInUser)
        .then(() => {
            res.send('removed')
        }).catch(err => loggerService.error(err))
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    userService.getById(userId)
        .then(user => {
            res.send(user)
        }).catch(err => loggerService.error('Cant load user' + err))
})

// USER AUTH

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.save(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

app.listen(PORT, () =>
    loggerService.info(`Server is ready on http://127.0.0.1:${PORT}/`))