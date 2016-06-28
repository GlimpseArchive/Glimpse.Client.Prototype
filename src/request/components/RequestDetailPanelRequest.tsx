import { TabbedPanel } from './TabbedPanel';
import { TabPanel } from './TabPanel';
import { trainCase } from '../../lib/StringUtilities';

import requestConverter = require('../repository/converter/request-converter');

import _ = require('lodash');
import Highlight = require('react-highlight');
import React = require('react');
import parseUrl = require('url-parse');

interface IFlattenedMiddleware {
    depth: number;
    middleware: { 
        name: string, 
        packageName: string, 
        headers: { [key: string]: string }
    };
}

export interface IRequestProps {
    url: string;
    middleware: IFlattenedMiddleware[],
    request: {
        body: string;
        contentType: string;
        formData: { [key: string]: string };
        headers: { [key: string]: string }
    };
    response: {
        body: string;
        contentType: string;
        headers: { [key: string]: string };
    };
}

export class Request extends React.Component<IRequestProps, {}> {
    public render() {
        let content;
        if (this.props.url && this.props.request && this.props.response) {
            const parsedUrl = parseUrl(this.props.url, /* parse query string */ true);
            const query = parsedUrl.query as { [key: string]: string };

            content = (
                <div className='tab-request'>
                    <div className='tab-request-response'>
                        { this.renderRequestResponse('Request', this.props.request.body, this.props.request.contentType, this.props.request.headers, query, this.props.request.formData) }
                        <div className='tab-request-separator' />
                        { this.renderRequestResponse('Response', this.props.response.body, this.props.response.contentType, this.props.response.headers) }
                    </div>
                    { this.renderMiddleware() }
                </div>
            );
        }
        else {
            content = <div className='tab-section text-minor'>Could not find any data.</div>;
        }

        return content;
    }

    private renderRequestResponse(title: string, body: string, contentType: string, headers: { [key: string]: string }, query?: { [key: string]: string }, formData?: { [key: string]: string }) {
        const panels = [
            { header: 'Headers', renderContent: () => this.renderHeaders(headers) },
            { header: 'Body', renderContent: () => this.renderBody(body, contentType) }
        ];

        if (!_.isEmpty(query) || !_.isEmpty(formData)) {
            panels.push({ header: 'Params', renderContent: () => this.renderParams(query, formData) });
        }
        
        return (
            <div className='tab-request-response-panel'>
                <div className='tab-request-title'>{title}</div>
                <br />
                <TabbedPanel>
                    { 
                        panels.map(panel => {
                            return (
                                <TabPanel header={panel.header}>
                                    { panel.renderContent() }
                                </TabPanel>
                            );
                        }) 
                    }
                </TabbedPanel>
            </div>
        );     
    }

    private renderHeaders(headers: { [key: string]: string}) {
        return (
            <div className='tab-request-headers'>
                <ul>
                    { 
                        _(headers)
                            .map((value, key) => { return { key: key, value: value }; })
                            .sortBy(pair => pair.key)
                            .map(pair => this.renderHeader(pair.key, pair.value))
                            .value() 
                    }
                </ul>
            </div>
        );
    }

    private renderHeader(key: string, value: string) {
        return (
            <li key={key}><span className='tab-request-header-key'>{trainCase(key)}: </span><span>{value}</span></li>
        );
    }

    private renderBody(body: string, contentType: string) {
        const highlightClassName = this.getHighlightClassNameForContentType(contentType);

        return (
            <div className='tab-request-body'>
                <Highlight className={highlightClassName}>{body}</Highlight>
            </div>
        );
    }

    private renderParams(query: { [key: string]: string }, formData: { [key: string]: string }) {
        return (
            <div className='tab-request-params'>
                { !_.isEmpty(query) ? this.renderParameterSet('Query String', query) : null }
                { !_.isEmpty(formData) ? this.renderParameterSet('Form Data', formData) : null }
            </div>
        );
    }

    private renderParameterSet(title: string, set: { [key: string]: string }) {
        return (
            <div className='tab-request-parameter-set'>
                <div className='tab-request-parameter-title'>{title}</div>
                <ul>
                    { 
                        _(set)
                            .map((value, key) => { return { key: key, value: value }; })
                            .sortBy(pair => pair.key)
                            .map(pair => this.renderParameter(pair.key, pair.value))
                            .value() 
                    }
                </ul>
            </div>
        );
    }

    private renderParameter(key: string, value: string) {
        return (
            <li key={key}><span className='tab-request-parameter-key'>{key}: </span><span>{value}</span></li>
        );
    }

    private renderMiddleware() {
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
                <td>{this.renderHeaders(middleware.middleware.headers)}</td>
                <td />
            </tr>
        );
    }

    private renderName(name: string, depth: number) {
        return (
            <div>
                {this.renderIndent(depth)}<span>{name}</span>
            </div>
        )
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
            return null;
        }
    }

    private getHighlightClassNameForContentType(contentType: string): string {
        const category = requestConverter.getContentTypeCategory(contentType);

        return (category && category.highlight) || '';
    }
}
