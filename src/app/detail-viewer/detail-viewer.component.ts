import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';

@Component({
  selector: 'app-detail-viewer',
  templateUrl: './detail-viewer.component.html',
  styleUrls: ['./detail-viewer.component.scss']
})
export class DetailViewerComponent implements OnInit {

  private pageNum = 1;
  private pageRendering = false;
  private pageNumPending = null;
  private pdfDoc = null;

  canvas = null;
  context = null;

  constructor(public dialogRef: MatDialogRef<DetailViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.pageNum = data.page;
    }

  ngOnInit() {
    this.canvas = document.querySelector('#viewer') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');
    this.load(this.data.src);
  }

  load(pdfdata) {
    pdfjsLib.getDocument(pdfdata).promise.then((pdf) => {
      console.log('-----------------------PDF loaded');

      this.pdfDoc = pdf;
      this.renderPage(this.data.page);

    }, (reason) => {
      console.log(reason);
    });
  }

  renderPage(pageNumber) {
    this.pdfDoc.getPage(pageNumber).then((page) => {
      console.log('-----------------------Page loaded');

      // Recompute viewport follow expected width
      let viewport = page.getViewport({ scale: 1 });
      const expectedWidth = 500;
      const scale = expectedWidth / viewport.width;
      viewport = page.getViewport({ scale: scale });

      // Prepare canvas using PDF page dimensions
      this.canvas.width = viewport.width;
      this.canvas.height = viewport.height;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: this.context,
        viewport: viewport
      };

      page.render(renderContext).promise.then(() => {
        console.log('-----------------------Page rendered');
      });
    });
  }

  /**
* If another page rendering in progress, waits until the rendering is
* finised. Otherwise, executes rendering immediately.
*/
  queueRenderPage(num) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }

  /**
   * Displays previous page.
   */
  onPrevPage() {
    if (this.pageNum <= 1) {
      return;
    }
    this.pageNum--;
    this.queueRenderPage(this.pageNum);
  }


  /**
   * Displays next page.
   */
  onNextPage() {
    if (this.pageNum >= this.pdfDoc.numPages) {
      return;
    }
    this.pageNum++;
    this.queueRenderPage(this.pageNum);
  }
}
