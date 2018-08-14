import App from './components/App';
import Home from './components/Home';
import Patient from './components/Patient';
import PatientDashboard from './components/PatientDashboard';
import Doctor from './components/Doctor';
import DoctorDashboard from './components/DoctorDashboard';
import Admin from './components/Admin';
import AdminDashboard from './components/AdminDashboard';

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
      component: PatientDashboard
    },
    {
      path: '/doctor',
      component: Doctor
    },
    {
      path: '/doctor/dashboard',
      component: DoctorDashboard
    },
    {
      path: '/admin',
      component: Admin
    },
    {
      path: '/admin/dashboard',
      component: AdminDashboard
    },
  ]
};

export default routes;
