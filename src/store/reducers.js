import {combineReducers} from 'redux';

function web3(state = {}, action){
	switch (action.type){
		case 'WEB3_LOADED':
			return {...state, connection: action.connection };
		case 'WEB3_ACCOUNT_LOADED':
			return {...state, account: action.account };
		default:
			return state
	}
}

function token(state = {}, action){
	switch (action.type){
		case 'TOKEN_LOADED':
			return {...state, contract: action.contract, loaded: true};
		default:
			return state
	}
}

function exchange(state = {}, action){
	switch (action.type){
		case 'EXCHANGE_LOADED':
			return {...state, contract: action.contract, loaded: true};
		case 'CANCELLED_ORDERS_LOADED':
			return {...state, cancelledOrders: {data: action.cancelledOrders, loaded: true}}
		case 'FILLED_ORDERS_LOADED':
			return {...state, filledOrders: {data: action.filledOrders, loaded: true}}
		case 'ALL_ORDERS_LOADED':
			return {...state, allOrders: {data: action.allOrders, loaded: true}}
		case 'ORDER_CANCELLING':
			return {...state, orderCancelling: true}
		case 'ORDER_CANCELLED':
			return {
				...state, 
				orderCancelling: false, 
				cancelledOrders: { 
					...state.cancelledOrders, 
					data:[
						...state.cancelledOrders.data,
						action.order
					]
				}
			}
		default:
			return state
	}
}


const rootReducer = combineReducers({
	web3: web3,
	token: token,
	exchange: exchange
})

export default rootReducer;


