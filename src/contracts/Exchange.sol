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

	event Deposit(address indexed token, address indexed user, uint256 amount, uint256 indexed balance);
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

	function depositToken(address _token, uint256 _amount) public{
		require(_token != ETHER);
		address _sender = msg.sender;
		require(Token(_token).transferFrom(_sender, address(this), _amount));
		tokens[_token][_sender] = tokens[_token][_sender].add(_amount);
		emit Deposit(_token, _sender, _amount, tokens[_token][_sender]);
	}
}

