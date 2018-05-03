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
export declare enum RenderMode {
    html = "html",
    text = "text",
    pre = "pre",
    image = "image",
    json = "json",
    template = "template",
}
declare class AjaxCtrl extends MetricsPanelCtrl {
    $rootScope: any;
    $q: any;
    $timeout: any;
    $http: any;
    $sce: any;
    templateSrv: any;
    datasourceSrv: any;
    backendSrv: any;
    $compile: any;
    static templateUrl: string;
    static scrollable: boolean;
    params_fn: Function;
    header_fn: Function;
    isIframe: boolean;
    objectURL: any;
    scopedVars: any;
    img: any;
    overlay: any;
    ngtemplate: any;
    requestCount: number;
    lastRequestTime: number;
    fn_error: any;
    lastURL: string;
    dsInfo: DSInfo;
    debugParams: any;
    timer: any;
    static examples: ({
        name: string;
        text: string;
        config: {
            method: string;
            mode: RenderMode;
            template: string;
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
        };
        editorTabIndex?: undefined;
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            mode: RenderMode;
            url: string;
            header_js: string;
            showTime: boolean;
            template?: undefined;
            params_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
    } | {
        name: string;
        text: string;
        editorTabIndex: number;
        config: {
            method: string;
            mode: RenderMode;
            template: string;
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
            mode?: undefined;
            template?: undefined;
            header_js?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
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
            mode?: undefined;
            template?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            params_js: string;
            mode?: undefined;
            template?: undefined;
            header_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTime?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
    } | {
        name: string;
        text: string;
        config: {
            url: string;
            withCredentials: boolean;
            params_js: string;
            header_js: string;
            method?: undefined;
            mode?: undefined;
            template?: undefined;
            responseType?: undefined;
            skipSameURL?: undefined;
            showTime?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
    })[];
    constructor($scope: any, $injector: any, $rootScope: any, $q: any, $timeout: any, $http: any, $sce: any, templateSrv: any, datasourceSrv: any, backendSrv: any, $compile: any);
    notifyWhenRenderingCompleted(): void;
    getStaticExamples(): ({
        name: string;
        text: string;
        config: {
            method: string;
            mode: RenderMode;
            template: string;
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
        };
        editorTabIndex?: undefined;
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            mode: RenderMode;
            url: string;
            header_js: string;
            showTime: boolean;
            template?: undefined;
            params_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
    } | {
        name: string;
        text: string;
        editorTabIndex: number;
        config: {
            method: string;
            mode: RenderMode;
            template: string;
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
            mode?: undefined;
            template?: undefined;
            header_js?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
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
            mode?: undefined;
            template?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
    } | {
        name: string;
        text: string;
        config: {
            method: string;
            url: string;
            params_js: string;
            mode?: undefined;
            template?: undefined;
            header_js?: undefined;
            responseType?: undefined;
            withCredentials?: undefined;
            skipSameURL?: undefined;
            showTime?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
    } | {
        name: string;
        text: string;
        config: {
            url: string;
            withCredentials: boolean;
            params_js: string;
            header_js: string;
            method?: undefined;
            mode?: undefined;
            template?: undefined;
            responseType?: undefined;
            skipSameURL?: undefined;
            showTime?: undefined;
            showTimePrefix?: undefined;
            showTimeFormat?: undefined;
            showTimeValue?: undefined;
            templateResponse?: undefined;
        };
        editorTabIndex?: undefined;
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
    updateTemplate(): void;
    process(rsp: any): void;
    openFullscreen(): void;
    afterRender(): void;
    link(scope: any, elem: any, attrs: any, ctrl: any): void;
}
export { AjaxCtrl, AjaxCtrl as PanelCtrl };
