export default function addFormulaVariablesToSensor (formula) {
    return formula.split("+").map(variable => variable.trim());
}
