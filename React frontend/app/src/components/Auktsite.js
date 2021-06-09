import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { withRouter } from 'react-router-dom';
import { Container, Button, Table, ButtonGroup, Input, Label } from 'reactstrap';
import Api from '../api/Api';
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:8080');

class Auktsite extends Component {

  constructor(props) {

    super(props)
    this.state = {
      auctions: [],
      items: [],
      valgDisabled: [],
      stopDisabled: [],
      disableAuctions: false,
      auctionName: '',
      auktionId: '',
      startbud: '',
      isEmpty: false,
      inputCheckId: '',
      onlyNumbers: true,
      userBid: '',
      bidAmount: '',
      bidTime: '',

    }

    this.chooseItem = this.chooseItem.bind(this);
    this.stopItemAuction = this.stopItemAuction.bind(this);
    this.inputHandler = this.inputHandler.bind(this);

  }

  componentDidMount() {
    
    this.checkAuth();

    fetch('/api/getAuctions')
      .then(response => response.json())
      .then(data => this.setState({auctions: data}));

  }

  checkAuth() {

    const auth = Api.getAuth()
    auth.then( (result) => {

      if(result) {

        if(result.role === 'auktionarius') {
          this.setState({username: result.username});
        }
        else {
          this.props.history.push('/')
          this.setState({token: false});
        }

      }

    });

  }

  auctionsBtnClick(auctionName, id) {

    this.setState({
      auctionName: auctionName,
      disableAuctions: true,
      auktionId: id
    });

    //fetcher bud hver gang nogen laver et bud
    socket.on('bidUpdate', data => {
      
      if(data.message === 'accepted') {
        this.setState({
          userBid: data.items[0].username, 
          bidAmount: data.items[0].bud, 
          bidTime: data.items[0].created
        }); 
      }
      else {
        this.setState({
          userBid: '', 
          bidAmount: '', 
          bidTime: ''
        });
      }

    });

    const username = this.state.username;

    socket.emit('join', {username: username, name: auctionName, auctionId: id});

    socket.on('auktjoined', data => {

      if(data.message === 'confirmed') {
        this.setState({items: data.items});
        // console.log(this.state.items)

      }

    });

  }

  chooseItem(itemId, auctionId, startbud) {

    console.log(itemId, auctionId, startbud)
    
    const re = /^[0-9]+$/;

    if(this.state.startbud !== '') {
      
      if(re.test(this.state.startbud)) {

        this.setState({
          valgDisabled: [...this.state.valgDisabled, itemId],
          stopDisabled: [...this.state.stopDisabled, itemId],
          inputCheckId: itemId
        });
        
        socket.emit('itemPicked', {
          itemId: itemId, 
          auctionId: auctionId, 
          auctionName: this.state.auctionName,
          startbud: startbud
        });

      }
      else {
        this.setState({onlyNumbers: false, isEmpty: false, inputCheckId: itemId})
      }     
      
    }
    else {
      this.setState({isEmpty: true, inputCheckId: itemId, onlyNumbers: true});
    }

  }

  stopItemAuction(id, auktionId, user, bid) {

    this.setState({
      stopDisabled: []
    });

    if(user === '' && bid === '') {
      user = '';
      bid= '';
    }

    fetch('/api/sold', {

      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id: id, auktionId: auktionId, user: user, bid: bid}),
      credentials: 'include'

    })

  }

  inputHandler(e) {

    this.setState({[e.target.name] : e.target.value});

  }

  endAuction(auktionId) {
    
    fetch('/api/endAuction', {

      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id: auktionId}),
      credentials: 'include'

    })
    .then(res => res.json())
    .then(data => this.setState({auctions: data, items: [], disableAuctions: false}));

  }
  
  render() {

    const { 
      username, auctions, items, valgDisabled, stopDisabled, 
      disableAuctions, isEmpty, startbud, inputCheckId, onlyNumbers,
      bidAmount, bidTime, userBid
    } = this.state;
    
    const auctionList = auctions.map(auction => {
      
      let buttons = [];
      buttons.push(
        <Button className='btn btn-primary' 
          color='primary' 
          style={{marginRight: "5px"}} 
          key={auction.id} 
          disabled={disableAuctions} 
          onClick={() => this.auctionsBtnClick(auction.name, auction.id)}
        >
          {auction.name}
        </Button>
      );
      
      return buttons;
      
    });
    
    const vareList = items.map( item => {

      const d = new Date(bidTime);

      return(
        <tr key={item.id}>
          <td>{item.name}</td>
          <td>{item.description}</td>
          <td>{item.picture}</td>
          <td>{item.itemValue}</td>
          <td>
            <Input 
              key={item.id}
              name='startbud'
              required='required'
              onChange={this.inputHandler}
              />
            {item.id === inputCheckId && startbud === '' && isEmpty === true ? <Label style={{color: 'red'}}>Skal være udfyldt</Label> : ''}
            {item.id === inputCheckId && onlyNumbers === false ? <Label style={{color: 'red'}}>Skal bestå at et beløb i kun tal</Label> : ''}
          </td>
          <td>
            Bud: {item.id === inputCheckId ? bidAmount : ''}
            <br/>
            Bruger: {item.id === inputCheckId ? userBid : ''}
            <br/>
            Kl. : {item.id === inputCheckId ? d.toLocaleString('da-DK') : ''}
          </td>
          <td></td>
          <td>
            <ButtonGroup>
              <Button size='sm' color='primary' 
                disabled={valgDisabled.indexOf(item.id) !== -1} 
                onClick={() => this.chooseItem(item.id, item.auktions_id, startbud)}
                >Vælg
              </Button>
              <Button size='sm' color='danger' 
                disabled={stopDisabled.indexOf(item.id) === -1} 
                onClick={() => this.stopItemAuction(item.id, item.auktions_id, userBid, bidAmount)}
                >Stop
              </Button>
            </ButtonGroup>
          </td>
        </tr>
      );
      
    });
    
    return (
      <div>
        <AppNavbar />
        <Container fluid>
          <p>Velkommen Auktionarius {username}</p>
          {auctionList}
          <Table className='mt-2'>
            <thead>
              <tr>
                <th width='15%'>Vare Navn</th>
                <th width='15%'>Info</th>
                <th width='15%'>Billede</th>
                <th width='10%'>Vurdering</th>
                <th width='10%'>Start bud</th>
                <th width='15%'>Nuværende bud</th>
                <th></th>
                <th width='10%'>Vælg/stop</th>
              </tr>
            </thead>
            <tbody>
              {vareList}
            </tbody>
          </Table>    
          {disableAuctions === false ? '' : [<br key={1}/>,<Button key={2} color='danger' onClick={() => this.endAuction(this.state.auktionId)}>Slut Auktion</Button>]}
        </Container>
      </div>
    );
  }

}

export default withRouter(Auktsite);
