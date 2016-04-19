import "babel-polyfill";
import router from "kinesis-router";
import {partialRight} from "ramda";

import {ACTION_INSERT, ACTION_UPDATE, ACTION_DELETE} from "./config";
import pipeline from "./pipeline";

export const handler = router()
    .on("element inserted in collection sensors", partialRight(pipeline, [ACTION_INSERT]))
    .on("element replaced in collection sensors", partialRight(pipeline, [ACTION_UPDATE]))
    .on("element removed in collection sensors", partialRight(pipeline, [ACTION_DELETE]));
