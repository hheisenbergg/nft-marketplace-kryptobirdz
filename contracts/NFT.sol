//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

//we will bring the openzepplin ERC721 NFT fUNCTIONALITY

import '@openzeppelin/contracts/token/ERC721/ERC721.sol' ;
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol' ; // inheriting ERC721 contract from this file
import '@openzeppelin/contracts/utils/Counters.sol' ;

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    //Counters allow us to keep a track of our tokeIds

    //address of the marketplace for NFTs to interact
    address contractAddress;

    //main-obj : give the NFT market the ability to transact with the tokens and also change the ownership as required
    //setApprovalforAll functions allows us to do the above

    //constructor is setting up our address
    constructor(address marketplaceAddress) ERC721('KryptoBirdz' , 'KBIRDZ') {
        contractAddress = marketplaceAddress;
    }

    //tokenURI on an NFT is a unique identifier of what the token "looks" like
    function mintToken(string memory tokenURI) public returns(uint) {
          _tokenIds.increment();
          uint256 newItemId = _tokenIds.current();
          _mint(msg.sender, newItemId);
          //setting the token URI : id and url
          _setTokenURI(newItemId , tokenURI);

          //give the marketplace the approval to transact between users
          //Enable or disable approval for a third party ("operator") to manage all of `msg.sender`'s assets
           setApprovalForAll(contractAddress , true);

           return newItemId; // minting the token and setting it up for sale : returning ID to do so
    }

}