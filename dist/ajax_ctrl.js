///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(
  ['app/plugins/sdk', 'jquery', 'lodash', './css/ajax-panel.css!'],
  function(exports_1) {
    var __extends =
      (this && this.__extends) ||
      function(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() {
          this.constructor = d;
        }
        d.prototype =
          b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
      };
    var sdk_1, jquery_1, lodash_1;
    var panelDefaults, AjaxCtrl;
    return {
      setters: [
        function(sdk_1_1) {
          sdk_1 = sdk_1_1;
        },
        function(jquery_1_1) {
          jquery_1 = jquery_1_1;
        },
        function(lodash_1_1) {
          lodash_1 = lodash_1_1;
        },
        function(_1) {},
      ],
      execute: function() {
        panelDefaults = {
          method: 'GET',
          url:
            'https://raw.githubusercontent.com/ryantxu/ajax-panel/master/static/example.txt',
          errorMode: 'show',
          params_js:
            '{\n' +
            " from:ctrl.range.from.format('x'),  // x is unix ms timestamp\n" +
            " to:ctrl.range.to.format('x'), \n" +
            ' height:ctrl.height\n' +
            '}',
        };
        AjaxCtrl = (function(_super) {
          __extends(AjaxCtrl, _super);
          function AjaxCtrl($scope, $injector, $q, templateSrv, $sce, $http) {
            _super.call(this, $scope, $injector);
            this.$q = $q;
            this.templateSrv = templateSrv;
            this.$sce = $sce;
            this.$http = $http;
            this.requestCount = 0;
            this.params_fn = null;
            this.display_fn = null;
            this.content = null; // The actual HTML
            lodash_1.default.defaults(this.panel, panelDefaults);
            this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
            this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
          }
          // Rather than issue a datasource query, we will call our ajax request
          AjaxCtrl.prototype.issueQueries = function(datasource) {
            var _this = this;
            this.updateTimeRange();
            var url = this.templateSrv.replace(this.panel.url, this.panel.scopedVars);
            var params;
            if (this.params_fn) {
              params = this.params_fn(this);
            }
            //console.log( "onRender", this, params );
            if (this.panel.method === 'iframe') {
              var height = this.height - 10;
              var hasArgs = url.indexOf('?') > 0;
              var src = encodeURI(
                url + (hasArgs ? '&' : '?') + jquery_1.default.param(params)
              );
              var html =
                "<iframe width='100%' height='" +
                height +
                "' frameborder='0' src=" +
                src +
                '></iframe>';
              this.updateContent(html);
              this.loading = false;
            } else {
              delete this.error;
              this.requestCount++;
              this.loading = true;
              this.$http({
                method: this.panel.method,
                url: url,
                params: params,
              }).then(
                function(response) {
                  var html = response.data;
                  if (_this.display_fn) {
                    html = _this.display_fn(_this, response);
                  }
                  _this.updateContent(html);
                  _this.loading = false;
                },
                function(err) {
                  _this.loading = false;
                  _this.error = err; //.data.error + " ["+err.status+"]";
                  //  this.inspector = {error: err};
                  console.warn('error', err);
                  var body =
                    '<h1>Error</h1><pre>' + JSON.stringify(err, null, ' ') + '</pre>';
                  _this.updateContent(body);
                }
              );
            }
            // Return empty results
            return null; //this.$q.when( [] );
          };
          // Overrides the default handling
          AjaxCtrl.prototype.handleQueryResult = function(result) {
            // Nothing. console.log('handleQueryResult', result);
          };
          AjaxCtrl.prototype.onPanelInitalized = function() {
            this.updateFN();
          };
          AjaxCtrl.prototype.onInitEditMode = function() {
            this.editorTabs.splice(1, 1); // remove the 'Metrics Tab'
            this.addEditorTab(
              'Options',
              'public/plugins/' + this.pluginId + '/partials/editor.html',
              1
            );
            this.editorTabIndex = 1;
            this.updateFN();
          };
          AjaxCtrl.prototype.onPanelTeardown = function() {
            // this.$timeout.cancel(this.nextTickPromise);
          };
          AjaxCtrl.prototype.updateFN = function() {
            this.params_fn = null;
            this.display_fn = null;
            if (this.panel.params_js) {
              try {
                this.params_fn = new Function(
                  'ctrl',
                  'return ' +
                    this.templateSrv.replace(this.panel.params_js, this.panel.scopedVars)
                );
              } catch (ex) {
                console.warn('error parsing params_js', this.panel.params_js, ex);
                this.params_fn = null;
              }
            }
            this.refresh();
          };
          AjaxCtrl.prototype.updateContent = function(html) {
            if (lodash_1.default.isNil(html)) {
              this.content = '';
              return;
            }
            try {
              this.content = this.$sce.trustAsHtml(
                this.templateSrv.replace(html, this.panel.scopedVars)
              );
            } catch (e) {
              console.log('AJAX panel error: ', e);
              this.content = this.$sce.trustAsHtml(html);
            }
          };
          AjaxCtrl.templateUrl = 'partials/module.html';
          return AjaxCtrl;
        })(sdk_1.MetricsPanelCtrl);
        exports_1('AjaxCtrl', AjaxCtrl);
      },
    };
  }
);
//# sourceMappingURL=ajax_ctrl.js.map
