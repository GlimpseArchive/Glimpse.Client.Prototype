import { RequestDetailPanelRequestMiddlewareContainer } from '../containers/RequestDetailPanelRequestMiddlewareContainer';
import { TabbedPanel } from './TabbedPanel';
import { TabPanel } from './TabPanel';
import { trainCase } from '../../lib/StringUtilities';

import requestConverter = require('../repository/converter/request-converter');

import _ = require('lodash');
import Highlight = require('react-highlight');
import React = require('react');
import parseUrl = require('url-parse');

interface IRequestResponseHeaders {
    [key: string]: string | string[];
}

export interface IRequestProps {
    url: string;
    request: {
        body: string;
        contentType: string;
        formData: { [key: string]: string };
        headers: { [key: string]: string }
    };
    response: {
        body: string;
        contentType: string;
        headers: IRequestResponseHeaders;
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
                    <RequestDetailPanelRequestMiddlewareContainer />
                </div>
            );
        }
        else {
            content = <div className='tab-section text-minor'>Could not find any data.</div>;
        }

        return content;
    }

    private renderRequestResponse(title: string, body: string, contentType: string, headers: IRequestResponseHeaders, query?: { [key: string]: string }, formData?: { [key: string]: string }) {
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
                                <TabPanel key={panel.header} header={panel.header}>
                                    { panel.renderContent() }
                                </TabPanel>
                            );
                        })
                    }
                </TabbedPanel>
            </div>
        );
    }

    private renderHeaders(headers: IRequestResponseHeaders) {
        const sortedHeaders = _(headers)
            .map((value: string | string[], key: string) => { return { key: key, value: value }; })
            .sortBy(pair => pair.key)
            .value();

        const headerArray = [];

        _.forEach(sortedHeaders, (pair) => {
            const value = pair.value;
            if (Array.isArray(value)) {
                value.forEach((v, index) => {
                    headerArray.push(this.renderHeader(pair.key, index, v));
                });
            }
            else {
                headerArray.push(this.renderHeader(pair.key, 0, value));
            }
        });

        return (
            <div className='tab-request-headers'>
                <ul>
                    { headerArray }
                </ul>
            </div>
        );
    }

    private renderHeader(key: string, index: number, value: string) {
        return (
            <li key={key + index}><span className='tab-request-header-key'>{trainCase(key)}: </span><span className='tab-request-header-value'>{value}</span></li>
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
                { !_.isEmpty(query) ? this.renderParameterSet('Query String', query) : null     /* tslint:disable-line:no-null-keyword */ }
                { !_.isEmpty(formData) ? this.renderParameterSet('Form Data', formData) : null  /* tslint:disable-line:no-null-keyword */ }
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
            <li key={key}><span className='tab-request-parameter-key'>{key}: </span><span className='tab-request-parameter-value'>{value}</span></li>
        );
    }

    private getHighlightClassNameForContentType(contentType: string): string {
        const category = requestConverter.getContentTypeCategory(contentType);

        return (category && category.highlight) || '';
    }
}
