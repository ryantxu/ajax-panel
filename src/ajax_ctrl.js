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
  constructor($scope, $injector, $q, templateSrv, $sce, $http) {
    super($scope, $injector);

    this.$sce = $sce;
    this.$http = $http;
    this.$q = $q;
    this.templateSrv = templateSrv;

    _.defaults(this.panel, panelDefaults);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));

    this.requestCount = 0;
  }

  // Rather than issue a datasource query, we will call our ajax request
  issueQueries(datasource) {
    this.updateTimeRange();

    var url = this.templateSrv.replace(this.panel.url, this.panel.scopedVars); 
    var params;
    if(this.params_fn) {
      params = this.params_fn( this );
    }
    //console.log( "onRender", this, params );

    if(this.panel.method === 'iframe') {   
      var width = this.resolution - 50;   
      var height = this.height - 10;   
      var src = encodeURI(url + '&' + $.param(params));   
      var html = `<iframe width='${width}' height='${height}' frameborder='0' src=${src}><\/iframe>`;   
      this.updateContent(html);   
    }   
    else {   
      delete this.error;
      this.requestCount++;
      this.loading = true;
      this.$http({
        method: this.panel.method,
        url: url,
        params: params
      }).then( response => {
        var html = response.data;
        if(this.display_fn) {
          html = this.display_fn(this, response);
        }
        this.updateContent( html );
        this.loading = false;
      }, (err) => {
        this.loading = false;
        this.error = err; //.data.error + " ["+err.status+"]";
      //  this.inspector = {error: err};

        console.warn('error', err);
        let body = '<h1>Error</h1><pre>' + JSON.stringify(err, null, " ") + "</pre>";
        this.updateContent(body);
      });
    }

    // Return empty results
    return null; //this.$q.when( [] );
  }

  // Overrides the default handling
  handleQueryResult(result) {
    // Nothing. console.log('handleQueryResult', result);
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
        this.params_fn = new Function('ctrl', 'return ' + this.templateSrv.replace(this.panel.params_js, this.panel.scopedVars));
      }
      catch( ex ) {
        console.warn('error parsing params_js', this.panel.params_js, ex );
        this.params_fn = null;
      }
    }
    this.refresh();
  }

  updateContent(html) {
    if(_.isNil(html)) {
      this.content = "";
      return;
    }

    try {
      this.content = this.$sce.trustAsHtml(this.templateSrv.replace(html, this.panel.scopedVars));
    } catch (e) {
      console.log('Text panel error: ', e);
      this.content = this.$sce.trustAsHtml(html);
    }
  }
}

AjaxCtrl.templateUrl = 'module.html';
