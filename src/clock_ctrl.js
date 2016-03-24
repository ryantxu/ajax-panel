import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';

export class ClockCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    this.$scope = $scope;
    this.updateClock();
  }

  updateClock() {
    this.time = moment().format('hh:mm:ss');
    this.$timeout(() => { this.updateClock(); }, 1000);
  }
}

ClockCtrl.templateUrl = 'module.html';
