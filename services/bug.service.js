import { utilService } from "./util.service.js"
import fs from 'fs'


const bugs = utilService.readJsonFile('./data/bugs.json')

export const bugService = {
    query,
    getById,
    remove,
    save
}

function query() {
    return Promise.resolve(bugs)
}

function getById(bugId) {
    const selectBug = bugs.find(bug => bug._id === bugId)
    if (!selectBug) return Promise.reject(`Cant find ${bugId}`)
    return Promise.resolve(selectBug)
}

function remove(bugId) {
    const selectBugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (selectBugIdx < 0) return Promise.reject(`Cant find ${bugId}`)
    bugs.splice(selectBugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.createdAt = Date.now()
        bugs.unshift(bugToSave)
    }
    return _saveBugsToFile()
        .then(() => bugToSave)
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