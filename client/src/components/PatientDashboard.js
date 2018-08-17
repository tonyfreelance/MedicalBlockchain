import React, {Component} from 'react';
import axios from 'axios';
import ipfs from '../ipfs';
import { Button, Form, Table, Dimmer, Loader, Segment } from 'semantic-ui-react';
import Websocket from 'react-websocket';
import { Tab, Popup } from 'semantic-ui-react'

class PatientDashboard extends Component {

  state = {
    ipfsHash:null,
    buffer: '',
    blockHash: '',
    record: '',
    publicKey: '',
    loading: false,
    sharedDoctors: [],
    unsharedDoctors: [],
    records: [],
    sender: ''
  }

  componentDidMount = () => {
    this.getDoctors();
    this.getRecords();
  }

  getDoctors = () => {
    let publicKey = localStorage.getItem("publicKey");
    axios.post('/api/connect/getDoctors', {publicKey: publicKey})
    .then((response) => {
      console.log(response);
      this.setState({unsharedDoctors: response.data.unsharedDoctors, sharedDoctors: response.data.sharedDoctors});
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

  getRecords = () => {
    let publicKey = localStorage.getItem("publicKey");
    axios.post('/api/blockchain/getRecordsForPatient', {publicKey: publicKey})
    .then((response) => {
      console.log(response.data);
      this.setState({records: response.data});
    })
    .catch(error => {
      // Show error notification
      console.log(error);
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
        let publicKey = localStorage.getItem("publicKey");

        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
          console.log(err,ipfsHash);
          // setState by setting ipfsHash to ipfsHash[0].hash
          this.setState({ ipfsHash:ipfsHash[0].hash });

          let data = {
            fromAddress: publicKey,
            record: ipfsHash[0].hash
          }

          axios.post('/api/blockchain/createTransaction', data)
          .then((response) => {
            // Redirect users to next screen
            console.log("Transaction added");
            this.setState({ipfsHash: ipfsHash[0].hash, sender: localStorage.getItem("fullName")});
            // this.setState({transactionHash: response.data.latestTransaction, });

            axios.post('/api/blockchain/mineBlock', null)
            .then((response) => {
              console.log("Block mined");
              this.setState({blockHash: response.data.hash, loading: false})
              this.getRecords();
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

  // handleData = (data) => {
  //   let result = JSON.parse(data);
  //
  //   if(result.hasOwnProperty('data')){
  //       let parsedData = JSON.parse(result.data);
  //       console.log(parsedData);
  //
  //       this.setState({record: parsedData[0].transactions[0].record});
  //       // this.setState({record: result.data[0].hash})
  //   }
  // }

  handleGrantAccess = (doctorKey) => {
    let data = {
      patientKey: localStorage.getItem("publicKey"),
      doctorKey: doctorKey,
      transactions: this.state.records
    };
    console.log(data);

    axios.post('/api/connect/grantAccess', data)
    .then((response) => {
      // Grant success notice
      console.log(response);
      this.getDoctors();
      this.getRecords();
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
      this.getDoctors();
      this.getRecords();
    })
    .catch(error => {
      // Show error notification
      console.log(error);
    });
  }

  render() {
    let showRecord = () => {
      return this.state.records.map((e, i) => {
            let publicKey = localStorage.getItem("publicKey");
            let a = new Date(e.timestamp);
            console.log(a);
            let date = a.getDate();
            let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            let year = a.getFullYear();
            let month = months[a.getMonth()];
            let datetime = date + ' ' + month + ' ' + year;

            return (
              <tr key={i}>
                <td>{i+1}</td>
                <td><a target="_blank" href={"https://gateway.ipfs.io/ipfs/" + e.record}>{e.record}</a></td>
                <td>{datetime}</td>
                <td>{e.fromAddress !== publicKey ? 'Dr. ' + e.sender : 'Me'}</td>
              </tr>
            )
          })
    };

    let myRecords = () => {
      return (
        <div className="shared-records">
          <h3>Your Medical Records</h3>
          <Table celled padded>
            <thead>
              <tr>
                <th>No</th>
                <th>Record</th>
                <th>Date</th>
                <th>Uploader</th>
              </tr>
            </thead>

            <tbody>

              {this.state.records === undefined || this.state.records.length === 0 ?  (<tr></tr>) : showRecord()}

            </tbody>
          </Table>
        </div>
      )
    }

    let uploadRecords = () => {
      return (
        <div className="ui stackable center aligned grid container upload-records">
          <div className="seven wide column upload-records-box">
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

          <Table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Value</th>
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
              <tr>
                <td>Sender </td>
                <td>{this.state.sender}</td>
              </tr>
            </tbody>
          </Table>
          <br/>
          <br/>
          <br/>
          <br/>
        </div>
          )
    }

    let userInfo = (e) => {
      return (
        <Table>
          <thead>
            <tr>
              <th>Info</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Name</td>
              <td>{e.firstName + ' ' + e.lastName}</td>
            </tr>
            <tr>
              <td>Hospital</td>
              <td>{e.hospital}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{e.email}</td>
            </tr>
            <tr>
              <td>Phone</td>
              <td>{e.phone}</td>
            </tr>
            <tr>
              <td>Address</td>
              <td>{e.address}</td>
            </tr>
            <tr>
              <td>City</td>
              <td>{e.city}</td>
            </tr>
            <tr>
              <td>Zip Code</td>
              <td>{e.postalCode}</td>
            </tr>
          </tbody>
        </Table>
      )
    }

    let controlAccess = () => {
      return (
        <div>
          <h3>Control Your Access</h3>
          <div className="ui divider"></div>
          <h4><i className="first aid large icon"></i> Doctors who have access to your records:</h4>
          <Table padded>
            <thead>
              <tr>
                <th className="center aligned">Doctor Name</th>
                <th className="center aligned">Hospital</th>
                <th className="center aligned">More Information</th>
                <th className="center aligned">Action</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.sharedDoctors.map((e,i) => {
                  return(
                    <tr key={i}>
                      <td className="center aligned">{e.firstName + ' ' + e.lastName}</td>
                      <td className="center aligned">{e.hospital}</td>
                      <td className="center aligned">
                        <Popup trigger={<button className="ui icon medium basic button"><i className="info circle icon"></i></button>}>
                          {userInfo(e)}
                        </Popup>
                      </td>
                      <td className="center aligned"><button className="ui red button" onClick={() => this.handleRevokeAccess(e.publicKey)}>Revoke Access</button></td>
                    </tr>
                  );
                })
              }
            </tbody>
          </Table>

          <div className="ui divider"></div>
          <h4><i className="first aid large icon"></i> Share your records with new doctors:</h4>
          <Table padded>
            <thead>
              <tr>
                <th className="center aligned">Doctor Name</th>
                <th className="center aligned">Hospital</th>
                <th className="center aligned">More Information</th>
                <th className="center aligned">Action</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.unsharedDoctors.map((e,i) => {
                  return(
                    <tr key={i}>
                      <td className="center aligned">{e.firstName + ' ' + e.lastName}</td>
                      <td className="center aligned">{e.hospital}</td>
                      <td className="center aligned">
                        <Popup trigger={<button className="ui icon medium basic button"><i className="info circle icon"></i></button>}>
                          {userInfo(e)}
                        </Popup>
                      </td>
                      <td className="center aligned"><button className="ui green button" onClick={() => this.handleGrantAccess(e.publicKey)}>Grant Access</button></td>
                    </tr>
                  );
                })
              }
            </tbody>
          </Table>
        </div>
      )
    }

    const panes = [
    { menuItem: { key: 'my-records', icon: 'heartbeat', content: 'My Records' }, render: () => <Tab.Pane>{myRecords()}</Tab.Pane> },
    { menuItem: { key: 'upload-records', icon: 'cloud upload', content: 'Upload Records' }, render: () => <Tab.Pane>{uploadRecords()}</Tab.Pane> },
    { menuItem: { key: 'control-access', icon: 'key', content: 'Control Access' }, render: () => <Tab.Pane>{controlAccess()}</Tab.Pane> },
    ]

    return(
      <div className="patient-dashboard">
        <h1><strong>Hello {this.getFullName()}!</strong></h1>
        <div className="dashboard-welcome">
          <h3>Your Address: <button className="ui mini compact button show-address-button" onClick={this.showPublicKey}>{this.state.publicKey === '' ? "Show" : "Hide"}</button></h3>
          <strong>{this.state.publicKey}</strong>
        </div>

        <div className="ui divider"></div>

        <Tab className="dashboard-main" menu={{ color: 'blue', inverted: false, fluid: true, vertical: true }} menuPosition='left' panes={panes} />



        {/* <Websocket url='ws://localhost:6001'
        onMessage={this.handleData.bind(this)}/> */}
      </div>
    );
  }

}

export default PatientDashboard;
