import { IsString, IsArray, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsObject()
  diagram?: { nodes: Record<string, unknown>[]; edges: Record<string, unknown>[] };
}
