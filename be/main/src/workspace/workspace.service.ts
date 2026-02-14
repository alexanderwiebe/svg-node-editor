import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceDataService } from './workspace-data.service';

@Injectable()
export class WorkspaceService {
  constructor(private readonly dataService: WorkspaceDataService) {}

  create(createWorkspaceDto: CreateWorkspaceDto): Workspace {
    return this.dataService.create(createWorkspaceDto);
  }

  findAll(): Workspace[] {
    return this.dataService.findAll();
  }

  findOne(id: string): Workspace {
    const workspace = this.dataService.findOne(id);
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
    return workspace;
  }

  update(id: string, updateWorkspaceDto: UpdateWorkspaceDto): Workspace {
    const workspace = this.dataService.update(id, updateWorkspaceDto);
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
    return workspace;
  }

  remove(id: string): void {
    const deleted = this.dataService.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Workspace with ID ${id} not found`);
    }
  }
}
