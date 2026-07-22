import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const KEY = 'projects_data';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getData(): Promise<Record<string, unknown> | null> {
    const row = await this.prisma.siteSetting.findUnique({ where: { key: KEY } });
    if (!row) return null;
    try {
      return JSON.parse(row.value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async saveData(data: Record<string, unknown>): Promise<void> {
    const value = JSON.stringify(data);
    await this.prisma.siteSetting.upsert({
      where: { key: KEY },
      update: { value },
      create: { key: KEY, value },
    });
  }

  /**
   * Composes the runnable Live Demo document for a project. Served from its
   * own URL (instead of iframe srcDoc) because srcdoc iframes inherit the
   * parent page's strict nonce-based CSP, which blocks the demos' CDN
   * scripts (cdn.tailwindcss.com) and inline code. A real URL responds with
   * its own CSP; the embedding iframe's sandbox attribute stays the
   * security boundary. Mirrors the old frontend buildSrcDoc byte-for-byte
   * so existing demos render exactly as they did before the CSP hardening.
   */
  async buildDemoHtml(slug: string): Promise<string | null> {
    const data = await this.getData();
    const projects = (data?.projects ?? []) as Array<Record<string, unknown>>;
    const p = projects.find((x) => x.slug === slug && x.visible === true);
    if (!p) return null;

    const html = typeof p.codeHtml === 'string' ? p.codeHtml : '';
    const css = typeof p.codeCss === 'string' ? p.codeCss : '';
    const js = typeof p.codeJs === 'string' ? p.codeJs : '';
    if (!html && !css && !js) return null;

    const safeJs = js.replace(/<\/script>/gi, '<\\/script>');
    const safeCss = css.replace(/<\/style>/gi, '<\\/style>');
    // In a sandbox="allow-scripts" iframe (no allow-same-origin), touching
    // window.localStorage throws SecurityError - this shim swaps in an
    // in-memory replacement so demos that use it without try/catch still run.
    const storagePatch =
      '<script>(function(){' +
      'function mem(){var s={};return{' +
      'getItem:function(k){return s.hasOwnProperty(k)?s[k]:null;},' +
      'setItem:function(k,v){s[String(k)]=String(v);},' +
      'removeItem:function(k){delete s[String(k)];},' +
      'clear:function(){s={};},' +
      'key:function(i){return Object.keys(s)[i]??null;},' +
      'get length(){return Object.keys(s).length;}' +
      '};}' +
      "['localStorage','sessionStorage'].forEach(function(n){" +
      'try{window[n].getItem("__");}' +
      'catch(e){try{Object.defineProperty(window,n,{value:mem(),configurable:true,writable:true});}catch(e2){}}' +
      '});' +
      '})();</script>';

    return [
      '<!DOCTYPE html><html><head>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      storagePatch,
      `<style>*{box-sizing:border-box}body{margin:0;padding:16px}${safeCss}</style>`,
      `</head><body>${html}`,
      `<script>${safeJs}</script>`,
      '</body></html>',
    ].join('');
  }
}
