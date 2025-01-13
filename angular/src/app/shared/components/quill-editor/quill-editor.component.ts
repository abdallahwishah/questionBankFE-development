import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  forwardRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';

// ---- Quill imports ----
import Quill, { DeltaStatic, Sources } from 'quill';

// 1) Import 'Embed' to define a custom blot
const Embed = Quill.import('blots/embed');

// 2) Define our custom blot class
class InputBlot extends Embed {
  static blotName = 'inputblot';
  static tagName = 'span';
  static className = 'ql-input-blot';

  static create(value: any): HTMLElement {
    const node = super.create(value) as HTMLElement;

    // Extract any data from "value" we want
    const name = value && value.name ? value.name : 'myInput';
    const val = value && value.value ? value.value : '';

    // Optionally store them in data-* if you like
    node.setAttribute('data-name', name);
    node.setAttribute('data-initial-value', val);

    // 2b) Create a real <input> inside
    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.name = name;
    inputEl.value = val;

    // Make it small & inline
    inputEl.style.display = 'inline-block';
    inputEl.style.width = 'auto';
    inputEl.style.padding = '2px 5px';
    inputEl.style.margin = '0 4px';
    inputEl.style.verticalAlign = 'middle';

    // Stop Quill from intercepting events:
    inputEl.addEventListener('click', e => e.stopPropagation());
    inputEl.addEventListener('keydown', e => e.stopPropagation());
    inputEl.addEventListener('keyup', e => e.stopPropagation());

    node.appendChild(inputEl);
    return node;
  }

  static value(domNode: HTMLElement): any {
    // Quill calls this to store blot data in Delta
    const input = domNode.querySelector('input');
    if (!input) return {};
    return {
      name: input.name || '',
      value: input.value || ''
    };
  }
}

// 3) Register the blot globally with Quill
Quill.register(InputBlot);

@Component({
  standalone: true,
  selector: 'app-quill-input-editor',
  imports: [FormsModule],
  template: `
    <div #quillContainer></div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuillInputEditorComponent),
      multi: true
    }
  ]
})
export class QuillInputEditorComponent
  implements AfterViewInit, OnDestroy, ControlValueAccessor
{
  @ViewChild('quillContainer', { static: true }) quillContainer!: ElementRef;

  // The Quill instance
  private quill!: Quill;

  // -------------- CVA + Two-Way Binding --------------
  private _value = '';

  @Input()
  get value(): string {
    return this._value;
  }
  set value(val: string) {
    this._value = val || '';
    if (this.quill) {
      // Dangerously paste the HTML (may contain <input>)
      this.quill.clipboard.dangerouslyPasteHTML(this._value);
    }
  }

  @Output() valueChange = new EventEmitter<string>();

  private onChangeFn: (_: any) => void = () => {};
  private onTouchedFn: () => void = () => {};

  writeValue(value: any): void {
    this.value = value || '';
  }
  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (this.quill) {
      this.quill.enable(!isDisabled);
    }
  }

  ngAfterViewInit(): void {
    // 4) Initialize Quill
    this.quill = new Quill(this.quillContainer.nativeElement, {
      theme: 'snow',
      modules: {
        // Example minimal toolbar
        toolbar: [
          ['bold', 'italic', 'underline', 'clean'],
          // If you want a custom button that calls insertInputAtCursor, define below
          [{ 'insertInput': [] }]
        ]
      }
    });

    // 5) Add a clipboard matcher for <input> tags => transform them to inputblot
    this.quill.clipboard.addMatcher('INPUT', (node, delta) => {
      const nameAttr = node.getAttribute('name') || '';
      const valAttr = node.getAttribute('value') || '';
      const Delta = Quill.import('delta');
      return new Delta().insert({
        inputblot: { name: nameAttr, value: valAttr }
      });
    });

    // If we had an initial value, load it now
    if (this._value) {
      this.quill.clipboard.dangerouslyPasteHTML(this._value);
    }

    // 6) Listen for text-change => update ._value, emit events
    this.quill.on('text-change', (delta: DeltaStatic, oldDelta: DeltaStatic, source: Sources) => {
      const html = this.quill.root.innerHTML;
      this._value = html;
      this.valueChange.emit(html);
      this.onChangeFn(html);
    });

    // Mark touched on blur
    this.quill.on('selection-change', (range: any) => {
      if (!range) {
        this.onTouchedFn();
      }
    });

    // 7) Custom toolbar button (if you want an "Insert Input" button in Quill's toolbar)
    const toolbar = this.quill.getModule('toolbar');
    toolbar.addHandler('insertInput', () => {
      this.insertInputAtCursor('DragForm[0][Inputs][0]', 'Initial text');
    });
  }

  ngOnDestroy(): void {
    // Quill doesn't have a destroy method, but we can remove listeners if needed
  }

  // ------------------------------------------------------
  // Insert an <input> at the *current cursor* (not at the end)
  // ------------------------------------------------------
  public insertInputAtCursor(name: string, val: string) {
    if (!this.quill) return;
    const range = this.quill.getSelection(true);
    if (range) {
      this.quill.insertEmbed(range.index, 'inputblot', { name, value: val });
      // Move cursor after the newly inserted blot
      this.quill.setSelection(range.index + 1, 0);
    }
  }
}
