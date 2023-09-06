import { useState } from 'react'
import Header from '../../Components/Header'
import Title from '../../Components/Title'

import { FiUser } from 'react-icons/fi'

import { db } from '../../Services/firebaseConnection'
import { addDoc, collection } from 'firebase/firestore'

import { toast } from 'react-toastify'

export default function Customers() {

    const [nome, setNome] = useState("")
    const [cnpj, setCnpj] = useState("")
    const [endereco, setEndereco] = useState("")


    async function handleRegister(e) {
        e.preventDefault()
        
        if(nome !== '' && cnpj !== '' && endereco !== '') {
            await addDoc(collection(db, "customers"), {
                nomeFantasia: nome,
                cnpj: cnpj,
                endereco: endereco
            })
            .then(() => {
                setNome("")
                setCnpj("")
                setEndereco("")
                toast.success("Cliente cadastrada com sucesso!")
            })
            .catch((error) => {
                toast.error("Erro ao fazer o cadastro!")
            })
        } else {
            toast.error("Preencha todos os campos!")
        }
    }

    return(
        <div>
            <Header />

            <div className="content">
                <Title name="Clientes">
                    <FiUser size={25}/>
                </Title>

                <div className="container">
                    <form className="form-profile" onSubmit={handleRegister}>
                        <label>Nome Fantasia</label>
                        <input
                            type="text"
                            placeholder="Nome da empresa"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                        <label>CNPJ</label>
                        <input
                            type="number"
                            placeholder="Digite o CNPJ"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                        />
                        <label>Endereço</label>
                        <input
                            type="text"
                            placeholder="Digite o endereço da empresa"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                        />

                        <button type="submit">Cadastrar</button>
                    </form>
                </div>
            </div>
        </div>
    )
}