declare module 'pdfkit' {
  import { EventEmitter } from 'events';
  
  class PDFDocument extends EventEmitter {
    constructor(options?: object);
    
    public pipe(destination: NodeJS.WritableStream): NodeJS.WritableStream;
    public end(): void;
    public addPage(options?: object): this;
    public switchToPage(pageNumber: number): this;
    public save(): this;
    public restore(): this;
    public rect(x: number, y: number, width: number, height: number): this;
    public ellipse(x: number, y: number, radiusX: number, radiusY?: number): this;
    public circle(x: number, y: number, radius: number): this;
    public polygon(...points: number[][]): this;
    public path(): this;
    public fill(color?: string | object): this;
    public stroke(color?: string): this;
    public fillAndStroke(fillColor?: string, strokeColor?: string): this;
    public roundedRect(x: number, y: number, width: number, height: number, cornerRadius: number): this;
    public moveTo(x: number, y: number): this;
    public lineTo(x: number, y: number): this;
    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this;
    public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
    public closePath(): this;
    public text(text: string, x?: number, y?: number, options?: object): this;
    public moveDown(lines?: number): this;
    public moveUp(lines?: number): this;
    public image(path: string, x?: number, y?: number, options?: object): this;
    public font(src: string, family?: string): this;
    public fontSize(size: number): this;
    public fillColor(color: string): this;
    public strokeColor(color: string): this;
    public opacity(opacity: number): this;
    public rotate(angle: number, options?: { origin?: number[] }): this;
    public scale(xFactor: number, yFactor?: number, options?: { origin?: number[] }): this;
    public translate(x: number, y: number): this;
    public on(event: string, listener: Function): this;
    
    public info: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      CreationDate?: Date;
      Creator?: string;
      Producer?: string;
    };
    
    public page: {
      width: number;
      height: number;
      margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
    };
    
    public bufferedPageRange(): { start: number; count: number };
  }
  
  export default PDFDocument;
}

declare module 'pdfkit-table' {
  import PDFDocument from 'pdfkit';
  
  interface TableOptions {
    prepareHeader?: (row: any, indexColumn: number, indexRow: number, rectRow: any, rectCell: any) => void;
    prepareRow?: (row: any, indexColumn: number, indexRow: number, rectRow: any, rectCell: any) => any;
    width?: number;
    x?: number;
    y?: number;
    divider?: {
      header: { disabled: boolean; width: number; opacity: number; };
      horizontal: { disabled: boolean; width: number; opacity: number; };
    };
  }
  
  interface PdfTableDocument extends PDFDocument {
    table(table: { headers: string[]; rows: any[][]; }, options?: TableOptions): Promise<{ x: number; y: number; }>;
  }
  
  export default PdfTableDocument;
}