pragma solidity ^0.5.0;
import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Exchange {
    using SafeMath for uint;
	address public feeAccount;
	uint256 public feePercent;

	address constant ETHER = address(0);

	mapping(address => mapping(address => uint256)) public tokens;
	mapping(uint256 => _Order) public orders;
	mapping(uint256 => bool) public orderCanceled;
	mapping(uint256 => bool) public orderFilled;

	uint256 public orderCount;


	//Events
	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdraw(address token, address user, uint256 amount, uint256 balance);
	event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
	event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
	event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address userFill, uint256 timestamp);
	
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
		require(_token != ETHER,"manueeeeeeeeeeeeeeeeeeeeeee");
		address _sender = msg.sender;
		require(Token(_token).transferFrom(_sender, address(this), _amount),"not possible");
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
		address _sender = msg.sender;
		orderCount = orderCount.add(1);
		orders[orderCount] = _Order(orderCount, _sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
		emit Order(orderCount, _sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
	}

	function cancelOrder(uint256 _id) public {
		address _sender = msg.sender;
		_Order storage _order = orders[_id];
		require(_order.user == _sender);
		require(_order.id == _id);
		orderCanceled[_id] = true;
		emit Cancel(orderCount, _sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, _order.timestamp);
	}

	function fillOrder(uint256 _id) public{
		require(_id > 0 && _id <= orderCount);
		require(!orderFilled[_id]);
		require(!orderCanceled[_id]);
		_Order storage _order = orders[_id];
		orderFilled[_order.id] = true;
		_trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
	}

	function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal{
		address _sender = msg.sender;
		uint256 _feeAmount = _amountGive.mul(feePercent).div(100);
		//require(balanceOf(_order.tokenGet, _sender) > Token(_order.tokenGet).getBalance);
		tokens[_tokenGet][_sender] = tokens[_tokenGet][_sender].sub(_amountGet.add(_feeAmount));
		tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);
		tokens[_tokenGive][_sender] = tokens[_tokenGive][_sender].add(_amountGive);
		tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
		emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, _sender, now);
	}
	
}

