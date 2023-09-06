import { Routes, Route } from 'react-router-dom'

import SignIn from '../Pages/SignIn'
import SignUp from '../Pages/SignUp'
import Dashboard from '../Pages/Dashboard'
import Profile from '../Pages/Profile'
import Customers from '../Pages/Customers'
import New from '../Pages/New'

import Private from './Private'

function RoutesApp() {
    return(
        <Routes>
            <Route path="/" element={ <SignIn /> }/>
            <Route path="/register" element={ <SignUp /> }/>

            <Route path="/dashboard" element={ <Private> <Dashboard/> </Private> } />
            <Route path="/profile" element={<Private> <Profile/> </Private>} />
            <Route path="/customers" element={<Private> <Customers/> </Private>} />
            <Route path="/new" element={<Private> <New /> </Private>} />
            <Route path="/new/:id" element={<Private> <New /> </Private>} />

        </Routes>
    )
}

export default RoutesApp