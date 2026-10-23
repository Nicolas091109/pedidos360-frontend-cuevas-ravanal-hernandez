import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { apiBaseUrl } from '../../auth-config';

type EstadoNotificacion = 'SENT' | 'FAILED';

interface Notificacion {
  id: number;
  recipient: string;
  subject: string;
  message: string;
  estado: EstadoNotificacion;
  errorDetail: string | null;
  fechaCreacion: string;
}

interface OpcionEstado {
  valor: EstadoNotificacion;
  etiqueta: string;
}

// Asuntos que genera ms-pedidos360-notify a partir de los eventos de pedidos
const ETIQUETAS_ASUNTO: Record<string, string> = {
  PEDIDO_CREADO: 'Pedido creado',
  ESTADO_CAMBIADO: 'Cambio de estado'
};

@Component({
  selector: 'app-notificaciones',
  imports: [FormsModule, DatePipe],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css'
})
export class Notificaciones implements OnInit {

  private http = inject(HttpClient);
  private notifyUrl = `${apiBaseUrl}api/notify`;

  estados: OpcionEstado[] = [
    { valor: 'SENT', etiqueta: 'Enviada' },
    { valor: 'FAILED', etiqueta: 'Fallida' }
  ];

  notificaciones = signal<Notificacion[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  busqueda = signal('');
  filtroEstado = signal<EstadoNotificacion | 'TODOS'>('TODOS');

  notificacionesFiltradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const estado = this.filtroEstado();

    return this.notificaciones().filter(notificacion =>
      (estado === 'TODOS' || notificacion.estado === estado) &&
      (!texto ||
        notificacion.recipient?.toLowerCase().includes(texto) ||
        notificacion.subject?.toLowerCase().includes(texto) ||
        notificacion.message?.toLowerCase().includes(texto))
    );
  });

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.http.get<Notificacion[]>(this.notifyUrl).subscribe({
      next: notificaciones => {
        this.notificaciones.set(
          [...notificaciones].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las notificaciones. Intenta nuevamente.');
        this.cargando.set(false);
      }
    });
  }

  contarPorEstado(estado: EstadoNotificacion): number {
    return this.notificaciones().filter(notificacion => notificacion.estado === estado).length;
  }

  etiquetaEstado(estado: EstadoNotificacion): string {
    return this.estados.find(opcion => opcion.valor === estado)?.etiqueta ?? estado;
  }

  etiquetaAsunto(asunto: string): string {
    return ETIQUETAS_ASUNTO[asunto] ?? asunto;
  }
}
