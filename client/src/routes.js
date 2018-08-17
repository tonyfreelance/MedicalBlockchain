import App from './components/App';
import Home from './components/Home';
import Patient from './components/Patient';
import PatientDashboard from './components/PatientDashboard';
import Doctor from './components/Doctor';
import DoctorDashboard from './components/DoctorDashboard';
import Admin from './components/Admin';
import AdminDashboard from './components/AdminDashboard';
import Auth from './Auth';

const routes = {
  // base component (wrapper for the whole application).
  component: App,
  childRoutes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/patient',
      component: Patient
    },
    {
      path: '/patient/dashboard',
      component: PatientDashboard,
      onEnter: (nextState, replace) => {
        if (!Auth.isUserAuthenticated()) {
          replace('/');
        }
      }
    },
    {
      path: '/doctor',
      component: Doctor
    },
    {
      path: '/doctor/dashboard',
      component: DoctorDashboard,
      onEnter: (nextState, replace) => {
        if (!Auth.isUserAuthenticated()) {
          replace('/');
        }
      }
    },
    {
      path: '/admin',
      component: Admin
    },
    {
      path: '/admin/dashboard',
      component: AdminDashboard,
      onEnter: (nextState, replace) => {
        if (!Auth.isUserAuthenticated()) {
          replace('/');
        }
      }
    },
    {
      path: '/logout',
      onEnter: (nextState, replace) => {
        Auth.deauthenticateUser();
        localStorage.removeItem('email');
        // change the current URL to /
        replace('/');
      }
    },
  ]
};

export default routes;
