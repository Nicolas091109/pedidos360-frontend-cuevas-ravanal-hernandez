import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';

import { loginRequest } from '../../auth-config';

interface ImagenCarrusel {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  imagenesCarrusel: ImagenCarrusel[] = [
    { src: '/images/cafe.jpg', alt: 'Café' },
    { src: '/images/pasteleria.jpg', alt: 'Pastelería' },
    { src: '/images/cafeteria.jpg', alt: 'Cafetería' },
    { src: '/images/panaderia.webp', alt: 'Panadería' }
  ];

  indiceActual = 0;

  constructor(private msalService: MsalService) {}

  get account(): AccountInfo | null {
    return (
      this.msalService.instance.getActiveAccount() ??
      this.msalService.instance.getAllAccounts()[0] ??
      null
    );
  }

  login(): void {
    this.msalService.loginRedirect(loginRequest);
  }

  siguienteImagen(): void {
    this.indiceActual =
      (this.indiceActual + 1) % this.imagenesCarrusel.length;
  }

  imagenAnterior(): void {
    this.indiceActual =
      (this.indiceActual - 1 + this.imagenesCarrusel.length)
      % this.imagenesCarrusel.length;
  }

  seleccionarImagen(indice: number): void {
    this.indiceActual = indice;
  }
}