import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";

import './App.css';
import { useEffect, useState } from 'react';

import logoicon from './images/logoicon.png';
import about from './images/about.png';
import about2 from './images/about2.png';
import metamask from './images/metamask.svg';

import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Stack from 'react-bootstrap/Stack';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const chainIdList = [
  {id: 1, name: "eth"},
  {id: 5, name: "goerli"},
  {id: 137, name: "polygon"},
  {id: 80001, name: "mumbai"}
]

const getAccount = async () => {
  try {
    const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (account.length > 0) {
        return account[0];
    } else {
        return "";
    }
  } catch (err) {
    if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.');
    } else {
        console.error(err);
    }
    return "";
  }
}

const handleAccountChanged = async (accountNo, setAccount, setChainId, setNfts, setCollections, setChainName) => {

  const account = await getAccount();
  setAccount(account);

  const chainId = await getChainID();
  setChainId(chainId);

  const chainName = await getChainName(chainId);
  setChainName(chainName);

  const web3ApiKey = '27XAH0PFnvHnMN7EgbXAQiQH5ycsAuE3dduoJVtE5EQFwVklhnFTebDxlAiihvgV';
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'X-API-Key': web3ApiKey
    }
  };

  const resNftData = await fetch(`https://deep-index.moralis.io/api/v2/${account}/nft?chain=${chainName}`, options);
  const resNft = await resNftData.json();

  let nfts = [];
  for (let nft of resNft.result) {
    const tmp = JSON.parse(nft.metadata);
    console.log(JSON.stringify(tmp));
    if (tmp !== null) {
      if ("attributes" in tmp) {
        let cert_date = "";
        let ca_name = "";
        let ca_address = "";
        let genre = "";
        for (const attribute of tmp.attributes) {
          if (attribute.trait_type === "exp_type") {
            genre = attribute.value;
          } else if (attribute.trait_type === "ca_name") {
            ca_name = attribute.value;
          } else if (attribute.trait_type === "ca_address") {
            ca_address = attribute.value;
          } else if (attribute.trait_type === "cert_date") {
            cert_date = attribute.value.substring(0,4) + "/" +  attribute.value.substring(4,6) + "/" + attribute.value.substring(6);
          }
        }

        const nftinfo = {
          image: tmp.image !== "" ? `https://ipfs.io/ipfs/${tmp.image.substring(7)}` : "",
          cert_date: cert_date,
          ca_name: ca_name,
          ca_address: ca_address,
          genre: genre,
          description: tmp.description,
          token_address: nft.token_address
        }

        nfts.push(nftinfo);
      }
    }
  }

  setNfts(nfts.sort(( a, b ) => {
    var r = 0;
    if( a.cert_date > b.cert_date ){ r = -1; }
    else if( a.cert_date < b.cert_date ){ r = 1; }
  
    return r;
  }));

  const resCollectionData = await fetch(`https://deep-index.moralis.io/api/v2/${account}/nft/collections?chain=${chainName}`, options);
  const resCollection = await resCollectionData.json();
  setCollections(resCollection.result);

  window.history.replaceState('','',account);
}

const getChainName = async (chainId) => {
  let data = chainIdList.filter(function (item) {
    return item.id === chainId;
  });

  return data[0].name;
}

const getChainID = async () => {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainId);
}

