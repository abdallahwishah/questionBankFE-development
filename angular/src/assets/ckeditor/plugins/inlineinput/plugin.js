CKEDITOR.plugins.add('inlineinput', {
    // Must have both 'widget' and 'lineutils' for inline widget behavior
    requires: 'widget,lineutils',

    init: function (editor) {
      // ------------------------------------------------------------------
      // A) CSS to make the <span> resemble an input box in the editor
      // ------------------------------------------------------------------
      CKEDITOR.addCss(`
        .inline-input-widget {
          display: inline-block;
          min-width: 80px;
          margin: 0 2px;
          padding: 2px 4px;
          border: 1px solid #aaa;
          border-radius: 4px;
          background: #fdfdfd;
          cursor: text;
        }
        .inline-input-widget.inline-input-focused {
          outline: 2px dashed #80e080; /* highlight on focus */
        }
        .inline-input-value {
          border: none;
          background: transparent;
          outline: none;
          min-width: 50px;
        }
        /* Hide widget drag handle, if desired */
        .cke_widget_drag_handler_container {
          display: none !important;
        }
      `);

      // ------------------------------------------------------------------
      // B) Define the "inlineinput" widget
      // ------------------------------------------------------------------
      editor.widgets.add('inlineinput', {
        // Tells CKEditor it's an inline widget (can contain inline text).
        inline: true,

        // If you want to let users drag the widget:
        draggable: true,

        // Optional: a toolbar button to insert a new "inlineinput" widget
        button: 'Insert Inline Input',
        title: 'Inline Input',

        // Template if inserted from the toolbar button
        template: `
          <span class="inline-input-widget" data-value="">
            <span class="inline-input-value" contenteditable="true">Type here</span>
          </span>
        `,

        // Mark the `.inline-input-value` as an editable region
        editables: {
          value: {
            selector: '.inline-input-value'
          }
        },

        // -------------------------------------------------------------
        // 1) UPCAST: <input> => <span> with an editable child
        // -------------------------------------------------------------
        upcast: function (element) {
          // Only transform real <input> tags
          if (element.name === 'input') {
            // Convert <input> to <span class="inline-input-widget">
            element.name = 'span';
            element.addClass('inline-input-widget');

            // Grab <input> attributes we want to store
            const inputValue = element.attributes.value || '';
            const inputName  = element.attributes.name  || '';
            const inputClass = element.attributes.class || '';
            const inputStyle = element.attributes.style || '';

            // Store them in data-* so we can downcast later
            element.attributes['data-value'] = inputValue;
            element.attributes['data-name']  = inputName;
            element.attributes['data-class'] = inputClass;
            element.attributes['data-style'] = inputStyle;

            // Build a child <span contenteditable="true"> with the old value as text
            const childSpan = new CKEDITOR.htmlParser.element('span');
            childSpan.addClass('inline-input-value');
            childSpan.attributes.contenteditable = 'true';
            childSpan.add(new CKEDITOR.htmlParser.text(inputValue));

            // Remove <input>-only attributes we don’t need on the <span>
            delete element.attributes.type;
            delete element.attributes.value;
            delete element.attributes.name;
            delete element.attributes.class;
            delete element.attributes.style;

            // Add the childSpan
            element.add(childSpan);

            return true; // Tells CKEditor this is our widget
          }
          return false;
        },

        // -------------------------------------------------------------
        // 2) DOWNCAST: <span> => <input>
        // -------------------------------------------------------------
        downcast: function (element) {
          // Only if it's <span class="inline-input-widget">
          if (element.name === 'span' && element.hasClass('inline-input-widget')) {
            // Extract typed text from the child .inline-input-value
            let typedValue = '';
            const childSpan = element.children && element.children[0];
            if (childSpan && childSpan.children) {
              for (let i = 0; i < childSpan.children.length; i++) {
                const child = childSpan.children[i];
                if (child.type === CKEDITOR.htmlParser.NODE_TEXT) {
                  typedValue += child.value;
                }
              }
            }

            // Convert <span> -> <input type="text" value="...">
            element.name = 'input';
            element.attributes = element.attributes || {};
            element.attributes.type = 'text';
            element.attributes.value = typedValue;

            // Restore name, class, style from data-*
            if (element.attributes['data-name']) {
              element.attributes.name = element.attributes['data-name'];
            }
            if (element.attributes['data-class']) {
              element.attributes.class = element.attributes['data-class'];
            }
            if (element.attributes['data-style']) {
              element.attributes.style = element.attributes['data-style'];
            }

            // Remove leftover children
            element.children = [];
            // Remove leftover data-* attributes
            delete element.attributes['data-value'];
            delete element.attributes['data-name'];
            delete element.attributes['data-class'];
            delete element.attributes['data-style'];
            element.removeClass('inline-input-widget');
          }
        },

        // Called when the widget is focused/blurred, to add focus styling
        onFocus: function() {
          this.element.addClass('inline-input-focused');
        },
        onBlur: function() {
          this.element.removeClass('inline-input-focused');
        }
      });

      // ------------------------------------------------------------------
      // C) If you want a toolbar button to insert new inline inputs
      // ------------------------------------------------------------------
      if (editor.ui.addButton) {
        editor.ui.addButton('InlineInput', {
          label: 'Insert Inline Input',
          command: 'inlineinput',
          toolbar: 'insert',
          icon: 'button' // or your own icon
        });
      }

      // ------------------------------------------------------------------
      // D) Single-Click Hack: immediately place caret inside the child
      // ------------------------------------------------------------------
      editor.on('contentDom', function() {
        const editable = editor.editable();

        // Listen for clicks in the editing area
        editable.on('click', function(evt) {
          const target = evt.data.getTarget();

          // Find if we clicked on the cke_widget_wrapper
          const widgetWrapper = target.getAscendant(function(el) {
            return el.hasClass && el.hasClass('cke_widget_wrapper');
          }, true);

          if (widgetWrapper) {
            // Get the widget instance from that wrapper
            const widget = editor.widgets.getByElement(widgetWrapper);

            // If it's our inlineinput widget and not focused
            if (widget && widget.name === 'inlineinput' && !widget.focused) {
              // Focus the widget
              widget.focus();

              // Place caret in the .inline-input-value
              const childEditable = widget.editables.value;
              if (childEditable) {
                const range = editor.createRange();
                range.moveToElementEditablePosition(childEditable);
                editor.getSelection().selectRanges([range]);
              }

              // Prevent CKEditor's default "select the entire widget" action
              evt.data.preventDefault();
            }
          }
        });
      });
    }
  });
