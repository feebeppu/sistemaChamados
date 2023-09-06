import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../Contexts/auth'


export default function Private({ children }){

    const { signed, loading } = useContext(AuthContext)

    if(loading) {
        return(
            <div></div>
        )
    }
    // se não tiver logado, vai redirecionar para a página de login
    if(!signed) {
        return <Navigate to="/"/>
    }

    return children
}