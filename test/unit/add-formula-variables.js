import {expect} from "chai";

import addFormulaVariablesToSensor from "steps/add-formula-variables";

describe("`addFormulaVariablesToSensor` function", () => {
    it("return the correct array of string", () => {
        const formula = "sensor1 + sensor2";
        const expected = ["sensor1", "sensor2"];
        const result = addFormulaVariablesToSensor(formula);

        expect(result).to.deep.equal(expected);
    });
});
