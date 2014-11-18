/**
 * @jsx React.DOM
 */

var csp = require('csp');

var VendingMachine = React.createClass({
  getInitialState: function() {
    return {
      coinsInserted: 0,
      chocolatesDispensed: 0,
      toffeesDispensed: 0
    };
  },

  componentDidMount: function() {
    csp.go(this.serveCustomers,  [this.props.coins, this.props.chocolates, this.props.toffees]);
  },

  render: function() {
    return (
        <div>
          <h2>Vending Machine</h2>
          <div id='status'>
            <h4>Status</h4>
            <ul>
              <li>Coins inserted: {this.state.coinsInserted}</li>
              <li>Chocolates dispensed: {this.state.chocolatesDispensed}</li>
              <li>Toffees dispensed: {this.state.toffeesDispensed}</li>
            </ul>
          </div>
        </div>
    );
  },

  serveCustomers: function*(coins, chocolates, toffees){
    while (true) {
      console.log("Waiting for customer to insert coin...");
      yield csp.take(coins);
      this.setState({ coinsInserted: this.state.coinsInserted + 1 });
      console.log("Coin inserted!");

      console.log("Waiting for customer to retrieve candy...");
      var candy = yield csp.alts([[chocolates, 'chocolate'], [toffees, 'toffee']]);
      if (candy.channel === chocolates) {
        this.setState({ chocolatesDispensed: this.state.chocolatesDispensed + 1 });
      } else if (candy.channel === toffees) {
        this.setState({ toffeesDispensed: this.state.toffeesDispensed + 1 });
      }
      console.log("Candy retrieved!");
    }
  }
});

var VendingMachineSim = React.createClass({
  componentDidMount: function() {
    var coins      = this.props.coins,
        chocolates = this.props.chocolates,
        toffees    = this.props.toffees;

    for (var i = 0; i < this.props.size; i++) {
      console.log('[Customer ' + i + ']: getting in line.');
      csp.go(this.customer, ['[Customer ' + i + ']', coins, chocolates, toffees]);
    }
  },
  
  render: function() {
    return (
        <div id='vending-machine-sim'>
          <VendingMachine coins      = {this.props.coins}
                          chocolates = {this.props.chocolates}
                          toffees    = {this.props.toffees} />
        </div>
    );
  },

  customer: function*(name, coins, chocolates, toffees) {
    // wait for a random amount of time
    yield csp.take(csp.timeout(Math.random() * 5000));
  
    // make a random candy selection
    var candies = (Math.random() > 0.5) ? chocolates : toffees;

    console.log(name + ': inserting coin...');
    yield csp.put(coins, 1);
    console.log(name + ': coin inserted!');

    console.log(name + ': retrieving candy...');
    var candy = yield csp.take(candies);
    console.log(name + ': got a ' + candy + '.');
  }
});

React.render(
  <VendingMachineSim coins      = {csp.chan()} 
                     chocolates = {csp.chan()} 
                     toffees    = {csp.chan()}
                     size       = {100} />,
  document.getElementById('vending-machine')
);
