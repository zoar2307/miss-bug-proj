import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'

const { useState, useEffect } = React

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [labels, setLabels] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())


    useEffect(() => {
        loadBugs()
        loadLabels()
        console.log(filterBy)
    }, [filterBy])

    function loadBugs() {
        bugService.query(filterBy).then(setBugs)
    }
    function loadLabels() {
        bugService.queryLabels().then(setLabels)
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Succesfully!')
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
                setFilterBy(bugService.getDefaultFilter())

            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?'),
            description: prompt('Bug description?'),
            labels: prompt('Add labels separate by , '),
            severity: +prompt('Bug severity?'),
        }
        console.log(bug)
        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug)
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
                setFilterBy(bugService.getDefaultFilter())
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
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


    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value
                break;

            case 'checkbox':
                value = target.checked
                break

            default:
                break;
        }

        setFilterBy(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    function onBuildPDF() {
        bugService.createPdf()
    }

    function onChangePage(diff) {
        setFilterBy(prevFilter => {
            let nextPageIdx = prevFilter.pageIdx + diff
            if (nextPageIdx < 0) nextPageIdx = 0
            return { ...prevFilter, pageIdx: nextPageIdx }
        })
    }

    function onLabelClicked(label) {
        console.log(label)
        if (filterBy.selectedLabels && filterBy.selectedLabels.includes(label)) {
            setFilterBy(prevFilterBy => ({
                ...prevFilterBy,
                selectedLabels: prevFilterBy.selectedLabels.filter(selectedLabel => selectedLabel !== label)
            }))
        }
        else {
            setFilterBy(prevFilterBy => ({
                ...prevFilterBy,
                selectedLabels: [...prevFilterBy.selectedLabels, label]
            }))
        }
    }


    return (
        <main>
            <section className='info-actions'>
                <div>
                    <label htmlFor="txt">Title : </label>
                    <input type="text" name="txt" id="txt" placeholder="Filter by Text" onChange={handleChange} />
                </div>

                <div className='labels-container'>
                    {labels &&
                        labels.map((label, idx) => {
                            const activeClass = filterBy.selectedLabels && filterBy.selectedLabels.includes(label.label) ? 'active' : ''
                            return <div onClick={() => onLabelClicked(label.label)} className={`label ${activeClass}`} key={label + idx}><span>{label.label}</span></div>
                        })}
                </div>

                <div>
                    <label htmlFor="minSeverity">Min severity : </label>
                    <select name="minSeverity" id="minSeverity" onChange={handleChange} value={filterBy.minSeverity}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="sortBy">Sort : </label>
                    <select name="sortBy" id="sortBy" onChange={handleChange} value={filterBy.sortBy} >
                        <option value="createdAt">created at</option>
                        <option value="title">Title</option>
                        <option value="severity">Severity</option>
                    </select>
                </div>


                <select name="sortDir" onChange={handleChange} value={filterBy.sortDir}>
                    <option value="1">Asc</option>
                    <option value="-1">Dec</option>
                </select>

                <div className='buttons'>
                    <button onClick={onAddBug}>Add Bug ⛐</button>
                    <button onClick={onBuildPDF}>PDF</button>
                </div>
            </section >
            <main>
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
                <div>
                    <button onClick={() => onChangePage(-1)}>Prev</button>
                    <button onClick={() => onChangePage(1)}>Next</button>
                </div>
            </main>
        </main >
    )
}
