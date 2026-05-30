import { Controller, Get, Query } from "@nestjs/common";

import { AnalyticsService } from "./analytics.service";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  getSummary(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getSummary(query);
  }
}
