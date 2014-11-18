/**
 * @jsx React.DOM
 */

var csp = require('csp');

var VendingMachine = React.createClass({
  getInitialState: function() {
    return {
      coinsInserted:       0,
      chocolatesDispensed: 0,
      toffeesDispensed:    0
    };
  },

  componentDidMount: function() {
    csp.go(this.serveCustomers,  [this.props.coins, this.props.chocolates, this.props.toffees]);
  },

  render: function() {
    return (
        <div>
          <h2>Vending Machine ({this.props.name})</h2>
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
      this.setState({ coinInserted: true });

      console.log("Waiting for customer to retrieve candy...");
      var candy = yield csp.alts([[chocolates, 'chocolate'], [toffees, 'toffee']]);
      if (candy.channel === chocolates) {
        this.setState({ chocolatesDispensed: this.state.chocolatesDispensed + 1 });
      } else if (candy.channel === toffees) {
        this.setState({ toffeesDispensed: this.state.toffeesDispensed + 1 });
      }
      console.log("Candy retrieved!");
      this.setState({ coinInserted: false });
    }
  }
});

var VendingMachineGrid = React.createClass({
  render: function() {
    var gridSize   = this.props.gridSize,
        coins      = this.props.coins,
        chocolates = this.props.chocolates,
        toffees    = this.props.toffees;
    
    var vms = _.chain(_.range(gridSize))
          .map(function(vm, n) {
            return (
                <tr>
                  <td>
                    <VendingMachine name       = {'vm' + n}
                                    coins      = {coins[n]}
                                    chocolates = {chocolates[n]}
                                    toffees    = {toffees[n]} />
                  </td>
                </tr>
            );
          });
    
    return (
        <table>
          <thead>
          </thead>
          <tbody>
            {vms}
          </tbody>
        </table>
    );
  }
});

var VendingMachineSim = React.createClass({
  componentDidMount: function() {
    var coins      = this.props.coins,
        chocolates = this.props.chocolates,
        toffees    = this.props.toffees;

    for (var i = 0; i < this.props.gridSize; i++) {
      for (var j = 0; j < this.props.numCustomers; j++) {
        var id = (i+1) * (j+1);
        console.log('[Customer ' + id + ']: getting in line.');
        csp.go(this.customer, ['[Customer ' + id + ']', 
                               coins[i], chocolates[i], toffees[i]]);
      }
    }
  },
  
  render: function() {
    return (
        <VendingMachineGrid gridSize   = {this.props.gridSize}
                            coins      = {this.props.coins}
                            chocolates = {this.props.chocolates}
                            toffees    = {this.props.toffees} />
    );
  },

  customer: function*(name, coins, chocolates, toffees) {
    // wait for a random amount of time
    yield csp.take(csp.timeout(Math.random() * 60000));
  
    // make a random candy selection
    var candies = (Math.random() > 0.5) ? chocolates : toffees;

    console.log(name + ': inserting coin...');
    yield csp.put(coins, 1);
    console.log(name + ': coin inserted!');

    yield csp.take(csp.timeout(Math.random() * 1000));

    console.log(name + ': retrieving candy...');
    var candy = yield csp.take(candies);
    console.log(name + ': got a ' + candy + '.');
  }
});

var gridSize = 4;
var numCustomers = 2500;

function makeChannels(n) {
  var channels = [];

  for (var i = 0; i < n; i++) {
//    channels.push(csp.chan());
    channels.push(csp.chan(100));
  }

  return channels;
}

React.render(
    <VendingMachineSim gridSize     = {gridSize} 
                       numCustomers = {numCustomers}
                       coins        = {makeChannels(gridSize)}
                       chocolates   = {makeChannels(gridSize)}
                       toffees      = {makeChannels(gridSize)}
    />,
  document.getElementById('vending-machine')
);
