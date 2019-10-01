import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'pdf-viewer';
  numPagesArray: Array<number>;

  constructor(private _cdf: ChangeDetectorRef) { }

  ngOnInit(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjsWorker.js';
  }

  onFileSelected() {
    const file: any = document.querySelector('#file');

    if (typeof (FileReader) !== 'undefined' && file.files.length !== 0) {
      const reader = new FileReader();

      reader.onloadstart = () => {
        console.log('onloadstart');
      };

      reader.onload = (e: any) => {
        this.load(e.target.result);
        console.log(e.target.result);
      };

      reader.onloadend = () => {
        console.log('onloadend');
      };

      reader.readAsArrayBuffer(file.files[0]);
    }
  }

  load(pdfdata) {
    pdfjsLib.getDocument(pdfdata).promise.then((pdf) => {
      console.log('-----------------------PDF loaded');
      this.numPagesArray = new Array(pdf.numPages);
      this._cdf.detectChanges();

      for (let i = 0; i < pdf.numPages; i++) {
        this.loadPage(pdf, i + 1);
      }

    }, (reason) => {
      console.log(reason);
    });
  }

  loadPage(pdf, pageNumber) {
    pdf.getPage(pageNumber).then((page) => {
      console.log('-----------------------Page loaded');

      // Recompute viewport follow expected width
      let viewport = page.getViewport({ scale: 1 });
      const expectedWidth = 400;
      const scale = expectedWidth / viewport.width;
      viewport = page.getViewport({ scale: scale });

      // Prepare canvas using PDF page dimensions
      const canvas = document.querySelectorAll('#the-canvas').item(pageNumber - 1) as HTMLCanvasElement;
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      page.render(renderContext).promise.then(() => {
        console.log('-----------------------Page rendered');
      });
    });
  }
}
