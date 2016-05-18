import {expect} from "chai";
import {merge} from "ramda";
import * as sinon from "sinon";

import {handler} from "index";
import mongodb from "services/mongodb";
import {run, getEventFromObject} from "../mocks";
import {SENSORS_COLLECTION_NAME} from "config";

const aSensor = {
    description: "a description",
    name: "Sensore ambientale",
    type: "ZTHL",
    virtual: false,
    siteId: "site1",
    userId: "user1"
};

describe("On sensor", () => {

    var db;
    var sensorsCollection;
    var clock;
    const now = new Date("2016-01-15").getTime();

    before(async () => {
        db = await mongodb;
        sensorsCollection = db.collection(SENSORS_COLLECTION_NAME);
    });

    after(async () => {
        await db.dropCollection(SENSORS_COLLECTION_NAME);
        await db.close();
    });

    beforeEach(() => {
        clock = sinon.useFakeTimers(now);
    });

    afterEach(async () => {
        await sensorsCollection.remove({});
        clock.restore();
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
            isDeleted: false,
            siteId: "site1",
            userId: "user1",
            createdDate: now
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
            virtual: false
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
            isDeleted: false,
            lastModifiedDate: now
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

    it("INSERT, UPDATE, UPDATE & DELETE", async () => {
        const tick = 10000;
        const eventInsert = getEventFromObject({
            id: "eventId",
            data: {
                element: aSensor,
                id: "ANZ01"
            },
            type: "element inserted in collection sensors"
        });
        const eventUpdate1 = getEventFromObject({
            id: "eventId",
            data: {
                element: {
                    ...aSensor,
                    name: "Sensore ambientale 2"
                },
                id: "ANZ01"
            },
            type: "element replaced in collection sensors"
        });
        const eventUpdate2 = getEventFromObject({
            id: "eventId",
            data: {
                element: {
                    ...aSensor,
                    name: "Sensore ambientale 1"
                },
                id: "ANZ01"
            },
            type: "element replaced in collection sensors"
        });
        const eventDelete = getEventFromObject({
            id: "eventId",
            data: {
                element: undefined,
                id: "ANZ01"
            },
            type: "element removed in collection sensors"
        });

        const expectedInsert = {
            _id: "ANZ01",
            description: "a description",
            name: "Sensore ambientale",
            type: "ZTHL",
            virtual: false,
            isDeleted: false,
            siteId: "site1",
            userId: "user1",
            createdDate: Date.now()
        };

        const expectedUpdate1 = {
            _id: "ANZ01",
            description: "a description",
            name: "Sensore ambientale 2",
            type: "ZTHL",
            virtual: false,
            isDeleted: false,
            siteId: "site1",
            userId: "user1",
            createdDate: Date.now(),
            lastModifiedDate: Date.now() + tick
        };

        const expectedUpdate2 = {
            _id: "ANZ01",
            description: "a description",
            name: "Sensore ambientale 1",
            type: "ZTHL",
            virtual: false,
            isDeleted: false,
            siteId: "site1",
            userId: "user1",
            createdDate: Date.now(),
            lastModifiedDate: Date.now() + (2 * tick)
        };

        const expectedDelete = {
            _id: "ANZ01",
            description: "a description",
            name: "Sensore ambientale 1",
            type: "ZTHL",
            virtual: false,
            isDeleted: true,
            siteId: "site1",
            userId: "user1",
            createdDate: Date.now(),
            lastModifiedDate: Date.now() + (2 * tick)
        };

        await run(handler, eventInsert);
        const resultInsert = await sensorsCollection.findOne({_id: "ANZ01"});
        expect(resultInsert).to.deep.equal(expectedInsert);

        clock.tick(tick);
        await run(handler, eventUpdate1);
        const resultUpdate1 = await sensorsCollection.findOne({_id: "ANZ01"});
        expect(resultUpdate1).to.deep.equal(expectedUpdate1);

        clock.tick(tick);
        await run(handler, eventUpdate2);
        const resultUpdate2 = await sensorsCollection.findOne({_id: "ANZ01"});
        expect(resultUpdate2).to.deep.equal(expectedUpdate2);

        clock.tick(tick);
        await run(handler, eventDelete);
        const resultDelete = await sensorsCollection.findOne({_id: "ANZ01"});
        expect(resultDelete).to.deep.equal(expectedDelete);
    });
});
