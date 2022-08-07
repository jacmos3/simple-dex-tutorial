import {get, groupBy, reject} from 'lodash'
import {createSelector} from 'reselect';
import {ETHER_ADDRESS, GREEN, RED, tokens, ether } from '../helpers.js';
import moment from 'moment';

const account = state => get(state, "web3.account");
export const accountSelector = createSelector(account, (a)=> {return a});

const tokenLoaded = state => get(state, 'token.loaded', false);
export const tokenLoadedSelectior = createSelector(tokenLoaded, (tl)=> {return tl});

const exchangeLoaded = state => get(state, 'exchange.loaded', false);
export const exchangeLoadedSelector = createSelector(exchangeLoaded, (el)=> {return el});

const exchange = state => get(state,'exchange.contract');
export const exchangeSelector = createSelector(exchange, (e) => {return e});
export const contractsLoadedSelector = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tl, el) => (tl && el)
);


// All Orders
const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false);
const allOrders = state => get(state, 'exchange.allOrders.data', []);

// Cancelled orders
const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false);
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, (loaded) => {return loaded});

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', false);
export const cancelledOrdersSelector = createSelector(cancelledOrders, (o) => {return o});

// Filled Orders
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false);
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, (loaded) => {return loaded});

const filledOrders = state => get(state, 'exchange.filledOrders.data', []);
export const filledOrdersSelector = createSelector(
	filledOrders,
	(orders) => {
		//decorate the orders
		orders = decorateFilledOrders(orders);
		
		//sort orders by date ascending for price comparison
		orders = orders.sort((a,b) => a.timestamp - b.timestamp);


		//sort orders by date descending for display
		orders = orders.sort((a,b) => b.timestamp - a.timestamp);
		return orders;
	}
);

const decorateFilledOrders = (orders) => {
	// Track previous order to compare history
	let previousOrder = orders[0];

	return (
		orders.map((order) => {
			order = decorateOrder(order);
			order = decorateFilledOrder(order, previousOrder);
			previousOrder = order; // update the previous order once it's decrated
			return order;
		})
	)
}

const decorateOrder = (order) => {
	let etherAmount;
	let tokenAmount;

	if (order.tokenGive == ETHER_ADDRESS){
		etherAmount = order.amountGive;
		tokenAmount = order.amountGet;
	}
	else{
		etherAmount = order.amountGet;
		tokenAmount = order.amountGive;
	}
	// Calculate token price to 5 decimal places
	let tokenPrice = (etherAmount /tokenAmount);
	const precision = 100000;
	tokenPrice = Math.round(tokenPrice * precision) / precision; 

	return ({
		...order,
		etherAmount: ether(etherAmount),
		tokenAmount: tokens(tokenAmount),
		tokenPrice: tokenPrice,
		formattedTimestamp:moment.unix(order.timestamp).format('h:mm:ss a M/D')
	});

}
	const decorateFilledOrder = (order, previousOrder) => {

		return({
			...order,
			tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
		})
	}

	const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
		if (previousOrder.id === orderId){
			return GREEN;
		}
		// Show green price if order price higher than previous order
		// Show red price if order price lower than previous order

		return previousOrder.tokenPrice <= tokenPrice ? GREEN : RED;
	}

const openOrders = state => {
	const all = allOrders(state);
	const filled = filledOrders(state);
	const cancelled = cancelledOrders(state);
	


	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o.id === order.id);
		const orderCancelled = cancelled.some((o) => o.id === order.id);
		return (orderFilled || orderCancelled);
	})

	return openOrders;
}

// Loads Order Book if cancelledOrders are loaded and filled Orders are loaded and all orders are loaded
const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state);
export const orderBookLoadedSelector = createSelector(orderBookLoaded, (loaded) => {return loaded})
//Create the order book
export const orderBookSelector = createSelector(
	openOrders,
	(orders) => {
		// Decorate orders
		orders = decorateOrderBookOrders(orders);

		// Group orders by "orderType"
		orders = groupBy(orders, 'orderType');
		
		//Fetch buy orders token price
		const buyOrders = get(orders, 'buy', []);

		//Sort buy orders by token price
		orders = {
			...orders,
			buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
		}

		//Fetch sell orders token price
		const sellOrders = get(orders, 'sell', []);
		
		//Sort sell orders by token price
		orders = {
			...orders,
			sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
		}
		return orders;
	}
)

const decorateOrderBookOrders = (orders) => {
	return (
		orders.map((order) =>{
			order = decorateOrder(order);
			order = decorateOrderBookOrder(order);
			return(order);
		})
	)
}

const decorateOrderBookOrder = (order) => {
	const orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";
	return ({
		...order,
		orderType,
		orderTypeClass: (orderType == 'buy' ? GREEN : RED),
		orderFillClass: orderType === 'buy' ? 'sell' : 'buy'
	});
}
