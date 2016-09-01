import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import _ from 'lodash';
import './css/ajax-panel.css!';

const panelDefaults = {
  url: 'https://raw.githubusercontent.com/ryantxu/ajax-panel/master/static/example.txt',
  content : "HELLO!"
};

export class AjaxCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
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
    var content = this.panel.content;
    content += " :: " + this + " :: " + new Date()

    console.log( "onRender", this, content);
    this.updateContent(content);
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
