///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';
import $ from 'jquery';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import moment from 'moment';
import './css/ajax-panel.css!';

export class AjaxCtrl extends MetricsPanelCtrl {
  static templateUrl = 'partials/module.html';
  static scrollable = true;

  params_fn: Function = null;
  content: string = null; // The actual HTML
  objectURL: any = null; // Used for images

  img: any = null; // HTMLElement
  overlay: any = null;

  requestCount = 0;
  lastRequestTime = -1;
  fn_error: any = null;

  // Used in the editor
  theURL: string = null; // Used for debugging

  static panelDefaults = {
    method: 'GET',
    url: 'https://raw.githubusercontent.com/ryantxu/ajax-panel/master/static/example.txt',
    params_js:
      '{\n' +
      " from:ctrl.range.from.format('x'),  // x is unix ms timestamp\n" +
      " to:ctrl.range.to.format('x'), \n" +
      ' height:ctrl.height,\n' +
      ' now:Date.now(),\n' +
      ' since:ctrl.lastRequestTime\n' +
      '}',
  };

  constructor(
    $scope,
    $injector,
    public $q,
    public templateSrv,
    public datasourceSrv,
    public backendSrv,
    public $sce
  ) {
    super($scope, $injector);

    _.defaults(this.panel, AjaxCtrl.panelDefaults);

    $scope.$on('$destroy', () => {
      if (this.objectURL) {
        URL.revokeObjectURL(this.objectURL);
      }
    });

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
  }

  getCurrentParams() {
    if (this.params_fn) {
      this.updateTimeRange();
      return this.params_fn(this);
    }
    return null;
  }

  _getURL(ds) {
    let url = this.templateSrv.replace(this.panel.url, this.panel.scopedVars);
    const params = this.getCurrentParams();
    if (params) {
      const hasArgs = url.indexOf('?') > 0;
      url = encodeURI(url + (hasArgs ? '&' : '?') + $.param(params));
    }

    if (ds) {
      if (ds.url) {
        url = ds.url + url;
      } else if (ds.urls) {
        url = ds.urls[0] + url;
      }
    }
    return url;
  }

  // Rather than issue a datasource query, we will call our ajax request
  issueQueries(datasource) {
    if (this.fn_error) {
      this.error = this.fn_error;
      return;
    }

    let dsp = null;
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
      ds => {
        const sent = Date.now();
        const src = (this.theURL = this._getURL(ds));
        if (this.panel.method === 'iframe') {
          this.lastRequestTime = sent;
          const html = `<iframe width="100%" height="${
            this.height
          }" frameborder="0" src="${src}"><\/iframe>`;
          this.update(html, false);
        } else {
          const url = this.templateSrv.replace(this.panel.url, this.panel.scopedVars);
          const params = this.getCurrentParams();

          let options: any = {
            method: this.panel.method,
            url: url,
            params: params,
            headers: this.panel.headers,
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
            this.error = 'Invalid URL: ' + options.url + ' // ' + JSON.stringify(params);
            this.update(this.error, false);
            return;
          }

          // Now make the call
          this.requestCount++;
          this.loading = true;
          console.log('AJAX REQUEST', options);
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
              let body =
                '<h1>Error</h1><pre>' + JSON.stringify(err, null, ' ') + '</pre>';
              this.update(body, false);
            }
          );
        }
      },
      err => {
        this.error = err;
        console.warn('Unable to find Data Source', this.panel.datasource, err);
      }
    );

    // Return empty results
    return null; //this.$q.when( [] );
  }

  // Overrides the default handling
  handleQueryResult(result) {
    // Nothing. console.log('handleQueryResult', result);
  }

  onPanelInitalized() {
    this.updateFN();
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
        //   return includeBuiltin || !value.meta.builtIn;
        // })
        .map(ds => {
          return {value: ds.value, text: ds.name, datasource: ds};
        })
    );
  }

  datasourceChanged(option) {
    if (option && option.datasource) {
      this.setDatasource(option.datasource);
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
    this.refresh();
  }

  update(rsp: any, checkVars: boolean = true) {
    if (!rsp) {
      this.content = '';
      return;
    }

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
    let html = rsp;

    if (!_.isString(html)) {
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
    this.overlay = $(elem.find('.mymodal')[0]);
    this.overlay.remove();
    this.overlay.css('display', 'block');
    this.img.css('display', 'none');
  }
}
