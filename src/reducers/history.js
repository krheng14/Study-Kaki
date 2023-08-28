const historyReducer = (state = {arr:[]}, action) => {
    switch(action.type) {
        case "HISTORYINCREMENT":
            return {
                ...state,
                arr: [...state.arr, action.payload]
            }
        default:
            return state;
    }
}

export default historyReducer;