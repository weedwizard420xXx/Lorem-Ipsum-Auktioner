import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Link, withRouter } from 'react-router-dom';
import { Row, Col, Input, Form, FormGroup, Label, Button, Container } from 'reactstrap';
import Api from '../api/Api'

class RegisterAuktioner extends Component{
    constructor(props){
        super(props);
        this.state = {
            auctions:[],
            aukName:'',
            isFocused: false,

        }
        this.checkAuth = this.checkAuth.bind(this)
        this.hentAuk = this.hentAuk.bind(this)
        this.opretAukHandler = this.opretAukHandler.bind(this);
        this.inputHandler = this.inputHandler.bind(this);
        this.redirect = this.redirect.bind(this);
    }

    redirect(id){
        this.props.history.push(`EditAuk/${id}`)
    }

    inputHandler(e) {
        this.setState({ [e.target.name]: e.target.value });
    }
  
    componentDidMount() {
        this.checkAuth();
        this.hentAuk();
    }

    checkAuth() {

        const auth = Api.getAuth()
        auth.then((result) => {

            if (result) {

                if (result.role === 'admin') {
                    this.setState({ 
                        token: result.token,
                        username: result.username
                    });
                }
                else {
                    this.props.history.push('/')
                    this.setState({ token: false });
                }

            }

        });

    }

    hentAuk() {
        fetch('/api/hentAuk', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state),
            credentials: 'include'
    
        })
        .then(res => res.json())
        .then(data => {
          if(data.message === 'Successful') {
            this.setState({auctions:data.data})
            console.log(this.state.auctions);
          }
          else if(data.message === 'Someting went wrong...') {
            alert('Noget gik galt')
          }
        });
    }

    async opretAukHandler() {
        const aukName = this.state.aukName;
        console.log(aukName)
        if (!aukName=='') {
            await fetch('/api/registerAuk', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.state),
                credentials: 'include'

            })
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'Successful') {
                        window.location.reload()
                    }
                    else if (data.message === 'Someting went wrong...') {
                        alert('Noget gik galt')
                    }
                });
        }
    }

    render(){
        const {auctions, aukName, isFocused} = this.state;
        const auctionList = auctions.map(auction => {
            let buttons = [];
            buttons.push(<Button className='btn btn-primary' color='primary' key={auction.id} onClick={()=>this.redirect(auction.id)} >{auction.name}</Button>);
            return buttons;
        });
        return (
            <div>
              <AppNavbar />
              <Container fluid>
                <h2>Opret ny auktion</h2>
                    <FormGroup>
                        <Label>Navn</Label>
                        <Input
                            name='aukName'
                            required='required'
                            placeholder='Navn'
                            onChange={this.inputHandler}
                            onFocus={() => this.setState({ isFocused: true })}
                        />
                        <Button
                            className='btn btn-primary'
                            color='primary'
                            onClick={this.opretAukHandler}
                        >Opret auktion</Button>
                    </FormGroup>
                    <Col md={12}>
                        {aukName === '' && isFocused === true ? <Label style={{ color: 'red' }}>Skal være udfyldt</Label> : ''}
                    </Col>
                <h2>Eksisterende auktioner</h2>
                <div>
                    <br />
                    {auctionList}
                </div>
                <br />
              </Container>
            </div>
          );
    }
}
export default withRouter(RegisterAuktioner);