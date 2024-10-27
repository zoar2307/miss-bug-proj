import fs from 'fs'
import Cryptr from 'cryptr'

import { utilService } from "./util.service.js"

const cryptr = new Cryptr('secret-zyBugs-1234')
const users = utilService.readJsonFile('./data/user.json')

export const userService = {
    query,
    getById,
    remove,
    save,

    checkLogin,
    getLoginToken,
    validateToken
}

function query() {
    const usersToReturn = users.map(user => ({ _id: user._id, fullname: user.fullname }))
    return Promise.resolve(usersToReturn)
}

function getById(userId) {
    let user = users.find(user => user._id === userId)
    if (!user) return Promise.reject(`Cant find User`)
    user = {
        _id: user._id,
        fullname: user.fullname
    }
    return Promise.resolve(user)
}

function remove(userId) {
    users = users.filter(user => user._id !== userId)
    return _saveUsersToFile
}

function save(user) {
    user._id = utilService.makeId()
    users.push(user)
    return _saveUsersToFile()
        .then(() => ({
            _id: user._id,
            fullname: user.fullname,
            isAdmin: user.isAdmin,
        }))
}

function checkLogin({ username, password }) {
    let user = users.find(user => user.username === username && user.password === password)

    if (user) {
        user = {
            _id: user._id,
            fullname: user.fullname,
            isAdmin: user.isAdmin,
        }
    }
    return Promise.resolve(user)
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}


function validateToken(token) {
    if (!token) return null

    const str = cryptr.decrypt(token)
    const user = JSON.parse(str)
    return user
}

function _saveUsersToFile() {
    return new Promise((resolve, reject) => {
        const usersStr = JSON.stringify(users, null, 2)
        fs.writeFile('data/user.json', usersStr, err => {
            if (err) {
                return console.log(err)
            }
            resolve()
        })
    })
}
