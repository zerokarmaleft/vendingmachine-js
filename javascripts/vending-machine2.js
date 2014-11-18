/**
 * @jsx React.DOM
 */

var csp = require('csp');

var VendingMachine = React.createClass({
  getInitialState: function() {
    return {
      coinInserted: false,
      disabled: false
    };
  },

  componentDidMount: function() {
    csp.go(this.serveTwoCustomers, [this.props.coins, this.props.chocolates]);
  },

  render: function() {
    var status = this.state.coinInserted ?
          "Coin inserted. Candy dispensed." :
          "Please insert coin.";
    status = this.state.disabled ?
      "Machine served two customers; it is now locked and requires service." :
      status;

    var candyTaken = !this.state.coinInserted;

    return (
        <div>
          <h2>Vending Machine</h2>
          <div id='status'>
           <h4>Status: {status}</h4>
          </div>
          <div id='coin-slot'>
            <button disabled={this.state.disabled || this.state.coinInserted} onClick={this.onCoinInserted}>Insert Coin</button>
          </div>
          <div id='candy-dispenser'>
            <button disabled={this.state.disabled || candyTaken} onClick={this.onCandyTaken}>Take Candy</button>
          </div>
        </div>
    );
  },

  serveTwoCustomers: function*(coins, chocolates){
    for (var i = 0; i < 2; i++) {
      console.log('[Customer #' + i + '] Waiting for coin to be inserted...');
      yield csp.take(coins);
      console.log('[Customer #' + i + '] Coin inserted!');
      this.setState({ coinInserted: true });
      console.log('[Customer #' + i + '] Waiting for customer to take chocolate...');
      yield csp.put(chocolates, "chocolate");
      this.setState({ coinInserted: false });
    }

    this.setState({ disabled: true });
  },

  onCoinInserted: function(e) {
    var coins = this.props.coins;

    csp.go(function* () {
      yield csp.put(coins, e);
    });
  },

  onCandyTaken: function(e) {
    var chocolates = this.props.chocolates;

    csp.go(function* () {
      var candy = yield csp.take(chocolates);
      console.log('Yay! Got a: ' + candy);
    });
  }
});

React.render(
    <VendingMachine coins={csp.chan()} chocolates={csp.chan()}/>,
  document.getElementById('vending-machine')
);
