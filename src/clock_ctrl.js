import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import _ from 'lodash';
import './css/clock-panel.css!';

const panelDefaults = {
  mode: 'time',
  clockType: '24 hour',
  offsetFromUtc: null,
  bgColor: null,
  countdownSettings: {
    endCountdownTime: moment().seconds(0).milliseconds(0).add(1, 'day').toDate(),
    endText: '00:00:00'
  },
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
    if (!(this.panel.countdownSettings.endCountdownTime instanceof Date)) {
      this.panel.countdownSettings.endCountdownTime = moment(this.panel.countdownSettings.endCountdownTime).toDate();
    }

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
    if (!this.panel.countdownSettings.endCountdownTime) {
      this.time = this.panel.countdownSettings.endText;
    }

    const now = moment();
    const timeLeft = moment.duration(moment(this.panel.countdownSettings.endCountdownTime).diff(now));
    let formattedTimeLeft = '';

    if (timeLeft.asSeconds() <= 0) {
      this.time = this.panel.countdownSettings.endText;
      return;
    }

    if (timeLeft.years() > 0) {
      formattedTimeLeft = timeLeft.years() === 1 ? '1 year ' : timeLeft.years() + ' years ';
    }
    if (timeLeft.months() > 0) {
      formattedTimeLeft += timeLeft.months() === 1 ? '1 month ' : timeLeft.months() + ' months ';
    }
    if (timeLeft.days() > 0) {
      formattedTimeLeft += timeLeft.days() === 1 ? '1 day ' : timeLeft.days() + ' days ';
    }

    formattedTimeLeft += moment.utc(timeLeft.asMilliseconds()).format('HH:mm:ss');

    this.time = formattedTimeLeft;
  }

  initEditMode() {
    super.initEditMode();
    this.addEditorTab('Options', 'public/plugins/grafana-clock-panel/editor.html', 2);
  }
}

ClockCtrl.templateUrl = 'module.html';
