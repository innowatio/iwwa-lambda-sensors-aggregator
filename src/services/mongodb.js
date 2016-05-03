import {MongoClient} from "mongodb";

import {
    MONGODB_URL,
    SENSORS_COLLECTION_NAME
} from "../config";

export default MongoClient.connect(MONGODB_URL);

export async function insert (sensor, id) {
    const db = await MongoClient.connect(MONGODB_URL);
    sensor._id = id;
    return db.collection(SENSORS_COLLECTION_NAME).insert(
        sensor
    );
}

export async function update (sensor, id) {
    const db = await MongoClient.connect(MONGODB_URL);
    return db.collection(SENSORS_COLLECTION_NAME).update(
        {_id: id},
        {$set: sensor}
    );
}

export async function logicalDelete (id) {
    const db = await MongoClient.connect(MONGODB_URL);
    return db.collection(SENSORS_COLLECTION_NAME).update(
        {_id: id},
        {$set: {isDeleted: true}}
    );
}
