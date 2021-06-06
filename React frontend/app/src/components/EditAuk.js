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
            id:this.props.match.params.id,
            aukName:[],
        }
        this.cancel = this.cancel.bind(this);
        this.checkAuth = this.checkAuth.bind(this)
        this.aukInfo = this.aukInfo.bind(this);
        this.inputHandler = this.inputHandler.bind(this);
    }
    cancel() {
        //Husk at få fikset så den bare går en side tilbage
        this.props.history.push('/')
    }

    inputHandler(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    componentDidMount() {
        this.checkAuth();
        this.aukInfo();
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
            console.log(data);
          if(data.message === 'Successful') {
            this.setState({aukName:data.name})
              console.log(data.name);
          }
          else if(data.message === 'Someting went wrong...') {
            alert('Noget gik galt')
          }
        });
        
    }

    render() {
        const{id,aukName} = this.state
        return (
            <div>
                <AppNavbar />
                <Container fluid>
                    <h2>Auktion:{aukName}</h2>
                    <div>
                    </div>
                    <br />
                </Container>
            </div>
        );
    }
}
export default withRouter(EditAuk);