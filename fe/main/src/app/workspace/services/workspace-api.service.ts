import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workspace } from '../models/workspace.model';
import { environment } from '../../../environments/environment';

export interface CreateWorkspaceDto {
  name: string;
  tags: string[];
  description: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  tags?: string[];
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/workspaces`;
  private readonly useBackend = environment.useBackend;

  isBackendEnabled(): boolean {
    return this.useBackend;
  }

  create(dto: CreateWorkspaceDto): Observable<Workspace> {
    return this.http.post<Workspace>(this.apiUrl, dto);
  }

  findAll(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(this.apiUrl);
  }

  findOne(id: string): Observable<Workspace> {
    return this.http.get<Workspace>(`${this.apiUrl}/${id}`);
  }

  update(id: string, dto: UpdateWorkspaceDto): Observable<Workspace> {
    return this.http.patch<Workspace>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
