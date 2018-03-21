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

class AjaxCtrl extends MetricsPanelCtrl {
  static templateUrl = 'partials/module.html';
  static scrollable = true;

  params_fn: Function = null;
  header_fn: Function = null;

  json: any = null; // The the json-tree
  content: string = null; // The actual HTML
  objectURL: any = null; // Used for images

  img: any = null; // HTMLElement
  overlay: any = null;

  requestCount = 0;
  lastRequestTime = -1;
  fn_error: any = null;

  // Used in the editor
  lastURL: string = null;
  dsInfo: DSInfo = null;

  static examples = [
    {
      // The first example should set all relevant fields!
      name: 'Simple',
      text: 'loads static content from github',
      config: {
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
        header_js: '{\n\n}',
        responseType: 'text',
        withCredentials: false,
        skipSameURL: true,

        showTime: false,
        showTimeFormat: 'LTS',
        showTimeValue: 'request',
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
      text: 'template variables in URL',
      config: {
        method: 'GET',
        url: 'https://httpbin.org/image?asdgasdg',
        params_js: '{\n' + ' __now:Date.now(),\n' + '}',
        responseType: 'arraybuffer',

        showTime: true,
        showTimeFormat: 'LTS',
        showTimeValue: 'request',
      },
    },
    {
      name: 'Echo Service',
      text: 'Responds with the request attributes',
      config: {
        method: 'GET',
        url: 'https://httpbin.org/anything',
        header_js:
          '{\n' +
          " sample:'value',  // x is unix ms timestamp\n" +
          " Authentication: 'xxx'\n" +
          '}',
        showTime: true,
      },
    },
    {
      name: 'Image in IFrame',
      text: 'load an image in an iframe',
      config: {
        method: 'iframe',
        url: 'https://dummyimage.com/600x400/f00/fff&text=GRAFANA',
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
        header_js: '{\n' + " Authentication: 'not a real header'\n" + '}',
      },
    },
    {
      name: 'Basic Auth (fail)',
      text: 'send correct basic auth',
      config: {
        url: 'https://httpbin.org/basic-auth/user/pass',
        withCredentials: true,
        params_js: '{}',
        header_js: '{\n' + " Authentication: 'not a real header'\n" + '}',
      },
    },
  ];

  constructor(
    $scope,
    $injector,
    public $rootScope,
    public $q,
    public $http,
    public templateSrv,
    public datasourceSrv,
    public backendSrv,
    public $sce
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

    this.updateFN();
    this.datasourceChanged(null);
  }

  getCurrentParams() {
    if (this.params_fn) {
      return this.params_fn(this);
    }
    return null;
  }

  getHeaders() {
    if (this.header_fn) {
      return this.header_fn(this);
    }
    return null;
  }

  _getURL() {
    let url = this.templateSrv.replace(this.panel.url, this.panel.scopedVars);
    const params = this.getCurrentParams();
    if (params) {
      const hasArgs = url.indexOf('?') > 0;
      const p = $.param(params);
      url = url + (hasArgs ? '&' : '?') + encodeURI(p);
    }

    if (this.dsInfo) {
      return this.dsInfo.baseURL + url;
    }
    return url;
  }

  // Rather than issue a datasource query, we will call our ajax request
  issueQueries(datasource) {
    if (this.fn_error) {
      this.loading = false;
      this.error = this.fn_error;
      return null;
    }

    this.updateTimeRange();
    const src = this._getURL();
    if (this.panel.skipSameURL && src === this.lastURL) {
      console.log('URL Did not change', src);
      this.loading = false;
      return null;
    }

    this.lastURL = src;
    this.error = null; // remove the error
    const sent = Date.now();
    if (this.panel.method === 'iframe') {
      this.lastRequestTime = sent;
      const height = this.height;
      const html = `<iframe width="100%" height="${height}" frameborder="0" src="${src}"><\/iframe>`;
      this.update(html, false);
    } else {
      const url = this.templateSrv.replace(this.panel.url, this.panel.scopedVars);
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
        this.update(this.error, false);
        return;
      }

      // Now make the call
      this.requestCount++;
      this.loading = true;
      this.backendSrv.datasourceRequest(options).then(
        response => {
          this.lastRequestTime = sent;
          this.loading = false;
          this.update(response);
        },
        err => {
          this.lastRequestTime = sent;
          this.loading = false;

          this.error = err; //.data.error + " ["+err.status+"]";
          this.inspector = {error: err};
          let body = '<h1>Error</h1><pre>' + JSON.stringify(err, null, ' ') + '</pre>';
          this.update(body, false);
        }
      );
    }

    // Return empty results
    return null; //this.$q.when( [] );
  }

  // Overrides the default handling
  handleQueryResult(result) {
    // Nothing. console.log('handleQueryResult', result);
  }

  onPanelInitalized() {
    this.updateFN();
    this.datasourceChanged(null);
    $(window).on(
      'resize',
      _.debounce(fn => {
        this.refresh();
      }, 150)
    );
  }

  onInitEditMode() {
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
        this.refresh();
      });
    } else {
      this.dsInfo = null;
      this.refresh();
    }
  }

  updateFN() {
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
    if (this.panel.header_js) {
      try {
        this.header_fn = new Function(
          'ctrl',
          'return ' +
            this.templateSrv.replace(this.panel.header_js, this.panel.scopedVars)
        );
      } catch (ex) {
        console.warn('error parsing header_js', this.panel.header_js, ex);
        this.header_fn = null;
        this.fn_error = ex;
      }
    }
    this.refresh();
  }

  update(rsp: any, checkVars: boolean = true) {
    if (this.panel.showTime) {
      let when = null;
      if ('request' === this.panel.showTimeValue) {
        when = this.lastRequestTime;
      }
      if (when) {
        this.timeInfo = moment(when).format(this.panel.showTimeFormat);
      } else {
        this.timeInfo = this.lastRequestTime + '?';
      }
    } else {
      this.timeInfo = null;
    }

    if (!rsp) {
      this.content = null;
      this.json = null;
      return;
    }

    let contentType = null;
    if (rsp.hasOwnProperty('headers')) {
      contentType = rsp.headers('Content-Type');
    }

    let body = null;
    if (rsp.hasOwnProperty('data')) {
      body = rsp.data;
    } else {
      body = rsp;
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

    if (!_.isString(body)) {
      body = '<pre>' + JSON.stringify(body, null, 2) + '</pre>';
      this.json = null;
    }

    try {
      if (checkVars) {
        body = this.templateSrv.replace(body, this.panel.scopedVars);
      }
      this.content = this.$sce.trustAsHtml(body);
    } catch (e) {
      console.log('trustAsHtml error: ', e, body);
      this.content = null;
      this.json = null;
      this.error = 'Error trusint HTML: ' + e;
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

  link(scope, elem, attrs, ctrl) {
    this.img = $(elem.find('img')[0]);
    this.overlay = $(elem.find('.ajaxmodal')[0]);
    this.overlay.remove();
    this.overlay.css('display', 'block');
    this.img.css('display', 'none');
  }
}

export {AjaxCtrl, AjaxCtrl as PanelCtrl};
