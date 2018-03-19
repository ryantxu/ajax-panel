/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import {MetricsPanelCtrl} from 'app/plugins/sdk';
export declare class AjaxCtrl extends MetricsPanelCtrl {
  $q: any;
  templateSrv: any;
  $sce: any;
  $http: any;
  static templateUrl: string;
  requestCount: number;
  params_fn: Function;
  display_fn: Function;
  content: string;
  constructor(
    $scope: any,
    $injector: any,
    $q: any,
    templateSrv: any,
    $sce: any,
    $http: any
  );
  issueQueries(datasource: any): any;
  handleQueryResult(result: any): void;
  onPanelInitalized(): void;
  onInitEditMode(): void;
  onPanelTeardown(): void;
  updateFN(): void;
  updateContent(html: any): void;
}
