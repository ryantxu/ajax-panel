'use strict';

System.register(['app/plugins/sdk', 'moment', 'lodash', './css/clock-panel.css!'], function (_export, _context) {
  var PanelCtrl, moment, _, _createClass, panelDefaults, ClockCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      PanelCtrl = _appPluginsSdk.PanelCtrl;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_cssClockPanelCss) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
        mode: 'time',
        clockType: '24 hour',
        offsetFromUtc: null,
        offsetFromUtcMinutes: null,
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

      _export('ClockCtrl', ClockCtrl = function (_PanelCtrl) {
        _inherits(ClockCtrl, _PanelCtrl);

        function ClockCtrl($scope, $injector) {
          _classCallCheck(this, ClockCtrl);

          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ClockCtrl).call(this, $scope, $injector));

          _.defaults(_this.panel, panelDefaults);
          _.defaults(_this.panel.timeSettings, panelDefaults.timeSettings);

          if (!(_this.panel.countdownSettings.endCountdownTime instanceof Date)) {
            _this.panel.countdownSettings.endCountdownTime = moment(_this.panel.countdownSettings.endCountdownTime).toDate();
          }

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.events.on('panel-initialized', _this.render.bind(_this));

          _this.updateClock();
          return _this;
        }

        _createClass(ClockCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/grafana-clock-panel/editor.html', 2);
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            this.$timeout.cancel(this.nextTickPromise);
          }
        }, {
          key: 'updateClock',
          value: function updateClock() {
            if (this.panel.mode === 'time') {
              this.renderTime();
            } else {
              this.renderCountdown();
            }

            this.nextTickPromise = this.$timeout(this.updateClock.bind(this), 1000);
          }
        }, {
          key: 'renderTime',
          value: function renderTime() {
            var now = void 0;

            if (this.panel.offsetFromUtc && this.panel.offsetFromUtcMinutes) {
              var offsetInMinutes = parseInt(this.panel.offsetFromUtc, 10) * 60 + parseInt(this.panel.offsetFromUtcMinutes, 10);
              now = moment().utcOffset(offsetInMinutes);
            } else if (this.panel.offsetFromUtc && !this.panel.offsetFromUtcMinutes) {
              now = moment().utcOffset(parseInt(this.panel.offsetFromUtc, 10));
            } else {
              now = moment();
            }

            if (this.panel.dateSettings.showDate) {
              this.date = now.format(this.panel.dateSettings.dateFormat);
            }

            this.time = now.format(this.getTimeFormat());
          }
        }, {
          key: 'getTimeFormat',
          value: function getTimeFormat() {
            if (this.panel.clockType === '24 hour') {
              return 'HH:mm:ss';
            }

            if (this.panel.clockType === '12 hour') {
              return 'h:mm:ss A';
            }

            return this.panel.timeSettings.customFormat;
          }
        }, {
          key: 'renderCountdown',
          value: function renderCountdown() {
            if (!this.panel.countdownSettings.endCountdownTime) {
              this.time = this.panel.countdownSettings.endText;
            }

            var now = moment();
            var timeLeft = moment.duration(moment(this.panel.countdownSettings.endCountdownTime).diff(now));
            var formattedTimeLeft = '';

            if (timeLeft.asSeconds() <= 0) {
              this.time = this.panel.countdownSettings.endText;
              return;
            }

            var previous = '';

            if (timeLeft.years() > 0) {
              formattedTimeLeft = timeLeft.years() === 1 ? '1 year, ' : timeLeft.years() + ' years, ';
              previous = 'years';
            }
            if (timeLeft.months() > 0 || previous === 'years') {
              formattedTimeLeft += timeLeft.months() === 1 ? '1 month, ' : timeLeft.months() + ' months, ';
              previous = 'month';
            }
            if (timeLeft.days() > 0 || previous === 'months') {
              formattedTimeLeft += timeLeft.days() === 1 ? '1 day, ' : timeLeft.days() + ' days, ';
              previous = 'days';
            }
            if (timeLeft.hours() > 0 || previous === 'days') {
              formattedTimeLeft += timeLeft.hours() === 1 ? '1 hour, ' : timeLeft.hours() + ' hours, ';
              previous = 'hours';
            }

            if (timeLeft.minutes() > 0 || previous === 'hours') {
              formattedTimeLeft += timeLeft.minutes() === 1 ? '1 minute, ' : timeLeft.minutes() + ' minutes, ';
            }

            formattedTimeLeft += timeLeft.seconds() === 1 ? '1 second ' : timeLeft.seconds() + ' seconds';
            this.time = formattedTimeLeft;
          }
        }, {
          key: 'link',
          value: function link(scope, elem) {
            var _this2 = this;

            this.events.on('render', function () {
              var $panelContainer = elem.find('.panel-container');

              if (_this2.panel.bgColor) {
                $panelContainer.css('background-color', _this2.panel.bgColor);
              } else {
                $panelContainer.css('background-color', '');
              }
            });
          }
        }]);

        return ClockCtrl;
      }(PanelCtrl));

      _export('ClockCtrl', ClockCtrl);

      ClockCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=clock_ctrl.js.map
