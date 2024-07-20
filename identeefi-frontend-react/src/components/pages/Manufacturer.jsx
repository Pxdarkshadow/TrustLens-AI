import '../../css/Role.css'
import { Button } from '../Button';
import { createWeb3Modal, useWeb3Modal } from '@web3modal/wagmi/react'

import { Link ,useNavigate} from 'react-router-dom';
import { useState, useEffect ,FC, useCallback} from 'react';
import { Box, Button as Btn, styled } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import WalletButtons from '../../components/WalletButtons/';
import  ButtonContainer  from './styles.jsx';
import { ConnectionType } from '../../connection/'
import WalletConnect from './WalletConnect';
import { arbitrum, mainnet, polygon, sepolia,bscTestnet } from 'wagmi/chains'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'


// import Web3ModalProvider from '@components/wagmi';
import { useAccount } from 'wagmi';

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

// import { useWeb3React } from '@web3-react/core'

// import { getConnection } from 'connection';
const getEthereumObject = () => window.ethereum

const findMetaMaskAccount = async () => {
    try {
        const ethereum = getEthereumObject();
        /*
         * First make sure we have access to the Ethereum object.
         */
        if (!ethereum) {
            console.error("Make sure you have Metamask!");
            return null;
        }

        console.log("We have the Ethereum object", ethereum);
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log("accounts:", accounts)

        if (accounts.length !== 0) {
            const account = accounts[0];//connected account
            console.log("Found an authorized account:", account);
            return account;
        } else {
            console.error("No authorized account found");
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

const Manufacturer = () => {
    // const {address, isConnected} = useAccount();
    const [currentAccount, setCurrentAccount] = useState('');
    // const [isConnected, setIsConnected] = useState(false)
    const {isConnected,address,status} =  useAccount({
        config
      });
      const navigate = useNavigate();
    useEffect(()=>{
console.log('isConnectedd:',isConnected)
    },[])
      
    useEffect(() => {
        findMetaMaskAccount().then((account) => {
            if (account !== null) {
                console.log(account)
                setCurrentAccount(account);
            }
        });
    }, []);

    const connectWallet = async () => {
        try {
            const ethereum = getEthereumObject();
            if (!ethereum) {
                alert("Get MetaMask!");
                return;
            }

            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });

            console.log("Connected", accounts[0]);
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.error(error);
        }
    };

    // const handleClick = (e) => {
    //     if (!isConnected) {
    //         e.preventDefault();
    //         alert("Please connect your wallet to proceed.");
    //     }
    // };
    const handleProfileClick = (e)=>{
        console.log(isConnected)
        if(isConnected){
        navigate('/profile');
        }
    }
    useEffect(()=>{
        if(!currentAccount){
            console.log("Current account:",currentAccount)
        }
        else{
            console.log(currentAccount)
        }

    },[])

    // useEffect(async() => {
    //     console.log(isConnected);

    //     if (isConnected && address) {
    //         setCurrentAccount(address);
    //     }
    // }, [isConnected, address]);
    return (
        <div className="role-container">
             <Box
                sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                }}
            >
                <WalletConnect />
            </Box>
            <div className="role-container-box">
                <Box
                    sx={{                        
                        position: 'absolute',
                        top: 20,
                        right: 20,
                    }}
                >
                    <Btn  href="/login" endIcon={<LogoutIcon />}>Logout</Btn>                    
                </Box>
{
console.log("Manu log res0")

}
                <h2>Welcome:</h2>
                <h1>Manufacturer</h1>
              
                <Link to="/add-product">


                    <Button className="btns" buttonStyle='btn--long'  buttonSize='btn--large'onClick={handleProfileClick} >Check Profile</Button>
             </Link>

                <Link to="/add-product">
                    <Button  className="btns" buttonStyle='btn--long' buttonSize='btn--large'>Add Product</Button>
                </Link>
            {/* Wallet Connect */}
               {/* <button onClick={()=> setIsConnected(true)}> */}

                <WalletConnect onClick={connectWallet} />
               {/* </button> */}
                {/* <Web3ModalProvider /> */}
                {/*
                 * If there is no currentAccount render this button
                */}
                 {/* {!currentAccount && (
                    <Button className="btns" buttonStyle='btn--long' buttonSize='btn--large' onClick={connectWallet}>Connect Wallet</Button>
                )}  */}
 


            </div>
            {console.log("res above")}
        </div>

    );
}

// const WalletButtons 
export default Manufacturer;