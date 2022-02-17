const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonic="Enter mnemonic here";
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "Enter path for ropsten network",1)
      },
      network_id: 3
    }
  },
  compilers:{
    solc:{
      version:"^0.8.0"
    }
  }
};