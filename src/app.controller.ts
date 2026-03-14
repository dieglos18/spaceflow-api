import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthBearer } from './auth/auth-bearer.decorator';
import { AppService } from './app.service';
import { HealthResponseDto, ProtectedResponseDto } from './app.dto';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check (root)' })
  @ApiResponse({ status: 200, description: 'Service is running.', type: HealthResponseDto })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is running.', type: HealthResponseDto })
  getHealthAlias() {
    return this.appService.getHealth();
  }

  @Get('protected')
  @AuthBearer()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Protected resource (requires Bearer token)' })
  @ApiResponse({ status: 200, description: 'Access granted.', type: ProtectedResponseDto })
  getProtected() {
    return this.appService.getProtected();
  }
}
