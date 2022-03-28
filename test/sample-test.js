const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KBMarket", function () {
  it("Should mint and trade NFTs", async function () {
    //tests to receive contract address
    const Market = await ethers.getContractFactory('KBMarket') // getting the KBmarket contract
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    const NFT = await ethers.getContractFactory('NFT') // getting the NFT contract
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    //tests to recieve listing price and auction price
    let listingPrice = await market.getListingPrice() // getting the lsiting price
    listingPrice = listingPrice.toString() // converting it to string

    const auctionPrice = ethers.utils.parseUnits('100' , 'ether') // setting up the auction price

    //tests for minting : minting 2 tokens using mint function from NFT contract
    await nft.mintToken('https-t1')
    await nft.mintToken('https-t2')

     //tests for creating nft in the marketplace
    await market.makeMarketItem(nftContractAddress , 1 , auctionPrice , {value : listingPrice})
    await market.makeMarketItem(nftContractAddress , 2 , auctionPrice , {value : listingPrice})

    const [_ , buyerAddress] = await ethers.getSigners()
    
    //tests for creating a market sale with address , id and price
    await market.connect(buyerAddress).createMarketSale(nftContractAddress , 1 , {
      value : auctionPrice
    })

    //tests for getting the unosld items on the marketplace
    let items = await market.fetchMarketTokens()

    //fetching the ietemms on by one 
    items = await Promise.all(items.map(async i => {

      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item;
    }))

    //test out all the items
    console.log('items' , items)

  });
});
