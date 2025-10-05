import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CurrentUser } from '@/decorators/user.decorator';
import { CreateOrderDto } from './dto/create.order';
import { type JWTPayload } from '@/auth/types/jwt-payload';
import { Optional } from '@/decorators/optional.decorator';
import { Public } from '@/decorators/public.decorator';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Optional()
  @Post()
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: JWTPayload | null,
  ) {
    return this.orderService.createOrder(dto, user);
  }

  @Public()
  @Get(':id/status')
  async getOrderStatus(@Param('id') orderId: string) {
    return this.orderService.getOrderStatus(orderId);
  }

  @Public()
  @Post('webhook')
  async statusCallback(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-webhook-signature') signature: string,
    @Headers('x-webhook-timestamp') timestamp: string,
  ) {
    return this.orderService.processWebhook(req.rawBody, signature, timestamp);
  }
}
