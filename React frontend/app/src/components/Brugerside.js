import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Link, withRouter } from 'react-router-dom';
import { Container, Button } from 'reactstrap';
import socketIOClient from 'socket.io-client';
import Api from '../api/Api';

const socket = socketIOClient('http://localhost:8080');

class Brugerside extends Component {
  
  constructor(props) {
    
    super(props);
    this.state = {
      auctions: [{"id": 1,"name": "biler"},{"id": 2, "name": "kunst"}],
      username: '',
      items: [],
      userBid: '',
      bidAmount: '',
      bidTime: '',
      bla: []
    }
    
    this.auctionsBtnClick = this.auctionsBtnClick.bind(this);
    this.bidOnItem = this.bidOnItem.bind(this);
    
  }
  
  componentDidMount() {
    this.checkAuth();
  }

  checkAuth() {

    const auth = Api.getAuth()
    auth.then( (result) => {

      if(result) {

        if(result.role === 'byder') {
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

    socket.on('joined', data => {

      
      if(data.message === 'confirmed') {

        data.items.map( subitems => subitems.map( item => {
          return this.setState({bla: <Button key={id} onClick={() => this.bidOnItem(username, auctionName, id, item.id)} className='btn btn-primary'>Byd</Button>, items: [data.items]})
        }));

      }

    });

  }

  bidOnItem(username, auctionName, id, itemId) {

    socket.emit('bid', {user: username, name: auctionName, auctionId: id, itemId: itemId, bid: this.state.bidAmount});
    console.log(username, auctionName, id, itemId)

  }



  render() {
    
    const { username, auctions, items, userBid, bidAmount, bidTime} = this.state;

    const auctionList = auctions.map(auction => {

      let buttons = [];
      buttons.push(<Button className='btn btn-primary' color='primary' style={{marginRight: "5px"}} key={auction.id} onClick={() => this.auctionsBtnClick(auction.name, auction.id)}>{auction.name}</Button>);

      return buttons;

    });
    
    const currentItem = items.map( subitems => subitems.map( item => {

      const d = new Date(bidTime);

      return (
        <p key={item[0].id}>
          {item[0].vare}
          <br/>
          {item[0].info}
          <br />
          Nuværende bud: {bidAmount} <br/>
          Bruger: {userBid} <br/>
          Lavet kl. : {d.toLocaleString('da-DK')} 
        </p>
      )

    }));

    return (
      <div>
        
        <AppNavbar />
        <Container fluid>
          <p>Velkommen {username}</p>
          <Link className='btn btn-primary' to=''>Auktioner</Link>
          <Link className='btn btn-primary' to='/SendVurdering'>Indsend vare til vurdering</Link>
          <div>
          <br />
            {auctionList}
          </div>
          <br />
          <div>
            {currentItem}
          </div>
          <br />
          <div>
            {this.state.bla}
          </div>

        </Container>
      </div>
    );
  }

}

export default withRouter(Brugerside);