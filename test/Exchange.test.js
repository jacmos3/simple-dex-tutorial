import {tokens,EVM_REVERT, INVALID_ADDRESS,ETHER_ADDRESS,ether} from './helpers';
const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token');
require('chai')
	.use(require('chai-as-promised'))
	.should();

contract('Exchange',([deployer, feeAccount, user1, user2]) => {
	let token;
	let exchange;
	const feePercent = 10;
	beforeEach(async () => {
		exchange = await Exchange.new(feeAccount,10);
		token = await Token.new();
		token.transfer(user1,tokens(100), {from: deployer});
	})

	describe('deployment', ()=> {
		it('tracks the feeAccount', async () => {
			let result = await exchange.feeAccount();
			result.should.equal(feeAccount);
		});

		it('tracks the feePercent', async () => {
			let result = await exchange.feePercent();
			result.toString().should.equal(feePercent.toString());
		});
	});


	describe('fallback', ()=> {
		it('reverts when Ether is sent', async () => {
			await exchange.sendTransaction({value: 1, from: user1}).should.be.rejectedWith(EVM_REVERT);
		});
	});

	describe('depositing ether', ()=> {
		let result;
		let amount;

		beforeEach(async () =>{
			amount = ether(1);
			result = await exchange.depositEther({from: user1, value: amount});
		})

		it('tracks the Ether deposit', async ()=>{
			const balance = await exchange.tokens(ETHER_ADDRESS, user1);
			balance.toString().should.equal(amount.toString());
		});

		it('emits a deposit', async () => {
				const log = result.logs[0];
				log.event.should.eq('Deposit');
				const event = log.args;
				event.token.should.equal(ETHER_ADDRESS, 'token address is correct');
				event.user.should.equal(user1, 'user is correct');
				event.amount.toString().should.equal(amount.toString(), 'amount is correct');
				event.balance.toString().should.equal(amount.toString(), 'amount is correct');
			});
		describe('success', () =>{
			
		});
		
		describe('failure', () =>{

		});
	});

	describe('withdrawing ether', ()=> {
		let result;
		let amount = ether(1);
		beforeEach(async () =>{
			await exchange.depositEther({from: user1, value: amount});
		})

		describe('success', async () =>{
			beforeEach(async () => {
				result = await exchange.withdrawEther(amount, {from: user1});
			})


		it ('withdraws Ether funds', async ()=>{
			const balance = await exchange.tokens(ETHER_ADDRESS, user1);
			balance.toString().should.equal = 0;
		});

		it('emits a withdraw', async () => {
				const log = result.logs[0];
				log.event.should.eq('Withdraw');
				const event = log.args;
				event.token.should.equal(ETHER_ADDRESS);
				event.user.should.equal(user1);
				event.amount.toString().should.equal(amount.toString());
				event.balance.toString().should.equal('0');
			});
				
		});
		describe('failure', () =>{
			it ('rejects withdraw for insufficient balance', async() =>{
				await exchange.withdrawEther(ether(100), {from:user1}).should.be.rejectedWith(EVM_REVERT);
			})
		});
	});

	describe('withdrawing tokens', async ()=> {
		let result;
		let amount;

		describe('success', async () =>{
			beforeEach(async () => {
				amount = tokens(10);
				await token.approve(exchange.address, amount, {from: user1});
				await exchange.depositToken(token.address, amount, {from:user1});

				//Withdraw tokens
				result = await exchange.withdrawToken(token.address, amount, {from: user1});
			});

			it ('withdraws token funds', async () =>{
				const balance = await exchange.tokens(token.address, user1);
				balance.toString().should.equal('0');
			});

			it('emits a withdraw', async () => {
				const log = result.logs[0];
				log.event.should.eq('Withdraw');
				const event = log.args;
				event.token.should.equal(token.address);
				event.user.should.equal(user1);
				event.amount.toString().should.equal(amount.toString());
				event.balance.toString().should.equal('0');
			});

			describe('failure', async() =>{
				it('rejects Ether withdraws', async () =>{
					await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT);
				});

				it('fails for insufficient balances', async () =>{
					await exchange.withdrawToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT);
				});
			});
		});
	});

	describe('depositing tokens', ()=> {
		let result;
		let amount;

		describe('success', () =>{
			beforeEach(async() =>{
				amount = tokens(10);
				await token.approve(exchange.address, tokens(10), {from: user1});
				result = await exchange.depositToken(token.address, amount, {from: user1});
			});

			it('tracks the token deposit', async () => {
				let balance;
				balance = await token.balanceOf(exchange.address);
				balance.toString().should.equal(amount.toString());
				balance = await exchange.tokens(token.address, user1);
				balance.toString().should.equal(amount.toString());
			});

			it('emits a deposit', async () => {
				const log = result.logs[0];
				log.event.should.eq('Deposit');
				const event = log.args;
				event.token.should.equal(token.address, 'token address is correct');
				event.user.should.equal(user1, 'user is correct');
				event.amount.toString().should.equal(tokens(10).toString(), 'amount is correct');
				event.balance.toString().should.equal(tokens(10).toString(), 'balance is correct');
			});

		});

		describe('failure', () =>{
			it('fails when no tokens are approved', async () => {
				await exchange.depositToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT);

			});

			it('rejects Ether deposit using depositToken', async () => {
				await exchange.depositToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT);

			});
		})
	
	});

	describe('checking balance', ()=> {
		let amount = ether(1);
		beforeEach(async() =>{
			await exchange.depositEther({from: user1, value: amount});
		});

		it('checking user balance', async () =>{
			let balance = await exchange.balanceOf(ETHER_ADDRESS, user1);
			balance.toString().should.equal(amount.toString());
		});
	});


	describe('making orders', ()=> {
		let result;
		let tokenGet;
		let amountGet = tokens(1);
		let tokenGive = ETHER_ADDRESS;
		let amountGive = ether(1);

		beforeEach(async() =>{
			tokenGet = token.address;
			result = await exchange.makeOrder(tokenGet, amountGet, tokenGive, amountGive, {from: user1});
		});

		it('tracks the newely created order', async () =>{
			const orderCount = await exchange.orderCount();
			orderCount.toString().should.equal('1');
			const order = await exchange.orders('1');
			order.id.toString().should.equal('1', 'id is correct');
			order.user.should.equal(user1, 'user is correct');
			order.tokenGet.should.equal(tokenGet, 'tokenGet is correct');
			order.amountGet.toString().should.equal(amountGet.toString(), 'amountGet is correct');
			order.tokenGive.should.equal(tokenGive, 'tokenGive is correct');
			order.amountGive.toString().should.equal(amountGive.toString(), 'amountGive is correct');
			order.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
		});

		it('emits an order event', async () => {
			const log = result.logs[0];
			log.event.should.eq('Order');
			const event = log.args;
			event.id.toString().should.equal('1', 'id is correct');
			event.user.should.equal(user1, 'user is correct');
			event.tokenGet.should.equal(tokenGet, 'tokenGet is correct');
			event.amountGet.toString().should.equal(amountGet.toString(), 'amountGet is correct');
			event.tokenGive.should.equal(tokenGive, 'tokenGive is correct');
			event.amountGive.toString().should.equal(amountGive.toString(), 'amountGive is correct');
			event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
		});

	});


	describe('orders actions', ()=> {
		let tokenGet;
		let amountGet = tokens(1);
		let tokenGive = ETHER_ADDRESS;
		let amountGive = ether(1);
		beforeEach(async() =>{
			tokenGet = token.address;
			await exchange.depositEther({ from: user1, value: amountGive});
			await exchange.makeOrder(tokenGet, amountGet, tokenGive, amountGive, {from: user1});

			await token.transfer(user2, tokens(100), {from: deployer});
			await token.approve(exchange.address, tokens(2), {from: user2});
			await exchange.depositToken(tokenGet, tokens(2), {from: user2});
		});


		describe('filling orders', async () =>{
			let result;
			
			describe('success', ()=> {
				beforeEach(async () =>{
					result = await exchange.fillOrder('1', {from:user2});
				});

				it ('execute the trade & charge fees', async ()=> {
					let balance;
					balance = await exchange.balanceOf(tokenGet, user1);
					balance.toString().should.equal(tokens(1).toString(), "user1 received tokens");
					
					balance = await exchange.balanceOf(ETHER_ADDRESS, user2);
					balance.toString().should.equal(ether(1).toString(), "user2 received ether");

					balance = await exchange.balanceOf(ETHER_ADDRESS, user1);
					balance.toString().should.equal('0', "user1 ether deducted");

					balance = await exchange.balanceOf(tokenGet, user2);
					balance.toString().should.equal(tokens(0.9).toString(), "user2 tokens deducted with fee applied");

					balance = await exchange.balanceOf(tokenGet, feeAccount);
					balance.toString().should.equal(tokens(0.1).toString(), "feeAccount received fee");
				});

				it ('updates filled orders', async () =>{
					const orderFilled = await exchange.orderFilled(1);
					orderFilled.should.equal(true);
				});

				it('emits a trade event', async () => {
					const log = result.logs[0];
					log.event.should.eq('Trade');
					const event = log.args;
					event.id.toString().should.equal('1', 'id is correct');
					event.user.should.equal(user1, 'user is correct');
					event.tokenGet.should.equal(tokenGet, 'tokenGet is correct');
					event.amountGet.toString().should.equal(amountGet.toString(), 'amountGet is correct');
					event.tokenGive.should.equal(tokenGive, 'tokenGive is correct');
					event.amountGive.toString().should.equal(amountGive.toString(), 'amountGive is correct');
					event.userFill.should.equal(user2, 'userFill is correct');
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
				});
				
			});

			describe('failure', ()=> {
				it ('reject invalid order ids', async ()=> {
					const invalidOrderId = 99999;
					await exchange.fillOrder(invalidOrderId, {from:user2}).should.be.rejectedWith(EVM_REVERT);

				});
				
				it ('rejects already filled orders', async ()=> {
					await exchange.fillOrder(1, {from:user2}).should.be.fulfilled;
					await exchange.fillOrder(1, {from: user2}).should.be.rejectedWith(EVM_REVERT);
				});

				it ('rejects canceled orders', async() =>{
					await exchange.cancelOrder('1', {from: user1}).should.be.fulfilled;
					await exchange.fillOrder(1, {from: user2}).should.be.rejectedWith(EVM_REVERT);
				});
			});
			
		});


		describe('canceling orders', async () =>{
			let result;
			
			describe('success', ()=> {
				beforeEach(async () =>{
					result = await exchange.cancelOrder('1', {from:user1});
				});
				it ('updates canceled orders', async ()=> {
					const orderCanceled = await exchange.orderCanceled(1);
					orderCanceled.should.equal(true);
				});

				it('emits an cancel event', async () => {
					const log = result.logs[0];
					log.event.should.eq('Cancel');
					const event = log.args;
					event.id.toString().should.equal('1', 'id is correct');
					event.user.should.equal(user1, 'user is correct');
					event.tokenGet.should.equal(tokenGet, 'tokenGet is correct');
					event.amountGet.toString().should.equal(amountGet.toString(), 'amountGet is correct');
					event.tokenGive.should.equal(tokenGive, 'tokenGive is correct');
					event.amountGive.toString().should.equal(amountGive.toString(), 'amountGive is correct');
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
				});
			});

			describe('failure', ()=> {
				it ('order not existing', async ()=> {
					const invalidOrderId = 99999;
					await exchange.cancelOrder(invalidOrderId, {from: user1}).should.be.rejectedWith(EVM_REVERT);
				});
				it ('rejects unauthorized cancelations', async ()=> {
					await exchange.cancelOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT);
				});
			});
			
		});

	});

})