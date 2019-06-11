import * as React from 'react'
import { FileSystemTree } from './components/FileSystemTree'
import { JournalTable } from './components/JournalTable'
import { SplitPane } from './components/SplitPane'
import { TransactionLists } from './components/TransactionLists'
import { Actions, Database, Journal, Node, nodeIsFile, NodePath, StringPath } from './Database'

export function App() {
    const [actions, setActions] = React.useState<Actions>({})
    const [database, setDatabase] = React.useState(
        () => new Database((actions, wait) => new Promise(res => setTimeout(() => res(setActions(actions)), wait)))
    )

    return (
        <div className='d-flex flex-column vw-100 vh-100'>
            <nav className='navbar navbar-light bg-light shadow-sm'>
                <span className='navbar-brand mb-0'>FS Database</span>
            </nav>
            <div className='d-flex flex-fill w-100'>
                <SplitPane split='vertical' base={'75%'} left={100} right={-100}>
                    <SplitPane split='vertical' base={'50%'} left={100} right={-100}>
                        <div className='d-flex flex-column w-100 h-100'>
                            <h5 className='text-center shadow-sm p-2 mb-2 w-100'>DISK</h5>
                            <FileSystemJournal
                                fs={database.persistentFs}
                                prefix='persistent'
                                journal={database.persistentJournal}
                                actions={{
                                    ...actions,
                                    write: undefined,
                                    create: undefined,
                                    delete: undefined,
                                    rename: undefined
                                }}
                            />
                        </div>
                        <div className='d-flex flex-column w-100 h-100'>
                            <h5 className='text-center shadow-sm p-2 mb-2 w-100'>MEMORY</h5>
                            <FileSystemJournal
                                fs={database.volatileFs}
                                prefix='volatile'
                                journal={database.volatileJournal}
                                actions={{ ...actions, read: undefined }}
                            />
                        </div>
                    </SplitPane>
                    <div className='d-flex flex-column w-100 h-100'>
                        <ControlPanel actions={actions} database={database} />
                    </div>
                </SplitPane>
            </div>
        </div>
    )
}

function FileSystemJournal(props: { fs: Node; prefix: string; journal: Journal; actions: Actions }) {
    return (
        <SplitPane split='horizontal' base={'50%'} left={100} right={-100}>
            <div className='d-flex flex-column w-100 h-100'>
                <h6 className='text-center p-1 mb-1 w-100'>File System</h6>
                <FileSystemTree fs={props.fs} prefix={props.prefix} actions={props.actions} />
            </div>
            <div className='d-flex flex-column w-100 h-100'>
                <h6 className='text-center p-1 mb-1 w-100'>Journal</h6>
                <div className='d-flex overflow-auto w-100'>
                    <JournalTable journal={props.journal} />
                </div>
            </div>
        </SplitPane>
    )
}

function ControlPanel(props: { actions: Actions; database: Database }) {
    return (
        <>
            <RecoveryAlgorithms chosenRA={'ur'} />
            <TransactionActions actions={props.actions} />
            <TransactionLists
                active={[...props.database.activeTransactions].sort().map(transaction => transaction.toString())}
                consolidated={[...props.database.consolidatedTransactions]
                    .sort()
                    .map(transaction => transaction.toString())}
                aborted={[...props.database.abortedTransactions].sort().map(transaction => transaction.toString())}
            />
        </>
    )
}

function RecoveryAlgorithms(props: { chosenRA: string; onChooseRA?: (algorithm: string) => void }) {
    React.useEffect(() => {
        if (props.chosenRA != undefined && !!props.onChooseRA) props.onChooseRA('ur')
    }, [])

    return (
        <div className='d-flex flex-column shadow-sm m-2 w-100'>
            <h6 className='text-center p-2 mb-1'>Recovery Algorithms</h6>
            <div className='d-flex m-2'>
                <button
                    type='button'
                    className={`btn ${props.chosenRA === 'ur' ? 'btn-primary' : 'btn-outline-secondary'} flex-fill m-2`}
                    style={{ width: '33%' }}
                    disabled={!props.onChooseRA}
                    onClick={event => props.onChooseRA('ur')}
                >
                    <span className='d-block'>immediate</span>
                    (UNDO/REDO)
                </button>
                <button
                    type='button'
                    className={`btn ${
                        props.chosenRA === 'unr' ? 'btn-primary' : 'btn-outline-secondary'
                    } flex-fill m-2`}
                    style={{ width: '33%' }}
                    disabled={!props.onChooseRA}
                    onClick={event => props.onChooseRA('unr')}
                >
                    <span className='d-block'>immediate</span>
                    (UNDO/NO-REDO)
                </button>
                <button
                    type='button'
                    className={`btn ${
                        props.chosenRA === 'nur' ? 'btn-primary' : 'btn-outline-secondary'
                    } flex-fill m-2`}
                    style={{ width: '33%' }}
                    disabled={!props.onChooseRA}
                    onClick={event => props.onChooseRA('nur')}
                >
                    <span className='d-block'>delayed</span>
                    (NO-UNDO/REDO)
                </button>
            </div>
        </div>
    )
}

function TransactionActions(props: { actions: Actions }) {
    return (
        <div className='d-flex flex-column shadow-sm m-2 w-100'>
            <h6 className='text-center p-2 mb-1'>Transaction Actions</h6>
            <div className='d-flex mx-2 mb-2'>
                <button
                    type='button'
                    className='btn btn-outline-success m-2 w-25'
                    disabled={!props.actions.start}
                    onClick={props.actions.start}
                >
                    Start Transaction
                </button>
                <button
                    type='button'
                    className='btn btn-outline-primary m-2 w-25'
                    disabled={!props.actions.commit}
                    onClick={props.actions.commit}
                >
                    Commit Transaction
                </button>
                <button
                    type='button'
                    className='btn btn-outline-warning m-2 w-25'
                    disabled={!props.actions.abort}
                    onClick={props.actions.abort}
                >
                    Abort Transaction
                </button>
                <button
                    type='button'
                    className='btn btn-outline-danger  m-2 w-25'
                    disabled={!props.actions.restart}
                    onClick={props.actions.restart}
                >
                    Restart (Fail)
                </button>
            </div>
        </div>
    )
}
