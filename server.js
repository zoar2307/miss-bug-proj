import express from 'express'
import { loggerService } from './services/logger.service.js'
import { bugService } from './services/bug.service.js'
import cookieParser from 'cookie-parser'
import { createPdf } from './services/PDFService.js'

const app = express()
const PORT = process.env.PORT
const SECRET1 = process.env.SECRET1


app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug', (req, res) => {
    const filterBy = req.query
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
    const { title, description, severity, labels } = req.body
    const bugToSave = { title, description, severity: +severity, labels }
    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch(err => loggerService.error('Cant save bug' + err))
})

app.put('/api/bug', (req, res) => {
    const { _id, title, description, severity } = req.body
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

app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send(`Bug ${bugId} removed`))
        .catch(err => loggerService.error('Cant remove bug' + err))
})

app.listen(PORT, () =>
    loggerService.info(`Server is ready on http://127.0.0.1:${PORT}/`))