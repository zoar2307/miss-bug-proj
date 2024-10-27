import { start } from "repl"
import { utilService } from "./util.service.js"
import fs from 'fs'


const bugs = utilService.readJsonFile('./data/bugs.json')
let allLabels = utilService.readJsonFile('./data/labels.json')
const PAGE_SIZE = 3

export const bugService = {
    query,
    getById,
    remove,
    save,
    queryLabels,
}

function query(filterBy) {
    return Promise.resolve(bugs)
        .then(bugs => {
            console.log(filterBy)

            if (filterBy.all === 'all') {
                return bugs
            }
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title))
            } else if (filterBy.minSeverity) {
                bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
            }
            if (filterBy.selectedLabels) {
                bugs = bugs.filter(bug => bug.labels.some(label => filterBy.selectedLabels.includes(label)))
            }
            if (filterBy.creatorId) {
                bugs = bugs.filter(bug => bug.creator._id === filterBy.creatorId)

            }

            if (filterBy.sortBy === 'title') bugs.sort((b1, b2) => b1.title.localeCompare(b2.title) * +filterBy.sortDir)
            else bugs.sort((b1, b2) => (b1[filterBy.sortBy] - b2[filterBy.sortBy]) * +filterBy.sortDir)

            const startIdx = filterBy.pageIdx * PAGE_SIZE
            return bugs.slice(startIdx, startIdx + PAGE_SIZE)
        })
}

function queryLabels() {
    return Promise.resolve(allLabels)
}
function getAllLabels() {
    allLabels = []
    bugs.forEach(bug => {
        const tempArray = []
        bug.labels.forEach(label => {
            if (!tempArray.includes(label.toLowerCase())) {
                tempArray.push(label.toLowerCase())
                allLabels.push({ label })
            }
        })
    })
    _saveLabelsToFile()
}

function getById(bugId) {
    const selectBug = bugs.find(bug => bug._id === bugId)
    if (!selectBug) return Promise.reject(`Cant find ${bugId}`)
    return Promise.resolve(selectBug)
}

function remove(bugId, loggedInUser) {
    const selectBugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (selectBugIdx < 0) return Promise.reject(`Cant find ${bugId}`)

    const bug = bugs[selectBugIdx]
    if (!loggedInUser.isAdmin &&
        bug.creator._id !== loggedInUser._id) {
        return Promise.reject('Not your bug')
    }

    bugs.splice(selectBugIdx, 1)
    getAllLabels()
    return _saveBugsToFile()
}

function save(bugToSave, loggedInUser) {
    if (bugToSave.labels && bugToSave.labels.length > 0) {
        bugToSave.labels = bugToSave.labels.split(',') || bugToSave.labels
    }
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        if (!loggedInUser.isAdmin &&
            bugs[bugIdx].creator._id !== loggedInUser._id) {
            return Promise.reject('Not your bug')
        }
        bugs[bugIdx] = { ...bugs[bugIdx], ...bugToSave }
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.createdAt = Date.now()
        bugToSave.creator = loggedInUser
        bugs.unshift(bugToSave)
    }
    getAllLabels()
    return _saveBugsToFile()
        .then(() => {
            return bugToSave
        })
}


function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bugs.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}

function _saveLabelsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(allLabels, null, 4)
        fs.writeFile('data/labels.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}