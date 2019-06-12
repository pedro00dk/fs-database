import * as React from 'react'
import { Journal } from '../Database'

export function JournalTable(props: { journal: Journal }) {
    const journal = [...props.journal].reverse()

    const logDecorations: { [operation: string]: string } = {
        start: 'table-success',
        commit: 'table-primary',
        abort: 'table-warning',
        check: 'table-secondary'
    }

    return (
        <table className='table table-sm table-bordered m-0 w-100 h-100' style={{ tableLayout: 'fixed' }}>
            <thead>
                <tr>
                    <th style={{ width: '12%' }}>tid</th>
                    <th style={{ width: '12%' }}>time</th>
                    <th style={{ width: '15%' }}>op</th>
                    <th style={{ width: '31%' }}>object</th>
                    <th style={{ width: '15%' }}>{'<<'}</th>
                    <th style={{ width: '15%' }}>{'>>'}</th>
                </tr>
            </thead>
            <tbody>
                {journal.map((entry, i) => (
                    <tr key={i} className={logDecorations[entry.operation]}>
                        <th className='text-truncate' style={{ width: '12%' }} title={entry.transaction}>
                            {entry.transaction}
                        </th>
                        <td
                            className='text-truncate'
                            style={{ width: '12%' }}
                            title={`${entry.timestamp.getMinutes()}:${entry.timestamp.getSeconds()}`}
                        >
                            {entry.timestamp.getMinutes()}:{entry.timestamp.getSeconds()}
                        </td>
                        <td className='text-truncate' style={{ width: '15%' }} title={entry.operation}>
                            {entry.operation}
                        </td>
                        <td
                            className='text-truncate'
                            style={{ width: '31%' }}
                            title={`${!!entry.object ? entry.object.join('/') : ''}`}
                        >{`${!!entry.object ? entry.object.join('/') : ''}`}</td>
                        <td className='text-truncate' style={{ width: '15%' }} title={entry.before}>
                            {entry.before}
                        </td>
                        <td className='text-truncate' style={{ width: '15%' }} title={entry.after}>
                            {entry.after}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
