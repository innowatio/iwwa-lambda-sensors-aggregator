import {expect} from "chai";
import {merge} from "ramda";

import {handler} from "index";
import mongodb from "services/mongodb";
import {run, getEventFromObject} from "../mocks";
import {SENSORS_COLLECTION_NAME} from "config";

const aSensor = {
    description: "a description",
    name: "Sensore ambientale",
    type: "ZTHL",
    virtual: false,
    formula: "",
    siteId: "site1",
    userId: "user1"
};

describe("On sensor", () => {

    var db;
    var sensorsCollection;

    before(async () => {
        db = await mongodb;
        sensorsCollection = db.collection(SENSORS_COLLECTION_NAME);
    });

    after(async () => {
        await db.dropCollection(SENSORS_COLLECTION_NAME);
        await db.close();
    });

    afterEach(async () => {
        await sensorsCollection.remove({});
    });

    it("perform INSERT", async () => {
        const event = getEventFromObject({
            id: "eventId",
            data: {
                element: aSensor,
                id: "ANZ01"
            },
            type: "element inserted in collection sensors"
        });
        const expected = {
            _id: "ANZ01",
            description: "a description",
            name: "Sensore ambientale",
            type: "ZTHL",
            virtual: false,
            formula: "",
            isDeleted: false,
            siteId: "site1",
            userId: "user1"
        };

        await run(handler, event);
        const result = await sensorsCollection.findOne({_id: "ANZ01"});
        expect(result).to.deep.equal(expected);
    });

    it("perform UPDATE", async () => {
        sensorsCollection.insert(merge(aSensor, {_id: "ANZ01"}));

        const eventSensor = merge(aSensor, {
            siteId: "siteId",
            userId: "userId",
            description: "desc",
            name: "Sensore co2",
            type: "CO2",
            virtual: false,
            formula: "formula"
        });
        const event = getEventFromObject({
            id: "eventId",
            data: {
                element: eventSensor,
                id: "ANZ01"
            },
            type: "element replaced in collection sensors"
        });
        const expected = {
            _id: "ANZ01",
            siteId: "siteId",
            userId: "userId",
            description: "desc",
            name: "Sensore co2",
            type: "CO2",
            virtual: false,
            formula: "formula",
            variables: ["formula"],
            isDeleted: false
        };

        await run(handler, event);
        const result = await sensorsCollection.findOne({_id: "ANZ01"});
        expect(result).to.deep.equal(expected);
    });

    it("perform logical DELETE", async () => {
        sensorsCollection.insert(merge(aSensor, {_id: "ANZ01", isDeleted: false}));

        const event = getEventFromObject({
            id: "eventId",
            data: {
                element: undefined,
                id: "ANZ01"
            },
            type: "element removed in collection sensors"
        });
        const expected = merge(aSensor, {
            _id: "ANZ01",
            isDeleted: true
        });

        await run(handler, event);
        const result = await sensorsCollection.findOne({_id: "ANZ01"});
        expect(result).to.deep.equal(expected);
    });
});
