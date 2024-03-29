//WEB3
export function web3Loaded(connection){
	return {
		type: 'WEB3_LOADED',
		connection: connection
	}
}

export function web3AccountLoaded(account){
	return {
		type: 'WEB3_ACCOUNT_LOADED',
		account: account
	}
}

//TOKEN
export function tokenLoaded(contract){
	return {
		type: 'TOKEN_LOADED',
		contract: contract
	}
}

//EXCHANGE
export function exchangeLoaded(contract){
	return {
		type: 'EXCHANGE_LOADED',
		contract: contract
	}
}

export function cancelledOrdersLoaded(cancelledOrders){
	return{
		type: 'CANCELLED_ORDERS_LOADED',
		cancelledOrders: cancelledOrders
	}
}

export function filledOrdersLoaded(filledOrders){
	return{
		type: 'FILLED_ORDERS_LOADED',
		filledOrders: filledOrders
	}
}

export function allOrdersLoaded(allOrders){
	return{
		type: 'ALL_ORDERS_LOADED',
		allOrders: allOrders
	}
}

// Cancel Order
export function orderCancelling(){
	return{
		type: 'ORDER_CANCELLING'
	}
}


export function orderCancelled(order){
	return{
		type: 'ORDER_CANCELLED',
		order
	}
}

// Fill Order
export function orderFilling(){
	return{
		type: 'ORDER_FILLING'
	}
}

export function orderFilled(order){
	return{
		type: 'ORDER_FILLED',
		order
	}
}