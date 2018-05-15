System.register(["app/plugins/sdk", "jquery", "lodash", "app/core/app_events", "moment", "./css/ajax-panel.css!"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __moduleName = context_1 && context_1.id;
    var sdk_1, jquery_1, lodash_1, app_events_1, moment_1, DSInfo, RenderMode, AjaxCtrl;
    return {
        setters: [
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (app_events_1_1) {
                app_events_1 = app_events_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (_1) {
            }
        ],
        execute: function () {
            DSInfo = (function () {
                function DSInfo(ds) {
                    this.name = null;
                    this.baseURL = null;
                    this.isProxy = false;
                    this.withCredentials = false;
                    this.basicAuth = null;
                    this.name = ds.name;
                    if (ds.url) {
                        this.baseURL = ds.url;
                    }
                    else if (ds.urls) {
                        this.baseURL = ds.urls[0];
                    }
                    this.isProxy = this.baseURL.startsWith('/api/');
                    this.withCredentials = ds.withCredentials;
                    this.basicAuth = ds.basicAuth;
                }
                return DSInfo;
            }());
            exports_1("DSInfo", DSInfo);
            (function (RenderMode) {
                RenderMode["html"] = "html";
                RenderMode["text"] = "text";
                RenderMode["pre"] = "pre";
                RenderMode["image"] = "image";
                RenderMode["json"] = "json";
                RenderMode["template"] = "template";
            })(RenderMode || (RenderMode = {}));
            exports_1("RenderMode", RenderMode);
            AjaxCtrl = (function (_super) {
                __extends(AjaxCtrl, _super);
                function AjaxCtrl($scope, $injector, $rootScope, $q, $timeout, $http, $sce, templateSrv, datasourceSrv, backendSrv, $compile) {
                    var _this = _super.call(this, $scope, $injector) || this;
                    _this.$rootScope = $rootScope;
                    _this.$q = $q;
                    _this.$timeout = $timeout;
                    _this.$http = $http;
                    _this.$sce = $sce;
                    _this.templateSrv = templateSrv;
                    _this.datasourceSrv = datasourceSrv;
                    _this.backendSrv = backendSrv;
                    _this.$compile = $compile;
                    _this.params_fn = null;
                    _this.header_fn = null;
                    _this.isIframe = false;
                    _this.objectURL = null;
                    _this.scopedVars = null;
                    _this.img = null;
                    _this.overlay = null;
                    _this.ngtemplate = null;
                    _this.requestCount = 0;
                    _this.lastRequestTime = -1;
                    _this.fn_error = null;
                    _this.lastURL = null;
                    _this.dsInfo = null;
                    _this.debugParams = null;
                    _this.timer = null;
                    lodash_1.default.defaults(_this.panel, AjaxCtrl.examples[0].config);
                    $scope.$on('$destroy', function () {
                        if (_this.objectURL) {
                            URL.revokeObjectURL(_this.objectURL);
                        }
                    });
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.events.on('panel-initialized', _this.onPanelInitalized.bind(_this));
                    _this.events.on('render', _this.notifyWhenRenderingCompleted.bind(_this));
                    return _this;
                }
                AjaxCtrl.prototype.notifyWhenRenderingCompleted = function () {
                    var _this = this;
                    if (this.timer) {
                        this.$timeout.cancel(this.timer);
                    }
                    if (this.requestCount > 0) {
                        var requestID_1 = this.requestCount;
                        this.timer = this.$timeout(function () {
                            _this.timer = null;
                            if (_this.requestCount != requestID_1) {
                                return;
                            }
                            if (_this.loading) {
                                _this.notifyWhenRenderingCompleted();
                            }
                            else {
                                _this.renderingCompleted();
                            }
                        }, 100);
                    }
                };
                AjaxCtrl.prototype.getStaticExamples = function () {
                    return AjaxCtrl.examples;
                };
                AjaxCtrl.prototype.loadExample = function (example, evt) {
                    var _this = this;
                    if (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                    console.log('Loading example', example);
                    var first = AjaxCtrl.examples[0].config;
                    lodash_1.default.forEach(lodash_1.default.keys(first), function (k) {
                        delete _this.panel[k];
                    });
                    lodash_1.default.defaults(this.panel, example.config);
                    lodash_1.default.defaults(this.panel, first);
                    jquery_1.default(window).scrollTop(0);
                    app_events_1.default.emit('dash-scroll', { animate: false, evt: 0 });
                    this.$rootScope.appEvent('alert-success', [
                        'Loaded Example Configuraiton',
                        example.name,
                    ]);
                    if (example.editorTabIndex) {
                        this.editorTabIndex = example.editorTabIndex;
                    }
                    else {
                        this.editorTabIndex = 1;
                    }
                    this.$scope.response = null;
                    this.updateFN();
                    this.updateTemplate();
                    this.datasourceChanged(null);
                    this.refresh();
                };
                AjaxCtrl.prototype.getCurrentParams = function (scopedVars) {
                    var params = {};
                    if (this.params_fn) {
                        params = this.params_fn(this);
                    }
                    return params;
                };
                AjaxCtrl.prototype.template = function (v) {
                    if (v) {
                        return this.templateSrv.replace(v, this.scopedVars);
                    }
                    return null;
                };
                AjaxCtrl.prototype.getHeaders = function (scopedVars) {
                    if (this.header_fn) {
                        return this.header_fn(this);
                    }
                    return null;
                };
                AjaxCtrl.prototype._getURL = function (scopedVars) {
                    var url = this.templateSrv.replace(this.panel.url, scopedVars);
                    var params = this.getCurrentParams();
                    if (params) {
                        var p = jquery_1.default.param(params);
                        if (p) {
                            var hasArgs = url.indexOf('?') > 0;
                            url = url + (hasArgs ? '&' : '?') + p;
                        }
                    }
                    if (this.dsInfo) {
                        return this.dsInfo.baseURL + url;
                    }
                    return url;
                };
                AjaxCtrl.prototype.updateTimeRange = function (datasource) {
                    var before = this.timeInfo;
                    _super.prototype.updateTimeRange.call(this);
                    if (this.panel.showTime && before) {
                        this.timeInfo = before;
                    }
                };
                AjaxCtrl.prototype.issueQueries = function (datasource) {
                    var _this = this;
                    if (this.fn_error) {
                        this.loading = false;
                        this.error = this.fn_error;
                        return null;
                    }
                    var scopedVars = (this.scopedVars = Object.assign({}, this.panel.scopedVars, {
                        __interval: { text: this.interval, value: this.interval },
                        __interval_ms: { text: this.intervalMs, value: this.intervalMs },
                    }));
                    if (this.debugParams) {
                        this.debugParams = {};
                        console.log('???', scopedVars);
                        lodash_1.default.each(scopedVars, function (v, k) {
                            console.log('each', k, v);
                            _this.debugParams[k] = v.text;
                        });
                        lodash_1.default.each(this.templateSrv.variables, function (v) {
                            _this.debugParams[v.name] = v.getValueForUrl();
                        });
                    }
                    var src = this._getURL(scopedVars);
                    if (this.panel.skipSameURL && src === this.lastURL) {
                        this.loading = false;
                        return null;
                    }
                    this.lastURL = src;
                    this.error = null;
                    var sent = Date.now();
                    if (this.isIframe) {
                        this.$scope.url = this.$sce.trustAsResourceUrl(src);
                        if (this.objectURL) {
                            this.img.css('display', 'none');
                            URL.revokeObjectURL(this.objectURL);
                            this.objectURL = null;
                        }
                        return;
                    }
                    else {
                        var url = this.templateSrv.replace(this.panel.url, scopedVars);
                        var params = this.getCurrentParams();
                        var options = {
                            method: this.panel.method,
                            responseType: this.panel.responseType,
                            url: url,
                            params: params,
                            headers: this.getHeaders(),
                            cache: false,
                            withCredentials: this.panel.withCredentials,
                        };
                        options.headers = options.headers || {};
                        if (this.dsInfo) {
                            if (this.dsInfo.basicAuth || this.dsInfo.withCredentials) {
                                options.withCredentials = true;
                            }
                            if (this.dsInfo.basicAuth) {
                                options.headers.Authorization = this.dsInfo.basicAuth;
                            }
                            options.url = this.dsInfo.baseURL + url;
                        }
                        else if (!options.url || options.url.indexOf('://') < 0) {
                            this.error = 'Invalid URL: ' + options.url + ' // ' + JSON.stringify(params);
                            this.process(this.error);
                            return;
                        }
                        this.requestCount++;
                        this.loading = true;
                        this.backendSrv.datasourceRequest(options).then(function (response) {
                            _this.lastRequestTime = sent;
                            _this.process(response);
                            _this.loading = false;
                        }, function (err) {
                            _this.lastRequestTime = sent;
                            _this.loading = false;
                            _this.error = err;
                            _this.inspector = { error: err };
                            var body = '<h1>Error</h1><pre>' + JSON.stringify(err, null, ' ') + '</pre>';
                            _this.process(body);
                        });
                    }
                    return null;
                };
                AjaxCtrl.prototype.handleQueryResult = function (result) {
                    this.render();
                };
                AjaxCtrl.prototype.onPanelInitalized = function () {
                    var _this = this;
                    this.updateFN();
                    this.updateTemplate();
                    this.datasourceChanged(null);
                    jquery_1.default(window).on('resize', lodash_1.default.debounce(function (fn) {
                        _this.refresh();
                    }, 150));
                };
                AjaxCtrl.prototype.onConfigChanged = function () {
                    this.lastURL = null;
                    this.refresh();
                };
                AjaxCtrl.prototype.onInitEditMode = function () {
                    this.debugParams = {};
                    this.editorTabs.splice(1, 1);
                    this.addEditorTab('Request', 'public/plugins/' + this.pluginId + '/partials/editor.request.html', 1);
                    this.addEditorTab('Display', 'public/plugins/' + this.pluginId + '/partials/editor.display.html', 2);
                    this.addEditorTab('Examples', 'public/plugins/' + this.pluginId + '/partials/editor.examples.html', 4);
                    this.editorTabIndex = 1;
                    this.updateFN();
                };
                AjaxCtrl.prototype.getDatasourceOptions = function () {
                    return Promise.resolve(this.datasourceSrv
                        .getMetricSources()
                        .map(function (ds) {
                        return { value: ds.value, text: ds.name, datasource: ds };
                    }));
                };
                AjaxCtrl.prototype.datasourceChanged = function (option) {
                    var _this = this;
                    if (option && option.datasource) {
                        this.setDatasource(option.datasource);
                    }
                    if (this.panel.useDatasource) {
                        if (!this.panel.datasource) {
                            this.panel.datasource = 'default';
                        }
                        this.datasourceSrv.get(this.panel.datasource).then(function (ds) {
                            if (ds) {
                                _this.dsInfo = new DSInfo(ds);
                            }
                            _this.onConfigChanged();
                        });
                    }
                    else {
                        this.dsInfo = null;
                        this.onConfigChanged();
                    }
                };
                AjaxCtrl.prototype.updateFN = function () {
                    this.fn_error = null;
                    this.params_fn = null;
                    if (this.panel.params_js) {
                        try {
                            this.params_fn = new Function('ctrl', 'return ' + this.panel.params_js);
                        }
                        catch (ex) {
                            console.warn('error parsing params_js', this.panel.params_js, ex);
                            this.params_fn = null;
                            this.fn_error = ex;
                        }
                    }
                    if (this.panel.header_js) {
                        try {
                            this.header_fn = new Function('ctrl', 'return ' + this.panel.header_js);
                        }
                        catch (ex) {
                            console.warn('error parsing header_js', this.panel.header_js, ex);
                            this.header_fn = null;
                            this.fn_error = ex;
                        }
                    }
                    this.onConfigChanged();
                };
                AjaxCtrl.prototype.updateTemplate = function () {
                    var txt = '';
                    this.isIframe = this.panel.method === 'iframe';
                    if (this.panel.mode == RenderMode.template) {
                        if (!this.panel.template) {
                            this.panel.template = '<pre>{{ response }}</pre>';
                        }
                        txt = this.panel.template;
                    }
                    else {
                        delete this.panel.template;
                        if (this.isIframe) {
                            txt =
                                '<iframe \
          frameborder="0" \
          width="100%"  \
          height="{{ ctrl.height }}" \
          ng-src="{{ url }}" \
          ng-if="ctrl.panel.method === \'iframe\'"></iframe>';
                        }
                        else {
                            if (!this.panel.mode) {
                                this.panel.mode = RenderMode.html;
                            }
                            switch (this.panel.mode) {
                                case RenderMode.html:
                                    txt = '<div ng-bind-html="response"></div>';
                                    break;
                                case RenderMode.text:
                                    txt = '{{ response }}';
                                    break;
                                case RenderMode.pre:
                                    txt = '<pre>{{ response }}</pre>';
                                    break;
                                case RenderMode.json:
                                    txt =
                                        '<json-tree root-name="sub" object="response" start-expanded="true"></json-tree>';
                                    break;
                                case RenderMode.image:
                                    txt = '';
                                    break;
                                default:
                                    console.warn('Unsupported render mode:', this.panel.mode);
                            }
                        }
                    }
                    console.log('UPDATE template', this.panel, txt);
                    this.ngtemplate.html(txt);
                    this.$compile(this.ngtemplate.contents())(this.$scope);
                    if (this.$scope.response) {
                        this.render();
                    }
                };
                AjaxCtrl.prototype.process = function (rsp) {
                    if (this.panel.showTime) {
                        var txt = this.panel.showTimePrefix ? this.panel.showTimePrefix : '';
                        if (this.panel.showTimeValue) {
                            var when = null;
                            if ('request' === this.panel.showTimeValue) {
                                when = this.lastRequestTime;
                            }
                            else if ('recieve' === this.panel.showTimeValue) {
                                when = Date.now();
                            }
                            else if (this.panel.showTimeValue.startsWith('header-')) {
                                var h = this.panel.showTimeValue.substring('header-'.length);
                                var v = rsp.headers[h];
                                if (v) {
                                    console.log('TODO, parse header', v, h);
                                }
                                else {
                                    var vals = {};
                                    for (var key in rsp.headers()) {
                                        vals[key] = rsp.headers[key];
                                    }
                                    console.log('Header:', h, 'not found in:', vals, rsp);
                                }
                            }
                            if (when) {
                                txt += moment_1.default(when).format(this.panel.showTimeFormat);
                            }
                            else {
                                txt += 'missing: ' + this.panel.showTimeValue;
                            }
                        }
                        this.timeInfo = txt;
                    }
                    else {
                        this.timeInfo = null;
                    }
                    if (!rsp) {
                        return;
                    }
                    this.$scope.response = rsp.data ? rsp.data : rsp;
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
                            if (this.panel.mode != RenderMode.image) {
                                this.panel.mode = RenderMode.image;
                                this.updateTemplate();
                            }
                            return;
                        }
                    }
                    if (this.objectURL) {
                        this.img.css('display', 'none');
                        URL.revokeObjectURL(this.objectURL);
                        this.objectURL = null;
                    }
                    if (this.panel.mode == RenderMode.json) {
                        this.updateTemplate();
                    }
                };
                AjaxCtrl.prototype.openFullscreen = function () {
                    var _this = this;
                    this.overlay.find('img').attr('src', this.objectURL);
                    jquery_1.default('.grafana-app').append(this.overlay);
                    this.overlay.on('click', function () {
                        _this.overlay.remove();
                    });
                };
                AjaxCtrl.prototype.afterRender = function () {
                    console.log('AFTER RENDER!!!');
                };
                AjaxCtrl.prototype.link = function (scope, elem, attrs, ctrl) {
                    this.img = jquery_1.default(elem.find('img')[0]);
                    this.ngtemplate = jquery_1.default(elem.find('.ngtemplate')[0]);
                    this.overlay = jquery_1.default(elem.find('.ajaxmodal')[0]);
                    this.overlay.remove();
                    this.overlay.css('display', 'block');
                    this.img.css('display', 'none');
                };
                AjaxCtrl.templateUrl = 'partials/module.html';
                AjaxCtrl.scrollable = true;
                AjaxCtrl.examples = [
                    {
                        name: 'Simple',
                        text: 'loads static content from github',
                        config: {
                            method: 'GET',
                            mode: RenderMode.html,
                            template: '',
                            url: 'https://raw.githubusercontent.com/ryantxu/ajax-panel/master/static/example.txt',
                            params_js: '{\n' +
                                " from:ctrl.range.from.format('x'),  // x is unix ms timestamp\n" +
                                " to:ctrl.range.to.format('x'), \n" +
                                ' height:ctrl.height,\n' +
                                ' now:Date.now(),\n' +
                                " interval: ctrl.template('$__interval'),\n" +
                                " sample: 'Not escaped: $__interval',\n" +
                                ' since:ctrl.lastRequestTime\n' +
                                '}',
                            header_js: '{}',
                            responseType: 'text',
                            withCredentials: false,
                            skipSameURL: true,
                            showTime: false,
                            showTimePrefix: null,
                            showTimeFormat: 'LTS',
                            showTimeValue: 'request',
                            templateResponse: true,
                        },
                    },
                    {
                        name: 'Echo Service',
                        text: 'Responds with the request attributes',
                        config: {
                            method: 'GET',
                            mode: RenderMode.json,
                            url: 'https://httpbin.org/anything?templateInURL=$__interval',
                            header_js: "{\n  Accept: 'text/plain'\n}",
                            showTime: true,
                        },
                    },
                    {
                        name: 'Echo Service with Template',
                        text: 'Format the response with an angular template',
                        editorTabIndex: 2,
                        config: {
                            method: 'GET',
                            mode: RenderMode.template,
                            template: '<h5>Origin: {{ response.origin }}</h5>\n\n<pre>{{ response | json }}</pre>',
                            url: 'https://httpbin.org/anything?templateInURL=$__interval',
                            header_js: "{\n  Accept: 'text/plain'\n}",
                            showTime: true,
                        },
                    },
                    {
                        name: 'Webcamera in Thailand',
                        text: 'Load an image dynamically',
                        config: {
                            method: 'GET',
                            url: 'http://tat.touch-ics.com/CCTV/cam.php?cam=31&datatype=image&langISO=EN&t=current&reloadtime=1',
                            params_js: '{\n' + ' __now:Date.now(),\n' + '}',
                            responseType: 'arraybuffer',
                            showTime: true,
                        },
                    },
                    {
                        name: 'Image',
                        text: 'Sending "Accept" header',
                        config: {
                            method: 'GET',
                            url: 'https://httpbin.org/image',
                            params_js: '{}',
                            header_js: "{\n  Accept: 'image/jpeg'\n}",
                            responseType: 'blob',
                            showTime: true,
                            showTimeValue: 'recieve',
                        },
                    },
                    {
                        name: 'Image in IFrame',
                        text: 'load an image in an iframe',
                        config: {
                            method: 'iframe',
                            url: 'https://dummyimage.com/600x300/4286f4/000&text=GRAFANA',
                            params_js: '{}',
                        },
                    },
                    {
                        name: 'Basic Auth (success)',
                        text: 'send correct basic auth',
                        config: {
                            url: 'https://httpbin.org/basic-auth/user/pass',
                            withCredentials: true,
                            params_js: '{}',
                            header_js: '{\n' +
                                "   Authorization: 'Basic ' + btoa('user' + ':' + 'pass')\n" +
                                "// Authorization: 'Basic dXNlcjpwYXNz'\n" +
                                '}',
                        },
                    },
                    {
                        name: 'Basic Auth (fail)',
                        text: 'send correct basic auth',
                        config: {
                            url: 'https://httpbin.org/basic-auth/userx/passx',
                            withCredentials: true,
                            params_js: '{}',
                            header_js: '{\n' + " Authorization: 'Basic ...bad..'\n" + '}',
                        },
                    },
                ];
                return AjaxCtrl;
            }(sdk_1.MetricsPanelCtrl));
            exports_1("AjaxCtrl", AjaxCtrl);
            exports_1("PanelCtrl", AjaxCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map