const handleCollectonSelect = async (chainName, setSelectedCollection, setSelectedCollectionName, setMintedNfts) => {
  let selectedCollection = "";
  let elements = document.getElementsByName('collections');
  for (let i in elements) {
    if (elements.item(i).checked){
      selectedCollection = elements.item(i).id;
      setSelectedCollection(selectedCollection);
      setSelectedCollectionName(elements.item(i).value);
    }
  }

  const web3ApiKey = '27XAH0PFnvHnMN7EgbXAQiQH5ycsAuE3dduoJVtE5EQFwVklhnFTebDxlAiihvgV';
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'X-API-Key': web3ApiKey
    }
  };

  const resNftData = await fetch(`https://deep-index.moralis.io/api/v2/nft/${selectedCollection}?chain=${chainName}&format=decimal`, options);
  const resNft = await resNftData.json();
  let nfts = [];
  for (let nft of resNft.result) {
    const tmp = JSON.parse(nft.metadata);
    if (tmp !== null) {
      if ("attributes" in tmp) {
        let cert_date = "";
        let ca_name = "";
        let owner_address = "";
        let genre = "";
        for (const attribute of tmp.attributes) {
          if (attribute.trait_type === "exp_type") {
            genre = attribute.value;
          } else if (attribute.trait_type === "ca_name") {
            ca_name = attribute.value;
          } else if (attribute.trait_type === "owner_address") {
            owner_address = attribute.value;
          } else if (attribute.trait_type === "cert_date") {
            cert_date = attribute.value.substring(0,4) + "/" +  attribute.value.substring(4,6) + "/" + attribute.value.substring(6);
          }
        }

        const nftinfo = {
          image: tmp.image !== "" ? `https://ipfs.io/ipfs/${tmp.image.substring(7)}` : "",
          cert_date: cert_date,
          ca_name: ca_name,
          owner_address: owner_address,
          genre: genre,
          description: tmp.description,
          token_address: nft.token_address
        }

        nfts.push(nftinfo);
      }  
    }
  }
  setMintedNfts(nfts.sort(( a, b ) => {
    var r = 0;
    if( a.cert_date > b.cert_date ){ r = -1; }
    else if( a.cert_date < b.cert_date ){ r = 1; }
  
    return r;
  }));
}

