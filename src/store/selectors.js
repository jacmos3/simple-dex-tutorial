import {get} from 'lodash'
import {createSelector} from 'reselect';

const account = state => get(state, "web3.account");
export const accountSelector = createSelector(account, (account)=> {return account});

const tokenLoaded = state => get(state, 'token.loaded', false);
export const tokenLoadedSelectior = createSelector(tokenLoaded, (tokenLoaded)=> {return tokenLoaded});

const exchangeLoaded = state => get(state, 'exchange.loaded', false);
export const exchangeLoadedSelector = createSelector(exchangeLoaded, (exchangeLoaded)=> {return exchangeLoaded});

export const contractsLoadedSelector = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tokenLoaded, exchangeLoaded) => (tokenLoaded && exchangeLoaded)
);