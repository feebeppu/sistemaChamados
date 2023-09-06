import './title.css'

// passamos o children para acessar o icone que criamos dentro do component Title no arquivo do Profile
export default function Title({children, name}) {
    return(
        <div className="title">
            {children}
            <span>{name}</span>
        </div>
    )
}