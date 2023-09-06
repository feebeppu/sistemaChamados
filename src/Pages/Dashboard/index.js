import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../Contexts/auth"

import Header from "../../Components/Header"
import Title from "../../Components/Title"
import { FiPlus, FiMessageSquare, FiSearch, FiEdit2 } from "react-icons/fi"

import { Link } from "react-router-dom"
import { collection, getDocs, orderBy, limit, startAfter, query } from "firebase/firestore"
import { db } from "../../Services/firebaseConnection"

import { format } from "date-fns"
import Modal from "../../Components/Modal"

import './dashboard.css'

const listRef = collection(db, "chamados")

export default function Dashboard() {
    const { logout } = useContext(AuthContext)

    const [chamados, setChamados] = useState([])
    const [loading, setLoading] = useState(true)

    const [isEmpty, setIsEmpty] = useState(false)
    const [lastDocs, setLastDocs] =useState()
    const [loadingMore, setLoadingMore] = useState(false)

    const [showModal, setShowModal] = useState(false)
    const [detail, setDetail] = useState()

    useEffect(() => {
        async function loadChamados(){
            // aqui ordenamos a lista pela ordem de abertura do chamado e vai buscar no máximo os 5 últimos chamados que foram cadastrados
            const q = query(listRef, orderBy('created', 'desc'), limit(5))

            // pegamos nosssos chamados do banco de dados através da const q e passamos para o querySnapshot que será o parâmetro da nossa função updateState
            const querySnapshot = await getDocs(q)
            // aqui zeramos nossa lista chamados, para concertar o bug do <React.StrictMode>, quando o useEffect passa duas vezes e exibe por exemplo, 2 vezes a nossa lista na tela
            setChamados([])
            await updateState(querySnapshot)

            setLoading(false)
        }

        loadChamados()

        return () => {}
    }, [])

    async function updateState(querySnapshot) {
        // se estiver vazio, recebe como "true"
        const isCollectionEmpty = querySnapshot.size === 0

        if(!isCollectionEmpty) {
            let lista = []

            querySnapshot.forEach((doc) => {
                lista.push({
                    id: doc.id,
                    assunto: doc.data().assunto,
                    cliente: doc.data().cliente,
                    clienteId: doc.data().clienteId,
                    created: doc.data().created,
                    createdFormat: format(doc.data().created.toDate(), 'dd/MM/yyyy'),
                    status: doc.data().status,
                    complemento: doc.data().complemento
                })
            })

            // buscando último item da lista renderizada
            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
            
            // se caso já tiver algo na nossa lista, pegamos esse e acrescentamos a mais a nossa let lista, pois não queremos substituir, queremos acrescentar
            setChamados(chamados => [...chamados, ...lista])
            setLastDocs(lastDoc)

        } else {
            setIsEmpty(true)
        }

        setLoadingMore(false)
    }

   async function handleMore() {
        setLoadingMore(true)

        const q = query(listRef, orderBy('created', 'desc'), startAfter(lastDocs), limit(5))
        const querySnapshot = await getDocs(q)

        await updateState(querySnapshot)
    }
    
    function toggleModal(item) {
        // estamos negando o "false" que é o valor inicial dele, então ele vai para true
        setShowModal(!showModal)
        setDetail(item)
    }

    if(loading) {
        return(
            <div>
                <Header />

                <div className="content">
                    <Title name="Tickets">
                        <FiMessageSquare size={25} />
                    </Title>

                    <div className="container dashboard">
                        <span>Buscando chamados...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Header />
            
            <div className="content">
                <Title name="Tickets">
                    <FiMessageSquare size={25} />
                </Title>

                <>
                    {chamados.length === 0 ? (
                        <div className="container dashboard">
                            <span>Nenhum chamado encontrado!</span>
                            <Link to="/new" className="new">
                             <FiPlus color="#FFF" size={25}/>
                             Novo Chamado
                            </Link>
                        </div>
                    ) : (
                        <>
                          <Link to="/new" className="new">
                            <FiPlus color="#FFF" size={25}/>
                            Novo Chamado
                          </Link>

                          <table>
                            <thead>
                                <tr>
                                    <th scope="col">Cliente</th>
                                    <th scope="col">Assunto</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Cadastrado em</th>
                                    <th scope="col">#</th>
                                </tr>
                            </thead>  
                            <tbody>
                                {chamados.map((item, index) => {
                                    return(
                                        <tr key={index}>
                                            <td data-label="Cliente">{item.cliente}</td>
                                            <td data-label="Assunto">{item.assunto}</td>
                                            <td data-label="Status">
                                            <span className="badge" style={{ backgroundColor: item.status === 'Aberto' ? '#5cb85c' : '#999'}}>
                                                {item.status}
                                            </span>
                                            </td>
                                            <td data-label="Cadastrado">{item.createdFormat}</td>
                                            <td data-label="#">
                                                <button className="action" style={{ backgroundColor: "#3583f6"}} onClick={() => toggleModal(item)}>
                                                    <FiSearch color="#FFF" size={17}/>
                                                </button>
                                                <Link to={`/new/${item.id}`} className="action" style={{ backgroundColor: "#f6a935"}}>
                                                    <FiEdit2 color="#FFF" size={17}/>
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                          </table>
                        
                          {/* se loadingMore está como true ele irá mostrar o h3 */}
                          {loadingMore && <h3>Buscando mais chamados...</h3>}
                          {!loadingMore && !isEmpty && <button className="btn-more" onClick={handleMore}>Buscar mais</button>}
                        </>
                    )}

                    
                </>
            </div>

            {showModal && (
                <Modal 
                    conteudo={detail}
                    close={() => setShowModal(!showModal)}
                />
            )}
        </div>
    )
}