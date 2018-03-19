System.register(['./ajax_ctrl'], function(exports_1) {
  var ajax_ctrl_1;
  return {
    setters: [
      function(ajax_ctrl_1_1) {
        ajax_ctrl_1 = ajax_ctrl_1_1;
      },
    ],
    execute: function() {
      exports_1('PanelCtrl', ajax_ctrl_1.AjaxCtrl);
    },
  };
});
//# sourceMappingURL=module.js.map
