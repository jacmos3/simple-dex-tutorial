import {tokens,EVM_REVERT, INVALID_ADDRESS,ETHER_ADDRESS,ether} from './helpers';
const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token');
require('chai')
	.use(require('chai-as-promised'))
	.should();

contract('Exchange',([deployer, feeAccount, user1]) => {
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
})
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
			event.balance.toString().should.equal(tokens(10).toString(), 'amount is correct');
		});

	})
	describe('failure', () =>{
		it('fails when no tokens are approved', async () => {
			await exchange.depositToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT);

		});

		it('rejects Ether deposit using depositToken', async () => {
			await exchange.depositToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT);

		});
	})
	
		
	});

})