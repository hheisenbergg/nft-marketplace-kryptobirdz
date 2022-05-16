//here we want to load the users nfts i.e the mynfts page 

import {ethers} from 'ethers'
import { useEffect , useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

//getting the address's from config.js
import { nftaddress, nftmarketaddress } from '../config'

//getting the contracts
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'

export default function MyAssets() {
  const [nfts , setNFts] = useState([]) // array of nfts
  const [loadingState , setLoadingState] = useState('not-loaded') // loading state for if something needs to be loaded
  
  useEffect(()=>{
   loadNFTs()
  }, [])

  async function loadNFTs() {
    // hooking up the signer to the msg.sender and displaying its nfts- what we want to load
    
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    
    const tokenContract = new ethers.Contract(nftaddress , NFT.abi , provider) //nft contract
    const marketContract = new ethers.Contract(nftmarketaddress , KBMarket.abi , signer) // marketplace contract
    const data = await marketContract.fetchMyNFTs() // getting all the nfts of the msg.sender from KBMarket contract

    //traversing through the map
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      
      //we want to get the token metadata
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString() , 'ether')
      //item array
      let item = {
        price,
        tokenId : i.tokenId.toNumber(),
        seller : i.seller,
        owner : i.owner,
        image : meta.data.image,
        name : meta.data.name,
        description : meta.data.description
      }
      return item
    }))

    setNFts(items) // setting the NFTs to the item array
    setLoadingState('loaded') // setting the loading state to loaded as NFTs are now loaded

  }

  
  if(loadingState === 'loaded' && !nfts.length) return (<h1
    className='px-20 py-7 text-4xl'><b>You have not bought any NFTs from this marketplace yet :(</b></h1>)
 
  return (
    <div className='flex justify-start'>
          <div className='px-4' style={{maxWidth : '1400px'}}>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20 pt-4'>
            {
              nfts.map((nft , i)=>(
                <div key={i} classname='border shadow rounded-x1 overflow-hidden'>
                  <img src={nft.image}/>
                  <div className='p-4'>
                    <p style={{height:'64px'}} className='text-3x1 font-semibold'>{nft.name}</p>
                    <div style={{height: '60px' , overflow: 'auto'}}>
                      <p className='text-black-400'><b>{nft.description}</b></p>
                      </div>
                    </div>
                    <div className='p-4 bg-black'>
                     <p className='text-3x-1 mb-4 font-bold text-white'>{nft.price} ETH</p>
                    </div>
                </div>
              ))
            }
            </div>
            </div>
    </div>
  )
}
