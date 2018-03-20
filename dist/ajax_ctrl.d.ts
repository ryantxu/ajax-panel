/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
export declare class DSInfo {
    name: string;
    baseURL: string;
    isProxy: boolean;
    withCredentials: boolean;
    basicAuth: string;
    constructor(ds: any);
}
export declare class AjaxCtrl extends MetricsPanelCtrl {
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
    jsonholder: any;
    img: any;
    overlay: any;
    requestCount: number;
    lastRequestTime: number;
    fn_error: any;
    theURL: string;
    dsInfo: DSInfo;
    static panelDefaults: {
        method: string;
        url: string;
        params_js: string;
        header_js: string;
        responseType: string;
    };
    constructor($scope: any, $injector: any, $q: any, $http: any, templateSrv: any, datasourceSrv: any, backendSrv: any, $sce: any);
    getCurrentParams(): any;
    getHeaders(): any;
    _getURL(): any;
    issueQueries(datasource: any): any;
    handleQueryResult(result: any): void;
    onPanelInitalized(): void;
    onInitEditMode(): void;
    getDatasourceOptions(): Promise<any>;
    datasourceChanged(option: any): void;
    updateFN(): void;
    update(rsp: any, checkVars?: boolean): void;
    openFullscreen(): void;
    link(scope: any, elem: any, attrs: any, ctrl: any): void;
}
