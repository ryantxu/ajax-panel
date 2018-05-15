///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';
import $ from 'jquery';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import appEvents from 'app/core/app_events';
import moment from 'moment';
import './css/ajax-panel.css!';

export class DSInfo {
  name: string = null;
  baseURL: string = null;
  isProxy: boolean = false;
  withCredentials: boolean = false;
  basicAuth: string = null;

  constructor(ds) {
    this.name = ds.name;
    if (ds.url) {
      this.baseURL = ds.url;
    } else if (ds.urls) {
      this.baseURL = ds.urls[0];
    }
    this.isProxy = this.baseURL.startsWith('/api/');
    this.withCredentials = ds.withCredentials;
    this.basicAuth = ds.basicAuth;
  }
}

// <option value="html">Direct HTML</option>
// <option value="text">Escaped Text</option>
// <option value="image">Image</option>
// <option value="json">JSON Tree</option>
// <option value="template">Angular Template</option>
export enum RenderMode {
  html = 'html',
  text = 'text',
  pre = 'pre',
  image = 'image',
  json = 'json',
  template = 'template',
}

class AjaxCtrl extends MetricsPanelCtrl {
  static templateUrl = 'partials/module.html';
  static scrollable = true;

  params_fn: Function = null;
  header_fn: Function = null;

  isIframe: boolean = false;
  objectURL: any = null; // Used for images
  scopedVars: any = null; // updated each request

  img: any = null; // HTMLElement
  overlay: any = null; // HTMLElement
  ngtemplate: any = null; // HTMLElement

  requestCount = 0;
  lastRequestTime = -1;
  fn_error: any = null;

  // Used in the editor
  lastURL: string = null;
  dsInfo: DSInfo = null;
  debugParams: any = null;
  timer: any = null;

  static examples = [
    {
      // The first example should set all possible fields!
      name: 'Simple',
      text: 'loads static content from github',
      config: {
        method: 'GET',
        mode: RenderMode.html,
        template: '',
        url:
          'https://raw.githubusercontent.com/ryantxu/ajax-panel/master/static/example.txt',
        params_js:
          '{\n' +
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
        template:
          '<h5>Origin: {{ response.origin }}</h5>\n\n<pre>{{ response | json }}</pre>',
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
        url:
          'http://tat.touch-ics.com/CCTV/cam.php?cam=31&datatype=image&langISO=EN&t=current&reloadtime=1',
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
        header_js:
          '{\n' +
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

  constructor(
    $scope,
    $injector,
    public $rootScope,
    public $q,
    public $timeout,
    public $http,
    public $sce,
    public templateSrv,
    public datasourceSrv,
    public backendSrv,
    public $compile
  ) {
    super($scope, $injector);

    _.defaults(this.panel, AjaxCtrl.examples[0].config);

    $scope.$on('$destroy', () => {
      if (this.objectURL) {
        URL.revokeObjectURL(this.objectURL);
      }
    });

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
    this.events.on('render', this.notifyWhenRenderingCompleted.bind(this));
  }

  // This checks that all requests have completed before saying
  notifyWhenRenderingCompleted() {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
    }

    if (this.requestCount > 0) {
      const requestID = this.requestCount;
      this.timer = this.$timeout(() => {
        this.timer = null;

        if (this.requestCount != requestID) {
          return;
        }

        // If it is still loading... try again
        if (this.loading) {
          this.notifyWhenRenderingCompleted();
        } else {
          this.renderingCompleted();
        }
      }, 100);
    }
  }

  // Expose the examples to Angular
  getStaticExamples() {
    return AjaxCtrl.examples;
  }

  loadExample(example: any, evt?: any) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }

    console.log('Loading example', example);
    const first = AjaxCtrl.examples[0].config;
    _.forEach(_.keys(first), k => {
      delete this.panel[k];
    });
    _.defaults(this.panel, example.config);
    _.defaults(this.panel, first);

    $(window).scrollTop(0);
    appEvents.emit('dash-scroll', {animate: false, evt: 0});

    this.$rootScope.appEvent('alert-success', [
      'Loaded Example Configuraiton',
      example.name,
    ]);

    if (example.editorTabIndex) {
      this.editorTabIndex = example.editorTabIndex;
    } else {
      this.editorTabIndex = 1;
    }
    this.$scope.response = null;
    this.updateFN();
    this.updateTemplate();
    this.datasourceChanged(null);
    this.refresh();
  }

  getCurrentParams(scopedVars?: any) {
    let params = {};
    if (this.params_fn) {
      params = this.params_fn(this);
    }
    // if(false) {
    //   this.templateSrv.fillVariableValuesForUrl(params, scopedVars);
    // }
    return params;
  }

