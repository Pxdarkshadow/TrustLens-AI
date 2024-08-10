import '../../css/Role.css';
import { Button } from '../Button';
import { createWeb3Modal, useWeb3Modal } from '@web3modal/wagmi/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, Button as MuiButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import WalletConnect from './WalletConnect';
import { arbitrum, mainnet, polygon, sepolia, bscTestnet } from 'wagmi/chains';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { useAccount } from 'wagmi';

const projectId = '7236c984a38479e85f91b945bd9076a8';
if (!projectId) {
  throw new Error("Please provide project id");
}

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const vanarChain = {
  id: 0x13308,
  name: 'Vanguard',
  nativeCurrency: { name: 'Vanar', symbol: 'VG', decimals: 18 },
  rpcUrls: {
    default: { 
      http: ['https://rpc-vanguard.vanarchain.com'] 
    },
  },
  blockExplorers: {
    default: { name: 'Vanguard Explorer', url: 'https://explorer-vanguard.vanarchain.com' },
  },
};

const chains = [mainnet, arbitrum, polygon, sepolia, vanarChain, bscTestnet];
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableEmail: true
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  allowUnsupportedChain: true,
  themeMode: 'dark',
  enableAnalytics: true,
  enableOnramp: true
});

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log("accounts:", accounts);

    if (accounts.length !== 0) {
      const account = accounts[0];
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
  const [currentAccount, setCurrentAccount] = useState('');
  const { isConnected, address } = useAccount({ config });
  const navigate = useNavigate();

  useEffect(() => {
    console.log('isConnected:', isConnected);
  }, [isConnected]);

  useEffect(() => {
    findMetaMaskAccount().then((account) => {
      if (account !== null) {
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

  const handleProfileClick = () => {
    if (isConnected) {
      navigate('/profile');
    }
  };

  useEffect(() => {
    console.log("Current account:", currentAccount);
  }, [currentAccount]);

  return (
    <div className="role-container">
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
        }}
      >
      </Box>
      <div className="role-container-box">
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
          }}
        >
          <MuiButton href="/login" endIcon={<LogoutIcon />}>Logout</MuiButton>
        </Box>
        <h2>Welcome:</h2>
        <h1>Manufacturer</h1>
        <Link to="/profile">
          <Button className="btns" buttonStyle='btn--long' buttonSize='btn--large' onClick={handleProfileClick}>Check Profile</Button>
        </Link>
        <Link to="/add-product">
          <Button className="btns" buttonStyle='btn--long' buttonSize='btn--large'>Add Product</Button>
        </Link>
        <WalletConnect onClick={connectWallet} />

      </div>
    </div>
  );
};

export default Manufacturer;