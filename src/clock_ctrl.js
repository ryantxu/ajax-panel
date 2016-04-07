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
    showDate: false,
    dateFormat: 'YYYY-MM-DD',
    fontSize: '20px',
    fontWeight: 'normal'
  },
  timeSettings: {
    customFormat: 'HH:mm:ss',
    fontSize: '60px',
    fontWeight: 'normal'
  }
};

export class ClockCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.timeSettings, panelDefaults.timeSettings);

    if (!(this.panel.countdownSettings.endCountdownTime instanceof Date)) {
      this.panel.countdownSettings.endCountdownTime = moment(this.panel.countdownSettings.endCountdownTime).toDate();
    }
    console.log('#ctor', this.panel.clockType);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.updateClock();
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-clock-panel/editor.html', 2);
  }

  onPanelTeardown() {
    this.$timeout.cancel(this.nextTickPromise);
  }

  updateClock() {
    if (this.panel.mode === 'time') {
      this.renderTime();
    } else {
      this.renderCountdown();
    }

    this.nextTickPromise = this.$timeout(this.updateClock.bind(this), 1000);
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

    this.time = now.format(this.getTimeFormat());
  }

  getTimeFormat() {
    if (this.panel.clockType === '24 hour') {
      return "HH:mm:ss";
    } else if (this.panel.clockType === '12 hour') {
      return "h:mm:ss A";
    } else {
      return this.panel.timeSettings.customFormat;
    }
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
      formattedTimeLeft = timeLeft.years() === 1 ? '1 year, ' : timeLeft.years() + ' years, ';
    }
    if (timeLeft.months() > 0) {
      formattedTimeLeft += timeLeft.months() === 1 ? '1 month, ' : timeLeft.months() + ' months, ';
    }
    if (timeLeft.days() > 0) {
      formattedTimeLeft += timeLeft.days() === 1 ? '1 day, ' : timeLeft.days() + ' days, ';
    }
    if (timeLeft.hours() > 0) {
      formattedTimeLeft += timeLeft.hours() === 1 ? '1 hour, ' : timeLeft.hours() + ' hours, ';
    }
    if (timeLeft.minutes() > 0) {
      formattedTimeLeft += timeLeft.minutes() === 1 ? '1 minute, ' : timeLeft.minutes() + ' minutes, ';
    }
    if (timeLeft.seconds() > 0) {
      formattedTimeLeft += timeLeft.seconds() === 1 ? '1 second, ' : timeLeft.seconds() + ' seconds';
    }

    this.time = formattedTimeLeft;
  }
}

ClockCtrl.templateUrl = 'module.html';