  // This is called from Javascript
  template(v: string) {
    if (v) {
      return this.templateSrv.replace(v, this.scopedVars);
    }
    return null;
  }

  getHeaders(scopedVars?: any) {
    if (this.header_fn) {
      return this.header_fn(this);
    }
    return null;
  }

  _getURL(scopedVars?: any) {
    let url = this.templateSrv.replace(this.panel.url, scopedVars);
    const params = this.getCurrentParams();
    if (params) {
      const p = $.param(params);
      if (p) {
        const hasArgs = url.indexOf('?') > 0;
        url = url + (hasArgs ? '&' : '?') + p;
      }
    }
    if (this.dsInfo) {
      return this.dsInfo.baseURL + url;
    }
    return url;
  }

  /**
   * @override
   */
  updateTimeRange(datasource?) {
    // Keep the timeinfo even after updating the range
    const before = this.timeInfo;
    super.updateTimeRange();
    if (this.panel.showTime && before) {
      this.timeInfo = before;
    }
  }

  /**
   * Rather than issue a datasource query, we will call our ajax request
   * @override
   */
  issueQueries(datasource) {
    if (this.fn_error) {
      this.loading = false;
      this.error = this.fn_error;
      return null;
    }
    // make shallow copy of scoped vars,
    // and add built in variables interval and interval_ms
    const scopedVars = (this.scopedVars = Object.assign({}, this.panel.scopedVars, {
      __interval: {text: this.interval, value: this.interval},
      __interval_ms: {text: this.intervalMs, value: this.intervalMs},
    }));
    if (this.debugParams) {
      this.debugParams = {};
      console.log('???', scopedVars);
      _.each(scopedVars, (v, k) => {
        console.log('each', k, v);
        this.debugParams[k] = v.text;
      });
      _.each(this.templateSrv.variables, v => {
        this.debugParams[v.name] = v.getValueForUrl();
      });
    }

    const src = this._getURL(scopedVars);
    if (this.panel.skipSameURL && src === this.lastURL) {
      this.loading = false;
      return null;
    }

    this.lastURL = src;
    this.error = null; // remove the error
    const sent = Date.now();
    if (this.isIframe) {
      this.$scope.url = this.$sce.trustAsResourceUrl(src);
      // Its not an image, so remove it
      if (this.objectURL) {
        this.img.css('display', 'none');
        URL.revokeObjectURL(this.objectURL);
        this.objectURL = null;
      }
      return;
    } else {
      const url = this.templateSrv.replace(this.panel.url, scopedVars);
      const params = this.getCurrentParams();

      let options: any = {
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
      } else if (!options.url || options.url.indexOf('://') < 0) {
        this.error = 'Invalid URL: ' + options.url + ' // ' + JSON.stringify(params);
        this.process(this.error);
        return;
      }

      // Now make the call
      this.requestCount++;
      this.loading = true;
      this.backendSrv.datasourceRequest(options).then(
        response => {
          this.lastRequestTime = sent;
          this.process(response);
          this.loading = false;
        },
        err => {
          this.lastRequestTime = sent;
          this.loading = false;

          this.error = err; //.data.error + " ["+err.status+"]";
          this.inspector = {error: err};
          let body = '<h1>Error</h1><pre>' + JSON.stringify(err, null, ' ') + '</pre>';
          this.process(body);
        }
      );
    }

    // Return empty results
    return null; //this.$q.when( [] );
  }

  // Overrides the default handling
  handleQueryResult(result) {
    //console.log('handleQueryResult', Date.now(), this.loading);
    this.render();
  }

  onPanelInitalized() {
    this.updateFN();
    this.updateTemplate();
    this.datasourceChanged(null);
    $(window).on(
      'resize',
      _.debounce(fn => {
        this.refresh();
      }, 150)
    );
  }

  onConfigChanged() {
    this.lastURL = null;
    this.refresh();
  }

  onInitEditMode() {
    this.debugParams = {};
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
    this.addEditorTab(
      'Examples',
      'public/plugins/' + this.pluginId + '/partials/editor.examples.html',
      4
    );
    this.editorTabIndex = 1;
    this.updateFN();
  }

  getDatasourceOptions() {
    return Promise.resolve(
      this.datasourceSrv
        .getMetricSources()
        // .filter(value => {
        //   return !value.meta.builtIn; // skip mixed and 'grafana'?
        // })
        .map(ds => {
          return {value: ds.value, text: ds.name, datasource: ds};
        })
    );
  }

