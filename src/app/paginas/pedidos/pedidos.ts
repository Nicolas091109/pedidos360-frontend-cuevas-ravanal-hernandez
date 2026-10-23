import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { apiBaseUrl } from '../../auth-config';

type EstadoPedido =
  | 'CREADO'
  | 'ACEPTADO'
  | 'EN_PREPARACION'
  | 'DESPACHADO'
  | 'ENTREGADO'
  | 'CANCELADO';

interface DetallePedido {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  clienteSub: string;
  pymeId: number;
  clienteId: string | null;
  clienteEmail: string | null;
  estado: EstadoPedido;
  total: number;
  direccionEntrega: string;
  fechaCreacion: string;
  fechaEntrega: string | null;
  detalles: DetallePedido[];
}

interface OpcionEstado {
  valor: EstadoPedido;
  etiqueta: string;
}

// Mismas transiciones que EstadoPedido.java en ms-pedidos360-orders
const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  CREADO: ['ACEPTADO', 'CANCELADO'],
  ACEPTADO: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['DESPACHADO', 'CANCELADO'],
  DESPACHADO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: []
};

@Component({
  selector: 'app-pedidos',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class Pedidos implements OnInit {

  private http = inject(HttpClient);
  private ordersUrl = `${apiBaseUrl}api/orders`;

  estados: OpcionEstado[] = [
    { valor: 'CREADO', etiqueta: 'Creado' },
    { valor: 'ACEPTADO', etiqueta: 'Aceptado' },
    { valor: 'EN_PREPARACION', etiqueta: 'En preparación' },
    { valor: 'DESPACHADO', etiqueta: 'Despachado' },
    { valor: 'ENTREGADO', etiqueta: 'Entregado' },
    { valor: 'CANCELADO', etiqueta: 'Cancelado' }
  ];

  pedidos = signal<Pedido[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);
  actualizando = signal(false);

  busqueda = signal('');
  filtroEstado = signal<EstadoPedido | 'TODOS'>('TODOS');
  idSeleccionado = signal<number | null>(null);

  pedidosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const estado = this.filtroEstado();

    return this.pedidos().filter(pedido =>
      (estado === 'TODOS' || pedido.estado === estado) &&
      (!texto ||
        String(pedido.id).includes(texto) ||
        pedido.clienteEmail?.toLowerCase().includes(texto) ||
        pedido.direccionEntrega?.toLowerCase().includes(texto))
    );
  });

  pedidoSeleccionado = computed(() =>
    this.pedidos().find(pedido => pedido.id === this.idSeleccionado()) ?? null
  );

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.http.get<Pedido[]>(this.ordersUrl).subscribe({
      next: pedidos => {
        this.pedidos.set(
          [...pedidos].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
        );
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los pedidos. Intenta nuevamente.');
        this.cargando.set(false);
      }
    });
  }

  contarPorEstado(estado: EstadoPedido): number {
    return this.pedidos().filter(pedido => pedido.estado === estado).length;
  }

  etiquetaEstado(estado: EstadoPedido): string {
    return this.estados.find(opcion => opcion.valor === estado)?.etiqueta ?? estado;
  }

  siguientesEstados(estado: EstadoPedido): OpcionEstado[] {
    return this.estados.filter(opcion => TRANSICIONES[estado].includes(opcion.valor));
  }

  seleccionarPedido(pedido: Pedido): void {
    this.idSeleccionado.set(
      this.idSeleccionado() === pedido.id ? null : pedido.id
    );
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: EstadoPedido): void {
    this.actualizando.set(true);
    this.error.set(null);

    this.http
      .patch<Pedido>(`${this.ordersUrl}/${pedido.id}/estado`, null, {
        params: { nuevoEstado }
      })
      .subscribe({
        next: actualizado => {
          this.pedidos.update(pedidos =>
            pedidos.map(p =>
              p.id === pedido.id
                ? { ...p, ...actualizado, detalles: actualizado.detalles ?? p.detalles }
                : p
            )
          );
          this.actualizando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(
            err.error?.message ??
            `No se pudo cambiar el pedido #${pedido.id} a ${this.etiquetaEstado(nuevoEstado)}.`
          );
          this.actualizando.set(false);
        }
      });
  }
}
