/**
 * @jsx React.DOM
 */

var csp = require('csp');

var VendingMachine = React.createClass({
  getInitialState: function() {
    return {
      coinInserted: false
    };
  },

  componentDidMount: function() {
    csp.go(this.takeOneCoin, [this.props.coins, this.props.chocolates]);
  },

  render: function() {
    var status = this.state.coinInserted ?
          "Coin inserted, but machine is now locked and requires service." :
          "Please insert coin.";
    var coinSlotDisabled = this.state.coinInserted;
    
    return (
        <div>
          <h2>Vending Machine</h2>
          <div id='status'>
            <h4>Status: {status}</h4>
          </div>
          <div id='coin-slot'>
            <button disabled={coinSlotDisabled} 
                    onClick={this.handleClick}>
              Insert Coin
            </button>
          </div>
          <div id='candy-dispenser'>
            <button disabled={true}>Take Candy</button>
          </div>
        </div>
    );
  },

  takeOneCoin: function*(coins, chocolates){
    console.log('Waiting for coin to be inserted...');
    yield csp.take(coins);
    console.log('Coin inserted!');
    this.setState({ coinInserted: true });
  },

  handleClick: function(e) {
    var coins = this.props.coins;
    csp.go(function* () { yield csp.put(coins, e); });
  }
});

React.render(
  <VendingMachine coins={csp.chan()} chocolates={csp.chan()}/>,
  document.getElementById('vending-machine')
);
