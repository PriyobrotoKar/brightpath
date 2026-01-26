import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create.organization';
import { CurrentUser } from '@/decorators/user.decorator';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { Roles } from '@/decorators/role.decorator';
import { UpdateOrganizationDto } from './dto/update.oganization';

@Roles('CREATOR')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.organizationService.createOrganization(dto, currentUser);
  }

  @Get()
  async getOrganization(@CurrentUser() currentUser: JWTPayload) {
    return this.organizationService.getOrganization(currentUser);
  }

  @Patch()
  async updateOrganization(
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() currentUser: JWTPayload,
  ) {
    return this.organizationService.updateOrganization(dto, currentUser);
  }
}
