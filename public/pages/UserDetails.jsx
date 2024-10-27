import { BugList } from "../cmps/BugList.jsx"
import { bugService } from "../services/bug.service.js"
import { userService } from "../services/user.service.js"
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'


const { useState, useEffect, useRef } = React
const { useNavigate } = ReactRouter
const { Link } = ReactRouterDOM



export function UserDetails() {
    const navigate = useNavigate()
    const user = userService.getLoggedInUser()
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState({ ...bugService.getDefaultFilter(), creatorId: user._id })


    useEffect(() => {
        if (!user) navigate('/')
        loadBugs()
    }, [])


    function loadBugs() {
        bugService.query(filterBy).then(setBugs)
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                const bugsToUpdate = bugs.map((currBug) =>
                    currBug._id === savedBug._id ? savedBug : currBug
                )
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }

    function onChangePage(diff) {
        setFilterBy(prevFilter => {
            let nextPageIdx = prevFilter.pageIdx + diff
            if (nextPageIdx < 0) nextPageIdx = 0
            return { ...prevFilter, pageIdx: nextPageIdx }
        })
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Succesfully!')
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    return (
        <section className="user-details">
            {user && <React.Fragment>
                <h2>{user.fullname}</h2>
                <h3>{user.username}</h3>
                <h3>{user.isAdmin && <Link to={`/user/admin`}>Admin page</Link>}</h3>
                {bugs ? <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} /> : <div>This user has no bugs</div>}

                <div>
                    <button onClick={() => onChangePage(-1)}>Prev</button>
                    <button onClick={() => onChangePage(1)}>Next</button>
                </div>
            </React.Fragment>}


        </section>
    )
}