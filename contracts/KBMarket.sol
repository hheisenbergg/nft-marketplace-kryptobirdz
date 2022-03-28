//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import '@openzeppelin/contracts/token/ERC721/ERC721.sol' ;
import '@openzeppelin/contracts/security/ReentrancyGuard.sol'; //security against transactions for multiple requests
import '@openzeppelin/contracts/utils/Counters.sol' ;

import 'hardhat/console.sol';

contract KBMarket is ReentrancyGuard {

    using Counters for Counters.Counter ;

    //main Obj : number of items minted , tokens not been sold yet , number of transactions 
    //total number of tokens : using tokenId 
    //arrays here need to know the length beforehand

    Counters.Counter private _tokenIds;
    Counters.Counter private _tokensSold;

    //determine who is the owner of the contract
    address payable owner;

    //charge a listing fee for the owner to make a comission
    uint256 listingPrice = 0.045 ether ; // listing price is 0.045 eth

    constructor() {
        owner = payable(msg.sender); // setting the owner
    }

    //we cannot create objects in solidity but can create structs
    struct MarketToken {
        uint itemId;
        address nftContract ;
        uint256 tokenId ;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketToken) private idToMarketToken ; // creating a mapping so that for every token item id we can get
                                                            //all the details related to it defined in the MarketToken structure

    
    event MarketTokenMinted(
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );


    //function to get the listing price
    function getListingPrice() public view returns (uint256) {
        return listingPrice ;
    }

    //Two functions required 
    //1. creating a market item and putting it up on sale
    //2. creating a market sale for buying and selling between different parties

    function makeMarketItem (
        address nftContract,
        uint tokenId,
        uint price
    )

    public payable nonReentrant {
        //nonReentrant is a modifier to prevent reentry attack

        //we need to make sure that while minting price of the nft >0
        require(price > 0 , 'Price must be atleast 1 wei');
        require(msg.value == listingPrice , 'Price must be equal to listing price');

        _tokenIds.increment(); // keeping track of tokenIds
        uint itemId = _tokenIds.current(); //setting value of current tokenId

        //function to put the token up for sale
        idToMarketToken[itemId] = MarketToken(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender), // seller
            payable(address(0)), // no owner yet
            price,
            false // not sold yet so false

        );

        //function to mint NFT ON THE MARKET PLACE
        //function transferFrom(address sender, address recipient, uint256 amount)
        IERC721(nftContract).transferFrom(msg.sender , address(this) , tokenId);

            emit MarketTokenMinted(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
      
    }

        /* Creates the sale of a marketplace item */
        /* Transfers ownership of the item, as well as funds between parties */
        function createMarketSale(
            address nftContract,
            uint itemId)
            public payable nonReentrant {
               uint price = idToMarketToken[itemId].price;
               uint tokenId = idToMarketToken[itemId].tokenId;

               require(msg.value == price , 'Please submit the listed price to continue');

               //transferring the amount to the seller
               idToMarketToken[itemId].seller.transfer(msg.value);

               //transfer the NFT TO THE BUYER
               IERC721(nftContract).transferFrom(address(this) , msg.sender , tokenId);
               idToMarketToken[itemId].owner= payable(msg.sender);
               idToMarketToken[itemId].sold = true;
               _tokensSold.increment(); // updating sold token counter

               //function transfer(address recipient, uint256 amount)
               payable(owner).transfer(listingPrice);

            } 


       //function to return all the unsold items on the marketplace : fetchMarketItems
       function fetchMarketTokens() public view returns(MarketToken[] memory) {
           uint itemCount = _tokenIds.current();
           uint unsoldItemCount = _tokenIds.current() - _tokensSold.current(); // current unsold NFTs
           uint currentIndex = 0;

           //looping of the number of items created and if the item has not been sold yet adding 
           //it to the array
           MarketToken[] memory items = new MarketToken[](unsoldItemCount); // array for storing unsold items
           for(uint i=0 ; i<itemCount ; i++) {

               //checking for items that are not sold
               if(idToMarketToken[i+1].owner == address(0)) {
                   uint currentId = i+1; // updating id
                   MarketToken storage currentItem = idToMarketToken[currentId]; // getting item from mapping
                   items[currentIndex] = currentItem; // inserting item to array
                   currentIndex += 1; // updating index
               }
           }
           
           return items ;
       }


       //function to return the nfts that the user has purchased
       function fetchMyNFTs() public view returns (MarketToken[] memory) {
           uint totalItemCount = _tokenIds.current();
           //a second counter for each individual user
           uint itemCount = 0;
           uint currentIndex = 0;

           //getting total number of nfts that have been purachased by the user on the marketplace
           for(uint i=0 ; i<totalItemCount ; i++) {

               if(idToMarketToken[i + 1].owner == msg.sender) {

                   itemCount +=1;
               }
           }
           
           MarketToken[] memory items = new MarketToken[](itemCount); // defining the array 

           //second loop for populating the array with the nfts purchased by the user
           for(uint i=0 ; i<totalItemCount ;i++) {
               if(idToMarketToken[i + 1].owner == msg.sender) {
                   uint currentId = idToMarketToken[i + 1].itemId;
                   MarketToken storage currentItem = idToMarketToken[currentId];
                   items[currentIndex] = currentItem;
                   currentIndex += 1;
               }
           }

           return items;
       }

       //function to return array of total minted nfts
       function fetchItemsCreated() public view returns(MarketToken[] memory) {
           //instead of .owner it is .seller
           uint totalItemCount = _tokenIds.current();
           uint itemCount = 0;
           uint currentIndex = 0;

           
           for(uint i=0 ; i<totalItemCount ; i++) {

               if(idToMarketToken[i + 1].seller == msg.sender) {

                   itemCount +=1;
               }
           }

           MarketToken[] memory items = new MarketToken[](itemCount);
           for(uint i=0 ; i<totalItemCount ;i++) {
               if(idToMarketToken[i + 1].seller == msg.sender) {
                   uint currentId = idToMarketToken[i + 1].itemId;
                   MarketToken storage currentItem = idToMarketToken[currentId];
                   items[currentIndex] = currentItem;
                   currentIndex += 1;
               }
           }

           return items ;

       }
    }



