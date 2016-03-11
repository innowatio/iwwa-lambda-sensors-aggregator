import router from "kinesis-router";
import {partialRight} from "ramda";
import {ACTION_INSERT, ACTION_UPDATE, ACTION_DELETE} from "config";
import {logicalDelete, insert, update} from "services/mongodb";

async function pipeline (event, action) {
    const sensor = event.data.element;
    sensor._id = sensor.id;
    delete sensor.id;
    sensor.isDeleted = action === ACTION_DELETE;

    switch (action) {
    case ACTION_INSERT:
        await insert(sensor);
        break;
    case ACTION_UPDATE:
        await update(sensor);
        break;
    case ACTION_DELETE:
        await logicalDelete(sensor);
        break;
    }

    return null;
}

export const handler = router()
    .on("element inserted in collection sensors", partialRight(pipeline, [ACTION_INSERT]))
    .on("element replaced in collection sensors", partialRight(pipeline, [ACTION_UPDATE]))
    .on("element removed in collection sensors", partialRight(pipeline, [ACTION_DELETE]));
