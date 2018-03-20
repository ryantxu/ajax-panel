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
    var AjaxCtrl;
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
        AjaxCtrl = (function(_super) {
          __extends(AjaxCtrl, _super);
          function AjaxCtrl(
            $scope,
            $injector,
            $q,
            templateSrv,
            datasourceSrv,
            backendSrv,
            $sce
          ) {
            var _this = this;
            _super.call(this, $scope, $injector);
            this.$q = $q;
            this.templateSrv = templateSrv;
            this.datasourceSrv = datasourceSrv;
            this.backendSrv = backendSrv;
            this.$sce = $sce;
            this.params_fn = null;
            this.content = null; // The actual HTML
            this.objectURL = null; // Used for images
            this.img = null; // HTMLElement
            this.overlay = null;
            this.requestCount = 0;
            this.lastRequestTime = -1;
            this.fn_error = null;
            // Used in the editor
            this.theURL = null; // Used for debugging
            lodash_1.default.defaults(this.panel, AjaxCtrl.panelDefaults);
            $scope.$on('$destroy', function() {
              if (_this.objectURL) {
                URL.revokeObjectURL(_this.objectURL);
              }
            });
            this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
            this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
          }
          AjaxCtrl.prototype.getCurrentParams = function() {
            if (this.params_fn) {
              this.updateTimeRange();
              return this.params_fn(this);
            }
            return null;
          };
          AjaxCtrl.prototype._getURL = function(ds) {
            var url = this.templateSrv.replace(this.panel.url, this.panel.scopedVars);
            var params = this.getCurrentParams();
            if (params) {
              var hasArgs = url.indexOf('?') > 0;
              url = encodeURI(
                url + (hasArgs ? '&' : '?') + jquery_1.default.param(params)
              );
            }
            if (ds) {
              if (ds.url) {
                url = ds.url + url;
              } else if (ds.urls) {
                url = ds.urls[0] + url;
              }
            }
            return url;
          };
          // Rather than issue a datasource query, we will call our ajax request
          AjaxCtrl.prototype.issueQueries = function(datasource) {
            var _this = this;
            if (this.fn_error) {
              this.error = this.fn_error;
              return;
            }
            var dsp = null;
            if (this.panel.useDatasource) {
              if (!this.panel.datasource) {
                this.panel.datasource = 'default';
              }
              dsp = this.datasourceSrv.get(this.panel.datasource);
            } else {
              dsp = this.$q.when(null);
            }
            this.error = null; // remove the error
            dsp.then(
              function(ds) {
                var sent = Date.now();
                var src = (_this.theURL = _this._getURL(ds));
                if (_this.panel.method === 'iframe') {
                  _this.lastRequestTime = sent;
                  var html =
                    '<iframe width="100%" height="' +
                    _this.height +
                    '" frameborder="0" src="' +
                    src +
                    '"></iframe>';
                  _this.update(html, false);
                } else {
                  var url = _this.templateSrv.replace(
                    _this.panel.url,
                    _this.panel.scopedVars
                  );
                  var params = _this.getCurrentParams();
                  var options = {
                    method: _this.panel.method,
                    url: url,
                    params: params,
                    headers: _this.panel.headers,
                  };
                  options.headers = options.headers || {};
                  if (ds && (ds.url || ds.urls)) {
                    if (ds.basicAuth || ds.withCredentials) {
                      options.withCredentials = true;
                    }
                    if (ds.basicAuth) {
                      options.headers.Authorization = ds.basicAuth;
                    }
                    if (ds.url) {
                      options.url = ds.url + url;
                    } else if (ds.urls) {
                      options.url = ds.urls[0] + url;
                    }
                  } else if (!options.url || options.url.indexOf('://') < 0) {
                    _this.error =
                      'Invalid URL: ' + options.url + ' // ' + JSON.stringify(params);
                    _this.update(_this.error, false);
                    return;
                  }
                  // Now make the call
                  _this.requestCount++;
                  _this.loading = true;
                  console.log('AJAX REQUEST', options);
                  _this.backendSrv.datasourceRequest(options).then(
                    function(response) {
                      _this.lastRequestTime = sent;
                      _this.loading = false;
                      _this.update(response);
                    },
                    function(err) {
                      _this.lastRequestTime = sent;
                      _this.loading = false;
                      _this.error = err; //.data.error + " ["+err.status+"]";
                      _this.inspector = {error: err};
                      var body =
                        '<h1>Error</h1><pre>' + JSON.stringify(err, null, ' ') + '</pre>';
                      _this.update(body, false);
                    }
                  );
                }
              },
              function(err) {
                _this.error = err;
                console.warn('Unable to find Data Source', _this.panel.datasource, err);
              }
            );
            // Return empty results
            return null; //this.$q.when( [] );
          };
          // Overrides the default handling
          AjaxCtrl.prototype.handleQueryResult = function(result) {
            // Nothing. console.log('handleQueryResult', result);
          };
          AjaxCtrl.prototype.onPanelInitalized = function() {
            var _this = this;
            this.updateFN();
            jquery_1.default(window).on(
              'resize',
              lodash_1.default.debounce(function(fn) {
                _this.refresh();
              }, 150)
            );
          };
          AjaxCtrl.prototype.onInitEditMode = function() {
            this.editorTabs.splice(1, 1); // remove the 'Metrics Tab'
            this.addEditorTab(
              'Request',
              'public/plugins/' + this.pluginId + '/partials/editor.request.html',
              1
            );
            this.addEditorTab(
              'Display',
              'public/plugins/' + this.pluginId + '/partials/editor.display.html',
              2
            );
            this.editorTabIndex = 1;
            this.updateFN();
          };
          AjaxCtrl.prototype.getDatasourceOptions = function() {
            return Promise.resolve(
              this.datasourceSrv.getMetricSources().map(function(ds) {
                return {value: ds.value, text: ds.name, datasource: ds};
              })
            );
          };
          AjaxCtrl.prototype.datasourceChanged = function(option) {
            if (option && option.datasource) {
              this.setDatasource(option.datasource);
              this.refresh();
            }
          };
          AjaxCtrl.prototype.updateFN = function() {
            this.fn_error = null;
            this.params_fn = null;
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
                this.fn_error = ex;
              }
            }
            this.refresh();
          };
          AjaxCtrl.prototype.update = function(rsp, checkVars) {
            if (checkVars === void 0) {
              checkVars = true;
            }
            if (!rsp) {
              this.content = '';
              return;
            }
            var contentType = null;
            if (rsp.hasOwnProperty('headers')) {
              contentType = rsp.headers('Content-Type');
            }
            if (contentType) {
              if (contentType.startsWith('image/')) {
                var blob = new Blob([rsp.data], {
                  type: contentType,
                });
                var old = this.objectURL;
                this.objectURL = URL.createObjectURL(blob);
                this.img.attr('src', this.objectURL);
                if (old) {
                  URL.revokeObjectURL(old);
                }
                this.img.css('display', 'block');
                console.log('Got Image', blob, contentType);
                this.content = '';
                return;
              }
              console.log('GOT', contentType);
            }
            // Its not an image, so remove it
            if (this.objectURL) {
              this.img.css('display', 'none');
              URL.revokeObjectURL(this.objectURL);
              this.objectURL = null;
              console.log('Removing old image');
            }
            console.log('UPDATE... text', rsp);
            var html = rsp;
            if (!lodash_1.default.isString(html)) {
              html = JSON.stringify(html, null, 2);
            }
            try {
              if (checkVars) {
                html = this.templateSrv.replace(html, this.panel.scopedVars);
              }
              this.content = this.$sce.trustAsHtml(html);
            } catch (e) {
              console.log('AJAX panel error: ', e, html);
              this.content = this.$sce.trustAsHtml(html);
            }
          };
          AjaxCtrl.prototype.openFullscreen = function() {
            var _this = this;
            // Update the image
            this.overlay.find('img').attr('src', this.objectURL);
            jquery_1.default('.grafana-app').append(this.overlay);
            this.overlay.on('click', function() {
              _this.overlay.remove();
            });
          };
          AjaxCtrl.prototype.link = function(scope, elem, attrs, ctrl) {
            this.img = jquery_1.default(elem.find('img')[0]);
            this.overlay = jquery_1.default(elem.find('.mymodal')[0]);
            this.overlay.remove();
            this.overlay.css('display', 'block');
            this.img.css('display', 'none');
          };
          AjaxCtrl.templateUrl = 'partials/module.html';
          AjaxCtrl.scrollable = true;
          AjaxCtrl.panelDefaults = {
            method: 'GET',
            url:
              'https://raw.githubusercontent.com/ryantxu/ajax-panel/master/static/example.txt',
            params_js:
              '{\n' +
              " from:ctrl.range.from.format('x'),  // x is unix ms timestamp\n" +
              " to:ctrl.range.to.format('x'), \n" +
              ' height:ctrl.height,\n' +
              ' now:Date.now(),\n' +
              ' since:ctrl.lastRequestTime\n' +
              '}',
          };
          return AjaxCtrl;
        })(sdk_1.MetricsPanelCtrl);
        exports_1('AjaxCtrl', AjaxCtrl);
      },
    };
  }
);
//# sourceMappingURL=ajax_ctrl.js.map
