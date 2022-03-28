import '../styles/globals.css'
import './app.css'
import Link from 'next/link' // allows us to create a nav bar so that we can move to different parts of the marketplace

function KryptoBirdMarketPlace({Component , pageProps}) {
  return (
    <div>
      <nav className='border-b p-6' style={{backgroundColor:'purple'}}>
        <p className='text-2xl font-bold text-white'><b>KRYPTOBIRDZ MARKETPLACE</b></p>&nbsp;
        <div className='flex mt-4 justify-center'>
          <Link href='/'>
            <a className='mr-4'>
              <b>Main MarketPlace</b>
            </a>
          </Link>
          <Link href='/mint-item'>
            <a className='mr-6'>
              <b>NFT Minting Dashboard</b>
            </a>
          </Link>
          <Link href='/my-nfts'>
            <a className='mr-6'>
              <b> NFTs Bought</b>
            </a>
          </Link>
          <Link href='/account-dashboard'>
            <a className='mr-4'>
              <b>Creator's Dashboard</b>
            </a>
          </Link>
          </div>
      </nav>
          <Component {...pageProps} />
    </div>
  )
}

export default KryptoBirdMarketPlace
