import {logicalDelete, insert, update} from "./services/mongodb";
import addFormulaVariablesToSensor from "./steps/add-formula-variables";
import {ACTION_INSERT, ACTION_UPDATE, ACTION_DELETE} from "./config";

export default async function pipeline (event, action) {
    var sensor = event.data.element || {};
    const id = event.data.id;
    sensor._id = id;
    sensor.isDeleted = action === ACTION_DELETE;

    if (sensor.formula) {
        sensor.variables = addFormulaVariablesToSensor(sensor.formula);
    }

    const now = Date.now();

    switch (action) {
    case ACTION_INSERT:
        sensor.createdDate = now;
        await insert(sensor);
        break;
    case ACTION_UPDATE:
        sensor.lastModifiedDate = now;
        await update(sensor);
        break;
    case ACTION_DELETE:
        await logicalDelete(sensor);
        break;
    }

    return null;
}
