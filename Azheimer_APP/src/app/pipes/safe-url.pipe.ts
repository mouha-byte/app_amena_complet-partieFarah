import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeUrl {
    if (!url) {
      return '';
    }
    
    // Si c'est une URL externe ou une data URL, on la sécurise
    if (url.startsWith('http') || url.startsWith('data:image')) {
      return this.sanitizer.bypassSecurityTrustUrl(url);
    }
    
    // Si c'est un chemin relatif, on ajoute l'URL de base du backend
    if (url.startsWith('/')) {
      return this.sanitizer.bypassSecurityTrustUrl(`http://localhost:8085${url}`);
    }
    
    // Sinon, on considère que c'est une URL relative
    return this.sanitizer.bypassSecurityTrustUrl(`http://localhost:8085/${url}`);
  }
}
