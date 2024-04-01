import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

async function query(filterBy = { txt: '', inStock: null, pageIdx: 0 }) {
    console.log('i am filter', filterBy)
    try {

        let criteria = {
            title: { $regex: filterBy.txt, $options: 'i' }
        }

        if (filterBy.inStock !== null) {
            criteria.inStock = filterBy.inStock === 'true' ? true : false
        } else {
            criteria.inStock = { $ne: null };
        }
       



        const collection = await dbService.getCollection('toy')
        let pageIdx = filterBy.pageIdx || 0;
        if(typeof pageIdx === 'string'){
            pageIdx = +pageIdx
        }
        const pageSize = 5
        const skipCount = pageIdx * pageSize;

        const toys = await collection.find(criteria)
                                     .skip(skipCount)
                                     .limit(pageSize)
                                     .toArray();

        return toys;
    } catch (err) {
        logger.error('Cannot find toys', err);
        throw err;
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        var toy = collection.findOne({ _id: ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: ObjectId(toyId) })
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            title: toy.title,
            price: toy.price
        }
        if (toy.msgs) {
            toyToSave.msgs = toy.msgs
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toyId}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg
}
