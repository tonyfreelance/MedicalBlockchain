import React, {Component} from 'react';
import axios from 'axios';
import ipfs from '../ipfs';
import { Button, Form, Table, Dimmer, Loader, Segment } from 'semantic-ui-react';
import Websocket from 'react-websocket';


class PatientDashboard extends Component {

  state = {
    ipfsHash:null,
    buffer: '',
    blockHash: '',
    record: '',
    publicKey: '',
    loading: false,
    sharedDoctors: [],
    doctorList: []
  }

  componentDidMount = () => {
    axios.get('/api/connect/getDoctor')
    .then((response) => {
      console.log(response);
      this.setState({doctorList: response.data})
    })
    .catch(error => {
      // Show error notification
      console.log(error);
      // const failedNotification = {
      //   title: 'Error!',
      //   message: 'Could not process the form.',
      //   level: 'error'
      // };
      // this.addNotification(failedNotification);
    });
  }


  getFullName = () => {
    return localStorage.getItem('fullName');
  }

  showPublicKey = () => {
    let publicKey = localStorage.getItem("publicKey");

    if (this.state.publicKey === '') {
      this.setState({publicKey});
      console.log(this.state.publicKey);
    } else {
      this.setState({publicKey: ''});
    }
  }

  captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)
      };

  convertToBuffer = async(reader) => {
      //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
        this.setState({buffer});
    };

    onSubmit = async (event) => {
        event.preventDefault();
        this.setState({loading: true});



        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
          console.log(err,ipfsHash);
          // setState by setting ipfsHash to ipfsHash[0].hash
          this.setState({ ipfsHash:ipfsHash[0].hash });

          let data = {
            fromAddress: "0xngoc",
            toAddress: "0xnhi",
            // record: ipfsHash[0].hash
            record: "QmUAPHhxcTcQKiAFSRjcUbpge9UDyiL5NVyrKFJaXgATKv"
          }

          axios.post('/api/blockchain/createTransaction', data)
          .then((response) => {
            // Redirect users to next screen
            console.log("Transaction added");
            this.setState({ipfsHash: "QmUAPHhxcTcQKiAFSRjcUbpge9UDyiL5NVyrKFJaXgATKv"});
            // this.setState({transactionHash: response.data.latestTransaction});

            axios.post('/api/blockchain/mineBlock', null)
            .then((response) => {
              console.log("Block mined");
              this.setState({blockHash: response.data.hash, loading: false})
            })
            .catch(error => {
              console.log(error);
            });
            // localStorage.setItem('fullName', response.data.fullName);
            // browserHistory.push('/patient/dashboard');
          })
          .catch(error => {
            // Show error notification
            console.log(error);
            // const failedNotification = {
            //   title: 'Error!',
            //   message: 'Could not process the form.',
            //   level: 'error'
            // };
            // this.addNotification(failedNotification);
          });

        }) //await ipfs.add
      }; //onSubmit

  handleData = (data) => {
    let result = JSON.parse(data);

    if(result.hasOwnProperty('data')){
        let parsedData = JSON.parse(result.data);
        console.log(parsedData);

        this.setState({record: parsedData[0].transactions[0].record});
        // this.setState({record: result.data[0].hash})
    }
  }

  handleGrantAccess = (doctorKey) => {
    let data = {
      patientKey: localStorage.getItem("publicKey"),
      doctorKey: doctorKey
    };
    console.log(data);

    axios.post('/api/connect/grantAccess', data)
    .then((response) => {
      // Grant success notice
      console.log(response);
    })
    .catch(error => {
      // Show error notification
      console.log(error);
    });
  }

  handleRevokeAccess = (doctorKey) => {
    let data = {
      patientKey: localStorage.getItem("publicKey"),
      doctorKey: doctorKey
    };
    console.log(data);

    axios.post('/api/connect/revokeAccess', data)
    .then((response) => {
      // Grant success notice
      console.log(response);
    })
    .catch(error => {
      // Show error notification
      console.log(error);
    });
  }

  render() {
    let showRecord = () => {
      return (
        <tr>
          <td>1</td>
          <td><a target="_blank" href={"https://gateway.ipfs.io/ipfs/" + this.state.record}>{this.state.record}</a></td>
        </tr>
      );
    };

    return(
      <div className="patient-dashboard">
        <h1><strong>Hello {this.getFullName()}!</strong></h1>
        <p>
          <h3>Your Address: </h3>
          <button className="ui mini compact button show-address-button" onClick={this.showPublicKey}>{this.state.publicKey === '' ? "Show" : "Hide"}</button>
          <br/>
          <strong>{this.state.publicKey}</strong>
          <br/>
          <br/>
        </p>

        <div className="ui divider"></div>

        <div className="ui stackable center aligned grid container upload-records">
          <div className="five wide column upload-records-box">
            <i className="huge cloud upload icon"></i>
            <h3> Store your Health data in the Blockchain </h3>
            <p>Upload your medical history and fully control the sharing preferences.</p>
            <Form onSubmit={this.onSubmit}>
              <input
                type = "file"
                onChange = {this.captureFile}
              />
              <br/>
              <br/>
              <button
                type="submit"
                className={this.state.loading ? "ui loading button orange" : "ui button orange"}
              >
                Upload Medical Records
              </button>
            </Form>
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Values</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>IPFS Hash # </td>
              <td><a target="_blank" href={"https://gateway.ipfs.io/ipfs/" + this.state.ipfsHash}>{this.state.ipfsHash}</a></td>
            </tr>
            <tr>
              <td>Block Hash # </td>
              <td>{this.state.blockHash}</td>
            </tr>

          </tbody>
        </Table>

        <div className="ui divider"></div>

        <div className="shared-records">
          <h3>Your Shared Records</h3>
          <Table>
            <thead>
              <tr>
                <th>No</th>
                <th>Record</th>
              </tr>
            </thead>

            <tbody>

              {this.state.record !== '' ? showRecord() : (<tr></tr>)}

            </tbody>
          </Table>
        </div>

        <div className="ui divider"></div>

        <div>
          <h3>Control Your Access</h3>
          <h4>Doctors who have access to your records:</h4>
          {
            this.state.doctorList.map((e,i) => {
              return(
                <div key={i}>
                  <p>{e.firstName}</p>
                  <button onClick={() => this.handleGrantAccess(e.publicKey)}>Grant Access</button>
                  <button onClick={() => this.handleRevokeAccess(e.publicKey)}>Revoke Access</button>
                </div>
              );
            })
          }
        </div>

        <Websocket url='ws://localhost:6001'
          onMessage={this.handleData.bind(this)}/>
      </div>
    );
  }

}

export default PatientDashboard;
