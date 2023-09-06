import { useState, useEffect, useContext } from "react"

import Header from "../../Components/Header"
import Title from "../../Components/Title"
import { FiPlusCircle, FiEdit2 } from "react-icons/fi"

import { AuthContext } from "../../Contexts/auth"
import { db } from "../../Services/firebaseConnection"
import { collection, getDocs, getDoc, doc, addDoc, updateDoc } from "firebase/firestore"

import { useParams, useNavigate } from "react-router-dom"

import { toast } from "react-toastify"

import "./new.css"

const listRef = collection(db, "customers")

export default function New() {

    const { user } = useContext(AuthContext)
    const { id } = useParams()
    const navigate = useNavigate()

    const [customers, setCustomers] = useState([])
    const [loadCustomer, setLoadCustomer] = useState(true)
    const [customerSelected, setCustomerSelected] = useState(0)

    const [complemento, setComplemento] = useState("")
    const [assunto, setAssunto] = useState("Suporte")
    const [status, setStatus] = useState("Aberto")
    const [idCustomer, setIdCustomer] = useState(false)

    useEffect(() =>{

        async function loadCustomers() {
            // buscandos os dados do "customers" do nosso banco de dados
            const querySnapshot = await getDocs(listRef)
            .then((snapshot) => {
                let lista = []

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        nomeFantasia: doc.data().nomeFantasia
                    })
                })
                
                // se ele não encontrar nenhum item no banco de dados
                if(snapshot.docs.size === 0) {
                    console.log('Nenhuma empresa encontrada')
                    setCustomers([ {id: '1', nomeFantasia: 'FREELA'} ])
                    setLoadCustomer(false)
                    return
                } 

                setCustomers(lista)
                setLoadCustomer(false)

                if(id) {
                    loadId(lista)
                }
             })
            .catch((error) => {
                console.log("Erro ao buscar os clientes", error)
                setLoadCustomer(false)
                setCustomers([ {id: '1', nomeFantasia: 'FREELA'} ])
            })
        }

        loadCustomers()
        // passamos o id como array de depêndencias, para que, caso tenha um id, ele chama para usar no useEffect
    }, [id])

    async function loadId(lista) {
        // pegando o chamado pelo id especifico
        const docRef = doc(db, "chamados", id)
        await getDoc(docRef)
        .then((snapshot) => {
            setAssunto(snapshot.data().assunto)
            setStatus(snapshot.data().status)
            setComplemento(snapshot.data().complemento)
            
            // buscando se em nossa lista, tem algum cliente que tem o id igual ao id do cliente do snapshot que buscamos
            let index = lista.findIndex(item => item.id === snapshot.data().clienteId)
            setCustomerSelected(index)
            // passamos para true, pq ele entende que acessamos a tela de editar
            setIdCustomer(true)

        })
        .catch((error) => {
            console.log(error)
            setIdCustomer(false)
        })
    }

    function handleOptionChange(e) {
        setStatus(e.target.value)
    }

    function handleChangeSelect(e) {
        setAssunto(e.target.value)
    }

    function handleChangeCustomer(e) {
        // e.target.value nesse caso, retorna o value que passamos na tag option, que será o index do item da nossa lista
        setCustomerSelected(e.target.value)
        console.log(e.target.value)
    }

    async function handleRegister(e) {
        e.preventDefault()

        if(idCustomer) {
            // Atualizando chamado
            const docRef = doc(db, "chamados", id)
            await updateDoc(docRef, {
                cliente: customers[customerSelected].nomeFantasia,
                clienteId: customers[customerSelected].id,
                assunto: assunto,
                complemento: complemento,
                status: status,
                userId: user.uid
            })
            .then(() => {
                toast.success("Chamado atualizado com sucesso!")
                setCustomerSelected(0)
                setComplemento("")
                navigate("/dashboard")
            })
            .catch((error) => {
                toast.error("Ops, erro ao atualizar este chamado!")
                console.log(error)
            })

            return
        }

        // registrar chamado
        await addDoc(collection(db, "chamados"), {
            created: new Date(),
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            complemento: complemento,
            status: status,
            userId: user.uid
        })
        .then(() => {
            toast.success("Chamado Registrado!")
            setComplemento("")
            setCustomerSelected(0)
        })
        .catch((error) => {
            console.log(error)
            toast.error("Erro ao registrar!")
        })
    }

    return(
        <div>
            <Header />

            <div className="content">
                <Title name={id ? "Editando Chamado" : "Novo Chamado"}>
                    {idCustomer === true ? <FiEdit2 size={25}/> : <FiPlusCircle size={25} />}
                </Title>

                <div className="container">
                    <form className="form-profile" onSubmit={handleRegister}>

                        <label>Clientes</label>
                        {
                            loadCustomer ? (
                                <input type="text" disabled={true} value="Carregando..." />
                            ) : (
                                // o value inicial do select será "0" que é o valor inicial da nossa state customerSelected, que será sempre o primeiro da lista do nosso banco de dados, assim passamos qual o customer está de fato sendo selecionado
                                // handleChangeCustomer irá alterar o value da state customerSelected, baseado no value da option selecionada, que no caso passamos o index da lista customers
                                <select value={customerSelected} onChange={handleChangeCustomer}>
                                    {customers.map((item, index) => {
                                        return(
                                            <option key={index} value={index}>
                                                {item.nomeFantasia}
                                            </option>
                                        )
                                    })}
                                </select>
                            )
                        }

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value="Suporte">Suporte</option>
                            <option value="Visita Tecnica">Visita Tecnica</option>
                            <option value="Financeiro">Financeiro</option>
                        </select>

                        <label>Status</label>
                        <div className="status">
                            <input
                                type="radio"
                                name="radio"
                                value="Aberto"
                                onChange={handleOptionChange}
                                // ele só vai marcar o check se o status dele for igual ao value que passamos para cada input
                                checked={ status === 'Aberto'}
                            />
                            <span>Em aberto</span>
                            <input
                                type="radio"
                                name="radio"
                                value="Progresso"
                                onChange={handleOptionChange}
                                checked={ status === 'Progresso'}
                            />
                            <span>Progresso</span>
                            <input
                                type="radio"
                                name="radio"
                                value="Atendido"
                                onChange={handleOptionChange}
                                checked={ status === 'Atendido'}
                            />
                            <span>Atendido</span>
                        </div>

                        <label>Complemento</label>
                        <textarea
                            type="text"
                            placeholder="Descreva seu problema (opicional)."
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                        />

                        <button type="submit">Registar</button>
                    </form>
                </div>
            </div>
        </div>
    )
}