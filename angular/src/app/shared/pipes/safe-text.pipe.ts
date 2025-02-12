import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  standalone: true,
  name: 'safeText'
})
export class SafeTextPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, charSize = 100): string {
    if (!value) return '';

    // Create a temporary container
    const tempDiv = document.createElement('div');

    // Set the HTML content
    tempDiv.innerHTML = value;

    // Remove all style tags and their content
    const styleTags = tempDiv.getElementsByTagName('style');
    while (styleTags.length > 0) {
      styleTags[0].parentNode?.removeChild(styleTags[0]);
    }

    // Remove inline styles
    const elementsWithStyle = tempDiv.querySelectorAll('[style]');
    elementsWithStyle.forEach(element => {
      element.removeAttribute('style');
    });

    // Remove class attributes
    const elementsWithClass = tempDiv.querySelectorAll('[class]');
    elementsWithClass.forEach(element => {
      element.removeAttribute('class');
    });

    // Get text content (this automatically removes all HTML tags)
    let text = tempDiv.textContent || tempDiv.innerText || '';

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Limit to specified character size and append ellipses if longer
    return text?(text.length > charSize ? text.substring(0, charSize) + '...' : text):value;
  }
}



