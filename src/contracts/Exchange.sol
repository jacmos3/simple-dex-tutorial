pragma solidity ^0.5.0;
import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
// TODO

// [X]Set the fee
// [ ]Deposit Ether
// [ ]Withdraw Ether
// [ ]Deposit tokens
// [ ]Withdraw tokens
// [ ]Check balances
// [ ]Make order
// [ ]Cancel order
// [ ]Fill order
// [ ]Charge fees

contract Exchange {
    using SafeMath for uint;
	address public feeAccount;
	uint256 public feePercent;

	address constant ETHER = address(0);

	mapping(address => mapping(address => uint256)) public tokens;

	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdraw(address token, address user, uint256 amount, uint256 balance);
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
}

