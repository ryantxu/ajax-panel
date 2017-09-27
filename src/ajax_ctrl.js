import {MetricsPanelCtrl} from 'app/plugins/sdk';
import $ from 'jquery'
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';
import moment from 'moment';
import './css/ajax-panel.css!';

const panelDefaults = {
  method: 'GET',
  url: 'https://raw.githubusercontent.com/ryantxu/ajax-panel/master/static/example.txt',
  errorMode: 'show',
  params_js: "{\n" +
             " from:ctrl.range.from.format('x'),  // x is unix ms timestamp\n" +
             " to:ctrl.range.to.format('x'), \n" +
             " height:ctrl.height\n" +
             "}"
};

export class AjaxCtrl extends MetricsPanelCtrl {
  // constructor($scope, $injector, private templateSrv, private $sce) {
  constructor($scope, $injector, templateSrv, $sce, $http) {

    super($scope, $injector);
    this.$sce = $sce;
    this.$http = $http;
    this.templateSrv = templateSrv;

    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.timeSettings, panelDefaults.timeSettings);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
    this.events.on('refresh', this.onRefresh.bind(this));
    this.events.on('render', this.onRender.bind(this));
  }

  // This just skips trying to send the actual query.  perhaps there is a better way
  issueQueries(datasource) {
    this.updateTimeRange();

    //console.log('block issueQueries', datasource);
  }

  onPanelInitalized() {
    this.updateFN();
  }

  onInitEditMode() {
    this.editorTabs.splice(1,1); // remove the 'Metrics Tab'
    this.addEditorTab('Options', 'public/plugins/' + this.pluginId + '/editor.html',1);
    this.editorTabIndex = 1;

    this.updateFN();
  }

  onPanelTeardown() {
   // this.$timeout.cancel(this.nextTickPromise);
  }

  updateFN() {
    this.params_fn = null;
    this.display_fn = null;

    if(this.panel.params_js) {
      try {
        this.params_fn = new Function('ctrl', 'return ' + this.panel.params_js);
      }
      catch( ex ) {
        console.warn('error parsing params_js', this.panel.params_js, ex );
        this.params_fn = null;
      }
    }

    this.onRefresh();
  }

  onRefresh() {
    //console.log('refresh', this);
    this.updateTimeRange();  // needed for the first call

    var self = this;
    var url = this.templateSrv.replace(self.panel.url, this.panel.scopedVars); 
    var params;
    if(this.params_fn) {
      params = this.params_fn( this );
    }
    //console.log( "onRender", this, params );

    if(self.panel.method === 'iframe') {   
      var width = self.resolution - 50;   
      var height = self.height - 10;   
      var src = encodeURI(url + '&' + $.param(params));   
      var html = `<iframe width='${width}' height='${height}' frameborder='0' src=${src}><\/iframe>`;   
      self.updateContent(html);   
    }   
    else {   
      this.$http({
        method: this.panel.method,
        url: url,
        params: params
      }).then(function successCallback(response) {
        //console.log('success', response, self);
        var html = response.data;
        if(self.display_fn) {
          html = self.display_fn(self, response);
        }
        self.updateContent( html );
      }, function errorCallback(response) {
        console.warn('error', response);
        var body = '<h1>Error</h1><pre>' + JSON.stringify(response, null, " ") + "</pre>";
        self.updateContent(body);
      });
    }
  }

  updateContent(html) {
    try {
      this.content = this.$sce.trustAsHtml(this.templateSrv.replace(html, this.panel.scopedVars));
    } catch (e) {
      console.log('Text panel error: ', e);
      this.content = this.$sce.trustAsHtml(html);
    }
  }

  onRender() {
    //console.log('render', this);
  }
}

AjaxCtrl.templateUrl = 'module.html';
