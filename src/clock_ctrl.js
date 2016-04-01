import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import _ from 'lodash';
import './css/clock-panel.css!';

const panelDefaults = {
  mode: 'time',
  clockType: '24 hour',
  offsetFromUtc: null,
  bgColor: null,
  endCountdownTime: moment().seconds(0).milliseconds(0).add(1, 'day').toDate(),
  dateSettings: {
    showDate: true,
    dateFormat: 'YYYY-MM-DD',
    fontSize: '20px',
    fontWeight: 'normal'
  },
  timeSettings: {
    timeFormat24hr: 'HH:mm:ss',
    timeFormat12hr: 'h:mm:ss A',
    fontSize: '60px',
    fontWeight: 'normal'
  }
};

export class ClockCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);

    this.updateClock();
  }

  updateClock() {
    if (this.panel.mode === 'time') {
      this.renderTime();
    } else {
      this.renderCountdown();
    }
    this.$timeout(() => { this.updateClock(); }, 1000);
  }

  renderTime() {
    let now;
    if (this.panel.offsetFromUtc) {
      now = moment().utcOffset(parseInt(this.panel.offsetFromUtc, 10));
    } else {
      now = moment();
    }

    if (this.panel.dateSettings.showDate) {
      this.date = now.format(this.panel.dateSettings.dateFormat);
    }
    this.time = this.panel.clockType === '24 hour' ? now.format(this.panel.timeSettings.timeFormat24hr) : now.format(this.panel.timeSettings.timeFormat12hr);
  }

  renderCountdown() {
    if (!this.panel.endCountdownTime) {
      this.time = '00:00:00';
    }

    const now = moment();
    const timeLeft = moment.duration(moment(this.panel.endCountdownTime).diff(now));
    const formattedTimeLeft = moment.utc(timeLeft.asMilliseconds()).format('HH:mm:ss');

    if (timeLeft.asDays() > 1) {
      this.time = timeLeft.days() + ' days ' + formattedTimeLeft;
    } else if (timeLeft.asSeconds() > 0) {
      this.time = formattedTimeLeft;
    } else {
      this.time = '00:00:00';
    }
  }

  initEditMode() {
    super.initEditMode();
    this.addEditorTab('Options', 'public/plugins/grafana-clock-panel/editor.html', 2);
  }
}

ClockCtrl.templateUrl = 'module.html';
