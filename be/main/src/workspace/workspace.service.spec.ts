import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceDataService } from './workspace-data.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let dataService: WorkspaceDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceService, WorkspaceDataService],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    dataService = module.get<WorkspaceDataService>(WorkspaceDataService);

    // Clear data before each test
    dataService.clear();
  });

  afterEach(() => {
    dataService.clear();
  });

  describe('create', () => {
    it('should create a new workspace', () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Test Workspace',
        tags: ['test', 'unit'],
        description: 'Test description',
      };

      const workspace = service.create(createDto);

      expect(workspace).toBeDefined();
      expect(workspace.id).toBeDefined();
      expect(workspace.name).toBe(createDto.name);
      expect(workspace.tags).toEqual(createDto.tags);
      expect(workspace.description).toBe(createDto.description);
      expect(workspace.createdAt).toBeInstanceOf(Date);
      expect(workspace.updatedAt).toBeInstanceOf(Date);
    });

    it('should create workspaces with unique IDs', () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Test Workspace',
        tags: ['test'],
        description: 'Test description',
      };

      const workspace1 = service.create(createDto);
      const workspace2 = service.create(createDto);

      expect(workspace1.id).not.toBe(workspace2.id);
    });
  });

  describe('findAll', () => {
    it('should return an empty array when no workspaces exist', () => {
      const workspaces = service.findAll();
      expect(workspaces).toEqual([]);
    });

    it('should return all workspaces', () => {
      const createDto1: CreateWorkspaceDto = {
        name: 'Workspace 1',
        tags: ['tag1'],
        description: 'Description 1',
      };
      const createDto2: CreateWorkspaceDto = {
        name: 'Workspace 2',
        tags: ['tag2'],
        description: 'Description 2',
      };

      service.create(createDto1);
      service.create(createDto2);

      const workspaces = service.findAll();
      expect(workspaces).toHaveLength(2);
    });

    it('should return workspaces sorted by updatedAt descending', async () => {
      const createDto1: CreateWorkspaceDto = {
        name: 'Workspace 1',
        tags: ['tag1'],
        description: 'Description 1',
      };
      const createDto2: CreateWorkspaceDto = {
        name: 'Workspace 2',
        tags: ['tag2'],
        description: 'Description 2',
      };

      const workspace1 = service.create(createDto1);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const workspace2 = service.create(createDto2);

      const workspaces = service.findAll();

      // workspace2 should be first (more recent)
      expect(workspaces[0].id).toBe(workspace2.id);
      expect(workspaces[1].id).toBe(workspace1.id);
    });
  });

  describe('findOne', () => {
    it('should return a workspace by id', () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Test Workspace',
        tags: ['test'],
        description: 'Test description',
      };

      const created = service.create(createDto);
      const found = service.findOne(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe(created.name);
    });

    it('should throw NotFoundException when workspace does not exist', () => {
      expect(() => service.findOne('non-existent-id')).toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException with correct message', () => {
      const id = 'non-existent-id';
      expect(() => service.findOne(id)).toThrow(
        `Workspace with ID ${id} not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a workspace', () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Original Name',
        tags: ['original'],
        description: 'Original description',
      };

      const created = service.create(createDto);
      const createdAt = created.createdAt;

      const updateDto: UpdateWorkspaceDto = {
        name: 'Updated Name',
        tags: ['updated'],
        description: 'Updated description',
      };

      const updated = service.update(created.id, updateDto);

      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe(updateDto.name);
      expect(updated.tags).toEqual(updateDto.tags);
      expect(updated.description).toBe(updateDto.description);
      expect(updated.createdAt).toEqual(createdAt);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        created.updatedAt.getTime(),
      );
    });

    it('should partially update a workspace', () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Original Name',
        tags: ['original'],
        description: 'Original description',
      };

      const created = service.create(createDto);

      const updateDto: UpdateWorkspaceDto = {
        name: 'Updated Name',
      };

      const updated = service.update(created.id, updateDto);

      expect(updated.name).toBe(updateDto.name);
      expect(updated.tags).toEqual(created.tags); // Should remain unchanged
      expect(updated.description).toBe(created.description); // Should remain unchanged
    });

    it('should throw NotFoundException when updating non-existent workspace', () => {
      const updateDto: UpdateWorkspaceDto = {
        name: 'Updated Name',
      };

      expect(() => service.update('non-existent-id', updateDto)).toThrow(
        NotFoundException,
      );
    });

    it('should update the updatedAt timestamp', async () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Test Workspace',
        tags: ['test'],
        description: 'Test description',
      };

      const created = service.create(createDto);
      const originalUpdatedAt = created.updatedAt;

      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const updateDto: UpdateWorkspaceDto = {
        name: 'Updated Name',
      };

      const updated = service.update(created.id, updateDto);

      expect(updated.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('remove', () => {
    it('should remove a workspace', () => {
      const createDto: CreateWorkspaceDto = {
        name: 'Test Workspace',
        tags: ['test'],
        description: 'Test description',
      };

      const created = service.create(createDto);

      service.remove(created.id);

      expect(() => service.findOne(created.id)).toThrow(NotFoundException);
    });

    it('should throw NotFoundException when removing non-existent workspace', () => {
      expect(() => service.remove('non-existent-id')).toThrow(
        NotFoundException,
      );
    });

    it('should remove the correct workspace', () => {
      const createDto1: CreateWorkspaceDto = {
        name: 'Workspace 1',
        tags: ['tag1'],
        description: 'Description 1',
      };
      const createDto2: CreateWorkspaceDto = {
        name: 'Workspace 2',
        tags: ['tag2'],
        description: 'Description 2',
      };

      const workspace1 = service.create(createDto1);
      const workspace2 = service.create(createDto2);

      service.remove(workspace1.id);

      const workspaces = service.findAll();
      expect(workspaces).toHaveLength(1);
      expect(workspaces[0].id).toBe(workspace2.id);
    });
  });

  describe('integration', () => {
    it('should handle complete CRUD workflow', () => {
      // Create
      const createDto: CreateWorkspaceDto = {
        name: 'Integration Test',
        tags: ['integration', 'test'],
        description: 'Integration test workspace',
      };

      const created = service.create(createDto);
      expect(created.id).toBeDefined();

      // Read
      const found = service.findOne(created.id);
      expect(found.name).toBe(createDto.name);

      // Update
      const updateDto: UpdateWorkspaceDto = {
        name: 'Updated Integration Test',
      };
      const updated = service.update(created.id, updateDto);
      expect(updated.name).toBe(updateDto.name);

      // List
      const all = service.findAll();
      expect(all).toHaveLength(1);

      // Delete
      service.remove(created.id);
      expect(() => service.findOne(created.id)).toThrow(NotFoundException);
    });
  });
});
