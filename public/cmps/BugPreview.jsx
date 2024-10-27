

export function BugPreview({ bug }) {

    return <article>
        <h4>{bug.title}</h4>
        <h1>🐛</h1>
        <p>Severity: <span>{bug.severity}</span></p>
        {bug.creator &&
            <h4>
                Owner: {bug.creator.fullname}
            </h4>
        }

    </article>
}