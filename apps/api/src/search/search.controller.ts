import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Recherche globale : vidéos, séries, artistes, podcasts, créateurs' })
  @ApiQuery({ name: 'q', type: String, required: true, description: 'Terme de recherche (min. 2 caractères)' })
  async search(@Query('q') query: string) {
    const results = await this.searchService.globalSearch(query || '');
    return { success: true, data: results, query, timestamp: new Date().toISOString() };
  }
}
