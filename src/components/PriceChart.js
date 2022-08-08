import React, {Component} from 'react';
import {connect} from 'react-redux';
import Chart from 'react-apexcharts';
import Spinner from './Spinner.js';
import {chartOptions} from './PriceChartConfig.js'
import {
  priceChartLoadedSelector,
  priceChartSelector,
} from '../store/selectors';

const priceSymbol = (lastPriceChange) =>{
  const GREEN = <span className="text-success">&#9650;</span> // Green up triangle
  const RED = <span className = "text-danger">&#9660;</span> // Red down triangle
  return lastPriceChange === '+' ? GREEN : RED;
}

const showPriceChart = (priceChart) => {
  return (
    <div className= "price-chart">
      <div className= "price">
        <h4>DAPP/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}</h4>

      </div>
        <Chart options={chartOptions} series = {priceChart.series} type='candlestick' with = "100%" height="100%" />
    </div>
  )
}
class PriceChart extends Component{
  render(){
    
    return(
      <div className="vertical">
         <div className="card bg-dark text-white">
          <div className = "card-header">
            Price chart
          </div>
          <div className = "card-body">
            {this.props.priceChartLoaded ? showPriceChart(this.props.priceChart) : <Spinner />}
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state){

  console.log({
    priceChartLoaded: priceChartLoadedSelector(state),
    priceChart: priceChartSelector(state)   
  });

  return{
    priceChartLoaded: priceChartLoadedSelector(state),
    priceChart: priceChartSelector(state)   
  }
}
export default connect(mapStateToProps)(PriceChart);