const durationReducer = (state = 0, action) => {
    switch(action.type) {
        case "DURATIONINCREMENT":
            return state + action.payload
        case "DURATIONDECREMENT":
            return state - action.payload
        default:
            return state;
    }
}

export default durationReducer;