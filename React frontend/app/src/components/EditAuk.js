import React, { Component } from 'react';
import '../App.css';
import AppNavbar from './AppNavbar';
import 'bootstrap/dist/css/bootstrap.css';
import { Link, withRouter } from 'react-router-dom';
import { Row, Col, Input, Form, FormGroup, Label, Button, Container } from 'reactstrap';
import Api from '../api/Api'

class EditAuk extends Component {
    constructor(props) {
        super(props);
        this.state = {
            aukId:this.props.match.params.id,
            aukName:[],
            varer:[],
        }
        this.checkAuth = this.checkAuth.bind(this)
        this.aukInfo = this.aukInfo.bind(this);
        this.inputHandler = this.inputHandler.bind(this);
        this.getAllItems = this.getAllItems.bind(this);
    }

    inputHandler(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    componentDidMount() {
        this.checkAuth();
        this.aukInfo();
        this.getAllItems();
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

    aukInfo(){
        fetch('/api/aukInfo', {
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
            console.log(data.data[0].name);
          if(data.message === 'Successful') {
            this.setState({aukName:data.data[0].name})
              console.log('aukName: '+this.state.aukName);
          }
          else if(data.message === 'Someting went wrong...') {
            alert('Noget gik galt')
          }
        });
        
    }

    getAllItems(){
        fetch('/api/getAllItems', {
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
            console.log(data.data);
          if(data.message === 'Successful') {
            this.setState({varer:data.data})
              console.log('aukName: '+this.state.varer);
          }
          else if(data.message === 'Someting went wrong...') {
            alert('Noget gik galt')
          }
        });
    }

    async onClickHandler(vareId,aukId,mode){
        await fetch('/api/addOrRemoveFromAuk', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "vareId": vareId,
                "aukId": aukId,
                "mode": mode
            }),
            credentials: 'include'
    
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.data);
          if(data.message === 'Successful') {
            window.location.reload()
          }
          else if(data.message === 'Someting went wrong...') {
            alert('Noget gik galt')
          }
        });
    }

    render() {
        const{aukId,aukName,varer} = this.state
        const notAdded = varer.map(varer => {
            let buttons = [];
            if(varer.auktions_id==null){
                buttons.push(<Button className='btn btn-primary' color='primary' key={varer.id} onClick={()=>this.onClickHandler(varer.id,aukId,2)}>{varer.name}</Button>);   
            }
            return buttons;
        });
        const added = varer.map(varer => {
            let buttons = [];
            if(varer.auktions_id==aukId){
                buttons.push(<Button className='btn btn-primary' color='primary' key={varer.id} onClick={()=>this.onClickHandler(varer.id,aukId,1)}>{varer.name}</Button>);   
            }
            return buttons;
        });
        return (
            <div>
                <AppNavbar />
                <Container fluid>
                    <h2>Auktion:{aukName}</h2>
                    <div>
                        <h2>Varer:</h2>
                        <div>
                            <h3>Allerede tilføjet</h3>
                            {added}
                        </div>
                        <div>
                            <h3>Ikke tilføjet</h3>
                            {notAdded}
                        </div>
                    </div>
                    <br />
                </Container>
            </div>
        );
    }
}
export default withRouter(EditAuk);