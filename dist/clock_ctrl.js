'use strict';

System.register(['app/plugins/sdk', 'moment', 'lodash', './css/clock-panel.css!'], function (_export, _context) {
  var PanelCtrl, moment, _, _createClass, _get, panelDefaults, ClockCtrl;

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

      _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
          var parent = Object.getPrototypeOf(object);

          if (parent === null) {
            return undefined;
          } else {
            return get(parent, property, receiver);
          }
        } else if ("value" in desc) {
          return desc.value;
        } else {
          var getter = desc.get;

          if (getter === undefined) {
            return undefined;
          }

          return getter.call(receiver);
        }
      };

      panelDefaults = {
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

      _export('ClockCtrl', ClockCtrl = function (_PanelCtrl) {
        _inherits(ClockCtrl, _PanelCtrl);

        function ClockCtrl($scope, $injector) {
          _classCallCheck(this, ClockCtrl);

          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ClockCtrl).call(this, $scope, $injector));

          _.defaults(_this.panel, panelDefaults);

          _this.updateClock();
          return _this;
        }

        _createClass(ClockCtrl, [{
          key: 'updateClock',
          value: function updateClock() {
            var _this2 = this;

            if (this.panel.mode === 'time') {
              this.renderTime();
            } else {
              this.renderCountdown();
            }
            this.$timeout(function () {
              _this2.updateClock();
            }, 1000);
          }
        }, {
          key: 'renderTime',
          value: function renderTime() {
            var now = void 0;
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
        }, {
          key: 'renderCountdown',
          value: function renderCountdown() {
            if (!this.panel.endCountdownTime) {
              this.time = '00:00:00';
            }

            var now = moment();
            var timeLeft = moment.duration(moment(this.panel.endCountdownTime).diff(now));
            var formattedTimeLeft = moment.utc(timeLeft.asMilliseconds()).format('HH:mm:ss');

            if (timeLeft.asDays() > 1) {
              this.time = timeLeft.days() + ' days ' + formattedTimeLeft;
            } else if (timeLeft.asSeconds() > 0) {
              this.time = formattedTimeLeft;
            } else {
              this.time = '00:00:00';
            }
          }
        }, {
          key: 'initEditMode',
          value: function initEditMode() {
            _get(Object.getPrototypeOf(ClockCtrl.prototype), 'initEditMode', this).call(this);
            this.addEditorTab('Options', 'public/plugins/grafana-clock-panel/editor.html', 2);
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
