import { useContext, useState } from 'react'
import Header from '../../Components/Header'
import Title from '../../Components/Title'

import { FiSettings, FiUpload } from 'react-icons/fi'
import avatar from '../../assets/avatar.png'
import { AuthContext } from '../../Contexts/auth'


import { db, storage } from '../../Services/firebaseConnection'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import { toast } from 'react-toastify'

import './profile.css'


export default function Profile() {

    const { user, storageUser, setUser, logout } = useContext(AuthContext)
    const [imageAvatar, setImageAvatar] = useState(null)

    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl)
    const [nome, setNome] = useState(user && user.nome)
    const [email, setEmail] = useState(user && user.email)

    function handleFile(e) {
        if(e.target.files[0]){
            const image = e.target.files[0]

            if(image.type === 'image/jpeg' || image.type === 'image/png'){
                setImageAvatar(image)
                setAvatarUrl(URL.createObjectURL(image))
            } else {
                alert("Envie uma imagem do tipo png ou jpeg")
                setImageAvatar(null)
                return
            }
        }
    }

    async function handleUpload() {
        const currentUid = user.uid
        // aqui passamos a referencia, aonde queremos enviar a foto, que é no storage do firebase
        // primeiro passamos o acesso e depois o caminho que ela irá ficar
        const uploadRef = ref(storage, `images/${currentUid}/${imageAvatar.name}`)
        // passamos primeiro a referencia e depois o que queremos enviar
        const uploadTask = uploadBytes(uploadRef, imageAvatar)
        // passamos o snapshot para acessar os dados que foram enviados
        .then((snapshot) => {
            getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                let urlFoto = downloadURL

                const docRef = doc(db, "users", user.uid)
                await updateDoc(docRef, {
                    avatarUrl: urlFoto,
                    nome: nome
                })
                .then(() => {
                    let data = {
                    ...user,
                    nome: nome,
                    avatarUrl: urlFoto
                }

                setUser(data)
                storageUser(data)
                toast.success("Atualizado com sucesso!")
                })
            })
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if(imageAvatar === null && nome !== '') {
            // Atualizar apenas o nome do user
            const docRef = doc(db, "users", user.uid)
            await updateDoc(docRef, {
                nome: nome
            })
            .then(() => {
                let data = {
                    ...user,
                    nome: nome
                }

                setUser(data)
                storageUser(data)
                toast.success("Atualizado com sucesso!")
            })
            .catch(() => {
                alert("Algo deu errado!")
            })
        } else if(nome !== '' && imageAvatar !== null) {
            // Atualizar nome e foto
            handleUpload()
        }
    }


    return(
        <div>
            <Header />

            <div className="content">
                <Title name="Minha conta">
                    <FiSettings size={25}/>
                </Title>

                <div className="container" onSubmit={handleSubmit}>
                    <form className="form-profile">
                        <label className="label-avatar">
                            <span>
                                <FiUpload color="FFF" size={25}/>
                            </span>

                            <input type="file" accept="image/*" onChange={handleFile}/> <br/>
                            {avatarUrl === null ? (
                                <img src={avatar} alt="foto de perfil" width={250} height={250}/>
                            ) : (
                                <img src={avatarUrl} alt="foto de perfil" width={250} height={250}/>
                            )}
                        </label>

                        <label>Nome</label>
                        <input type="text" value={nome} onChange={e => setNome(e.target.value)}/>

                        <label>Email</label>
                        <input type="text" value={email} disabled={true}/>

                        <button type="submit">Salvar</button>
                    </form>
                </div>

                <div className="container">
                    <button className="logout-btn" onClick={() => logout()}>Sair da conta</button>
                </div>
            </div>
        </div>
    )
}