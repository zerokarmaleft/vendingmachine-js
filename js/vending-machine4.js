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
    csp.go(this.serveCustomers, [this.props.coins, this.props.chocolates, this.props.toffees]);
  },

  render: function() {
    var status = this.state.coinInserted ?
          "Coin inserted. Candy dispensed.":
          "Please insert coin.";

    var coinSlotDisabled        = this.state.coinInserted,
        candyDispensersDisabled = !this.state.coinInserted;

    return (
        <div>
          <h2>Vending Machine</h2>
          <div id='status'>
            <h4>Status: {status}</h4>
          </div>
          <div id='coin-slot'>
            <button disabled={coinSlotDisabled}
                    onClick={this.onCoinInserted}>
              Insert Coin
            </button>
          </div>
          <div id='chocolate-dispenser'>
            <button disabled={candyDispensersDisabled}
                    onClick={this.onChocolateTaken}>
              Take Chocolate
            </button>
          </div>
          <div id='toffee-dispenser'>
            <button disabled={candyDispensersDisabled}
                    onClick={this.onToffeeTaken}>
              Take Toffee
            </button>
          </div>
        </div>
    );
  },

  serveCustomers: function*(coins, chocolates, toffees){
    while (true) {
      console.log("Waiting for customer to insert coin...");
      yield csp.take(coins);
      console.log("Coin inserted!");
      this.setState({ coinInserted: true });

      console.log("Waiting for customer to retrieve candy...");
      yield csp.alts([[chocolates, 'chocolate'], [toffees, 'toffee']]);
      console.log("Candy retrieved!");
      this.setState({ coinInserted: false });
    }
  },

  onCoinInserted: function(e) {
    var coins = this.props.coins;

    csp.go(function* () {
      yield csp.put(coins, e);
    });
  },

  onChocolateTaken: function(e) {
    var chocolates = this.props.chocolates;

    csp.go(function* () {
      var candy = yield csp.take(chocolates);
      console.log('Customer says, "Yay! I got a ' + candy + '."');
    });
  },

  onToffeeTaken: function(e) {
    var toffees = this.props.toffees;

    csp.go(function* () {
      var candy = yield csp.take(toffees);
      console.log('Customer says, "Yay! I got a ' + candy + '."');
    });
  }
});

React.render(
  <VendingMachine coins      = {csp.chan()} 
                  chocolates = {csp.chan()}
                  toffees    = {csp.chan()} />,
  document.getElementById('vending-machine')
);
