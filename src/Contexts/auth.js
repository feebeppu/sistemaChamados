import { createContext, useState, useEffect } from "react";
import { auth, db } from '../Services/firebaseConnection';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AuthContext = createContext({})

function AuthProvider({ children }) {

    const [user, setUser] = useState(null)
    const [loadingAuth, setLoadingAuth] = useState(false)
    // esse loading criamos enquanto nossa app busca se tem alguém logado
    // passamos como true, pois ele sempre começará carregando, até buscar as informações do usuário
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()

    // aqui usamos o useEffect, para que toda vez que nossa app abrir, ele vai verificar no localStorage se tem dados 
    useEffect(() => {
        async function loadUser() {
            const storageUser = localStorage.getItem("@ticketsPRO")

            // se tem algo no storageUser, ele irá passar ao setUser os dados do localstorage, dizendo que tem alguém logado
            if(storageUser) {
                setUser(JSON.parse(storageUser))
                setLoading(false)
            }

            // caso não caia no if, passamos com false também para ele parar
            setLoading(false)
        }

        loadUser()
    }, [])

    async function signIn(email, password) {
        setLoadingAuth(true)

        await signInWithEmailAndPassword(auth, email, password)
        .then( async (value) => {
            // pegando os dados do nosso banco de dados, através do getDoc para passar para nossas states
            let uid = value.user.uid

            const docRef = doc(db, "users", uid)
            const docSnap = await getDoc(docRef)

            let data = {
                uid: uid,
                nome: docSnap.data().nome,
                email: value.user.email,
                avatarUrl: docSnap.data().avatarUrl
            }

            setUser(data)
            storageUser(data)
            setLoadingAuth(false)
            toast.success("Bem vindo(a) de volta!")
            navigate("/dashboard")
        })
        .catch((error) => {
            console.log(error)
            setLoadingAuth(false)
            toast.error("Ops, algo deu errado!")
        })
    }

    // Cadastrar novo usuário
    async function signUp(email, password, name) {
        setLoadingAuth(true)

        await createUserWithEmailAndPassword(auth, email, password)
        // passamos o value para acessar as informaçõe do usuário que gera pelo Authentication
        // cadastrando no banco de dados
        .then( async (value) => {
            let uid = value.user.uid

            await setDoc(doc(db, "users", uid), {
                nome: name,
                avatarUrl: null
            })
            .then(() => {

                let data = {
                    uid: uid,
                    nome: name,
                    email: value.user.email,
                    avatarUrl: null
                }

                setUser(data)
                // salvando no local storage
                storageUser(data)
                setLoadingAuth(false)
                toast.success("Seja bem-vindo ao sistema!")
                navigate("/dashboard")
            })
        })
        .catch((error) => {
            console.log(error)
            setLoadingAuth(false)
        })
    }

    function storageUser(data) {
        localStorage.setItem("@ticketsPRO", JSON.stringify(data))
    }

    // deslogando usuário
    async function logout() {
        await signOut(auth)
        localStorage.removeItem("@ticketsPRO")
        setUser(null)
    }

    return(
        <AuthContext.Provider 
        value={{
            // o "!!" converte nossa variável user para boleano, como ela está null, será false
            // com isso, sabemos se tem alguém logado ou não
            signed: !!user,
            user,
            signIn,
            signUp,
            logout,
            loadingAuth,
            loading,
            storageUser,
            setUser
        }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
