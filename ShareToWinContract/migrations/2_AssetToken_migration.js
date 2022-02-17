const assetTokenMigration = artifacts.require("AssetToken");

module.exports = async function (deployer) {
  await deployer.deploy(assetTokenMigration);
  const instance = await assetTokenMigration.deployed();

  //later add functionality to retreive the deployed contract address and make it available to the rest api project
};