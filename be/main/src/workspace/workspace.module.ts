import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceDataService } from './workspace-data.service';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceDataService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
