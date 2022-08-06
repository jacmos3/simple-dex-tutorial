import {get} from 'lodash'
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
	(tokenLoaded, exchangeLoaded) => (tokenLoaded && exchangeLoaded)
);

const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
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