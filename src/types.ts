export class DSInfo {
  name: string;
  baseURL: string;
  isProxy: boolean = false;
  withCredentials: boolean = false;
  basicAuth?: string;

  constructor(ds) {
    this.name = ds.name;
    if (ds.url) {
      this.baseURL = ds.url;
    } else if (ds.urls) {
      this.baseURL = ds.urls[0];
    }
    if (!this.baseURL) {
      this.baseURL = '';
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
// <option value="trustedHtml">Trusted HTML</option>
export enum RenderMode {
  html = 'html',
  text = 'text',
  pre = 'pre',
  image = 'image',
  json = 'json',
  template = 'template',
  trustedHtml = 'trustedHtml'
}
