///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['app/plugins/sdk', 'jquery', 'lodash', 'app/core/app_events', 'moment', './css/ajax-panel.css!'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var sdk_1, jquery_1, lodash_1, app_events_1, moment_1;
    var DSInfo, AjaxCtrl;
    return {
        setters:[
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
            function (_1) {}],
        execute: function() {
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
            })();
            exports_1("DSInfo", DSInfo);
            AjaxCtrl = (function (_super) {
                __extends(AjaxCtrl, _super);
                function AjaxCtrl($scope, $injector, $rootScope, $q, $http, templateSrv, datasourceSrv, backendSrv, $sce) {
                    var _this = this;
                    _super.call(this, $scope, $injector);
                    this.$rootScope = $rootScope;
                    this.$q = $q;
                    this.$http = $http;
                    this.templateSrv = templateSrv;
                    this.datasourceSrv = datasourceSrv;
                    this.backendSrv = backendSrv;
                    this.$sce = $sce;
                    this.params_fn = null;
                    this.header_fn = null;
                    this.json = null; // The the json-tree
                    this.content = null; // The actual HTML
                    this.objectURL = null; // Used for images
                    this.scopedVars = null; // updated each request
                    this.img = null; // HTMLElement
                    this.overlay = null;
                    this.requestCount = 0;
                    this.lastRequestTime = -1;
                    this.fn_error = null;
                    // Used in the editor
                    this.lastURL = null;
                    this.dsInfo = null;
                    lodash_1.default.defaults(this.panel, AjaxCtrl.examples[0].config);
                    $scope.$on('$destroy', function () {
                        if (_this.objectURL) {
                            URL.revokeObjectURL(_this.objectURL);
                        }
                    });
                    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
                    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
                }
                // Expose the examples to Angular
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
                    this.refresh();
                    this.updateFN();
                    this.datasourceChanged(null);
                };
                AjaxCtrl.prototype.getCurrentParams = function (scopedVars) {
                    var params = {};
                    if (this.params_fn) {
                        params = this.params_fn(this);
                    }
                    // if(false) {
                    //   this.templateSrv.fillVariableValuesForUrl(params, scopedVars);
                    // }
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
                /**
                 * @override
                 */
                AjaxCtrl.prototype.updateTimeRange = function (datasource) {
                    // Keep the timeinfo even after updating the range
                    var before = this.timeInfo;
                    _super.prototype.updateTimeRange.call(this);
                    if (this.panel.showTime && before) {
                        this.timeInfo = before;
                    }
                };
                /**
                 * Rather than issue a datasource query, we will call our ajax request
                 * @override
                 */
                AjaxCtrl.prototype.issueQueries = function (datasource) {
                    var _this = this;
                    if (this.fn_error) {
                        this.loading = false;
                        this.error = this.fn_error;
                        return null;
                    }
                    // make shallow copy of scoped vars,
                    // and add built in variables interval and interval_ms
                    var scopedVars = (this.scopedVars = Object.assign({}, this.panel.scopedVars, {
                        __interval: { text: this.interval, value: this.interval },
                        __interval_ms: { text: this.intervalMs, value: this.intervalMs },
                    }));
                    var src = this._getURL(scopedVars);
                    if (this.panel.skipSameURL && src === this.lastURL) {
                        this.loading = false;
                        return null;
                    }
                    this.lastURL = src;
                    this.error = null; // remove the error
                    var sent = Date.now();
                    if (this.panel.method === 'iframe') {
                        this.lastRequestTime = sent;
                        var height = this.height;
                        var html = "<iframe width=\"100%\" height=\"" + height + "\" frameborder=\"0\" src=\"" + src + "\"></iframe>";
                        this.update(html, false);
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
                            this.update(this.error, false);
                            return;
                        }
                        // Now make the call
                        this.requestCount++;
                        this.loading = true;
                        this.backendSrv.datasourceRequest(options).then(function (response) {
                            _this.lastRequestTime = sent;
                            _this.loading = false;
                            _this.update(response);
                        }, function (err) {
                            _this.lastRequestTime = sent;
                            _this.loading = false;
                            _this.error = err; //.data.error + " ["+err.status+"]";
                            _this.inspector = { error: err };
                            var body = '<h1>Error</h1><pre>' + JSON.stringify(err, null, ' ') + '</pre>';
                            _this.update(body, false);
                        });
                    }
                    // Return empty results
                    return null; //this.$q.when( [] );
                };
                // Overrides the default handling
                AjaxCtrl.prototype.handleQueryResult = function (result) {
                    // Nothing. console.log('handleQueryResult', result);
                };
                AjaxCtrl.prototype.onPanelInitalized = function () {
                    var _this = this;
                    this.updateFN();
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
                    this.editorTabs.splice(1, 1); // remove the 'Metrics Tab'
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
                // This saves the info we need from the datasouce
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
                AjaxCtrl.prototype.update = function (rsp, checkVars) {
                    if (checkVars === void 0) { checkVars = true; }
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
                        this.content = null;
                        this.json = null;
                        return;
                    }
                    var contentType = null;
                    if (rsp.hasOwnProperty('headers')) {
                        contentType = rsp.headers('Content-Type');
                    }
                    var body = null;
                    if (rsp.hasOwnProperty('data')) {
                        body = rsp.data;
                    }
                    else {
                        body = rsp;
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
                            this.content = null;
                            this.json = null;
                            return;
                        }
                    }
                    // Its not an image, so remove it
                    if (this.objectURL) {
                        this.img.css('display', 'none');
                        URL.revokeObjectURL(this.objectURL);
                        this.objectURL = null;
                    }
                    if (!lodash_1.default.isString(body)) {
                        body = '<pre>' + JSON.stringify(body, null, 2) + '</pre>';
                        this.json = null;
                    }
                    try {
                        if (checkVars && this.panel.templateResponse) {
                            body = this.templateSrv.replace(body, this.scopedVars);
                        }
                        this.content = this.$sce.trustAsHtml(body);
                    }
                    catch (e) {
                        console.log('trustAsHtml error: ', e, body);
                        this.content = null;
                        this.json = null;
                        this.error = 'Error trust HTML: ' + e;
                        this.content = this.$sce.trustAsHtml(this.error);
                    }
                };
                AjaxCtrl.prototype.openFullscreen = function () {
                    var _this = this;
                    // Update the image
                    this.overlay.find('img').attr('src', this.objectURL);
                    jquery_1.default('.grafana-app').append(this.overlay);
                    this.overlay.on('click', function () {
                        _this.overlay.remove();
                    });
                };
                AjaxCtrl.prototype.link = function (scope, elem, attrs, ctrl) {
                    this.img = jquery_1.default(elem.find('img')[0]);
                    this.overlay = jquery_1.default(elem.find('.ajaxmodal')[0]);
                    this.overlay.remove();
                    this.overlay.css('display', 'block');
                    this.img.css('display', 'none');
                };
                AjaxCtrl.templateUrl = 'partials/module.html';
                AjaxCtrl.scrollable = true;
                AjaxCtrl.examples = [
                    {
                        // The first example should set all relevant fields!
                        name: 'Simple',
                        text: 'loads static content from github',
                        config: {
                            method: 'GET',
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
            })(sdk_1.MetricsPanelCtrl);
            exports_1("AjaxCtrl", AjaxCtrl);
            exports_1("PanelCtrl", AjaxCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map