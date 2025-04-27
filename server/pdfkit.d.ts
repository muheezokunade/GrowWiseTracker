declare module 'pdfkit' {
  import { EventEmitter } from 'events';
  
  class PDFDocument extends EventEmitter {
    constructor(options?: any);
    // Add minimal type definitions needed
    pipe(destination: any): any;
    end(): void;
    
    // Methods used in our reports.ts
    font(name: string): this;
    fontSize(size: number): this;
    text(text: string, x?: number, y?: number, options?: any): this;
    moveDown(lines?: number): this;
    roundedRect(x: number, y: number, width: number, height: number, radius: number): this;
    fillColor(color: string): this;
    strokeColor(color: string): this;
    fill(): this;
    stroke(): this;
    switchToPage(pageNumber: number): this;
    
    // Properties used in our reports.ts
    info: {
      Title?: string;
      Author?: string;
      Subject?: string;
    };
    
    page: {
      width: number;
      height: number;
      margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      }
    };
    
    // Method used for pagination
    bufferedPageRange(): { count: number };
  }
  
  export default PDFDocument;
}

declare module 'pdfkit-table' {
  import PDFDocument from 'pdfkit';
  
  // Simplified for our use case
  interface PDFTableDocument extends PDFDocument {
    table(table: any, options?: any): Promise<any>;
  }
  
  export default PDFTableDocument;
}