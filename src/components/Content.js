import React, {Component} from 'react';
import {connect} from 'react-redux';
import {exchangeSelector} from '../store/selectors';
import {loadAllOrders} from '../store/interactions';
import Trades from './Trades.js';
import OrderBook from './OrderBook.js';

class Content extends Component{
  componentDidMount() {
    this.loadBlockchainData(this.props.exchange, this.props.dispatch)
  }

  async loadBlockchainData(exchange, dispatch) {
    await loadAllOrders(exchange, dispatch);
  }

    render(){
    return(
      <div className="content">
        <div className="vertical-split">
          <div className="card bg-dark text-white">
            <div className="card-header">
              Card Title
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
          <div className="card bg-dark text-white">
            <div className="card-header">
              Card Title
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
        </div>
        <OrderBook />
        <div className="vertical-split">
          <div className="card bg-dark text-white">
            <div className="card-header">
              Card Title
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
          <div className="card bg-dark text-white">
            <div className="card-header">
              Card Title
            </div>
            <div className="card-body">
              <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card content.</p>
              <a href="/#" className="card-link">Card link</a>
            </div>
          </div>
        </div>
         <Trades />
      </div>
    )
  }
}

function mapStateToProps(state){
  console.log("exchange?", exchangeSelector(state));
  return{
    exchange:exchangeSelector(state)
    //TODO: Fill me in...
  }
}
export default connect(mapStateToProps)(Content);