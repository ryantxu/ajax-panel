import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import _ from 'lodash';
import './css/clock-panel.css!';

const panelDefaults = {
  clockType: '24 hour',
  fontSize: '60px',
  fontWeight: 'normal',
  bgColor: null
};

export class ClockCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);

    this.updateClock();
  }

  updateClock() {
    this.time = this.panel.clockType === '24 hour' ? moment().format('HH:mm:ss') : moment().format('hh:mm:ss A');
    this.$timeout(() => { this.updateClock(); }, 1000);
  }

  initEditMode() {
    super.initEditMode();
    this.addEditorTab('Options', 'public/plugins/grafana-clock-panel/editor.html', 2);
  }
}

ClockCtrl.templateUrl = 'module.html';
