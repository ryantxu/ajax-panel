'use strict';

System.register(['lodash', './clock_ctrl'], function (_export, _context) {
  var _, ClockCtrl;

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_clock_ctrl) {
      ClockCtrl = _clock_ctrl.ClockCtrl;
    }],
    execute: function () {
      _export('PanelCtrl', ClockCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
