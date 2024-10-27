
// import axios from 'axios'
import axios from 'axios'
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'
import { func } from 'prop-types'
import { page } from 'pdfkit'

const STORAGE_KEY = 'bugDB'
const BASE_URL = '/api/bug/'
// _createBugs()

export const bugService = {
    query,
    queryLabels,
    getById,
    save,
    remove,
    createPdf,
    getDefaultFilter
}


function query(filterBy = {}) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
}

function queryLabels() {
    return axios.get('/api/labels')
        .then(res => res.data)
}



function getDefaultFilter() {
    return { txt: '', sortBy: 'createdAt', sortDir: -1, minSeverity: 1, pageIdx: 0, selectedLabels: [] }
}


function getById(bugId) {
    return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
}

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL, bug).then(res => res.data)
    } else {
        return axios.post(BASE_URL, bug).then(res => res.data)
    }

}

function createPdf() {
    return axios.get(BASE_URL + 'pdf')
}


function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (!bugs || !bugs.length) {
        bugs = [
            {
                title: "Infinite Loop Detected",
                severity: 4,
                _id: "1NF1N1T3"
            },
            {
                title: "Keyboard Not Found",
                severity: 3,
                _id: "K3YB0RD"
            },
            {
                title: "404 Coffee Not Found",
                severity: 2,
                _id: "C0FF33"
            },
            {
                title: "Unexpected Response",
                severity: 1,
                _id: "G0053"
            }
        ]
        utilService.saveToStorage(STORAGE_KEY, bugs)
    }



}
