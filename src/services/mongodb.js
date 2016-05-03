import {MongoClient} from "mongodb";

import {
    MONGODB_URL,
    SENSORS_COLLECTION_NAME
} from "../config";

export default MongoClient.connect(MONGODB_URL);

export async function insert (sensor) {
    const db = await MongoClient.connect(MONGODB_URL);
    return db.collection(SENSORS_COLLECTION_NAME).insert(
        sensor
    );
}

export async function update (sensor) {
    const db = await MongoClient.connect(MONGODB_URL);
    return db.collection(SENSORS_COLLECTION_NAME).update(
        {_id: sensor._id},
        {$set: sensor}
    );
}

export async function logicalDelete (sensor) {
    const db = await MongoClient.connect(MONGODB_URL);
    return db.collection(SENSORS_COLLECTION_NAME).update(
        {_id: sensor._id},
        {$set: {isDeleted: true}}
    );
}
