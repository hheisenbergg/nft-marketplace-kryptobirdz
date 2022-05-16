import {ethers} from 'ethers'
import { useEffect , useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

//getting the address's from config.js
import { nftaddress, nftmarketaddress } from '../config'

//getting the contracts
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'

export default function Home() {
  const [nfts , setNFts] = useState([]) // state for setting our nfts
  const [loadingState , setLoadingState] = useState('not-loaded') // loading state for if something needs to be loaded
  
  useEffect(()=>{
   loadNFTs()
  }, [])

  async function loadNFTs() {
    //provider , tokenContract , marketContract , data for our marketItems - what we want to load
    
    //providers are required for to interacting with a contract on the mainnet
    //The JSON-RPC API is a popular method for interacting with Ethereum
    const provider = new ethers.providers.JsonRpcProvider() 

    //syntax - new ethers.Contract( address , abi , Provider )
    //contract is an abstraction of the code deployeed to the blockchain
    const tokenContract = new ethers.Contract(nftaddress , NFT.abi , provider) //nft contract
    const marketContract = new ethers.Contract(nftmarketaddress , KBMarket.abi , provider) // marketplace contract
    const data = await marketContract.fetchMarketTokens() // getting all the nfts on the marketplace

    //traversing through the map for each nfts in the item array stored in the data variable
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId) // getting the tokenUri of the nft
      
      //we want to get the token metadata
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString() , 'ether') // getting the price and converting to String
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

  //function to buy nfts 
  async function buyNFT(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect() // connecting to metamask wallet
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress , KBMarket.abi , signer)

    const price = ethers.utils.parseUnits(nft.price.toString() , 'ether')
    //running the transaction (making a sale)by calling createMarketSale function
    const transaction = await contract.createMarketSale(nftaddress , nft.tokenId , {
      value : price
    })

    await transaction.wait()
    loadNFTs()
  }
  //checking if no nfts are left on the Marketplace dislaying Msg
  if(loadingState === 'loaded' && !nfts.length) return (<h1
    className='px-50 py-7 text-4xl'><b>OOPSS!!! No NFTs currently in the MarketPlace</b></h1>)
 
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
                     <button className='w-full bg-purple-500 text-white font-bold py-3 px-12 rounded'
                     onClick={()=> buyNFT(nft)}>BUY
                     </button>
                    </div>
                </div>
              ))
            }
            </div>
            </div>
    </div>
  )
}
