import React, {Component} from 'react';
import axios from 'axios';
import ipfs from '../ipfs';
import { Button, Form, Table, Dimmer, Loader, Segment } from 'semantic-ui-react';
import Websocket from 'react-websocket';
import { Tab, Popup, Dropdown } from 'semantic-ui-react'

class DoctorDashboard extends Component {

  state = {
    ipfsHash:null,
    buffer: '',
    blockHash: '',
    record: '',
    publicKey: '',
    loading: false,
    sharedPatients: [],
    records: [],
    sender: '',
    value: '',
    selectedPatientName: '',
    approvalStatus: ''
  }

  componentDidMount = () => {
    this.getPatients();
    this.getRecords();
    this.getApprovalStatus();
  }

  getApprovalStatus = () => {
    let publicKey = localStorage.getItem("publicKey");
    axios.post('/api/connect/getApprovalStatus', {publicKey: publicKey})
    .then((response) => {
      console.log(response);
      this.setState({approvalStatus: response.data});
    })
    .catch(error => {
      // Show error notification
      console.log(error);
    });
  }

  getPatients = () => {
    let publicKey = localStorage.getItem("publicKey");
    axios.post('/api/connect/getPatients', {publicKey: publicKey})
    .then((response) => {
      console.log(response);
      this.setState({sharedPatients: response.data.sharedPatients});
    })
    .catch(error => {
      // Show error notification
      console.log(error);
    });
  }

  getRecords = () => {
    let publicKey = localStorage.getItem("publicKey");
    axios.post('/api/blockchain/getRecordsForDoctor', {publicKey: publicKey})
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
            toAddress: this.state.value,
            record: ipfsHash[0].hash
          }

          axios.post('/api/blockchain/createTransactionForDoctor', data)
          .then((response) => {
            // Redirect users to next screen
            console.log("Transaction added");
            // Get Patient Name
            let patientName = '';
            for (const patient of this.state.sharedPatients) {
              if (patient.publicKey === this.state.value) {
                patientName = patient.firstName + ' ' + patient.lastName;
              }
            }
            this.setState({ipfsHash: ipfsHash[0].hash, sender: localStorage.getItem("fullName"), selectedPatientName: patientName});

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
          });

        }) //await ipfs.add
      }; //onSubmit

  handleSelectPatient = (e, {value}) => {
    this.setState({value});
    console.log(this.state.value);
  }

  handleSendRequest = () => {
    let publicKey = localStorage.getItem("publicKey");
    let doctorName = localStorage.getItem('fullName');
    axios.post('/api/connect/requestApproval', {doctorKey: publicKey, doctorName: doctorName})
    .then((response) => {
      this.setState({approvalStatus: response.data});
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
                <td>{e.fromAddress !== publicKey ? e.sender : 'Me'}</td>
              </tr>
            )
          })
    };

    let sharedRecords = () => {
      return (
        <div className="shared-records">
          <h3>Your Patient's Medical Records</h3>
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
      let {value} = this.state;

      let patientList = [];
      for (const patient of this.state.sharedPatients) {
        let patientData = {
          text: patient.firstName + ' ' + patient.lastName,
          value: patient.publicKey
        };
        patientList.push(patientData);
      }
      return (
        <div className="ui stackable center aligned grid container upload-records">
          <div className="eight wide column upload-records-box">
            <i className="huge cloud upload icon"></i>
            <h3> Store Your Patient's Health Data In Blockchain </h3>
            <p>Choose the patient you want to share record</p>
            <Dropdown placeholder='Select Patient' fluid selection options={patientList} onChange={this.handleSelectPatient} value={value}/>
            <br/>
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
                disabled={!this.state.value}
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
              <tr>
                <td>Patient </td>
                <td>{this.state.selectedPatientName}</td>
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

    let myPatients = () => {
      return (
        <div>
          <h3>My Patients</h3>
          <div className="ui divider"></div>
          <Table padded>
            <thead>
              <tr>
                <th className="center aligned">Patient Name</th>
                <th className="center aligned">More Information</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.sharedPatients.map((e,i) => {
                  return(
                    <tr key={i}>
                      <td className="center aligned">{e.firstName + ' ' + e.lastName}</td>
                      <td className="center aligned">
                        <Popup trigger={<button className="ui icon medium basic button"><i className="info circle icon"></i></button>}>
                          {userInfo(e)}
                        </Popup>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </Table>
        </div>
      )
    }

    let requireApproval = () => {

      let show = () => {
        console.log("Status: ", this.state.approvalStatus);
        if (this.state.approvalStatus === 'Pending') {
          return showPending();
        } else if (this.state.approvalStatus === 'Approved') {
          return showApproved();
        } else if (this.state.approvalStatus === 'Rejected') {
          return showRejected();
        }
      }

      let showApproved = () => {
        return (
          <div className="ui positive message transition hidden">
            <i className="close icon"></i>
            <div className="header">
              Congratulations! You are approved for Trusted Partners Program.
            </div>
            <p>Go to <b>Upload Records</b> section to start sharing test results with your patients.</p>
          </div>
        )
      };

      let showRejected = () => {
        return (
          <div className="ui negative message">
            <i className="close icon"></i>
            <div className="header">
              You need to send request for joining Trusted Partners Program.
            </div>
            <br/>
            <p><span>Click on this button to send request:</span>
              <button className="ui blue button send-request-button" onClick={this.handleSendRequest}>Send Request</button>
            </p>
          </div>
        )
      };

      let showPending = () => {
        return (
          <div className="ui info message">
            <i className="close icon"></i>
            <div className="header">
              Your request is under processing.
            </div>
            <p>Please come back later to check again.</p>
          </div>
        )
      }

      return (
        <div>
          <h3>Send approval request to Trusted Partners Program</h3>
          <div className="ui divider"></div>
          <div>
            {show()}
          </div>
        </div>
      )
    }

    const panes = [
    { menuItem: { key: 'shared-records', icon: 'heartbeat', content: 'Shared Records' }, render: () => <Tab.Pane>{sharedRecords()}</Tab.Pane> },
    { menuItem: { key: 'upload-records', icon: 'cloud upload', content: 'Upload Records' }, render: () => <Tab.Pane>{uploadRecords()}</Tab.Pane> },
    { menuItem: { key: 'my-patient', icon: 'user', content: 'My Patients' }, render: () => <Tab.Pane>{myPatients()}</Tab.Pane> },
    { menuItem: { key: 'require-approval', icon: 'key', content: 'Require Approval' }, render: () => <Tab.Pane>{requireApproval()}</Tab.Pane> }
    ]

    return(
      <div className="patient-dashboard">
        <h1><strong>Hello {this.getFullName()}!</strong></h1>
        <div className="dashboard-welcome">
          <h3>You have access to medical records of {this.state.sharedPatients.length} patients.</h3>
        </div>

        <div className="ui divider"></div>

        <Tab className="dashboard-main" menu={{ color: 'blue', inverted: false, fluid: true, vertical: true }} menuPosition='left' panes={panes} />



        {/* <Websocket url='ws://localhost:6001'
        onMessage={this.handleData.bind(this)}/> */}
      </div>
    );
  }

}

export default DoctorDashboard;
