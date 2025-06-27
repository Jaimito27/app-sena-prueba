import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UserService } from '../../core/services/user.service';
import { DocumentService } from '../../core/services/document.service';
import { combineLatest, map, Observable, of, retry, switchMap } from 'rxjs';
import { User } from '../../shared/models/user.interface';
import { Document } from '../../shared/models/document.interface'
import { AuthState } from '../../state/auth.state';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private store = inject(Store);
  private userService = inject(UserService);
  private documentService = inject(DocumentService);

  currentUser$!: Observable<User | null>;
  tenantId$!: Observable<string | null>;
  usersCount$!: Observable<number>;
  documentsCount$!: Observable<number>;
  userDocuments$!: Observable<Document[]>;
  userName$!: Observable<string>;
  userRole$!: Observable<string>;

  ngOnInit(): void {
    // Observa el usuario actual y tenant
    this.currentUser$ = this.store.select(AuthState.currentUser);
    this.tenantId$ = this.store.select(AuthState.userTenantId);

    this.usersCount$ = this.tenantId$.pipe(
      switchMap(tenantId => {
        if (!tenantId) return of(0);
        //userservice.getUsers() ya mapea roles y tenants
        return this.userService.getUsers().pipe(
          map(res => res.users.filter(u => u.tenantId === tenantId).length)
        );
      })
    );

    //documentos del mismo tenant
    this.documentsCount$ = this.tenantId$.pipe(
      switchMap(tenantId => {
        if (!tenantId) return of(0);
        return this.documentService.getDocumentsByTenant(tenantId).pipe(
          map(docs => docs.length)
        );
      })
    );

    this.userDocuments$ = combineLatest([
      this.currentUser$,
      this.tenantId$
    ]).pipe(
      switchMap(([user, tenantId]) => {
        if (!user || !tenantId) return of([]);
        return this.documentService.getDocumentsByTenant(tenantId).pipe(
          map(docs => docs.filter(doc => doc.userId === user.id))
        );
      })
    );

    //nombre del usuario
    this.userName$ = this.currentUser$.pipe(
      map(user => user ? `${user.firstName} ${user.lastName}` : 'Usuario')
    );

    //Rol principal del usuario

    this.userRole$ = this.currentUser$.pipe(map(user => user?.roles?.includes('admin') ? 'Admin' : 'Usuario'))
  }
}
