
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

const PAGE_SIZE = 5

export const toyService = {
    query,
    getById,
    remove,
    save
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy = { txt: '', inStock: 'all', pageIdx: 0 }) {
    let filteredToys = toys

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.title))
    }
    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        filteredToys = filteredToys.slice(startIdx, PAGE_SIZE + startIdx)
    }

    if (filterBy.inStock !== 'all') {
        filteredToys = filteredToys.filter((toy) => (filterBy.inStock === 'stock' ? toy.inStock : !toy.inStock))
    }

    return Promise.resolve(filteredToys)
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    // if (!loggedinUser.isAdmin &&
    //     car.owner._id !== loggedinUser._id) {
    //     return Promise.reject('Not your car')
    // }
    toys.splice(idx, 1)
    return _saveToysToFile()
}

// function save(toy, loggedinUser) {
//     if (toy._id) {
//         const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
//         // if (!loggedinUser.isAdmin &&
//         //     carToUpdate.owner._id !== loggedinUser._id) {
//         //     return Promise.reject('Not your car')
//         // }
//         toyToUpdate.title = toy.title
//         // toyToUpdate.speed = toy.speed
//         toyToUpdate.price = toy.price
//         toy = toyToUpdate
//     } else {
//         toy._id = utilService.makeId()
//         // toy.owner = {
//         //     fullname: loggedinUser.fullname,
//         //     score: loggedinUser.score,
//         //     _id: loggedinUser._id,
//         //     isAdmin: loggedinUser.isAdmin
//         // }
//         toys.push(toy)
//     }

//     return _saveToysToFile().then(() => toy)
// }

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        toys[idx] = { ...toys[idx], ...toy }
    } else {
        toy.createdAt = new Date(Date.now())
        toy._id = utilService.makeId()
        toys.unshift(toy)
    }
    _saveToysToFile()
    return Promise.resolve(toy)
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
