import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import $ from 'jquery';
import _ from 'lodash';
import appEvents from 'grafana/app/core/app_events';
import moment from 'moment';
import './style.css';
import { DSInfo, RenderMode } from './types';
import { examples } from './examples';

import { DataQueryResponse, DataSourceApi } from '@grafana/ui';

class AjaxCtrl extends MetricsPanelCtrl {
  static templateUrl = 'partials/module.html';
  static scrollable = true;

  paramsFn?: Function;
  headerFn?: Function;

  isIframe = false;
  objectURL: any = null; // Used for images
  scopedVars: any = null; // updated each request

  img?: any; // HTMLElement
  overlay?: any; // HTMLElement
  ngtemplate?: any; // HTMLElement

  requestCount = 0;
  lastRequestTime = -1;
  fnError?: any;

  // Used in the editor
  lastURL?: string;
  dsInfo?: DSInfo;
  debugParams?: any;
  timer?: any;

  /** @ngInject */
  constructor(
    $scope: any,
    $injector: any,
    public $rootScope: any,
    public $q: any,
    public $timeout: any,
    public $sce: any,
    public templateSrv: any,
    public datasourceSrv: any,
    public backendSrv: any,
    public $compile: any
  ) {
    super($scope, $injector);

    // Migrate old settings
    if (this.panel.useDatasource) {
      this.panel.request = 'datasource';
      delete this.panel.useDatasource;
    }
    _.defaults(this.panel, examples[0].config);

    $scope.$on('$destroy', () => {
      if (this.objectURL) {
        URL.revokeObjectURL(this.objectURL);
      }
    });

    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
    this.events.on('render', this.notifyWhenRenderingCompleted.bind(this));
  }

  onDataSnapshotLoad(snapshotData: any) {
    this.onDataReceived(snapshotData);
  }

  onDataError(err: any) {
    console.log('onDataError', err);
  }

  // Having this function pust ths query sidebar on
  onDataReceived(dataList: any) {
    this.process(dataList);
    this.loading = false;
  }

  // This checks that all requests have completed before saying
  notifyWhenRenderingCompleted() {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
    }

