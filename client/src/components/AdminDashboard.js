import React, {Component} from 'react';
import axios from 'axios';
import ipfs from '../ipfs';
import { Button, Form, Table, Dimmer, Loader, Segment } from 'semantic-ui-react';
import Websocket from 'react-websocket';


class AdminDashboard extends Component {

  state = {
    ipfsHash:null,
    buffer: '',
    blockHash: '',
    record: '',
    publicKey: '',
    loading: false
  }


  getFullName = () => {
    // return localStorage.getItem('fullName');
    return "Admin";
  }

  // showPublicKey = () => {
  //   let publicKey = localStorage.getItem("publicKey");
  //
  //   if (this.state.publicKey === '') {
  //     this.setState({publicKey});
  //     console.log(this.state.publicKey);
  //   } else {
  //     this.setState({publicKey: ''});
  //   }
  // }

  render() {
    // let showRecord = () => {
    //   return (
    //     <tr>
    //       <td>1</td>
    //       <td><a target="_blank" href={"https://gateway.ipfs.io/ipfs/" + this.state.record}>{this.state.record}</a></td>
    //     </tr>
    //   );
    // };

    return(
      <div className="patient-dashboard">
        <h1><strong>Hello {this.getFullName()}!</strong></h1>
        
      </div>
    );
  }

}

export default AdminDashboard;
