import express from 'express'
import { loggerService } from './services/logger.service.js'
import { bugService } from './services/bug.service.js'
import cookieParser from 'cookie-parser'

const app = express()
const port = 3030

app.use(express.static('public'))
app.use(cookieParser())

app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
        .catch(err => loggerService.error('Cant load bugs' + err))
})

app.get('/api/bug/save', (req, res) => {
    const { _id, title, description, severity } = req.query
    const bugToSave = { _id, title, description, severity: +severity }
    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch(err => loggerService.error('Cant save bug' + err))
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

app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`Bug ${bugId} removed`))
        .catch(err => loggerService.error('Cant remove bug' + err))
})

app.listen(port, () =>
    loggerService.info(`Server is ready on http://127.0.0.1:${port}/`))