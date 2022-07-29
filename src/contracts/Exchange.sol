pragma solidity ^0.5.0;
import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
// TODO

// [X]Set the fee
// [X]Deposit Ether
// [X]Withdraw Ether
// [X]Deposit tokens
// [X]Withdraw tokens
// [X]Check balances
// [X]Make order
// [X]Cancel order
// [ ]Fill order
// [ ]Charge fees

contract Exchange {
    using SafeMath for uint;
	address public feeAccount;
	uint256 public feePercent;

	address constant ETHER = address(0);

	mapping(address => mapping(address => uint256)) public tokens;
	mapping(uint256 => _Order) public orders;
	mapping(uint256 => bool) public orderCanceled;

	uint256 public orderCount;


	//Events
	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdraw(address token, address user, uint256 amount, uint256 balance);
	event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
	event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
	
	struct _Order{
		uint256 id;
		address user;
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint256 timestamp;
	}

	//a way to store the order
	//add the order to storage
	constructor(address _feeAccount, uint256 _feePercent) public{
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	function() external{
		revert();
	}

	function depositEther() payable public {
		address _sender = msg.sender;
		uint256 _value = msg.value;
		tokens[ETHER][_sender] = tokens[ETHER][_sender].add(_value);
		emit Deposit(ETHER, _sender, _value, tokens[ETHER][_sender]);
	}

	function withdrawEther(uint _amount) public{
		address payable _sender = msg.sender;
		require(tokens[ETHER][_sender] >= _amount);
		tokens[ETHER][_sender] = tokens[ETHER][_sender].sub(_amount);
		_sender.transfer(_amount);
		emit Withdraw(ETHER, _sender, _amount, tokens[ETHER][_sender]);
	}

	function depositToken(address _token, uint256 _amount) public{
		require(_token != ETHER);
		address _sender = msg.sender;
		require(Token(_token).transferFrom(_sender, address(this), _amount));
		tokens[_token][_sender] = tokens[_token][_sender].add(_amount);
		emit Deposit(_token, _sender, _amount, tokens[_token][_sender]);
	}

	function withdrawToken(address _token, uint256 _amount) public{
		address payable _sender = msg.sender;
		require(_token != ETHER);
		require(tokens[_token][_sender] >= _amount);
		tokens[_token][_sender] = tokens[_token][_sender].sub(_amount);
		require(Token(_token).transfer(_sender,_amount));
		emit Withdraw(_token, _sender, _amount, tokens[_token][_sender]);

	}

	function balanceOf(address _token, address _user) public view returns(uint256){
		return tokens[_token][_user];
	}

	function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
		orderCount = orderCount.add(1);
		orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
	}

	function cancelOrder(uint256 _id) public {
		_Order storage _order = orders[_id];
		require(_order.user == msg.sender);
		require(_order.id == _id);
		orderCanceled[_id] = true;
		emit Cancel(orderCount, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, _order.timestamp);
	}
}

