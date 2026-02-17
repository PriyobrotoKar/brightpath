import { type JWTPayload } from '@/auth/types/jwt-payload';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create.organization';
import { PrismaClient } from '@brightpath/db';
import { slugify } from '@/common/utils';
import { UpdateOrganizationDto } from './dto/update.oganization';

@Injectable()
export class OrganizationService {
  private logger = new Logger(OrganizationService.name);
  private readonly prisma: PrismaClient;

  constructor(private prismaService: PrismaService) {
    this.prisma = this.prismaService.client;
  }

  async createOrganization(dto: CreateOrganizationDto, user: JWTPayload) {
    this.logger.log(`User ${user.id} requested to create an organization`);

    const slug = slugify(dto.name);

    // Check if an organization is already created for this user or another user with the same name
    const orgExists =
      (await this.prisma.organization.findUnique({
        where: {
          slug,
        },
      })) ??
      (await this.prisma.organization.findUnique({
        where: {
          creatorId: user.id,
        },
      }));

    if (orgExists) {
      this.logger.error(`User ${user.id} already has an organization`);
      throw new ForbiddenException('Organization already exists');
    }

    // Create a new organization for the user
    const organization = await this.prisma.organization.create({
      data: {
        slug,
        name: dto.name,
        logo: dto.logo,
        creatorId: user.id,
      },
    });

    this.logger.log(
      `Organization ${organization.id} created for user ${user.id}`,
    );

    return organization;
  }

  async getOrganization(user: JWTPayload) {
    this.logger.log(`User ${user} requested to get organization`);

    const organization = await this.prisma.organization.findUnique({
      where: {
        creatorId: user.id,
      },
      include: {
        address: true,
      },
    });

    if (!organization) {
      this.logger.error(`User ${user.id} does not have an organization`);
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async getOrganizationBySlug(slug: string) {
    this.logger.log(`Requested to get organization by slug ${slug}`);

    const organization = await this.prisma.organization.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        logo: true,
      },
    });

    if (!organization) {
      this.logger.error(`Organization with slug ${slug} not found`);
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async updateOrganization(dto: UpdateOrganizationDto, user: JWTPayload) {
    this.logger.log(`User ${user.id} requested to update organization`);

    const organization = await this.prisma.organization.findUnique({
      where: {
        creatorId: user.id,
      },
    });

    if (!organization) {
      this.logger.error(`User ${user.id} does not have an organization`);
      throw new NotFoundException('Organization not found');
    }

    const slug = dto.name ? slugify(dto.name) : organization.slug;

    const updatedOrganization = await this.prisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
        slug,
        name: dto.name,
        logo: dto.logo,
        address: {
          upsert: {
            create: {
              address: dto.address,
              city: dto.city,
              state: dto.state,
              country: dto.country,
              postalCode: dto.postalCode,
            },
            update: {
              address: dto.address,
              city: dto.city,
              state: dto.state,
              country: dto.country,
              postalCode: dto.postalCode,
            },
          },
        },
      },
      include: {
        address: true,
      },
    });

    this.logger.log(
      `Organization ${updatedOrganization.id} updated for user ${user.id}`,
    );

    return updatedOrganization;
  }
}
