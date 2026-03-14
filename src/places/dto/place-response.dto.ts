import { ApiProperty } from '@nestjs/swagger';

/** Place entity as returned by the API. */
export class PlaceResponseDto {
  @ApiProperty({ example: 'clx123abc456def789', description: 'Unique place ID (CUID).' })
  id!: string;

  @ApiProperty({ example: 'Downtown Cowork', description: 'Place name.' })
  name!: string;

  @ApiProperty({ example: '123 Main St', description: 'Place address or location.' })
  location!: string;
}
