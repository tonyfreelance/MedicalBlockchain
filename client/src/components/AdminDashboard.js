import React, {Component} from 'react';
import axios from 'axios';
import ipfs from '../ipfs';
import { Button, Form, Table, Dimmer, Loader, Segment } from 'semantic-ui-react';
import { Tab, Popup } from 'semantic-ui-react'

class AdminDashboard extends Component {

  state = {
    pendingList: [],
    approvedList: [],
    rejectedList: []
  }

  componentDidMount = () => {
    this.getRequests();
  }

  getRequests = () => {
    axios.get('/api/connect/getRequests')
    .then((response) => {
      console.log(response);
      let pendingList = [];
      let approvedList = [];
      let rejectedList = [];

      if (response.data !== undefined || response.data.length !== 0) {
        for (const request of response.data) {
          if (request.status === 'Pending') {
            pendingList.push(request);
          }
          else if (request.status === 'Approved') {
            approvedList.push(request);
          }
          else if (request.status === 'Rejected') {
            rejectedList.push(request);
          }
        }
        this.setState({pendingList, approvedList, rejectedList});
      }
    })
    .catch(error => {
      // Show error notification
      console.log(error);
    });
  }

  handleApproveRequest = (doctorKey) => {
    axios.post('/api/connect/approveRequest', {doctorKey: doctorKey})
    .then((response) => {
      console.log(response);
      this.getRequests();
    })
    .catch(error => {
      // Show error notification
      console.log(error);
    });
  }

  handleRejectRequest = (doctorKey) => {
    axios.post('/api/connect/rejectRequest', {doctorKey: doctorKey})
    .then((response) => {
      console.log(response);
      this.getRequests();
    })
    .catch(error => {
      // Show error notification
      console.log(error);
    });
  }

  render() {

    let pendingRequests = () => {
      return (
        <div>
          <h3>Pending Requests</h3>
          <div className="ui divider"></div>
          <Table padded structured>
            <thead>
              <tr>
                <th className="center aligned">Doctor Name</th>
                <th className="center aligned">More Information</th>
                <th className="center aligned">Action</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.pendingList.map((e,i) => {
                  return(
                    <tr key={i}>
                      <td className="center aligned">{e.doctorName}</td>
                      <td className="center aligned">
                        {/* <Popup trigger={<button className="ui icon medium basic button"><i className="info circle icon"></i></button>}>
                          {userInfo(e)}
                        </Popup> */}
                        <button className="ui icon medium basic button"><i className="info circle icon"></i></button>
                      </td>
                      <td className="center aligned">
                        <div className="two ui buttons">
                          <button className="ui compact positive button" onClick={() => this.handleApproveRequest(e.doctorKey)}>Approve</button>
                          <button className="ui compact negative button" onClick={() => this.handleRejectRequest(e.doctorKey)}>Reject</button>
                        </div>
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

    let approvedRequests = () => {
      return (
        <div>
          <h3>Approved Requests</h3>
          <div className="ui divider"></div>
          <Table padded>
            <thead>
              <tr>
                <th className="center aligned">Doctor Name</th>
                <th className="center aligned">More Information</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.approvedList.map((e,i) => {
                  return(
                    <tr key={i}>
                      <td className="center aligned">{e.doctorName}</td>
                      <td className="center aligned">
                        {/* <Popup trigger={<button className="ui icon medium basic button"><i className="info circle icon"></i></button>}>
                          {userInfo(e)}
                        </Popup> */}
                        <button className="ui icon medium basic button"><i className="info circle icon"></i></button>
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

    let rejectedRequests = () => {
      return (
        <div>
          <h3>Rejected Requests</h3>
          <div className="ui divider"></div>
          <Table padded>
            <thead>
              <tr>
                <th className="center aligned">Doctor Name</th>
                <th className="center aligned">More Information</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.rejectedList.map((e,i) => {
                  return(
                    <tr key={i}>
                      <td className="center aligned">{e.doctorName}</td>
                      <td className="center aligned">
                        {/* <Popup trigger={<button className="ui icon medium basic button"><i className="info circle icon"></i></button>}>
                          {userInfo(e)}
                        </Popup> */}
                        <button className="ui icon medium basic button"><i className="info circle icon"></i></button>
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

    const panes = [
    { menuItem: { key: 'pending-requests', icon: 'hourglass half', content: 'Pending Requests' }, render: () => <Tab.Pane>{pendingRequests()}</Tab.Pane> },
    { menuItem: { key: 'approved-requests', icon: 'thumbs up outline', content: 'Approved Requests' }, render: () => <Tab.Pane>{approvedRequests()}</Tab.Pane> },
    { menuItem: { key: 'rejected-requests', icon: 'thumbs down outline', content: 'Rejected Requests' }, render: () => <Tab.Pane>{rejectedRequests()}</Tab.Pane> },
    ]
  
    return(
      <div className="patient-dashboard">
        <h1><strong>Hello Admin!</strong></h1>
        <div className="dashboard-welcome">
          <h3>You have {this.state.pendingList.length} pending requests.</h3>
        </div>

        <div className="ui divider"></div>

        <Tab className="dashboard-main" menu={{ color: 'blue', inverted: false, fluid: true, vertical: true }} menuPosition='left' panes={panes} />



      </div>
    );
  }

}

export default AdminDashboard;
