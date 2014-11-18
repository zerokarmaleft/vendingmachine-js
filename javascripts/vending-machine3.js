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
    csp.go(this.serveCustomers, [this.props.coins, this.props.chocolates]);
  },

  render: function() {
    var status = this.state.coinInserted ?
        "Coin inserted. Candy dispensed." :
        "Please insert coin.";

    var coinSlotDisabled       = this.state.coinInserted,
        candyDispenserDisabled = !this.state.coinInserted;
    
    return (
        <div>
          <h2>Vending Machine</h2>
          <div>
            <h4>Status: {status}</h4>
          </div>
          <div id='coin-slot'>
            <button disabled={coinSlotDisabled}
                    onClick={this.onCoinInserted}>
              Insert Coin
            </button>
          </div>
          <div id='candy-dispenser'>
            <button disabled={candyDispenserDisabled}
                    onClick={this.onCandyTaken}>
              Take Candy
            </button>
          </div>
        </div>
    );
  },

  serveCustomers: function*(coins, chocolates){
    while (true) {
      console.log("Waiting for customer to insert coin...");
      yield csp.take(coins);
      console.log("Coin inserted!");
      this.setState({ coinInserted: true });

      console.log("Waiting for customer to retrieve candy...");
      yield csp.put(chocolates, "chocolate");
      console.log("Chocolate retrieved!");
      this.setState({ coinInserted: false });
    }
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