  // This saves the info we need from the datasouce
  datasourceChanged(option) {
    if (option && option.datasource) {
      this.setDatasource(option.datasource);
    }

    if (this.panel.useDatasource) {
      if (!this.panel.datasource) {
        this.panel.datasource = 'default';
      }

      this.datasourceSrv.get(this.panel.datasource).then(ds => {
        if (ds) {
          this.dsInfo = new DSInfo(ds);
        }
        this.onConfigChanged();
      });
    } else {
      this.dsInfo = null;
      this.onConfigChanged();
    }
  }

  updateFN() {
    this.fn_error = null;
    this.params_fn = null;

    if (this.panel.params_js) {
      try {
        this.params_fn = new Function('ctrl', 'return ' + this.panel.params_js);
      } catch (ex) {
        console.warn('error parsing params_js', this.panel.params_js, ex);
        this.params_fn = null;
        this.fn_error = ex;
      }
    }
    if (this.panel.header_js) {
      try {
        this.header_fn = new Function('ctrl', 'return ' + this.panel.header_js);
      } catch (ex) {
        console.warn('error parsing header_js', this.panel.header_js, ex);
        this.header_fn = null;
        this.fn_error = ex;
      }
    }
    this.onConfigChanged();
  }

  updateTemplate() {
    let txt = '';
    this.isIframe = this.panel.method === 'iframe';
    if (this.panel.mode == RenderMode.template) {
      if (!this.panel.template) {
        this.panel.template = '<pre>{{ response }}</pre>';
      }
      txt = this.panel.template;
    } else {
      delete this.panel.template;
      if (this.isIframe) {
        txt =
          '<iframe \
          frameborder="0" \
          width="100%"  \
          height="{{ ctrl.height }}" \
          ng-src="{{ url }}" \
          ng-if="ctrl.panel.method === \'iframe\'"></iframe>';
      } else {
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
  }

  process(rsp: any) {
    if (this.panel.showTime) {
      let txt: string = this.panel.showTimePrefix ? this.panel.showTimePrefix : '';
      if (this.panel.showTimeValue) {
        let when = null;
        if ('request' === this.panel.showTimeValue) {
          when = this.lastRequestTime;
        } else if ('recieve' === this.panel.showTimeValue) {
          when = Date.now();
        } else if (this.panel.showTimeValue.startsWith('header-')) {
          let h = this.panel.showTimeValue.substring('header-'.length);
          let v = rsp.headers[h];
          if (v) {
            console.log('TODO, parse header', v, h);
          } else {
            let vals: any = {};
            for (let key in rsp.headers()) {
              vals[key] = rsp.headers[key];
            }
            console.log('Header:', h, 'not found in:', vals, rsp);
          }
        }

        if (when) {
          txt += moment(when).format(this.panel.showTimeFormat);
        } else {
          txt += 'missing: ' + this.panel.showTimeValue;
        }
      }
      this.timeInfo = txt;
    } else {
      this.timeInfo = null;
    }

    if (!rsp) {
      return;
    }
    this.$scope.response = rsp.data ? rsp.data : rsp;

    let contentType = null;
    if (rsp.hasOwnProperty('headers')) {
      contentType = rsp.headers('Content-Type');
    }

    if (contentType) {
      if (contentType.startsWith('image/')) {
        const blob = new Blob([rsp.data], {
          type: contentType,
        });
        const old = this.objectURL;
        this.objectURL = URL.createObjectURL(blob);
        this.img.attr('src', this.objectURL);
        if (old) {
          URL.revokeObjectURL(old);
        }
        this.img.css('display', 'block');

        // If we get an image, change the display to image type
        if (this.panel.mode != RenderMode.image) {
          this.panel.mode = RenderMode.image;
          this.updateTemplate();
        }
        return;
      }
    }

    // Its not an image, so remove it
    if (this.objectURL) {
      this.img.css('display', 'none');
      URL.revokeObjectURL(this.objectURL);
      this.objectURL = null;
    }

    // JSON Node needs to force refresh
    if (this.panel.mode == RenderMode.json) {
      this.updateTemplate();
    }
  }

  openFullscreen() {
    // Update the image
    this.overlay.find('img').attr('src', this.objectURL);
    $('.grafana-app').append(this.overlay);
    this.overlay.on('click', () => {
      this.overlay.remove();
    });
  }

  afterRender() {
    console.log('AFTER RENDER!!!');
  }

  link(scope, elem, attrs, ctrl) {
    this.img = $(elem.find('img')[0]);
    this.ngtemplate = $(elem.find('.ngtemplate')[0]);
    this.overlay = $(elem.find('.ajaxmodal')[0]);
    this.overlay.remove();
    this.overlay.css('display', 'block');
    this.img.css('display', 'none');
  }
}

export {AjaxCtrl, AjaxCtrl as PanelCtrl};
