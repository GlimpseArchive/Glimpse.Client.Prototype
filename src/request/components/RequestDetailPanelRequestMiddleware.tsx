import { trainCase } from '../../lib/StringUtilities';

import * as _ from 'lodash';
import * as React from 'react';

interface IFlattenedMiddleware {
    depth: number;
    middleware: {
        name: string,
        packageName: string,
        headers: { [key: string]: { value: string, isCurrent: boolean } }
    };
}

export interface IRequestMiddlewareProps {
    middleware: IFlattenedMiddleware[];
}

export class RequestMiddleware extends React.Component<IRequestMiddlewareProps, {}> {
    public render() {
        return (
            <div className='tab-request-middleware'>
                <div className='tab-request-title'>Middleware</div>
                <br />
                <table className='table table-bordered table-striped table-selectable tab-request-middleware-table'>
                    <thead>
                        <tr className='table-col-title-group'>
                            <th width='10%'><span className='table-col-title'>Ordinal</span></th>
                            <th width='25%'><span className='table-col-title'>Name</span></th>
                            <th width='20%'><span className='table-col-title'>Type</span></th>
                            <th width='10%'><span className='table-col-title'>Modify</span></th>
                            <th width='25%'><span className='table-col-title'>Parameter</span></th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.middleware.map((middlewareRow, index) => this.renderMiddlewareRow(index + 1, middlewareRow)) }
                    </tbody>
                </table>
            </div>
        );
    }

    private renderMiddlewareRow(ordinal: number, middleware: IFlattenedMiddleware) {
        return (
            <tr>
                <td>{ordinal}</td>
                <td>{this.renderName(middleware.middleware.name, middleware.depth)}</td>
                <td>{middleware.middleware.packageName}</td>
                <td>{_.size(middleware.middleware.headers) > 0 ? 'Header' : '-'}</td>
                <td>{this.renderMiddlewareHeaders(middleware.middleware.headers)}</td>
                <td />
            </tr>
        );
    }

    private renderName(name: string, depth: number) {
        return (
            <div>
                {this.renderIndent(depth)}<span>{name}</span>
            </div>
        );
    }

    private renderIndent(depth: number) {
        if (depth > 0) {
            const spans = [];

            for (let i = 0; i < depth; i++) {
                spans.push(<span className='tab-request-middleware-indent' />);
            }

            return spans;
        }
        else {
            return null; /* tslint:disable-line:no-null-keyword */
        }
    }

    private renderMiddlewareHeaders(headers: { [key: string]: { value: string } }) {
        return (
            <div className='tab-request-middleware-headers'>
                <ul>
                    {
                        _(headers)
                            .map((value, key) => { return { key: key, value: value }; })
                            .sortBy(pair => pair.key)
                            .map(pair => pair.value.isCurrent ? this.renderCurrentHeader(pair.key, pair.value.value) : this.renderOverwrittenHeader(pair.key, pair.value.value))
                            .value()
                    }
                </ul>
            </div>
        );
    }

    private renderOverwrittenHeader(key: string, value: string) {
        return (
            <li key={key}><span className='tab-request-middleware-header-overwritten'>{trainCase(key) + ' : ' + value}</span></li>
        );
    }

    private renderCurrentHeader(key: string, value: string) {
        return (
            <li key={key}><span className='tab-request-middleware-header-key'>{trainCase(key)}: </span><span className='tab-request-middleware-header-value'>{value}</span></li>
        );
    }
}
