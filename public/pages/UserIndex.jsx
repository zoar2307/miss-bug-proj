import { userService } from "../services/user.service.js"

const { useState, useEffect, useRef } = React
const { useNavigate } = ReactRouter


export function UserIndex() {
    const user = userService.getLoggedInUser()
    const navigate = useNavigate()
    const [users, setUsers] = useState(null)


    useEffect(() => {
        if (!user || !user.isAdmin) navigate('/')
        loadUsers()
    }, [])


    function loadUsers() {
        userService.query().then(setUsers)
    }

    function onRemove(userId) {
        userService.remove(userId).then(() => {
            const usersToUpdate = users.filter((user) => user._id !== userId)
            setUsers(usersToUpdate)
        })
    }
    if (!users) return <div>Loading...</div>
    return (
        <section className="user-index">
            {user && user.isAdmin &&
                <React.Fragment>
                    {users.map(user => {
                        return <div key={user._id}>
                            Name : {user.fullname} | Id : {user._id} <button onClick={() => onRemove(user._id)}>delete</button>
                        </div>
                    })}
                </React.Fragment>}

        </section>
    )
}