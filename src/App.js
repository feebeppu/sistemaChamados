import { BrowserRouter, Route } from "react-router-dom";
import RoutesApp from "./Routes";

import AuthProvider from './Contexts/auth'

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <ToastContainer autoClose={3000}/>
          <RoutesApp />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
