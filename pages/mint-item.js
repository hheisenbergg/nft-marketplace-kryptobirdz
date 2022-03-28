import {ethers} from 'ethers'
import {useState} from 'react'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import {create as ipfsHttpClient} from 'ipfs-http-client'

//getting the address's from config.js
import { nftaddress, nftmarketaddress } from '../config'

//getting the contracts
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'

//here we are going to set our ipfs up to host our nft data 

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function MintItem() {
    const [fileUrl , setFileUrl] = useState(null) // there is no file data in the starting
    const [formInput , updateFormInput] = useState({price: '' , name: '' , description: ''})
    const router = useRouter()

    //setting up a function that wroks when we update files in our forms while adding
    //nft images
    async function onChange(e) {
        const file = e.target.files[0]
        try{
            //bringing in the file and storing the added file by the user
        const added = await client.add(
            file , {
                progress : (prog) => console.log(`recieved: ${prog}`)
            }
        )
        //setting the url for the added file dynamically
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        setFileUrl(url)
        }catch(error) {
            console.log('Error uploading Files' , error)
        }

    }

    //function for creating a market
    async function createMarket() {
        const {name , description , price} = formInput
        //if any of these variale is not present then return
        if(!name || !description || !price || !fileUrl) return

        //uploading metadata to IPFS
        const data = JSON.stringify({
            name , description , image: fileUrl
        })
        try{
        const added = await client.add(data)
        //setting the url for the added file dynamically
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        //running a function that will create a sale and pass in the url
        creasteSale(url)
        }catch(error) {
            console.log('Error uploading Files' , error)
        }

    }

    //Main OBJ: create the items and listing the items for sale on the market
    async function creasteSale(url) {
     const web3Modal = new Web3Modal()
     const connection = await web3Modal.connect() // connecting to Wallet
     const provider=new ethers.providers.Web3Provider(connection)
     const signer = provider.getSigner()

     //creating a Token here
     let contract = new ethers.Contract(nftaddress , NFT.abi , signer)
     let transaction = await contract.mintToken(url) // calling minting function from NFT contract
     let tx = await transaction.wait()
     let event = tx.events[0]
     let value=event.args[2]
     let tokenId = value.toNumber()
     const price = ethers.utils.parseUnits(formInput.price , 'ether')

     //list the items for sale
     contract = new ethers.Contract(nftmarketaddress , KBMarket.abi , signer)
     let listingPrice = await contract.getListingPrice()
     listingPrice = listingPrice.toString()

     transaction = await contract.makeMarketItem(nftaddress , tokenId , price , {value: listingPrice})
     await transaction.wait()
     router.push('./')
     
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
             <input
             placeholder='Asset Name'
             className='mt-8 border rounded p-4'
             onChange={e => updateFormInput({...formInput , name: e.target.value})}
             />
              <textarea
             placeholder='Asset Description'
             className='mt-2 border rounded p-4'
             onChange={e => updateFormInput({...formInput , description: e.target.value})}
             />
              <input
             placeholder='Asset Price in Eth'
             className='mt-2 border rounded p-4'
             onChange={e => updateFormInput({...formInput , price: e.target.value})}
             />
              <input
             type='file'
             name='Asset'
             className='mt-4'
             onChange={onChange} // calling the onChange function
             /> {
                fileUrl && (
                    <img className='rounded mt-4' width='350px' src={fileUrl}/>
                )
             }
             <button onClick={createMarket} //calling the create market function to add the data
             className='font-bold mt-4 bg-purple-500 text-white rounded p-4 shadow-lg'
             >
                 Mint NFT
             </button>
            </div>
        </div>
    )


}