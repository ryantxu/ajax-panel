import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';
import moment from 'moment';
import './css/ajax-panel.css!';

const panelDefaults = {
  method: 'GET',
  url: 'https://raw.githubusercontent.com/ryantxu/ajax-panel/master/static/example.txt',
  errorMode: 'show',
  params_js: "{\n"+
             " from:ctrl.range.from.format('x'),  // x is unix ms timestamp\n"+
             " to:ctrl.range.to.format('x'), \n"+
             " height:ctrl.height\n"
             "}",
  display_js: null
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

    console.log('block issueQueries', datasource);
  }

  onPanelInitalized() {
    this.updateFN();
  }

  onInitEditMode() {
    this.editorTabs.splice(1,1); // remove the 'Metrics Tab'
    this.addEditorTab('Options', 'public/plugins/grafana-ajax-panel/editor.html',1);
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
    if(this.panel.display_js) {
      try {
        this.display_fn = new Function('ctrl', 'response', this.panel.display_js);
      }
      catch( ex ) {
        console.warn('error parsing display_js', this.panel.display_js, ex );
        this.display_fn = null;
      }
    }

    this.onRefresh();
  }

  onRefresh() {
    console.log('refresh', this);
    this.updateTimeRange();


    (function(wrap){ // Must be a better way!  maybe the http callbacks as function in this class?
      var params;
      if(wrap.params_fn) {
        params = wrap.params_fn( wrap );
      }
      console.log( "onRender", wrap, params );
      
      wrap.$http({
        method: wrap.panel.method,
        url: wrap.panel.url,
        params: params
      }).then(function successCallback(response) {
        console.log('success', response, wrap);
        var html = response.data;
        if(wrap.display_fn) {
          html = wrap.display_fn(wrap, response);
        }
        wrap.updateContent( html );
      }, function errorCallback(response) {
        console.log('error', response);
        var body = '<h1>Error</h1><pre>' + JSON.stringify(response, null, " ") + "</pre>";
        wrap.updateContent(body);
      });

    }(this));
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
    console.log('render', this);
  }
}

AjaxCtrl.templateUrl = 'module.html';
