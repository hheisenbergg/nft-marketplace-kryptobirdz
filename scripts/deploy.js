const hre = require("hardhat");
const fs = require('fs')

async function main() {
  
  //deploying the KBMarket contract
  const  NFTMarket = await hre.ethers.getContractFactory("KBMarket");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);

  //deploying the NFT contract
  const  NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address); // marketplace address is required by the NFT contract
  await nft.deployed();
  console.log("NFT contract deployed to:", nft.address);

  let config = `
  export const nftmarketaddress = ${nftMarket.address}
  export const nftaddress = ${nft.address}`

  //exporting the  address's to config.js file
  let data = JSON.stringify(config) 
  fs.writeFileSync('config.js' , JSON.parse(data))
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
