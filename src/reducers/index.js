import counterReducer from "./counter";
import loggedReducer from "./isLogged";
import durationReducer from "./duration";
import intervalReducer from "./interval";
import historyReducer from "./history";

import { combineReducers } from "redux";

const allReducers = combineReducers({
    counter: counterReducer,
    isLogged: loggedReducer,
    duration: durationReducer,
    interval: intervalReducer,
    history: historyReducer,
});

export default allReducers