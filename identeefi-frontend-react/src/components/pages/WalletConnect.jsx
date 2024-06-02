import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi'
import { arbitrum, mainnet, polygon, sepolia,bscTestnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Router from '../../components/Router'
import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '7236c984a38479e85f91b945bd9076a8'
if(!projectId){
  throw new Error("Pls provide project id")
}
// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const vanarChain = {
  id: 0x13308,
  name: 'Vanguard',
  nativeCurrency: { name: 'Vanar', symbol: 'VG', decimals: 18 },
  rpcUrls: {
    default: { 
      http: ['https://rpc-vanguard.vanarchain.com']},
  },
  blockExplorers: {
    default: { name: 'Vanguard Explorer', url: 'https://explorer-vanguard.vanarchain.com' },
  },
}

const chains = [mainnet, arbitrum,polygon,sepolia,vanarChain,bscTestnet]
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableEmail: true
 // Optional - Override createConfig parameters
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  allowUnsupportedChain: true,
  themeMode:'dark',
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

function WalletConnect() {
const {isConnected,address,status} =  useAccount({
  config
});

// const  {disconnect,} = useDisconnect({config});
// useEffect(()=>{
// console.log("account status:", isConnected);
// console.log(" address: ", address);
// console.log("status",status)

// },[isConnected,address,status])
// console.log(status)

  // const [isConnected , setIsConnected] = useState(false);
  // const {connect,connectors,error, isPending,} = useConnect({
  //   onSuccess:()=>{
  //     onConnect(true);
  //   }
  // });
  // useEffect(()=>{
  //   if(error){
  //     console.error("Error connecting wallet:",error);
  //   }
  // })

  // const handleConnect = () => {
  //   if (connectors.length > 0) {
  //     connect({ connector: connectors[0] });
  //   } else {
  //     console.log("No connectors available");
  //   }
  // };
const handleClick =()=>{
  // await new Promise(resolve => setTimeout(resolve, 0));

  console.log("handle status",status,isConnected)
}
  return (


    <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
   
      <w3m-button onClick={handleClick} size='md'/>
    </QueryClientProvider>
  </WagmiProvider>
  );
}

export default WalletConnect;
