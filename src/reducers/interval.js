const intervalReducer = (state = 0, action) => {
    switch(action.type) {
        case "INTERVALINCREMENT":
            return state + action.payload
        case "INTERVALDECREMENT":
            return state - action.payload
        default:
            return state;
    }
}

export default intervalReducer;