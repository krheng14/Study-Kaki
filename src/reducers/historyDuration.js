const historyDurationReducer = (state = {arr:[]}, action) => {
    switch(action.type) {
        case "HISTORYDURATIONINCREMENT":
            return {
                ...state,
                arr: [...state.arr, action.payload]
            }
        default:
            return state;
    }
}

export default historyDurationReducer;