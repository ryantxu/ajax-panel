/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import {MetricsPanelCtrl} from 'app/plugins/sdk';
export declare class AjaxCtrl extends MetricsPanelCtrl {
  $q: any;
  templateSrv: any;
  datasourceSrv: any;
  backendSrv: any;
  $sce: any;
  static templateUrl: string;
  static scrollable: boolean;
  params_fn: Function;
  content: string;
  objectURL: any;
  img: any;
  overlay: any;
  requestCount: number;
  lastRequestTime: number;
  fn_error: any;
  theURL: string;
  static panelDefaults: {
    method: string;
    url: string;
    params_js: string;
  };
  constructor(
    $scope: any,
    $injector: any,
    $q: any,
    templateSrv: any,
    datasourceSrv: any,
    backendSrv: any,
    $sce: any
  );
  getCurrentParams(): any;
  _getURL(ds: any): any;
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