const handleNewContract = async (account, chainName, setDisable, setCollections, setShowNewToken) => {
  setDisable(true);

  let cn = chainName;
  if(chainName === "eth") {
    cn = "mainnet";
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const sdk = ThirdwebSDK.fromSigner(signer, cn);

  const contractAddress = await sdk.deployer.deployNFTCollection({
    name: document.getElementById("token_name").value,
    symbol: document.getElementById("token_symbol").value,
    primary_sale_recipient: account,
  });

  const metadata = {
    name: "First NFT",
    description: "First NFT to show in Q list.",
    image: "",
  };
  
  const contract = await sdk.getContract(contractAddress);
  await contract.erc721.mint(metadata);

  setDisable(false);
  setShowNewToken(false);

  document.getElementById("reloadContract").click();
  
}

const handleMint = async (selectedCollection, chainName, setDisable, setMintedNfts, setShow) => {
  setDisable(true);

  let cn = chainName;
  if(chainName === "eth") {
    cn = "mainnet";
  }

  const account = await getAccount();
  const cert_date = document.getElementById("cert_date").value.replace(/[^0-9]/g, "");
  const owner = document.getElementById("owner").value;
  const title = document.getElementById("cert_date").value.replace(/[^0-9]/g, "") + "_" + document.getElementById("exp_type").value;
  const ca_name = document.getElementById("ca_name").value;
  const exp_type = document.getElementById("exp_type").value;
  const description = document.getElementById("description").value;
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();

  const sdk = ThirdwebSDK.fromSigner(signer, cn);
  const contract = await sdk.getContract(selectedCollection);

  const walletAddress = owner;
  const metadata = {
    name: title,
    description: description,
    image: document.getElementById("image").files[0],
    attributes: [
      {trait_type:"cert_date",value: cert_date},
      {trait_type:"exp_type",value:exp_type},
      {trait_type:"ca_address",value:account},
      {trait_type:"ca_name","value":ca_name},
      {trait_type:"owner_address","value":owner},
    ]
  };
  await contract.erc721.mintTo(walletAddress, metadata);


  const url = 'https://7iqg4cc3ca2nuy6oqrjchnuige0rqzcu.lambda-url.ap-northeast-1.on.aws/';
  const method = 'POST';
  const submitBody = {
    to: document.getElementById("email").value,
    from: ca_name,
    chainName: cn,
    title: exp_type,
    description: description
  };
  const body = JSON.stringify(submitBody);

  fetch(url, { method, body })
  .then((res) => {
    console.log(res.status);
    if (res.ok) {
      return res.json()
        .then((resJson) => {
          setDisable(false);
          setShow(false);
        
          document.getElementById("reloadCollection").click();
        })
    }
  })
  .catch((error) => {
    console.log(error);
  });  

}

const handleLogout = async () => {
  window.location.href = "/";
}


function App() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);
  const [chainName, setChainName] = useState("");
  // const [index, setIndex] = useState(0);
  const [disable, setDisable] = useState(false);
  const [show, setShow] = useState(false);
  const [showNewToken, setShowNewToken] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [mintedNfts, setMintedNfts] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedCollectionName, setSelectedCollectionName] = useState("");

  const location = window.location.pathname.toLowerCase();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleCloseNewToken = () => setShowNewToken(false);
  const handleShowNewToken = () => setShowNewToken(true);


  // const handleSelect = (selectedIndex, e) => {
  //   setIndex(selectedIndex);
  // };

  const initializeAccount = async () => {
    const account = getAccount();
    if (account !== "") {
      await handleAccountChanged(account, setAccount, setChainId, setNfts, setCollections,setChainName);
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on("accountsChanged", (accountNo) => handleAccountChanged(accountNo, setAccount, setChainId, setNfts, setCollections,setChainName));
        window.ethereum.on("chainChanged", (accountNo) => handleAccountChanged(accountNo, setAccount, setChainId, setNfts, setCollections,setChainName));
    } else {
      window.addEventListener('ethereum#initialized', initializeAccount, {
        once: true, 
      });
    
      setTimeout(initializeAccount, 3000); // 3 seconds
    }
  }, [account]);

  return (
    <div className="App d-flex flex-column">
      <div className="mb-auto w-100">
        {location === "/" ? (
          <>
            <Container className="my-5 p-5">
              <img src={logoicon} className="title-img mb-5" alt="logoicon"/>
              <h1 className="text-big mb-5">世界中の挑戦を<br />ブロックチェーンに記録</h1>
              <Row className="mx-auto mb-3 title-button">
                <Col sm={6} className="mb-3">
                  <Button className="py-2 px-4 btn-lg" variant="outline-dark" href="https://gainful-dinghy-88c.notion.site/Q-07aae2e74e65451eb0c7ad7ce9fd85c8" target="_blank" rel="noreferrer">使い方を見る</Button>
                </Col>
                <Col sm={6}>
                  <Button className="py-2 px-4 btn-lg" variant="outline-dark" id="GetAccountButton" onClick={initializeAccount}>MetaMaskと接続</Button>
                </Col>
              </Row>
              <small className="row-margin">Google ChromeとMetaMaskのインストールされたPCで利用可能です。</small>
            </Container>
            <Container className="content">
              <Row className="align-items-center row-margin">
                <Col sm={5} className="p-5"><img src={about} className="img-fluid lp-img" alt="about"></img></Col>
                <Col sm={7} className="left-align p-3"> 
                  <h1 className="text-big mb-5">Web3時代に、<br />証明書はいらない。</h1>
                  <h4 className="mb-4">Qは、学校の卒業歴や社会活動への参加歴など、様々な経歴情報をブロックチェーンに記録できるシステムです。<br />人生を通じて挑戦・経験したことをNFTの「証明トークン」に記録し、積み上げることで、学歴や保有資格だけでは測れなかった、その人の本当の魅力を可視化します。</h4>
                </Col>
              </Row>
              <Row className="align-items-center row-margin">
                <Col sm={7} className="left-align p-3"> 
                  <h1 className="text-big mb-5">誰でも贈り、受け取れる。</h1>
                  <h4 className="mb-4">Qを使うと、誰でも証明トークンを発行したり、自分が受け取った証明トークンの一覧を見ることができます。<br />これからは、学校が発行する卒業証書だけではなく、仲間同士で感謝を伝え合ったり、自分自身の学習記録を残したりすることも、すべてあなたの経歴につながります。</h4>
                </Col>
                <Col sm={5} className="p-3"><img src={about2} className="img-fluid lp-img" alt="about2"></img></Col>
              </Row>
              <Row className="align-items-center row-margin">
                <Col sm={5} className="p-3"><img src={metamask} alt="metamask"></img></Col>
                <Col sm={7} className="left-align p-3"> 
                  <h1 className="text-big mb-5">Qを集める冒険に出よう！</h1>
                  <h4 className="mb-4">証明書を発行したり、受け取ったりするためには、NFTを管理するためのウォレットアプリ「MetaMask」が必要です。<br />くわしいQのはじめかたは、マニュアルをご覧ください。</h4>
                  <Button className="py-2 px-4 btn-lg" variant="outline-dark" href="https://gainful-dinghy-88c.notion.site/Q-07aae2e74e65451eb0c7ad7ce9fd85c8" target="_blank" rel="noreferrer">使い方を見る</Button>
                </Col>
              </Row>
            </Container>
          </>
        ) : (
          <>
            <Navbar className="headernav" expand="lg">
              <Container className="align-items-center">
                <Navbar.Brand>
                  <img src={logoicon}  height="40px" alt="logoicon"/>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="me-auto">
                  </Nav>
                  <Nav>
                    <Navbar.Text>
                      <Button id="openhelp" className="mb-1 me-2" variant="text" href="https://gainful-dinghy-88c.notion.site/Q-07aae2e74e65451eb0c7ad7ce9fd85c8" target="_blank" rel="noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-question-circle" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                          <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                        </svg>
                      </Button>
                      {account ? (
                        <>
                          <span className="me-2">ネットワーク: {chainName}</span>
                          <Button className="px-4" variant="outline-dark" onClick={handleLogout}>接続を解除する</Button>
                        </>
                      ) : (
                        <Button className="px-4" variant="dark" onClick={initializeAccount}>MetaMaskと接続</Button>
                      )}
                    </Navbar.Text>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
            <ThirdwebProvider desiredChainId={chainId}>
              <Container className="mt-5">
                <Tabs
                  defaultActiveKey="receive"
                  id="uncontrolled-tab-example"
                  className="mb-3"
                >
                  <Tab eventKey="receive" title="受け取る">
                    <Navbar expand="lg">
                      <Container className="mx-0 px-0">
                        <Nav>
                          <Stack className="left-align">
                            <div>
                              <h3>
                                あなたの経歴
                                <Button id="reloadNft" className="mb-1" variant="text" onClick={() => handleAccountChanged(account, setAccount, setChainId, setNfts, setCollections,setChainName)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                  </svg>
                                </Button>
                              </h3>
                            </div>
                            <div><p><small>このウォレットで受け取った証明書の一覧です。</small></p></div>
                          </Stack>
                        </Nav>
                      </Container>
                    </Navbar>

                    <Table className="table-hover" responsive={true}>
                      <thead className="table-secondary">
                        <tr>
                          <th>画像</th>
                          <th>日付</th>
                          <th>発行者</th>
                          <th>発行者アドレス</th>
                          <th>証明すること</th>
                          <th>メッセージ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nfts.length !== 0 ? (nfts.map((nft, index) => {
                          return (
                            <tr key={index}>
                              <td>{nft.image !== "" ? <a href={nft.image}  target="_blank" rel="noreferrer"><img src={nft.image} alt="nftimage" width="100px" /></a> : <></>}</td>
                              <td>{nft.cert_date}</td>
                              <td>{nft.ca_name}</td>
                              <td>
                              <OverlayTrigger
                                  key="copy"
                                  placement="top"
                                  overlay={
                                    <Tooltip>コピー</Tooltip>
                                  }
                                >
                                  <Button variant="text" size="sm" onClick={()=>{navigator.clipboard.writeText(nft.token_address);}}>
                                    {nft.token_address.substring(0,4)}...{nft.token_address.substring(38)}
                                    <span className="ms-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
                                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                                      </svg>
                                    </span>
                                  </Button>
                                </OverlayTrigger>
                              </td>
                              <td>{nft.genre}</td>
                              <td>{nft.description}</td>
                            </tr>
                          );  
                        })) : (
                          <></>
                        )}
                      </tbody>
                    </Table>
                  </Tab>
                  <Tab eventKey="mint" title="発行する">
                    <Navbar expand="lg">
                      <Container className="mx-0 px-0">
                        <Nav>
                          <Stack className="left-align">
                            <div>
                              <h3>
                                発行者一覧
                                <Button id="reloadContract" variant="text" className="mb-1" onClick={() => handleAccountChanged(account, setAccount, setChainId, setNfts, setCollections,setChainName)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                  </svg>
                                </Button>
                              </h3>
                            </div>
                            <div><p><small>このウォレットで登録した発行者の一覧です。選択した発行者名で証明を発行します。<br />※新しく登録した発行者がブロックチェーンに記録されるまで数分かかる場合があります。リロードボタンを押下してください。</small></p></div>
                          </Stack>
                        </Nav>
                        <Nav className="justify-content-end">
                          {account === location.substring(1) ? (
                            <Button className="px-4" variant="outline-dark" onClick={handleShowNewToken}>発行者を登録する</Button>
                          ) : (
                            <></>
                          )}
                        </Nav>
                      </Container>
                    </Navbar>
                    <Table className="table-hover mb-5">
                      <thead className="table-secondary">
                        <tr>
                          <th>選択</th>
                          <th>発行者名</th>
                          <th>単位</th>
                          <th>発行者アドレス</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collections.length !== 0 ? (collections.map((collection, index) => {
                          return (
                            <tr key={index}>
                              <td><input className="form-check-input" type="radio" name="collections" id={collection.token_address} value={collection.name} onClick={() => handleCollectonSelect(chainName, setSelectedCollection, setSelectedCollectionName, setMintedNfts)} /></td>
                              <td>{collection.name}</td>
                              <td>{collection.symbol}</td>
                              <td>
                                <OverlayTrigger
                                  key="copy"
                                  placement="top"
                                  overlay={
                                    <Tooltip>コピー</Tooltip>
                                  }
                                >
                                  <Button variant="text" size="sm" onClick={()=>{navigator.clipboard.writeText(collection.token_address);}}>
                                    {collection.token_address.substring(0,4)}...{collection.token_address.substring(38)}
                                    <span className="ms-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
                                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                                      </svg>
                                    </span>
                                  </Button>
                                </OverlayTrigger>
                              </td>
                            </tr>
                          );  
                        })) : (
                          <></>
                        )}
                      </tbody>
                    </Table>

                    <Navbar expand="lg">
                      <Container className="mx-0 px-0">
                        <Nav>
                          <Stack className="left-align">
                            <div>
                              <h3>
                                証明を発行する
                                <Button id="reloadCollection" className="mb-1" variant="text" onClick={() => handleCollectonSelect(chainName, setSelectedCollection, setSelectedCollectionName, setMintedNfts)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                  </svg>
                                </Button>
                              </h3>
                            </div>
                            <div><p><small>選択した発行者から証明トークンを発行し、相手のウォレットアドレスに送信します。<br />※新しく登録した証明トークンがブロックチェーンに記録されるまで数分かかる場合があります。リロードボタンを押下してください。</small></p></div>
                          </Stack>
                        </Nav>
                        <Nav className="justify-content-end">
                          {selectedCollection !== "" ? (
                            <Button className="px-4" variant="outline-dark" onClick={handleShow} >証明トークンを発行する</Button>
                          ) : (
                            <></>
                          )}
                        </Nav>
                      </Container>
                    </Navbar>
                    <Table className="table-hover mb-5">
                      <thead className="table-secondary">
                        <tr>
                          <th>画像</th>
                          <th>日付</th>
                          <th>受取者アドレス</th>
                          <th>証明すること</th>
                          <th>説明</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mintedNfts.length !== 0 ? (mintedNfts.map((nft, index) => {
                          return (
                            <tr key={index}>
                              <td><td>{nft.image !== "" ? <a href={nft.image}  target="_blank" rel="noreferrer"><img src={nft.image} alt="nftimage" width="100px" /></a> : <></>}</td></td>
                              <td>{nft.cert_date}</td>
                              <td>
                                <OverlayTrigger
                                  key="copy"
                                  placement="top"
                                  overlay={
                                    <Tooltip>コピー</Tooltip>
                                  }
                                >
                                  <Button variant="text" size="sm" onClick={()=>{navigator.clipboard.writeText(nft.owner_address);}}>
                                    {nft.owner_address.substring(0,4)}...{nft.owner_address.substring(38)}
                                    <span className="ms-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                                      </svg>
                                    </span>
                                  </Button>
                                </OverlayTrigger>
                              </td>
                              <td>{nft.genre}</td>
                              <td>{nft.description}</td>
                            </tr>
                          );  
                        })) : (
                          <></>
                        )}
                      </tbody>
                    </Table>

                    <Modal
                      show={showNewToken}
                      backdrop="static"
                      onHide={handleCloseNewToken}
                      size="md"
                      aria-labelledby="contained-modal-title-vcenter"
                      centered
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>新しい発行者を登録する</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>発行者名</Form.Label>
                            <Form.Control id="token_name" type="text"  placeholder="スタディメーター株式会社" />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>トークン単位(任意)</Form.Label>
                            <Form.Control id="token_symbol" type="text" placeholder="ETH" />
                          </Form.Group>
                        </Form>
                        <p><strong>ご確認ください</strong></p>
                        <ul>
                          <li><small>登録ボタン押下後、MetaMaskの画面が開き、ブロックチェーンの利用手数料（ガス代）の支払いが<strong className="text-danger">2回</strong>発生します。暗号資産の残高をご確認ください。2回目の支払いでキャンセルすると、1回目のガス代を取り戻すことができません。</small></li>
                        </ul>
                      </Modal.Body>
                      <Modal.Footer>
                        {disable === false ? (
                          <>
                            <Button className="px-4" variant="outline-dark" id="closeNewToken" onClick={handleCloseNewToken}>
                              <span>キャンセル</span>
                            </Button>
                            <Button className="px-4" variant="dark" onClick={() => handleNewContract(account, chainName, setDisable, setCollections, setShowNewToken)}>
                              <span>登録する</span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button className="px-4" variant="outline-dark" id="closeNewToken" disabled="true">
                              <span>キャンセル</span>
                            </Button>
                            <Button className="px-4" variant="dark" disabled="true">
                              <span className="me-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              <span>数分かかる場合があります...</span>
                            </Button>
                          </>
                        )}
                      </Modal.Footer>
                    </Modal>

                    <Modal
                      show={show}
                      backdrop="static"
                      onHide={handleClose}
                      size="lg"
                      aria-labelledby="contained-modal-title-vcenter"
                      centered
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>新しい証明トークンを発行する</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>発行者名</Form.Label>
                            <Form.Control id="ca_name" type="text" value={selectedCollectionName} readOnly={true} />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>発行日（証明トークン自体は、発行直後に送信されます）</Form.Label>
                            <Form.Control id="cert_date" type="date" className="form-control datetimepicker-input" data-target="#datetimepicker1"/>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>受取者のウォレットアドレス</Form.Label>
                            <Form.Control id="owner" type="text" placeholder="0x..." />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>証明すること</Form.Label>
                            <Form.Control id="exp_type" type="text" placeholder="講座修了、セミナー参加..." />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>メッセージ</Form.Label>
                            <Form.Control id="description" type="text" placeholder="○○講座の受講、ありがとうございました！" />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>画像</Form.Label>
                            <Form.Control id="image" type="file" />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>通知先メールアドレス</Form.Label>
                            <Form.Control id="email" type="email" placeholder="experience@studymeter-web.com" />
                            <Form.Text className="text-muted">
                              証明トークンが発行されたことをメールで通知します。このメールアドレスは、NFTに記録されません。
                            </Form.Text>
                          </Form.Group>
                        </Form>
                        <p><strong>ご確認ください</strong></p>
                        <ul>
                          <li><small>通知先メールアドレス以外の情報は、ブロックチェーン上で公開され、削除することができません。個人情報や機密情報を含めないよう、ご注意ください。</small></li>
                          <li><small>発行ボタン押下後、MetaMaskの画面が開き、ブロックチェーンの利用手数料（ガス代）の支払いが発生します。</small></li>
                        </ul>

                      </Modal.Body>
                      <Modal.Footer>
                        {disable === false ? (
                          <>
                            <Button className="px-4" variant="outline-dark" onClick={handleClose}>
                              キャンセル
                            </Button>
                            <Button className="px-4" variant="dark" onClick={() => handleMint(selectedCollection, chainName, setDisable, setMintedNfts, setShow)}>
                                発行する
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button className="px-4" variant="outline-dark" disabled={true}>
                              キャンセル
                            </Button>
                            <Button className="px-4" variant="dark" disabled={true}>
                              <span className="me-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              <span>数分かかる場合があります...</span>
                            </Button>
                          </>
                        )}
                        
                      </Modal.Footer>
                    </Modal>
                  </Tab>
                </Tabs>
              </Container>
            </ThirdwebProvider>
          </>
        )}
        
      </div>  

      <footer className="mt-auto p-3">
        Ideated by Studymeter Inc.
      </footer>
    </div>
  );
}

export default App;
