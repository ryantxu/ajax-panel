/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
import './css/ajax-panel.css!';
export declare class DSInfo {
    name: string;
    baseURL: string;
    isProxy: boolean;
    withCredentials: boolean;
    basicAuth: string;
    constructor(ds: any);
}
export declare enum DisplayStyle {
    Direct = "Direct",
    Template = "Template",
    Image = "Image",
    JSON = "JSON",
}
export declare enum TemplateMode {
    html = "html",
    markdown = "markdown",
    text = "text",
}
declare class AjaxCtrl extends MetricsPanelCtrl {
    $rootScope: any;
    $q: any;
    $http: any;
    templateSrv: any;
    datasourceSrv: any;
    backendSrv: any;
    $sce: any;
    static templateUrl: string;
    static scrollable: boolean;
    params_fn: Function;
    header_fn: Function;
    json: any;
    content: string;
    objectURL: any;
    scopedVars: any;
    display: DisplayStyle;
    img: any;
    overlay: any;
    requestCount: number;
    lastRequestTime: number;
    fn_error: any;
    lastURL: string;
    dsInfo: DSInfo;
    static examples: ({
        name: string;
        text: string;
        config: {
            method: string;
            display: string;
            url: string;
            params_js: string;
            header_js: string;
            responseType: string;
            withCredentials: boolean;
            skipSameURL: boolean;
            showTime: boolean;
            showTimePrefix: any;
            showTimeFormat: string;
            showTimeValue: string;
            templateResponse: boolean;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            header_js: string;
            showTime: boolean;
            display?: undefined;
            params_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            display: DisplayStyle;
            mode: TemplateMode;
            url: string;
            header_js: string;
            showTime: boolean;
            params_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            params_js: string;
            responseType: string;
            showTime: boolean;
            display?: undefined;
            header_js?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            params_js: string;
            header_js: string;
            responseType: string;
            showTime: boolean;
            showTimeValue: string;
            display?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            params_js: string;
            display?: undefined;
            header_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTime?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            url: string;
            withCredentials: boolean;
            params_js: string;
            header_js: string;
            method?: undefined;
            display?: undefined;
            responseType?: undefined;
            skipSameURL?: undefined;
            showTime?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    })[];
    constructor($scope: any, $injector: any, $rootScope: any, $q: any, $http: any, templateSrv: any, datasourceSrv: any, backendSrv: any, $sce: any);
    getStaticExamples(): ({
        name: string;
        text: string;
        config: {
            method: string;
            display: string;
            url: string;
            params_js: string;
            header_js: string;
            responseType: string;
            withCredentials: boolean;
            skipSameURL: boolean;
            showTime: boolean;
            showTimePrefix: any;
            showTimeFormat: string;
            showTimeValue: string;
            templateResponse: boolean;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            header_js: string;
            showTime: boolean;
            display?: undefined;
            params_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            display: DisplayStyle;
            mode: TemplateMode;
            url: string;
            header_js: string;
            showTime: boolean;
            params_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            params_js: string;
            responseType: string;
            showTime: boolean;
            display?: undefined;
            header_js?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            params_js: string;
            header_js: string;
            responseType: string;
            showTime: boolean;
            showTimeValue: string;
            display?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            params_js: string;
            display?: undefined;
            header_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTime?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    } | {
        name: string;
        text: string;
        config: {
            url: string;
            withCredentials: boolean;
            params_js: string;
            header_js: string;
            method?: undefined;
            display?: undefined;
            responseType?: undefined;
            skipSameURL?: undefined;
            showTime?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
            mode?: undefined;
        };
    })[];
    loadExample(example: any, evt?: any): void;
    getCurrentParams(scopedVars?: any): {};
    template(v: string): any;
    getHeaders(scopedVars?: any): any;
    _getURL(scopedVars?: any): any;
    updateTimeRange(datasource?: any): void;
    issueQueries(datasource: any): any;
    handleQueryResult(result: any): void;
    onPanelInitalized(): void;
    onConfigChanged(): void;
    onInitEditMode(): void;
    getDatasourceOptions(): Promise<any>;
    datasourceChanged(option: any): void;
    updateFN(): void;
    update(rsp: any, checkVars?: boolean): void;
    openFullscreen(): void;
    link(scope: any, elem: any, attrs: any, ctrl: any): void;
}
export { AjaxCtrl, AjaxCtrl as PanelCtrl };
