import React, {Component} from 'react';
import {connect} from 'react-redux';
import {accountSelector} from '../store/selectors';

class Navbar extends Component{
  render(){
    return(
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <a className="navbar-brand" href="#">Dapp token Exchange</a>
         <div className="collapse navbar-collapse" id="navbarText">
          <span className="ml-auto navbar-text">
            <a 
              className="nav-link small" 
              href= {`https://etherscan.io/address/${this.props.account}`}
              target = "blank"
              rel ="noopener noreferrer"
            >
              {this.props.account}
            </a>
          </span>
        </div>
      </nav>
    )
  }
}

function mapStateToProps(state){
  console.log("account?", accountSelector(state));
  return{
    account:accountSelector(state)
  }
}
export default connect(mapStateToProps)(Navbar);