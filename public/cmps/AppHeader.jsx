const { NavLink } = ReactRouterDOM
const { useEffect, useState } = React
const { useNavigate } = ReactRouter

import { userService } from '../services/user.service.js'
import { UserMsg } from './UserMsg.jsx'

export function AppHeader() {
    const [user, setUser] = useState(userService.getLoggedInUser())
    const navigate = useNavigate()
    function onLogout() {
        userService.logout()
            .then(() => onSetUser(null))
            .catch(err => console.log(err))
    }

    function onSetUser(user) {
        setUser(user)
        navigate('/')
    }

    return (
        <header className='container'>
            <UserMsg />
            <nav>
                <NavLink to="/">Home</NavLink>
                |<NavLink to="/bug">Bugs</NavLink> |
                <NavLink to="/about">About</NavLink>
                {user ? (
                    <div>
                        <h5>{user.fullname} </h5>
                        <button onClick={onLogout}>Logout</button>
                    </div>


                ) : (
                    <div>
                        <NavLink to="/login">
                            Login
                        </NavLink>
                    </div>
                )}

            </nav>
            <h1>Bugs are Forever</h1>
        </header>
    )
}
