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
// import Web3ModalProvider from '@components/wagmi';
import { useAccount } from 'wagmi';
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
    // const navigate = useNavigate();

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
            <div className="role-container-box">
                <Box
                    sx={{                        
                        position: 'absolute',
                        top: 20,
                        right: 20,
                    }}
                >
                    <Btn href="/login" endIcon={<LogoutIcon />}>Logout</Btn>                    
                </Box>
{
console.log("Manu log res0")

}
                <h2>Welcome:</h2>
                <h1>Manufacturer</h1>
              
                <Link to="/profile" >

                    <Button className="btns" buttonStyle='btn--long' buttonSize='btn--large' >Check Profile</Button>
                </Link>

                <Link to="/add-product">
                    <Button className="btns" buttonStyle='btn--long' buttonSize='btn--large'>Add Product</Button>
                </Link>
            {/* Wallet Connect */}
               {/* <button onClick={()=> setIsConnected(true)}> */}

                <WalletConnect/>
               {/* </button> */}
                {/* <Web3ModalProvider /> */}
                {/*
                 * If there is no currentAccount render this button
                */}
                 {/* {!currentAccount && (
                    <Button className="btns" buttonStyle='btn--long' buttonSize='btn--large' onClick={connectWallet}>Connect Wallet</Button>
                )} 
  */}


            </div>
            {console.log("res above")}
        </div>

    );
}

// const WalletButtons 
export default Manufacturer;