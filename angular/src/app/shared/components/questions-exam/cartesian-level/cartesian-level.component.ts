import { Component, ElementRef, ViewChild, forwardRef, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-cartesian-level',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cartesian-level.component.html',
  styleUrls: ['./cartesian-level.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CartesianLevelComponent),
      multi: true
    }
  ]
})
export class CartesianLevelComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
  @Input() config: any;
  @ViewChild('drawingCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('baseGrid') baseGrid!: ElementRef<SVGElement>;

  // Grid lines array for template
  gridLines: number[] = Array.from({ length: 19 }, (_, i) => -45 + i * 5);

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private drawingImage: string | null = null;

  currentColor = '#000000';
  lineWidth = 2;
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit() {
    this.initializeCanvas();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'] && this.canvas) {
      this.initializeCanvas();
    }
  }

  private initializeCanvas() {
    const canvas = this.canvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();

    // Set up responsive canvas
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    const container = this.canvas.nativeElement.parentElement;
    if (container) {
      const width = container.clientWidth;
      const height = container.clientHeight;

      const canvas = this.canvas.nativeElement;
      canvas.width = width;
      canvas.height = height;

      // Restore any previous drawing after resize
      if (this.drawingImage) {
        this.restoreDrawing(this.drawingImage);
      }
    }
  }

  private restoreDrawing(savedDrawing: string) {
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    };
    img.src = savedDrawing;
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    if (this.disabled) return;

    event.preventDefault();
    this.isDrawing = true;
    const pos = this.getPosition(event);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing || this.disabled) return;

    event.preventDefault();
    const pos = this.getPosition(event);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    this.lastX = pos.x;
    this.lastY = pos.y;

    this.saveDrawing();
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    if (this.disabled) return;
    const canvas = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawingImage = null;
    this.saveDrawing();
  }

  private getPosition(event: MouseEvent | TouchEvent) {
    const canvas = this.canvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      event.preventDefault(); // Prevent scrolling on touch devices
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  private saveDrawing() {
    const dataUrl = this.canvas.nativeElement.toDataURL();
    this.drawingImage = dataUrl;
    this.onChange(dataUrl);
    this.onTouched();
  }

  // ControlValueAccessor Implementation
  writeValue(value: string): void {
    if (!value || !this.ctx) return;
    this.drawingImage = value;
    this.restoreDrawing(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Cleanup
  ngOnDestroy() {
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}
