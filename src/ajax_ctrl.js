import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import _ from 'lodash';
import './css/ajax-panel.css!';

const panelDefaults = {
  mode: 'url',
  source: 'https://raw.githubusercontent.com/ryantxu/ajax-panel/master/static/example.txt',
  body : "HELLO!"
};

export class AjaxCtrl extends PanelCtrl {
 // constructor($scope, $injector, private templateSrv, private $sce) { 
  constructor($scope, $injector, templateSrv, $sce, $http) {
    super($scope, $injector);
    this.sce = $sce;
    this.$http = $http;
    this.templateSrv = templateSrv;

    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.timeSettings, panelDefaults.timeSettings);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.events.on('refresh', this.onRender.bind(this));
    this.events.on('render', this.onRender.bind(this));
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-ajax-panel/editor.html', 2);
  }

  onPanelTeardown() {
   // this.$timeout.cancel(this.nextTickPromise);
  }

  onRender() {
    var content = this.panel.body;
    content += " :: " + this + " :: " + new Date()

    console.log( "onRender", this, content, this.panel.scopedVars);
    this.updateContent(content);

    this.$http({
      method: 'GET',
      url: this.panel.source
    }).then(function successCallback(response) {
      console.log('success', responsse);
    }, function errorCallback(response) {
      console.log('error', responsse);
    });
  }

  updateContent(html) {
    try {
      this.content = this.$sce.trustAsHtml(this.templateSrv.replace(html, this.panel.scopedVars));
    } catch (e) {
      console.log('Text panel error: ', e);
      this.content = this.$sce.trustAsHtml(html);
    }
  }
}

AjaxCtrl.templateUrl = 'module.html';