    if (this.requestCount > 0) {
      const requestID = this.requestCount;
      this.timer = this.$timeout(() => {
        this.timer = undefined;

        if (this.requestCount !== requestID) {
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
    return examples;
  }

  isUsingMetricQuery() {
    return this.panel.request.startsWith('query');
  }

  loadExample(example: any, evt?: any) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }

    console.log('Loading example', example);
    const first = examples[0].config;
    _.forEach(_.keys(first), (k: any) => {
      delete this.panel[k];
    });
    _.defaults(this.panel, example.config);
    _.defaults(this.panel, first);

    $(window).scrollTop(0);
    appEvents.emit('dash-scroll', { animate: false, evt: 0 });

    this.$rootScope.appEvent('alert-success', ['Loaded Example Configuraiton', example.name]);

    if (example.editorTabIndex) {
      this.editorTabIndex = example.editorTabIndex;
    } else {
      this.editorTabIndex = 1;
    }
    this.$scope.response = null;
    this.updateFN();
    this.updateTemplate();
    this.refresh();
  }

  getCurrentParams(scopedVars?: any) {
    let params = {};
    if (this.paramsFn) {
      params = this.paramsFn(this);
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
    if (this.headerFn) {
      return this.headerFn(this);
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
    if (this.panel.request === 'datasource' && this.dsInfo) {
      return this.dsInfo.baseURL + url;
    }
    return url;
  }

  /**
   * @override
   */
  updateTimeRange(datasource?: DataSourceApi) {
    const before = this.timeInfo;
    const v = super.updateTimeRange();
    if (this.panel.showTime && before) {
      this.timeInfo = before;
    }
    return v;
  }

  /**
   * Rather than issue a datasource query, we will call our ajax request
   * @override
   */
  issueQueries(datasource: DataSourceApi) {
    if (this.isUsingMetricQuery()) {
      return super.issueQueries(datasource);
    }

    this.datasource = datasource;
    if (this.fnError) {
      this.loading = false;
      this.error = this.fnError;
      return null;
    }
    // make shallow copy of scoped vars,
    // and add built in variables interval and interval_ms
    const scopedVars = (this.scopedVars = Object.assign({}, this.panel.scopedVars, {
      __interval: { text: this.interval, value: this.interval },
      __interval_ms: { text: this.intervalMs, value: this.intervalMs },
    }));

    // This lets us see the parameters in the editor
    if (this.debugParams) {
      this.debugParams = {};
      _.each(scopedVars, (v: any, k: any) => {
        this.debugParams[k] = v.text;
      });
      _.each(this.templateSrv.variables, (v: any) => {
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

      const options: any = {
        method: this.panel.method,
        responseType: this.panel.responseType,
        url: url,
        params: params,
        headers: this.getHeaders(),
        cache: false,
        withCredentials: this.panel.withCredentials,
      };
      options.headers = options.headers || {};

      let helper = Promise.resolve({});
      if (this.panel.request === 'datasource') {
        helper = this.datasourceSrv.get(this.panel.datasource).then((ds: any) => {
          console.log('DDDD', ds, this);
          if (ds) {
            this.dsInfo = new DSInfo(ds);

            // Change the URL
            if (this.dsInfo.basicAuth || this.dsInfo.withCredentials) {
              options.withCredentials = true;
            }
            if (this.dsInfo.basicAuth) {
              options.headers.Authorization = this.dsInfo.basicAuth;
            }

            options.url = this.dsInfo.baseURL + url;
          } else {
            // @ts-ignore
            this.dsInfo = null;
          }
        });
      } else if (!options.url) {
        this.error = 'Missing URL';
        this.showError(this.error, null);
        return;
      } else if (options.url.indexOf('://') < 0 && options.url.indexOf('api/') < 0) {
        this.error = 'Invalid URL: ' + options.url;
        this.showError(this.error, params);
        return;
      }

      // Now make the call
      this.requestCount++;
      this.loading = true;
      helper.then(() => {
        this.backendSrv.datasourceRequest(options).then(
          (response: any) => {
            this.lastRequestTime = sent;
            this.process(response);
            this.loading = false;
          },
          (err: any) => {
            console.log('ERR', err);
            this.lastRequestTime = sent;
            this.loading = false;

            this.error = err; //.data.error + " ["+err.status+"]";
            this.inspector = { error: err };
            this.showError('Request Error', err);
          }
        );
      });
    }

    // Return empty results
    return null; //this.$q.when( [] );
  }

  // Overrides the default handling (error for null result)
  handleQueryResult(result: DataQueryResponse) {
    this.loading = false;
    if (result) {
      if (this.isUsingMetricQuery()) {
        return super.handleQueryResult(result);
      }
    }
    this.render();
  }

  onPanelInitalized() {
    this.updateFN();
    this.updateTemplate();
    $(window).on(
      'resize',
      _.debounce((fn: any) => {
        this.refresh();
      }, 250)
    );
  }

  onConfigChanged() {
    this.lastURL = undefined;
    this.refresh();
  }

  onInitEditMode() {
    this.debugParams = {};
    this.addEditorTab('Request', 'public/plugins/' + this.pluginId + '/partials/editor.request.html', 2);
    this.addEditorTab('Display', 'public/plugins/' + this.pluginId + '/partials/editor.display.html', 3);
    this.addEditorTab('Examples', 'public/plugins/' + this.pluginId + '/partials/editor.examples.html', 5);
    this.editorTabIndex = 2;
    this.updateFN();
  }

  updateFN() {
    this.fnError = null;
    this.paramsFn = undefined;

    if (this.panel.params_js) {
      try {
        this.paramsFn = new Function('ctrl', 'return ' + this.panel.params_js);
      } catch (ex) {
        console.warn('error parsing params_js', this.panel.params_js, ex);
        this.paramsFn = undefined;
        this.fnError = ex;
      }
    }
    if (this.panel.header_js) {
      try {
        this.headerFn = new Function('ctrl', 'return ' + this.panel.header_js);
      } catch (ex) {
        console.warn('error parsing header_js', this.panel.header_js, ex);
        this.headerFn = undefined;
        this.fnError = ex;
      }
    }
    this.onConfigChanged();
  }

  updateTemplate() {
    let txt = '';
    this.isIframe = this.panel.method === 'iframe';
    if (this.panel.mode === RenderMode.template) {
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
          height="100%" \
          ng-src="{{ url }}" \
          ng-if="ctrl.panel.method === \'iframe\'"></iframe>';
      } else {
        if (!this.panel.mode) {
          this.panel.mode = RenderMode.html;
        }
        let mode = this.panel.mode;
        if (mode === RenderMode.html && this.isUsingMetricQuery()) {
          mode = RenderMode.pre; // don't show [object object]!
        }
        switch (mode) {
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
            txt = '<json-tree root-name="sub" object="response" start-expanded="true"></json-tree>';
            break;
          case RenderMode.image:
            txt = '';
            break;
          default:
            console.warn('Unsupported render mode:', this.panel.mode);
        }
      }
    }
    //console.log('UPDATE template', this.panel, txt);

    if (txt) {
      this.ngtemplate.html(txt);
      this.ngtemplate.css('display', 'block');
      this.$compile(this.ngtemplate.contents())(this.$scope);
    } else {
      this.ngtemplate.css('display', 'none');
    }

    if (this.$scope.response) {
      this.render();
    }
  }

  showError(msg: string, err: any) {
    this.timeInfo = null;
    if (this.objectURL) {
      this.img.css('display', 'none');
      URL.revokeObjectURL(this.objectURL);
      this.objectURL = null;
    }

    let txt = `<h1>${msg}</h1>`;
    if (err && this.panel.showErrors) {
      txt += '<pre>' + JSON.stringify(err) + '</pre>';
    } else {
      txt += '<pre>Something went wrong while executing your request.</pre>';
    }

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
        let when: any = undefined;
        if ('request' === this.panel.showTimeValue) {
          when = this.lastRequestTime;
        } else if ('recieve' === this.panel.showTimeValue) {
          when = Date.now();
        } else if (this.panel.showTimeValue.startsWith('header-')) {
          const h = this.panel.showTimeValue.substring('header-'.length);
          const v = rsp.headers[h];
          if (v) {
            console.log('TODO, parse header', v, h);
          } else {
            const vals: any = {};
            for (const key in rsp.headers()) {
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
    this.$scope.response = rsp.hasOwnProperty('data') ? rsp.data : rsp;

    let contentType = '';
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
        if (this.panel.mode !== RenderMode.image) {
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
    if (this.panel.mode === RenderMode.json) {
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

  link(scope: any, elem: any, attrs: any, ctrl: any) {
    this.img = $(elem.find('img')[0]);
    this.ngtemplate = $(elem.find('.ngtemplate')[0]);
    this.overlay = $(elem.find('.ajaxmodal')[0]);
    this.overlay.remove();
    this.overlay.css('display', 'block');
    this.img.css('display', 'none');
  }
}

export { AjaxCtrl, AjaxCtrl as PanelCtrl };
